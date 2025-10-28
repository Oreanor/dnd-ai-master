import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActionForm from '../../components/ActionForm'

describe('ActionForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input and submit button', () => {
    render(<ActionForm onSubmit={mockOnSubmit} />)

    expect(screen.getByPlaceholderText('Введите действие...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeInTheDocument()
  })

  it('should call onSubmit with trimmed text when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ActionForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('Введите действие...')
    const submitButton = screen.getByRole('button', { name: 'Отправить' })

    await user.type(input, '  attack the goblin  ')
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith('attack the goblin')
  })

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup()
    render(<ActionForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('Введите действие...')
    const submitButton = screen.getByRole('button', { name: 'Отправить' })

    await user.type(input, 'cast a spell')
    await user.click(submitButton)

    expect(input).toHaveValue('')
  })

  it('should not submit empty or whitespace-only input', async () => {
    const user = userEvent.setup()
    render(<ActionForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('Введите действие...')
    const submitButton = screen.getByRole('button', { name: 'Отправить' })

    // Test empty input
    await user.click(submitButton)
    expect(mockOnSubmit).not.toHaveBeenCalled()

    // Test whitespace-only input
    await user.type(input, '   ')
    await user.click(submitButton)
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should submit on Enter key press', async () => {
    const user = userEvent.setup()
    render(<ActionForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('Введите действие...')

    await user.type(input, 'attack the dragon')
    await user.keyboard('{Enter}')

    expect(mockOnSubmit).toHaveBeenCalledWith('attack the dragon')
  })

  it('should have correct CSS classes', () => {
    const { container } = render(<ActionForm onSubmit={mockOnSubmit} />)

    const form = container.querySelector('form')!
    const input = screen.getByPlaceholderText('Введите действие...')
    const button = screen.getByRole('button', { name: 'Отправить' })

    expect(form).toHaveClass('flex', 'gap-2', 'p-4')
    expect(input).toHaveClass('flex-1', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md')
    expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded-md')
  })

  it('should handle multiple rapid submissions', async () => {
    const user = userEvent.setup()
    render(<ActionForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText('Введите действие...')
    const submitButton = screen.getByRole('button', { name: 'Отправить' })

    await user.type(input, 'first action')
    await user.click(submitButton)

    await user.type(input, 'second action')
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(2)
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, 'first action')
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, 'second action')
  })
})
