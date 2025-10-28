import { validators, ValidationError } from '../../utils/validators'

describe('validators', () => {
  describe('string', () => {
    it('should validate valid string', () => {
      expect(validators.string('hello', 'test')).toBe('hello')
    })

    it('should trim whitespace', () => {
      expect(validators.string('  hello  ', 'test')).toBe('hello')
    })

    it('should throw error for non-string input', () => {
      expect(() => validators.string(123 as any, 'test')).toThrow(ValidationError)
      expect(() => validators.string(null as any, 'test')).toThrow(ValidationError)
      expect(() => validators.string(undefined as any, 'test')).toThrow(ValidationError)
    })

    it('should throw error for string too short', () => {
      expect(() => validators.string('', 'test', 1)).toThrow(ValidationError)
      expect(() => validators.string('a', 'test', 2)).toThrow(ValidationError)
    })

    it('should throw error for string too long', () => {
      const longString = 'a'.repeat(101)
      expect(() => validators.string(longString, 'test', 1, 100)).toThrow(ValidationError)
    })

    it('should use custom min/max length', () => {
      expect(validators.string('ab', 'test', 2, 2)).toBe('ab')
      expect(() => validators.string('a', 'test', 2, 2)).toThrow(ValidationError)
      expect(() => validators.string('abc', 'test', 2, 2)).toThrow(ValidationError)
    })
  })

  describe('playerId', () => {
    it('should validate valid player IDs', () => {
      expect(validators.playerId('player123', 'playerId')).toBe('player123')
      expect(validators.playerId('user@example.com', 'playerId')).toBe('user@example.com')
      expect(validators.playerId('user_name', 'playerId')).toBe('user_name')
      expect(validators.playerId('user-name', 'playerId')).toBe('user-name')
    })

    it('should throw error for invalid characters', () => {
      expect(() => validators.playerId('player 123', 'playerId')).toThrow(ValidationError)
      expect(() => validators.playerId('player#123', 'playerId')).toThrow(ValidationError)
      expect(() => validators.playerId('player$123', 'playerId')).toThrow(ValidationError)
    })

    it('should throw error for empty string', () => {
      expect(() => validators.playerId('', 'playerId')).toThrow(ValidationError)
    })

    it('should throw error for too long ID', () => {
      const longId = 'a'.repeat(51)
      expect(() => validators.playerId(longId, 'playerId')).toThrow(ValidationError)
    })
  })

  describe('roomId', () => {
    it('should validate valid room IDs', () => {
      expect(validators.roomId('room123', 'roomId')).toBe('room123')
      expect(validators.roomId('room_name', 'roomId')).toBe('room_name')
      expect(validators.roomId('room-name', 'roomId')).toBe('room-name')
    })

    it('should throw error for invalid characters', () => {
      expect(() => validators.roomId('room 123', 'roomId')).toThrow(ValidationError)
      expect(() => validators.roomId('room@123', 'roomId')).toThrow(ValidationError)
      expect(() => validators.roomId('room#123', 'roomId')).toThrow(ValidationError)
    })
  })

  describe('playerAction', () => {
    it('should validate valid actions', () => {
      expect(validators.playerAction('attack the goblin', 'action')).toBe('attack the goblin')
      expect(validators.playerAction('cast fireball', 'action')).toBe('cast fireball')
      expect(validators.playerAction('search the room', 'action')).toBe('search the room')
    })

    it('should throw error for dangerous patterns', () => {
      expect(() => validators.playerAction('<script>alert("xss")</script>', 'action')).toThrow(ValidationError)
      expect(() => validators.playerAction('javascript:alert("xss")', 'action')).toThrow(ValidationError)
      expect(() => validators.playerAction('onclick="alert(1)"', 'action')).toThrow(ValidationError)
      expect(() => validators.playerAction('eval("malicious code")', 'action')).toThrow(ValidationError)
      expect(() => validators.playerAction('function() { alert("xss") }', 'action')).toThrow(ValidationError)
    })

    it('should throw error for empty action', () => {
      expect(() => validators.playerAction('', 'action')).toThrow(ValidationError)
    })

    it('should throw error for too long action', () => {
      const longAction = 'a'.repeat(501)
      expect(() => validators.playerAction(longAction, 'action')).toThrow(ValidationError)
    })
  })

  describe('player', () => {
    const validPlayer = {
      id: 'player123',
      name: 'Test Player',
      str: 10,
      dex: 12,
      hp: 20,
      inventory: []
    }

    it('should validate valid player object', () => {
      expect(validators.player(validPlayer, 'player')).toEqual(validPlayer)
    })

    it('should throw error for non-object input', () => {
      expect(() => validators.player('not an object', 'player')).toThrow(ValidationError)
      expect(() => validators.player(null, 'player')).toThrow(ValidationError)
    })

    it('should throw error for missing required fields', () => {
      expect(() => validators.player({}, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ id: 'player123' }, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ name: 'Test Player' }, 'player')).toThrow(ValidationError)
    })

    it('should validate numeric fields', () => {
      // Test invalid str
      expect(() => validators.player({ ...validPlayer, str: 0 }, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ ...validPlayer, str: 21 }, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ ...validPlayer, str: '10' }, 'player')).toThrow(ValidationError)

      // Test invalid dex
      expect(() => validators.player({ ...validPlayer, dex: 0 }, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ ...validPlayer, dex: 21 }, 'player')).toThrow(ValidationError)

      // Test invalid hp
      expect(() => validators.player({ ...validPlayer, hp: 0 }, 'player')).toThrow(ValidationError)
      expect(() => validators.player({ ...validPlayer, hp: 101 }, 'player')).toThrow(ValidationError)
    })

    it('should validate edge cases for numeric fields', () => {
      // Test valid edge cases
      expect(validators.player({ ...validPlayer, str: 1 }, 'player')).toEqual({ ...validPlayer, str: 1 })
      expect(validators.player({ ...validPlayer, str: 20 }, 'player')).toEqual({ ...validPlayer, str: 20 })
      expect(validators.player({ ...validPlayer, hp: 1 }, 'player')).toEqual({ ...validPlayer, hp: 1 })
      expect(validators.player({ ...validPlayer, hp: 100 }, 'player')).toEqual({ ...validPlayer, hp: 100 })
    })
  })
})
