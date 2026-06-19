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

    // Verify loading state is reset and error state is shown
    expect(screen.getByText('Failed to load leaderboard. Please try again.')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('closes the modal when Escape key is pressed', async () => {
    getLeaderboard.mockResolvedValue([]);
    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));
    expect(screen.getByText('Hall of Fame')).toBeInTheDocument();

    // Press Escape
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Hall of Fame')).not.toBeInTheDocument();
  });

  it('closes the modal when backdrop is clicked', async () => {
    getLeaderboard.mockResolvedValue([]);
    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));
    expect(screen.getByText('Hall of Fame')).toBeInTheDocument();

    // Find the backdrop and click it. Since backdrop is the div that contains everything and handles clicks,
    // we can use testing library to find it by text or test-id. Or just click the wrapper.
    const backdrop = screen.getByText('Hall of Fame').closest('div').parentElement.parentElement;
    await userEvent.click(backdrop);

    expect(screen.queryByText('Hall of Fame')).not.toBeInTheDocument();
  });

  it('does not close the modal when inner content is clicked', async () => {
    getLeaderboard.mockResolvedValue([]);
    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));

    const innerContent = screen.getByText('Hall of Fame').parentElement;
    await userEvent.click(innerContent);

    expect(screen.getByText('Hall of Fame')).toBeInTheDocument();
  });

  it('navigates to user profile when a leaderboard item is clicked', async () => {
    const mockData = [
      { id: '123', username: 'user1', vibe: 'chill', eggScore: 9000, eggVerdict: 'godlike', avatarUrl: 'http://example.com/1.png' },
    ];
    getLeaderboard.mockResolvedValue(mockData);

    const originalLocation = window.location;
    // Mock window.history.pushState and window.location.reload
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: vi.fn() },
      writable: true
    });

    render(<Leaderboard />);

    // Open modal
    await userEvent.click(screen.getByRole('button', { name: '🏆 Hall of Fame' }));

    // Wait for data to load
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());

    // Click the item
    await userEvent.click(screen.getByText('user1').closest('button'));

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/?id=123');
    expect(window.location.reload).toHaveBeenCalled();
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });
});
