import { render, screen } from '@testing-library/react'
import MessageList from '../../components/MessageList'
import { Message } from '../../types'

const mockMessages: Message[] = [
  {
    type: 'system',
    text: 'Welcome to the game!',
  },
  {
    type: 'player',
    text: 'I attack the goblin',
    playerName: 'Test Player',
  },
  {
    type: 'ai',
    text: 'The goblin dodges your attack!',
  },
]

describe('MessageList', () => {
  it('should render all messages', () => {
    render(<MessageList messages={mockMessages} />)

    expect(screen.getByText('Welcome to the game!')).toBeInTheDocument()
    expect(screen.getByText('I attack the goblin')).toBeInTheDocument()
    expect(screen.getByText('The goblin dodges your attack!')).toBeInTheDocument()
  })

  it('should render correct labels for different message types', () => {
    render(<MessageList messages={mockMessages} />)

    expect(screen.getByText('Система:')).toBeInTheDocument()
    expect(screen.getByText('Test Player:')).toBeInTheDocument()
    expect(screen.getByText('DND Master:')).toBeInTheDocument()
  })

  it('should render player name when provided', () => {
    const messagesWithPlayer: Message[] = [
      {
        type: 'player',
        text: 'I cast a spell',
        playerName: 'Wizard',
      },
    ]

    render(<MessageList messages={messagesWithPlayer} />)

    expect(screen.getByText('Wizard:')).toBeInTheDocument()
  })

  it('should render "Вы" when player name is not provided', () => {
    const messagesWithoutPlayer: Message[] = [
      {
        type: 'player',
        text: 'I cast a spell',
      },
    ]

    render(<MessageList messages={messagesWithoutPlayer} />)

    expect(screen.getByText('Вы:')).toBeInTheDocument()
  })

  it('should apply correct CSS classes for different message types', () => {
    render(<MessageList messages={mockMessages} />)

    const systemMessage = screen.getByText('Welcome to the game!').closest('div')
    const playerMessage = screen.getByText('I attack the goblin').closest('div')
    const aiMessage = screen.getByText('The goblin dodges your attack!').closest('div')

    expect(systemMessage).toHaveClass('bg-blue-100', 'text-blue-800')
    expect(playerMessage).toHaveClass('bg-gray-100', 'text-gray-700')
    expect(aiMessage).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should render empty list when no messages', () => {
    render(<MessageList messages={[]} />)

    expect(screen.queryByText('Система:')).not.toBeInTheDocument()
    expect(screen.queryByText('DND Master:')).not.toBeInTheDocument()
  })

  it('should have scrollable container', () => {
    render(<MessageList messages={mockMessages} />)

    const container = screen.getByText('Welcome to the game!').closest('.flex-1')
    expect(container).toHaveClass('overflow-y-auto')
  })
})
