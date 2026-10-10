import { defineCollection, z } from "astro:content";

const blog = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        author: z.string(),
        image: z.string().optional(),
        summary: z.string().optional(),
    }),
});

export const collections = {
    blog,
};