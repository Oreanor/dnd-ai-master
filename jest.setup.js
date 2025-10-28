import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SOCKET_URL = 'http://localhost:3001'
process.env.COHERE_API_KEY = 'test-api-key'

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}))

// Create a mock function that can be overridden in tests
const mockUseSession = jest.fn()
mockUseSession.mockReturnValue({
  data: {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
  },
  status: 'authenticated',
})

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Expose the mock globally
global.mockUseSession = mockUseSession

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock scrollIntoView for JSDOM compatibility
Element.prototype.scrollIntoView = jest.fn()
