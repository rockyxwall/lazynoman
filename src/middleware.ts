import { defineMiddleware } from "astro:middleware";
import { getDb } from "./lib/turso";

export const onRequest = defineMiddleware(async (context, next) => {
  // Access Cloudflare runtime env if available
  const env = (context.locals as any).runtime?.env;
  
  // Initialize db and attach to locals
  (context.locals as any).db = getDb(env);
  
  return next();
});
