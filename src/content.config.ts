import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
	loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			category: z.string().optional(),
			creator: z.string().optional(),
			medium: z.string().optional(),
			progress: z.string().optional(),
			tags: z.array(z.string()).optional(),
			draft: z.boolean().default(false),
			summary: z.string().optional(),
			synonyms: z.array(z.string()).optional(),
			infoNovel: z.object({
				officialTitle: z.string().optional(),
				itemAuthor: z.string().optional(),
				rating: z.number().optional(),
				novelGenres: z.array(z.string()).optional(),
				novelTags: z.array(z.string()).optional(),
				status: z.string().optional(),
				chapterCount: z.number().optional(),
				platform: z.string().optional(),
				novelDescription: z.string().optional(),
				novelType: z.string().optional(),
			}).optional(),
			infoMyReadingStats: z.object({
				status: z.enum(['completed', 'on-hold', 'dropped', 'reading']),
				startedReading: z.string().optional(),
				stoppedReading: z.string().optional(),
				chaptersRead: z.number().optional(),
				totalChapters: z.number().optional(),
				myRating: z.number().optional(),
			}).optional(),
		}),
});

export const collections = { post };
