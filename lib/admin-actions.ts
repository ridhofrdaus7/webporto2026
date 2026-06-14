"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import {
  brandDataForDb,
  brandSchema,
  profileDataForDb,
  profileSchema,
  projectDataForDb,
  projectSchema
} from "@/lib/validation";

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function galleryRows(formData: FormData, projectId: string) {
  return formString(formData, "galleryItems")
    .split("\n")
    .map((line, index) => {
      const [mediaUrl, altText = "", mediaType = "image"] = line
        .split("|")
        .map((part) => part.trim());
      if (!mediaUrl) return null;
      return {
        project_id: projectId,
        media_url: mediaUrl,
        alt_text: altText || "Project gallery media",
        media_type: mediaType === "video" ? "video" : "image",
        sort_order: index
      };
    })
    .filter(Boolean) as Array<{
    project_id: string;
    media_url: string;
    alt_text: string;
    media_type: string;
    sort_order: number;
  }>;
}

export type ProjectFormState = { error?: string };

function projectInput(formData: FormData) {
  return {
    title: formString(formData, "title"),
    slug: formString(formData, "slug"),
    brandId: formString(formData, "brandId"),
    categoryId: formString(formData, "categoryId"),
    catalogId: formString(formData, "catalogId"),
    year: formString(formData, "year"),
    role: formString(formData, "role"),
    tools: formString(formData, "tools"),
    shortDescription: formString(formData, "shortDescription"),
    fullDescription: formString(formData, "fullDescription"),
    challenge: formString(formData, "challenge"),
    process: formString(formData, "process"),
    result: formString(formData, "result"),
    thumbnailUrl: formString(formData, "thumbnailUrl"),
    status: formString(formData, "status")
  };
}

function firstZodMessage(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  const issue = error.issues[0];
  if (!issue) return "Invalid form data.";
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

function revalidatePortfolioContent() {
  updateTag("portfolio-content");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/projects?demo=1");

  const parsed = projectSchema.safeParse(projectInput(formData));
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  const supabase = createSupabaseAdminClient();
  const { data: project, error } = await supabase
    .from("projects")
    .insert(projectDataForDb(parsed.data))
    .select("id")
    .single();
  if (error || !project) return { error: error?.message ?? "Failed to create project." };

  const media = galleryRows(formData, project.id);
  if (media.length > 0) {
    const { error: mediaError } = await supabase.from("project_media").insert(media);
    if (mediaError) return { error: mediaError.message };
  }

  revalidatePortfolioContent();
  redirect("/admin/projects");
}

export async function updateProjectAction(
  id: string,
  _prev: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/projects?demo=1");

  const parsed = projectSchema.safeParse(projectInput(formData));
  if (!parsed.success) return { error: firstZodMessage(parsed.error) };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("projects")
    .update(projectDataForDb(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  const { error: deleteError } = await supabase
    .from("project_media")
    .delete()
    .eq("project_id", id);
  if (deleteError) return { error: deleteError.message };

  const media = galleryRows(formData, id);
  if (media.length > 0) {
    const { error: mediaError } = await supabase.from("project_media").insert(media);
    if (mediaError) return { error: mediaError.message };
  }

  revalidatePortfolioContent();
  redirect("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/projects?demo=1");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;

  revalidatePortfolioContent();
}

export async function createBrandAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/brands?demo=1");

  const parsed = brandSchema.parse({
    name: formString(formData, "name"),
    slug: formString(formData, "slug")
  });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brands").insert(brandDataForDb(parsed));
  if (error) throw error;

  updateTag("portfolio-content");
  revalidatePath("/admin/brands");
  revalidatePath("/portfolio");
  redirect("/admin/brands");
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/brands?demo=1");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;

  updateTag("portfolio-content");
  revalidatePath("/admin/brands");
  revalidatePath("/portfolio");
}

export async function updateProfileAction(formData: FormData) {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) redirect("/admin/profile?demo=1");

  const parsed = profileSchema.parse({
    name: formString(formData, "name"),
    headline: formString(formData, "headline"),
    bio: formString(formData, "bio"),
    profileImageUrl: formString(formData, "profileImageUrl"),
    email: formString(formData, "email"),
    whatsapp: formString(formData, "whatsapp"),
    instagramUrl: formString(formData, "instagramUrl"),
    linkedinUrl: formString(formData, "linkedinUrl"),
    cvUrl: formString(formData, "cvUrl")
  });

  const supabase = createSupabaseAdminClient();
  const payload = profileDataForDb(parsed);

  const { data: existing } = await supabase.from("profile").select("id").maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("profile")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("profile").insert(payload);
    if (error) throw error;
  }

  revalidatePortfolioContent();
  revalidatePath("/about");
  redirect("/admin/profile");
}
