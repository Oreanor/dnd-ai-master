import { callAI, generateWelcomeContext, generateAIContext } from '../../lib/ai'

// Mock cohere-ai
const mockCohereClient = {
  chat: jest.fn()
}

jest.mock('cohere-ai', () => ({
  CohereClient: jest.fn(() => ({
    chat: jest.fn()
  }))
}))

// Mock environment variables
process.env.COHERE_API_KEY = 'test-api-key'

describe('AI Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.COHERE_API_KEY = 'test-api-key'
  })

  describe('generateWelcomeContext', () => {
    const mockWorldState = {
      context: {
        currentLocation: 'forge'
      },
      locations: {
        forge: {
          name: 'Заброшенная кузница',
          desc: 'Сумрак, запах ржавчины и углей.'
        }
      }
    }

    it('should generate welcome context with location info', () => {
      const result = generateWelcomeContext(mockWorldState)
      
      expect(result).toContain('Заброшенная кузница')
      expect(result).toContain('Сумрак, запах ржавчины и углей')
      expect(result).toContain('Опиши эту локацию кратко и атмосферно')
    })

    it('should handle missing location gracefully', () => {
      const worldStateWithoutLocation = {
        context: { currentLocation: 'unknown' },
        locations: {}
      }

      // This should throw an error since currentLocation is undefined
      expect(() => generateWelcomeContext(worldStateWithoutLocation)).toThrow()
    })
  })

  describe('generateAIContext', () => {
    const mockWorldState = {
      context: {
        currentLocation: 'forge',
        currentScene: 'You are in a dark room',
        recentEvents: [
          { player: 'player1', action: 'attacked goblin', success: true },
          { player: 'player2', action: 'cast spell', success: false }
        ]
      },
      locations: {
        forge: {
          npcs: [
            { name: 'Goblin', hp: 8 }
          ]
        }
      }
    }

    it('should generate context with player action and recent events', () => {
      const result = generateAIContext('TestPlayer', 'attack the goblin', mockWorldState)
      
      expect(result).toContain('TestPlayer')
      expect(result).toContain('attack the goblin')
      expect(result).toContain('You are in a dark room')
      expect(result).toContain('player1: attacked goblin (успех)')
      expect(result).toContain('player2: cast spell (неудача)')
    })

    it('should handle empty recent events', () => {
      const worldStateWithNoEvents = {
        ...mockWorldState,
        context: {
          ...mockWorldState.context,
          recentEvents: []
        }
      }

      const result = generateAIContext('TestPlayer', 'look around', worldStateWithNoEvents)
      
      expect(result).toContain('TestPlayer')
      expect(result).toContain('look around')
      expect(result).not.toContain('Последние действия:')
    })

    it('should limit recent events to last 3', () => {
      const worldStateWithManyEvents = {
        ...mockWorldState,
        context: {
          ...mockWorldState.context,
          recentEvents: [
            { player: 'p1', action: 'action1', success: true },
            { player: 'p2', action: 'action2', success: false },
            { player: 'p3', action: 'action3', success: true },
            { player: 'p4', action: 'action4', success: false },
            { player: 'p5', action: 'action5', success: true }
          ]
        }
      }

      const result = generateAIContext('TestPlayer', 'attack', worldStateWithManyEvents)
      
      // Should only include last 3 events
      expect(result).toContain('action3')
      expect(result).toContain('action4')
      expect(result).toContain('action5')
      expect(result).not.toContain('action1')
      expect(result).not.toContain('action2')
    })
  })

  describe('callAI', () => {
    it('should throw error when API key is not set', async () => {
      process.env.COHERE_API_KEY = ''
      
      await expect(callAI('test prompt')).rejects.toThrow('All AI models unavailable')
    })

    it('should throw error when cohere client is null', async () => {
      // Mock the cohere client to be null
      jest.doMock('cohere-ai', () => ({
        CohereClient: jest.fn(() => null)
      }))

      await expect(callAI('test prompt')).rejects.toThrow('All AI models unavailable')
    })

    it('should throw error when no models available', async () => {
      await expect(callAI('test prompt')).rejects.toThrow('All AI models unavailable')
    })

    it('should handle empty prompt', async () => {
      await expect(callAI('')).rejects.toThrow('All AI models unavailable')
    })

    it('should handle long prompt', async () => {
      const longPrompt = 'A'.repeat(1000)
      await expect(callAI(longPrompt)).rejects.toThrow('All AI models unavailable')
    })
  })
})
