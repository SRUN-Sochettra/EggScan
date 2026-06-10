import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BattleForm from './BattleForm'
import { vi } from 'vitest'

describe('BattleForm Component', () => {
  it('renders correctly', () => {
    render(<BattleForm onBattle={vi.fn()} loading={false} />)
    expect(screen.getByText('🥊 1v1 Battle Mode')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Player 1')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Player 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'FIGHT!' })).toBeInTheDocument()
  })

  it('calls onBattle with trimmed inputs when both fields are filled and submitted', async () => {
    const handleBattle = vi.fn()
    render(<BattleForm onBattle={handleBattle} loading={false} />)

    const input1 = screen.getByPlaceholderText('Player 1')
    const input2 = screen.getByPlaceholderText('Player 2')
    const submitBtn = screen.getByRole('button', { name: 'FIGHT!' })

    await userEvent.type(input1, '  user1  ')
    await userEvent.type(input2, ' user2 ')

    expect(submitBtn).not.toBeDisabled()

    await userEvent.click(submitBtn)

    expect(handleBattle).toHaveBeenCalledTimes(1)
    expect(handleBattle).toHaveBeenCalledWith('user1', 'user2')
  })

  it('disables inputs and button when loading is true', () => {
    render(<BattleForm onBattle={vi.fn()} loading={true} />)

    expect(screen.getByPlaceholderText('Player 1')).toBeDisabled()
    expect(screen.getByPlaceholderText('Player 2')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Simulating battle...' })).toBeDisabled()
  })

  it('disables submit button when inputs are empty or only whitespace', async () => {
    render(<BattleForm onBattle={vi.fn()} loading={false} />)

    const input1 = screen.getByPlaceholderText('Player 1')
    const input2 = screen.getByPlaceholderText('Player 2')
    const submitBtn = screen.getByRole('button', { name: 'FIGHT!' })

    // Initially disabled because inputs are empty
    expect(submitBtn).toBeDisabled()

    // Type only whitespace
    await userEvent.type(input1, '   ')
    await userEvent.type(input2, '   ')

    expect(submitBtn).toBeDisabled()

    // Type in one field, leave other empty
    await userEvent.clear(input1)
    await userEvent.clear(input2)
    await userEvent.type(input1, 'user1')

    expect(submitBtn).toBeDisabled()
  })
})
