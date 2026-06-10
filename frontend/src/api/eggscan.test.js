import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scanGithub, battleGithub, getLeaderboard, getScanResult } from './eggscan.js';

const BASE = 'http://localhost:8080';

describe('eggscan API', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scanGithub', () => {
    it('fetches successfully and returns json', async () => {
      const mockData = { id: 1, result: 'success' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await scanGithub('testuser', 'brutal');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/scan/testuser?mode=brutal`);
      expect(result).toEqual(mockData);
    });

    it('uses default honest mode when mode is not provided', async () => {
      const mockData = { id: 1, result: 'success' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      await scanGithub('testuser');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/scan/testuser?mode=honest`);
    });

    it('encodes special characters in username and mode', async () => {
      const mockData = { id: 1, result: 'success' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      await scanGithub('test user', 'my mode?');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/scan/test%20user?mode=my%20mode%3F`);
    });

    it('throws error with message from api when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'User not found' }),
      });

      await expect(scanGithub('testuser')).rejects.toThrow('User not found');
    });

    it('throws default error when response is not ok and json is invalid', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('invalid json'); },
      });

      await expect(scanGithub('testuser')).rejects.toThrow('Scan failed');
    });
  });

  describe('battleGithub', () => {
    it('fetches successfully and returns json', async () => {
      const mockData = { winner: 'user1' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await battleGithub('user1', 'user2');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/battle?u1=user1&u2=user2`);
      expect(result).toEqual(mockData);
    });

    it('encodes special characters in usernames', async () => {
      const mockData = { winner: 'user1' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      await battleGithub('user 1', 'user/2');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/battle?u1=user%201&u2=user%2F2`);
    });

    it('throws error with message from api when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Battle error' }),
      });

      await expect(battleGithub('user1', 'user2')).rejects.toThrow('Battle error');
    });

    it('throws default error when response is not ok and json is invalid', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('invalid json'); },
      });

      await expect(battleGithub('user1', 'user2')).rejects.toThrow('Battle failed');
    });
  });

  describe('getLeaderboard', () => {
    it('fetches successfully and returns json', async () => {
      const mockData = [{ username: 'user1', score: 100 }];
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getLeaderboard();
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/leaderboard`);
      expect(result).toEqual(mockData);
    });

    it('throws error with message from api when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Leaderboard unavailable' }),
      });

      await expect(getLeaderboard()).rejects.toThrow('Leaderboard unavailable');
    });

    it('throws default error when response is not ok and json is invalid', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('invalid json'); },
      });

      await expect(getLeaderboard()).rejects.toThrow('Failed to fetch leaderboard');
    });
  });

  describe('getScanResult', () => {
    it('fetches successfully and returns json', async () => {
      const mockData = { id: 'scan123', status: 'completed' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getScanResult('scan123');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/scan/result/scan123`);
      expect(result).toEqual(mockData);
    });

    it('encodes special characters in id', async () => {
      const mockData = { id: 'scan/123', status: 'completed' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      await getScanResult('scan/123');
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/scan/result/scan%2F123`);
    });

    it('throws error with message from api when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Scan not found' }),
      });

      await expect(getScanResult('scan123')).rejects.toThrow('Scan not found');
    });

    it('throws default error when response is not ok and json is invalid', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        json: async () => { throw new Error('invalid json'); },
      });

      await expect(getScanResult('scan123')).rejects.toThrow('Scan failed');
    });
  });
});
