import { z } from "zod";

const cleanText = (min = 0, max?: number) => {
  let schema = z.string().trim().min(min);
  if (max) schema = schema.max(max);
  return schema.transform((value) => value.replace(/[<>]/g, ""));
};

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const contactSchema = z.object({
  name: cleanText(2),
  email: z.string().trim().email(),
  company: cleanText().optional().or(z.literal("")),
  projectNeed: cleanText(2),
  budget: cleanText().optional().or(z.literal("")),
  message: cleanText(10, 2000)
});

export const projectSchema = z.object({
  title: cleanText(2),
  slug: z.string().trim().optional().or(z.literal("")),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  catalogId: z.string().trim().optional().or(z.literal("")),
  year: z.coerce.number().int().min(2000).max(2100),
  role: cleanText(),
  tools: cleanText(),
  shortDescription: cleanText(),
  fullDescription: cleanText(),
  challenge: cleanText(),
  process: cleanText(),
  result: cleanText(),
  thumbnailUrl: z.string().trim().url().or(z.string().startsWith("/uploads/")),
  status: z.enum(["draft", "published"])
});

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Maps validated project input to Supabase (snake_case) column values. */
export function projectDataForDb(input: z.infer<typeof projectSchema>) {
  const tools = input.tools
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean)
    .join(", ");

  return {
    title: input.title,
    slug: input.slug ? slugify(input.slug) : slugify(input.title),
    brand_id: input.brandId,
    category_id: input.categoryId,
    catalog_id: input.catalogId || null,
    year: input.year,
    role: input.role,
    tools,
    short_description: input.shortDescription,
    full_description: input.fullDescription,
    challenge: input.challenge,
    process: input.process,
    result: input.result,
    thumbnail_url: input.thumbnailUrl,
    status: input.status
  };
}

export const profileSchema = z.object({
  name: cleanText(2),
  headline: cleanText(5),
  bio: cleanText(20),
  profileImageUrl: z.string().trim().url().optional().or(z.literal("")),
  email: z.string().trim().email(),
  whatsapp: cleanText(5),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
  cvUrl: z.string().trim().url().optional().or(z.literal(""))
});

/** Maps validated profile input to Supabase (snake_case) column values. */
export function profileDataForDb(input: z.infer<typeof profileSchema>) {
  return {
    name: input.name,
    headline: input.headline,
    bio: input.bio,
    profile_image_url: input.profileImageUrl || null,
    email: input.email,
    whatsapp: input.whatsapp,
    instagram_url: input.instagramUrl || null,
    linkedin_url: input.linkedinUrl || null,
    cv_url: input.cvUrl || null
  };
}

export const brandSchema = z.object({
  name: cleanText(2),
  slug: z.string().trim().optional().or(z.literal(""))
});

/** Maps validated brand input to Supabase (snake_case) column values. */
export function brandDataForDb(input: z.infer<typeof brandSchema>) {
  return {
    name: input.name,
    slug: input.slug ? slugify(input.slug) : slugify(input.name)
  };
}

export const allowedUploadTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4"
];
