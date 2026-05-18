/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        JWT_SECRET?: string;
        RESEND_API_KEY?: string;
      };
    };
  }
}

interface ImportMetaEnv {
  readonly JWT_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly DB: D1Database;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}