import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Leaderboard from './Leaderboard';
import { getLeaderboard } from '../api/eggscan';

// Mock the API module
vi.mock('../api/eggscan', () => ({
  getLeaderboard: vi.fn(),
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hall of fame button', () => {
    render(<Leaderboard />);
    expect(screen.getByRole('button', { name: '🏆 Hall of Fame' })).toBeInTheDocument();
  });

  it('fetches and displays leaderboard data when opened', async () => {
    const mockData = [
      { id: '1', username: 'user1', vibe: 'chill', eggScore: 9000, eggVerdict: 'godlike', avatarUrl: 'http://example.com/1.png' },
      { id: '2', username: 'user2', vibe: 'spicy', eggScore: 8000, eggVerdict: 'legendary', avatarUrl: 'http://example.com/2.png' },
    ];

    // We want the promise to resolve after a tiny delay so the loading state is captured
    let resolvePromise;
    const promise = new Promise((resolve) => { resolvePromise = resolve; });
    getLeaderboard.mockReturnValue(promise);

    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));

    // Verify loading state
    expect(screen.getByText('Loading legends...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise(mockData);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading legends...')).not.toBeInTheDocument();
    });

    // Verify data is displayed
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('9000')).toBeInTheDocument();
    expect(screen.getByText('8000')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('API is down');

    let rejectPromise;
    const promise = new Promise((_, reject) => { rejectPromise = reject; });
    getLeaderboard.mockReturnValue(promise);

    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));

    // Verify loading state initially
    expect(screen.getByText('Loading legends...')).toBeInTheDocument();

    // Reject the promise
    rejectPromise(error);

    // Wait for loading to finish and error to be caught
    await waitFor(() => {
      expect(screen.queryByText('Loading legends...')).not.toBeInTheDocument();
    });

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    // Verify loading state is reset and empty state is shown
    expect(screen.getByText('No one has been scanned yet!')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
