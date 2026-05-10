import { defineMiddleware } from "astro:middleware";
import { getDb } from "./lib/turso";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware(async (context, next) => {
  // Use the new Astro v6 / Cloudflare way to access env
  context.locals.db = getDb(env);
  
  return next();
});
