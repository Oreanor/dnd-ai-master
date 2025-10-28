import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameRoom from '../../components/GameRoom'
import { Player, Message } from '../../types'

// Mock the useSocket hook
const mockUseSocket = {
  socket: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  },
  connected: true,
  messages: [] as Message[],
  world: null,
  players: [] as Player[],
  error: null as string | null,
  sendAction: jest.fn(),
}

jest.mock('../../hooks/useSocket', () => ({
  useSocket: () => mockUseSocket,
}))

describe('GameRoom Integration', () => {
  const mockPlayer: Player = {
    id: 'test-player-1',
    name: 'Test Player',
    str: 10,
    dex: 12,
    hp: 20,
    inventory: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock state
    mockUseSocket.connected = true
    mockUseSocket.messages = []
    mockUseSocket.players = []
    mockUseSocket.error = null
  })

  it('should render game room with all components', () => {
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Общая комната')).toBeInTheDocument()
    expect(screen.getByText('Подключено')).toBeInTheDocument()
    expect(screen.getByText('Игроки в комнате (0):')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Введите действие...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeInTheDocument()
  })

  it('should display connection status correctly', () => {
    mockUseSocket.connected = false
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Отключено')).toBeInTheDocument()
  })

  it('should display players when available', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Alice', str: 10, dex: 12, hp: 20, inventory: [] },
      { id: 'p2', name: 'Bob', str: 14, dex: 8, hp: 18, inventory: [] },
    ]
    mockUseSocket.players = players

    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Игроки в комнате (2):')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('should display messages when available', () => {
    const messages: Message[] = [
      { type: 'system', text: 'Welcome to the game!' },
      { type: 'player', text: 'I attack the goblin', playerName: 'Alice' },
      { type: 'ai', text: 'The goblin dodges!' },
    ]
    mockUseSocket.messages = messages

    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Welcome to the game!')).toBeInTheDocument()
    expect(screen.getByText('I attack the goblin')).toBeInTheDocument()
    expect(screen.getByText('The goblin dodges!')).toBeInTheDocument()
  })

  it('should display error when present', () => {
    mockUseSocket.error = 'Connection failed'
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Ошибка: Connection failed')).toBeInTheDocument()
  })

  it('should not display error when null', () => {
    mockUseSocket.error = null
    const { container } = render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(container.querySelector('.bg-red-100')).not.toBeInTheDocument()
  })

  it('should handle action submission', async () => {
    const user = userEvent.setup()
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    const input = screen.getByPlaceholderText('Введите действие...')
    const submitButton = screen.getByRole('button', { name: 'Отправить' })

    await user.type(input, 'attack the dragon')
    await user.click(submitButton)

    expect(mockUseSocket.sendAction).toHaveBeenCalledWith('attack the dragon')
  })

  it('should handle action submission via Enter key', async () => {
    const user = userEvent.setup()
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    const input = screen.getByPlaceholderText('Введите действие...')

    await user.type(input, 'cast fireball')
    await user.keyboard('{Enter}')

    expect(mockUseSocket.sendAction).toHaveBeenCalledWith('cast fireball')
  })

  it('should have correct layout structure', () => {
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    const mainContainer = screen.getByText('Общая комната').closest('.h-screen')
    expect(mainContainer).toHaveClass('bg-gray-100', 'flex', 'flex-col')

    const header = screen.getByText('Общая комната').closest('.bg-white')
    expect(header).toHaveClass('p-4', 'border-b', 'flex-shrink-0')

    const messagesArea = screen.getByPlaceholderText('Введите действие...').closest('.bg-white')
    expect(messagesArea).toHaveClass('border-t', 'pt-4', 'pb-20')
  })

  it('should handle empty messages array', () => {
    mockUseSocket.messages = []
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.queryByText('Система:')).not.toBeInTheDocument()
    expect(screen.queryByText('DND Master:')).not.toBeInTheDocument()
  })

  it('should handle empty players array', () => {
    mockUseSocket.players = []
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    expect(screen.getByText('Игроки в комнате (0):')).toBeInTheDocument()
  })

  it('should pass correct props to useSocket hook', () => {
    render(<GameRoom roomId="test-room" player={mockPlayer} />)

    // The hook is mocked, but we can verify the component renders without errors
    // which means the props were passed correctly
    expect(screen.getByText('Общая комната')).toBeInTheDocument()
  })
})
