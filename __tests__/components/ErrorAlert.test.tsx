import { render, screen } from '@testing-library/react'
import ErrorAlert from '../../components/ErrorAlert'

describe('ErrorAlert', () => {
  it('should render error message when error is provided', () => {
    const errorMessage = 'Test error message'
    render(<ErrorAlert error={errorMessage} />)

    expect(screen.getByText(`Ошибка: ${errorMessage}`)).toBeInTheDocument()
  })

  it('should not render anything when error is null', () => {
    const { container } = render(<ErrorAlert error={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('should not render anything when error is empty string', () => {
    const { container } = render(<ErrorAlert error="" />)

    expect(container.firstChild).toBeNull()
  })

  it('should have correct CSS classes for error styling', () => {
    const errorMessage = 'Test error message'
    const { container } = render(<ErrorAlert error={errorMessage} />)

    const errorContainer = container.firstChild as HTMLElement
    expect(errorContainer).toHaveClass('bg-red-100', 'border-l-4', 'border-red-500', 'text-red-700', 'p-4')
  })

  it('should have proper structure with flex layout', () => {
    const errorMessage = 'Test error message'
    render(<ErrorAlert error={errorMessage} />)

    const flexContainer = screen.getByText(`Ошибка: ${errorMessage}`).closest('.flex')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should have small font size for error text', () => {
    const errorMessage = 'Test error message'
    render(<ErrorAlert error={errorMessage} />)

    expect(screen.getByText(`Ошибка: ${errorMessage}`)).toHaveClass('text-sm', 'font-medium')
  })

  it('should handle long error messages', () => {
    const longErrorMessage = 'This is a very long error message that should still be displayed correctly without breaking the layout or causing any issues with the component rendering'
    render(<ErrorAlert error={longErrorMessage} />)

    expect(screen.getByText(`Ошибка: ${longErrorMessage}`)).toBeInTheDocument()
  })
})
