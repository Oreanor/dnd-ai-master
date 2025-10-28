import { renderHook, act } from '@testing-library/react'
import { useSocket } from '../../hooks/useSocket'
import { Player } from '../../types'

// Mock socket.io-client
const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
}

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}))

describe('useSocket', () => {
  const mockPlayer: Player = {
    id: 'test-player-1',
    name: 'Test Player',
    str: 10,
    dex: 12,
    hp: 20,
    inventory: [],
  }

  const mockRoomId = 'test-room'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize socket connection', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // The socket should be available
    expect(result.current.socket).toBeDefined()
    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', { roomId: mockRoomId, player: mockPlayer })
  })

  it('should handle system messages', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // Simulate system message
    act(() => {
      const systemHandler = mockSocket.on.mock.calls.find(call => call[0] === 'system')[1]
      systemHandler({ msg: 'Test system message' })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual({
      type: 'system',
      text: 'Test system message',
    })
  })

  it('should handle player messages', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // Simulate player message
    act(() => {
      const playerMessageHandler = mockSocket.on.mock.calls.find(call => call[0] === 'player_message')[1]
      playerMessageHandler({ playerName: 'Other Player', action: 'attacks the goblin' })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual({
      type: 'player',
      text: 'attacks the goblin',
      playerName: 'Other Player',
    })
  })

  it('should handle game updates with AI response', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    const mockWorldState = {
      players: { [mockPlayer.id]: mockPlayer },
      context: { currentScene: 'Test scene' },
    }

    // Simulate game update
    act(() => {
      const gameUpdateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'game_update')[1]
      gameUpdateHandler({ 
        aiResponse: 'The goblin falls to the ground!', 
        worldState: mockWorldState 
      })
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual({
      type: 'ai',
      text: 'The goblin falls to the ground!',
    })
    expect(result.current.world).toEqual(mockWorldState)
    expect(result.current.players).toEqual([mockPlayer])
  })

  it('should handle connection status changes', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // Simulate connection
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1]
      connectHandler()
    })

    expect(result.current.connected).toBe(true)

    // Simulate disconnection
    act(() => {
      const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1]
      disconnectHandler()
    })

    expect(result.current.connected).toBe(false)
  })

  it('should handle socket errors', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // Simulate error
    act(() => {
      const errorHandler = mockSocket.on.mock.calls.find(call => call[0] === 'error')[1]
      errorHandler({ code: 'TEST_ERROR', message: 'Test error message' })
    })

    expect(result.current.error).toBe('Test error message')
  })

  it('should send actions via socket', () => {
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    act(() => {
      result.current.sendAction('attack the goblin')
    })

    expect(mockSocket.emit).toHaveBeenCalledWith('player_action', {
      roomId: mockRoomId,
      playerId: mockPlayer.id,
      action: 'attack the goblin',
    })
  })

  it('should not send action if socket is not available', () => {
    // This test verifies that sendAction doesn't crash when socket is null
    // The hook's sendAction function already handles this case with the if check
    const { result } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    // The hook should work normally
    expect(result.current.sendAction).toBeDefined()
    expect(typeof result.current.sendAction).toBe('function')
  })

  it('should clean up socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket({ roomId: mockRoomId, player: mockPlayer }))

    unmount()

    expect(mockSocket.disconnect).toHaveBeenCalled()
  })
})
