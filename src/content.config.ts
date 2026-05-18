import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string(),
    author: z.string(),
  }),
});

export const collections = { articles };