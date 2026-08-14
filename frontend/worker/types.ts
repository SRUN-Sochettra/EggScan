export interface Env {
  DB: D1Database
  GITHUB_TOKEN: string
  GROQ_API_KEY: string
  GROQ_MODEL: string
}

export type AppBindings = { Bindings: Env }
