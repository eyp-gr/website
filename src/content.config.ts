
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  author: z.string().optional(),
  image: z.string().optional(),
  summary: z.string(),
  attachment: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
  }),
  schema: postSchema,
});

const policies = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/policies",
  }),
  schema: postSchema,
});

export const collections = {
  blog,
  policies,
};