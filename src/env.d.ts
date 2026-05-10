/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      db: import('@libsql/client').Client;
    }
  }
}

export {};
