import { z } from "zod";

export const IDSchema = z.string().or(z.number());

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const SearchSchema = z.object({
  query: z.string().optional(),
});
