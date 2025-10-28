import { render, screen } from '@testing-library/react'
import ConnectionStatus from '../../components/ConnectionStatus'

describe('ConnectionStatus', () => {
  it('should show connected status when connected is true', () => {
    render(<ConnectionStatus connected={true} />)

    expect(screen.getByText('Подключено')).toBeInTheDocument()
    
    const statusDot = screen.getByText('Подключено').previousElementSibling
    expect(statusDot).toHaveClass('bg-green-500')
  })

  it('should show disconnected status when connected is false', () => {
    render(<ConnectionStatus connected={false} />)

    expect(screen.getByText('Отключено')).toBeInTheDocument()
    
    const statusDot = screen.getByText('Отключено').previousElementSibling
    expect(statusDot).toHaveClass('bg-red-500')
  })

  it('should have correct structure with status dot and text', () => {
    render(<ConnectionStatus connected={true} />)

    const container = screen.getByText('Подключено').closest('div')
    expect(container).toHaveClass('flex', 'items-center', 'gap-2')
  })

  it('should have round status dot', () => {
    render(<ConnectionStatus connected={true} />)

    const statusDot = screen.getByText('Подключено').previousElementSibling
    expect(statusDot).toHaveClass('w-3', 'h-3', 'rounded-full')
  })

  it('should have small text size', () => {
    render(<ConnectionStatus connected={true} />)

    expect(screen.getByText('Подключено')).toHaveClass('text-sm')
  })
})
