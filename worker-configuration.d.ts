/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_TIME_ZONE?: string;
  APP_ORIGIN?: string;
}
