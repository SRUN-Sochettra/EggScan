import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RepoItem from './RepoItem'
import { vi } from 'vitest'
import { deepDiveRepo } from '../../api/eggscan'

// Mock the API module
vi.mock('../../api/eggscan', () => ({
  deepDiveRepo: vi.fn()
}))

describe('RepoItem Component', () => {
  const mockRepo = {
    name: 'test-repo',
    description: 'A test repository',
    primaryLanguage: 'JavaScript',
    stars: 42
  }
  const username = 'testuser'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders repository information correctly', () => {
    render(<RepoItem repo={mockRepo} username={username} />)

    expect(screen.getByText('test-repo')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('★ 42')).toBeInTheDocument()
    expect(screen.getByText('A test repository')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Deep Dive/i })).toBeInTheDocument()
  })

  it('handles deep dive success correctly', async () => {
    const user = userEvent.setup()
    const mockAnalysis = {
      summary: 'Great repo',
      architectureAndStack: 'React and Node',
      codeStructureFeedback: 'Well organized',
      commitQualityFeedback: 'Good commit messages',
      actionableImprovements: ['Add more tests', 'Update dependencies']
    }

    // Setup successful mock - delay it slightly so we can check loading state
    deepDiveRepo.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockAnalysis), 10)))

    render(<RepoItem repo={mockRepo} username={username} />)

    // Click deep dive button
    const deepDiveBtn = screen.getByRole('button', { name: /Deep Dive/i })
    await user.click(deepDiveBtn)

    // Should show loading state
    expect(screen.getByText(/Analyzing architecture/i)).toBeInTheDocument()

    // API should be called with correct arguments
    expect(deepDiveRepo).toHaveBeenCalledWith('testuser', 'test-repo')
    expect(deepDiveRepo).toHaveBeenCalledTimes(1)

    // Wait for analysis to appear
    await waitFor(() => {
      expect(screen.getByText(/AI Deep Dive/i)).toBeInTheDocument()
    })

    // Verify analysis content
    expect(screen.getByText('Great repo')).toBeInTheDocument()
    expect(screen.getByText('React and Node')).toBeInTheDocument()
    expect(screen.getByText('Add more tests')).toBeInTheDocument()
    expect(screen.getByText('Update dependencies')).toBeInTheDocument()

    // Loading state and button should be gone
    expect(screen.queryByText(/Analyzing architecture/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Deep Dive/i })).not.toBeInTheDocument()
  })

  it('handles deep dive error correctly', async () => {
    const user = userEvent.setup()
    // Setup error mock - delay it slightly so we can check loading state
    const errorMessage = 'API rate limit exceeded'
    deepDiveRepo.mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), 10)))

    render(<RepoItem repo={mockRepo} username={username} />)

    // Click deep dive button
    const deepDiveBtn = screen.getByRole('button', { name: /Deep Dive/i })
    await user.click(deepDiveBtn)

    // Should show loading state
    expect(screen.getByText(/Analyzing architecture/i)).toBeInTheDocument()

    // API should be called with correct arguments
    expect(deepDiveRepo).toHaveBeenCalledWith('testuser', 'test-repo')

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(`Failed to analyze: ${errorMessage}`)).toBeInTheDocument()
    })

    // Loading state should be gone
    expect(screen.queryByText(/Analyzing architecture/i)).not.toBeInTheDocument()

    // Button should be back since there's no analysis and it's not analyzing
    expect(screen.getByRole('button', { name: /Deep Dive/i })).toBeInTheDocument()
  })

  it('allows closing the analysis view', async () => {
    const user = userEvent.setup()
    deepDiveRepo.mockResolvedValueOnce({ summary: 'Test summary' })

    render(<RepoItem repo={mockRepo} username={username} />)

    // Click deep dive and wait for it to load
    await user.click(screen.getByRole('button', { name: /Deep Dive/i }))

    await waitFor(() => {
      expect(screen.getByText(/AI Deep Dive/i)).toBeInTheDocument()
    })

    // Click the close button
    const closeBtn = screen.getByRole('button', { name: /Close analysis/i })
    await user.click(closeBtn)

    // Analysis should be gone and deep dive button back
    expect(screen.queryByText(/AI Deep Dive/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Deep Dive/i })).toBeInTheDocument()
  })
})
