import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const post = defineCollection({
	// Load Markdown and MDX files in the `src/content/` directory.
	loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			category: z.string().optional(),
			creator: z.string().optional(),
			medium: z.string().optional(),
			status: z.string().optional(),
			platform: z.string().optional(),
			progress: z.string().optional(),
			tags: z.array(z.string()).optional(),
			draft: z.boolean().default(false),
			summary: z.string().optional(),
			officialTitle: z.string().optional(),
			synonyms: z.array(z.string()).optional(),
		}),
});

export const collections = { post };
