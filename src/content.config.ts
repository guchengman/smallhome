import { defineCollection, z } from "astro:content";

const articles = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    areaSize: z.string().optional(),
    room: z.string().optional(),
    styleName: z.string().optional(),
    budgetRange: z.string().optional(),
    coverImage: z.string(),
    author: z.string(),
  }),
});

export const collections = { articles };