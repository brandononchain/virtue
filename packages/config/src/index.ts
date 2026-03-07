export const config = {
  api: {
    port: parseInt(process.env.API_PORT || "4000", 10),
    host: process.env.API_HOST || "localhost",
  },
  providers: {
    default: (process.env.DEFAULT_PROVIDER || "mock") as "mock" | "luma" | "openai" | "google",
    luma: { apiKey: process.env.LUMA_API_KEY || "" },
    openai: { apiKey: process.env.OPENAI_API_KEY || "" },
    google: { apiKey: process.env.GOOGLE_AI_API_KEY || "" },
  },
  skills: {
    directory: process.env.SKILLS_DIR || "../../Skills",
  },
} as const;
