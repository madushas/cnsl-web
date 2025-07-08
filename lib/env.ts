import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },
  client: {
    // Add client-side env vars here if needed
  },
  experimental__runtimeEnv: {
    // Add runtime env vars here if needed
  },
});