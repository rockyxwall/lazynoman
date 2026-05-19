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
			heroImage: z.union([z.string(), image()]).optional(),
			draft: z.boolean().optional().default(false),
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			rating: z.number().min(1).max(10).optional(),
			itemAuthor: z.string().optional(),
			officialTitle: z.string().optional(),
			by: z.string().optional(),
		}),
});

export const collections = { post };
