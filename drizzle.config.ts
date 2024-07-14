import { defineConfig } from 'drizzle-kit';
import { cwd } from 'node:process';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(cwd());

// using cloudflare wrangler
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
