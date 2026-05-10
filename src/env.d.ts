/// <reference types="astro/client" />
import type { Client } from '@libsql/client';

declare namespace App {
  interface Locals {
    db: Client;
  }
}
