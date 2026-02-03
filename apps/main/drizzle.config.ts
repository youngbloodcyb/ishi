import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export default defineConfig({
  out: "./lib/db/migrations",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
