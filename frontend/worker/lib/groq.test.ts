import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { groqJson } from './groq'
import { AppError } from './errors'
import type { Env } from '../types'

describe('groqJson', () => {
  const fakeEnv = {
    GROQ_API_KEY: 'test-api-key',
    GROQ_MODEL: 'test-model',
  } as Env

  const TestSchema = z.object({
    answer: z.string(),
  })

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('translates generic 429 into AI-specific rate limit AppError and does not retry', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
    } as Response)

    try {
      await groqJson(fakeEnv, 'System prompt', { some: 'evidence' }, TestSchema)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      const appError = error as AppError
      expect(appError.status).toBe(429)
      expect(appError.code).toBe('UPSTREAM_RATE_LIMITED')
      expect(appError.message).toBe('The AI service is temporarily rate limited. Please wait and try again.')
    }

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not retry when another AppError occurs on the Groq request path', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    try {
      await groqJson(fakeEnv, 'System prompt', { some: 'evidence' }, TestSchema)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      const appError = error as AppError
      expect(appError.status).toBe(502)
      expect(appError.code).toBe('UPSTREAM_ERROR')
      expect(appError.message).toBe('An upstream service returned HTTP 500.')
    }

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('retries when JSON is invalid inside the Groq envelope and succeeds on the second attempt', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: 'not valid json text' } }],
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ answer: 'recovered' }) } }],
        }),
      } as unknown as Response)

    const result = await groqJson(fakeEnv, 'System prompt', { some: 'evidence' }, TestSchema)
    expect(result).toEqual({ answer: 'recovered' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retries when Zod schema validation fails and succeeds on the second attempt', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ wrongField: 123 }) } }],
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ answer: 'valid answer' }) } }],
        }),
      } as unknown as Response)

    const result = await groqJson(fakeEnv, 'System prompt', { some: 'evidence' }, TestSchema)
    expect(result).toEqual({ answer: 'valid answer' })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('throws AppError with status 502 and INVALID_AI_RESPONSE if content validation fails twice', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'invalid json content' } }],
      }),
    } as unknown as Response)

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await groqJson(fakeEnv, 'System prompt', { some: 'evidence' }, TestSchema)
      expect.unreachable('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      const appError = error as AppError
      expect(appError.status).toBe(502)
      expect(appError.code).toBe('INVALID_AI_RESPONSE')
      expect(appError.message).toBe('Repository analysis is temporarily unavailable. Please try again.')
    }

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'AI result validation failed after retry',
      expect.objectContaining({ validationSummary: expect.any(String) }),
    )
  })
})
