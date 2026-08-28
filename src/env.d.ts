/// <reference types="astro/client" />

declare module "https://unpkg.com/@waline/client@v3/dist/waline.js" {
  export interface WalineInitOptions {
    el: string | HTMLElement;
    serverURL: string;
    lang?: string;
    dark?: string | boolean;
    reaction?: boolean | string[];
    search?: boolean;
    [key: string]: any;
  }

  export function init(options: WalineInitOptions): any;
}
