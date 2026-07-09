import { defineCollection, z } from 'astro:content';

const artikelen = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    subtitle: z.string(),
    category: z.enum(['seo', 'ai', 'marketing', 'websites']),
    badge: z.string(),
    badgeColor: z.enum(['blue', 'orange', 'green', 'purple']),
    date: z.string(),
    readTime: z.string(),
    icon: z.string(),
    related: z.array(z.string()),
    ctaText: z.string(),
    ctaButton: z.string(),
  }),
});

export const collections = { artikelen };
