import { RateLimiter, rateLimiters, getClientId, sendRateLimitError } from '../../utils/rateLimiter'
import { Socket } from 'socket.io'

// Mock socket for testing
const mockSocket = {
  emit: jest.fn(),
  handshake: {
    address: '192.168.1.1'
  },
  conn: {
    remoteAddress: '192.168.1.1'
  }
} as unknown as Socket

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 1000, // 1 second for testing
      maxRequests: 3,
      message: 'Rate limit exceeded'
    })
  })

  describe('isAllowed', () => {
    it('should allow requests within limit', () => {
      const clientId = 'test-client-1'
      
      expect(rateLimiter.isAllowed(clientId)).toBe(true)
      expect(rateLimiter.isAllowed(clientId)).toBe(true)
      expect(rateLimiter.isAllowed(clientId)).toBe(true)
    })

    it('should block requests when limit exceeded', () => {
      const clientId = 'test-client-2'
      
      // Use up all requests
      rateLimiter.isAllowed(clientId)
      rateLimiter.isAllowed(clientId)
      rateLimiter.isAllowed(clientId)
      
      // This should be blocked
      expect(rateLimiter.isAllowed(clientId)).toBe(false)
    })

    it('should reset limit after window expires', async () => {
      const clientId = 'test-client-3'
      
      // Use up all requests
      rateLimiter.isAllowed(clientId)
      rateLimiter.isAllowed(clientId)
      rateLimiter.isAllowed(clientId)
      
      // Should be blocked
      expect(rateLimiter.isAllowed(clientId)).toBe(false)
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // Should be allowed again
      expect(rateLimiter.isAllowed(clientId)).toBe(true)
    })

    it('should handle different clients independently', () => {
      const client1 = 'client-1'
      const client2 = 'client-2'
      
      // Client 1 uses up all requests
      rateLimiter.isAllowed(client1)
      rateLimiter.isAllowed(client1)
      rateLimiter.isAllowed(client1)
      
      // Client 1 should be blocked
      expect(rateLimiter.isAllowed(client1)).toBe(false)
      
      // Client 2 should still be allowed
      expect(rateLimiter.isAllowed(client2)).toBe(true)
    })
  })

  describe('getRemainingRequests', () => {
    it('should return correct remaining requests', () => {
      const clientId = 'test-client-4'
      
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(3)
      
      rateLimiter.isAllowed(clientId)
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(2)
      
      rateLimiter.isAllowed(clientId)
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(1)
      
      rateLimiter.isAllowed(clientId)
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(0)
    })

    it('should return max requests for new client', () => {
      const clientId = 'new-client'
      expect(rateLimiter.getRemainingRequests(clientId)).toBe(3)
    })
  })

  describe('getResetTime', () => {
    it('should return future reset time for active client', () => {
      const clientId = 'test-client-5'
      const beforeTime = Date.now()
      
      rateLimiter.isAllowed(clientId)
      const resetTime = rateLimiter.getResetTime(clientId)
      
      expect(resetTime).toBeGreaterThan(beforeTime)
    })

    it('should return future reset time for new client', () => {
      const clientId = 'new-client-2'
      const beforeTime = Date.now()
      
      const resetTime = rateLimiter.getResetTime(clientId)
      
      expect(resetTime).toBeGreaterThan(beforeTime)
    })
  })
})

describe('rateLimiters', () => {
  describe('playerAction', () => {
    it('should have correct configuration', () => {
      expect(rateLimiters.playerAction.config.windowMs).toBe(15 * 1000)
      expect(rateLimiters.playerAction.config.maxRequests).toBe(5)
      expect(rateLimiters.playerAction.config.message).toBe('Слишком много действий. Подождите немного.')
    })
  })

  describe('joinRoom', () => {
    it('should have correct configuration', () => {
      expect(rateLimiters.joinRoom.config.windowMs).toBe(60 * 1000)
      expect(rateLimiters.joinRoom.config.maxRequests).toBe(3)
      expect(rateLimiters.joinRoom.config.message).toBe('Слишком много попыток подключения. Подождите минуту.')
    })
  })

  describe('aiRequest', () => {
    it('should have correct configuration', () => {
      expect(rateLimiters.aiRequest.config.windowMs).toBe(60 * 1000)
      expect(rateLimiters.aiRequest.config.maxRequests).toBe(10)
      expect(rateLimiters.aiRequest.config.message).toBe('Превышен лимит AI запросов. Подождите минуту.')
    })
  })
})

describe('getClientId', () => {
  it('should return handshake address when available', () => {
    const result = getClientId(mockSocket)
    expect(result).toBe('192.168.1.1')
  })

  it('should return remote address when handshake address is not available', () => {
    const socketWithoutHandshake = {
      ...mockSocket,
      handshake: { address: undefined }
    } as unknown as Socket

    const result = getClientId(socketWithoutHandshake)
    expect(result).toBe('192.168.1.1')
  })

  it('should return unknown when no address is available', () => {
    const socketWithoutAddress = {
      handshake: { address: undefined },
      conn: { remoteAddress: undefined }
    } as unknown as Socket

    const result = getClientId(socketWithoutAddress)
    expect(result).toBe('unknown')
  })
})

describe('sendRateLimitError', () => {
  it('should emit error with correct data', () => {
    const message = 'Rate limit exceeded'
    const resetTime = Date.now() + 5000

    sendRateLimitError(mockSocket, message, resetTime)

    expect(mockSocket.emit).toHaveBeenCalledWith('error', {
      code: 'RATE_LIMIT_EXCEEDED',
      message,
      resetTime
    })
  })
})
