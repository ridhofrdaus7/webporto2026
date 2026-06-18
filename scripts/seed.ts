/**
 * Seeds Supabase with the admin user, categories, profile, and sample projects.
 * Run with: npm run db:seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Admin creation is optional and credential-free by default: pass
 * ADMIN_EMAIL and ADMIN_PASSWORD inline ONLY when you want to create the
 * admin user (do not store them in .env), e.g.
 *   ADMIN_EMAIL="you@mail.com" ADMIN_PASSWORD="strong" npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { brands, catalogs, categories, profile, sampleProjects } from "../lib/sample-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "Skipping admin user (no ADMIN_EMAIL/ADMIN_PASSWORD provided). " +
        "Pass them inline only when you need to create one, or use the Supabase dashboard."
    );
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Ridho Firdaus", role: "admin" }
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      console.log(`Admin user ${email} already exists, skipping.`);
      return;
    }
    throw error;
  }
  console.log(`Created admin user ${data.user?.email}`);
}

async function seedBrands() {
  const { data, error } = await supabase
    .from("brands")
    .upsert(
      brands.map((brand) => ({ name: brand.name, slug: brand.slug })),
      { onConflict: "slug" }
    )
    .select("id,slug");
  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.slug, row.id as string]));
}

async function seedCategories() {
  const { data, error } = await supabase
    .from("categories")
    .upsert(
      categories.map((category) => ({ name: category.name, slug: category.slug })),
      { onConflict: "slug" }
    )
    .select("id,slug");
  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.slug, row.id as string]));
}

async function seedCatalogs(brandIds: Map<string, string>) {
  const { data, error } = await supabase
    .from("catalogs")
    .upsert(
      catalogs.map((catalog, index) => ({
        brand_name: catalog.brandName,
        brand_id: brandIds.get(catalog.brandSlug) ?? null,
        name: catalog.name,
        slug: catalog.slug,
        sort_order: index
      })),
      { onConflict: "slug" }
    )
    .select("id,slug");
  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.slug, row.id as string]));
}

async function seedProfile() {
  const payload = {
    name: profile.name,
    headline: profile.headline,
    bio: profile.bio,
    email: profile.email,
    whatsapp: profile.whatsapp,
    instagram_url: profile.instagramUrl ?? null,
    linkedin_url: profile.linkedinUrl ?? null
  };

  const { data: existing } = await supabase.from("profile").select("id").maybeSingle();
  if (existing) {
    const { error } = await supabase.from("profile").update(payload).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("profile").insert(payload);
    if (error) throw error;
  }
}

async function seedProjects(
  categoryIds: Map<string, string>,
  catalogIds: Map<string, string>,
  brandIds: Map<string, string>
) {
  for (const project of sampleProjects) {
    const categoryId = categoryIds.get(project.category.slug);
    if (!categoryId) throw new Error(`Missing category for ${project.slug}`);
    const catalogId = project.catalog ? catalogIds.get(project.catalog.slug) ?? null : null;
    const brandId = project.brand ? brandIds.get(project.brand.slug) ?? null : null;

    const { data: saved, error } = await supabase
      .from("projects")
      .upsert(
        {
          title: project.title,
          slug: project.slug,
          client_name: project.clientName,
          brand_id: brandId,
          category_id: categoryId,
          catalog_id: catalogId,
          year: project.year,
          role: project.role,
          tools: project.tools,
          short_description: project.shortDescription,
          full_description: project.fullDescription,
          challenge: project.challenge,
          process: project.process,
          result: project.result,
          thumbnail_url: project.thumbnailUrl,
          status: project.status
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (error || !saved) throw error ?? new Error(`Failed to seed ${project.slug}`);

    await supabase.from("project_media").delete().eq("project_id", saved.id);
    if (project.media.length > 0) {
      const { error: mediaError } = await supabase.from("project_media").insert(
        project.media.map((media) => ({
          project_id: saved.id,
          media_type: media.mediaType,
          media_url: media.mediaUrl,
          alt_text: media.altText,
          sort_order: media.sortOrder
        }))
      );
      if (mediaError) throw mediaError;
    }
  }
}

async function main() {
  await seedAdminUser();
  const brandIds = await seedBrands();
  const categoryIds = await seedCategories();
  const catalogIds = await seedCatalogs(brandIds);
  await seedProfile();
  await seedProjects(categoryIds, catalogIds, brandIds);
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
