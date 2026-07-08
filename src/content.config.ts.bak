import { defineCollection, z } from 'astro:content';

const novel = defineCollection({
  schema: z.object({
    title: z.string(),
    chineseTitle: z.string().optional(),
    cover: z.string().optional(),
    author: z.string().optional(),
    status: z.string().optional(),
    views: z.string().optional(),
    chapters: z.number().optional(),
    rating: z.number().optional(),
    readers: z.number().optional(),
    totalChars: z.string().optional(),
    tags: z.array(z.string()).optional(),
    tagCategories: z.record(z.string(), z.array(z.string())).optional(),
    genres: z.array(z.string()).optional(),
    details: z.object({
      author: z.string().optional(),
      authorPinyin: z.string().optional(),
      authorUrl: z.string().optional(),
      status: z.string().optional(),
      dateAdded: z.string().optional(),
      requested: z.string().optional(),
      requestedUrl: z.string().optional(),
      year: z.number().optional(),
      origin: z.string().optional(),
      language: z.string().optional(),
    }).optional(),
    rankings: z.object({
      weekly: z.number().optional(),
      allTime: z.number().optional(),
    }).optional(),
    dataFiles: z.object({
      chapters: z.string().optional(),
      reviews: z.string().optional(),
      recommendations: z.string().optional(),
      patrons: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { novel };
