import { unstable_cache as nextCache } from "next/cache";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL
} from "@/lib/supabase/config";
import {
  brands as sampleBrands,
  catalogs as sampleCatalogs,
  categories as sampleCategories,
  profile as sampleProfile,
  sampleProjects,
  type Brand,
  type Catalog,
  type PortfolioProject
} from "@/lib/sample-data";

const PROJECT_SELECT =
  "id,title,slug,client_name,brand_id,category_id,catalog_id,year,role,tools,short_description,full_description,challenge,process,result,thumbnail_url,status,created_at," +
  "brand:brands(id,name,slug)," +
  "category:categories(id,name,slug)," +
  "catalog:catalogs(id,name,slug,brand_name,brand_id)," +
  "media:project_media(id,media_type,media_url,alt_text,sort_order)";

const ADMIN_PROJECT_SELECT =
  "id,title,slug,client_name,year,status,thumbnail_url,created_at," +
  "brand:brands(name)," +
  "category:categories(name)," +
  "catalog:catalogs(name,brand_name)";

const PROJECT_CARD_SELECT =
  "id,title,slug,client_name,brand_id,category_id,catalog_id,year,short_description,thumbnail_url,status,created_at," +
  "brand:brands(id,name,slug)," +
  "category:categories(id,name,slug)," +
  "catalog:catalogs(id,name,slug,brand_name,brand_id)";

const PROJECT_LINK_SELECT = "id,title,slug,created_at";
const PUBLIC_CACHE_TAG = "portfolio-content";
const PUBLIC_CACHE_SECONDS = 60 * 30;

function createSupabasePublicReadClient(): SupabaseClient {
  if (isSupabaseAdminConfigured()) return createSupabaseAdminClient();

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

type ProjectRow = Record<string, unknown> & {
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  catalog: { id: string; name: string; slug: string; brand_name: string; brand_id: string | null } | null;
  media: Array<{
    id: string;
    media_type: "image" | "video";
    media_url: string;
    alt_text: string;
    sort_order: number;
  }> | null;
};

export type CatalogOption = Catalog & {
  brandId: string | null;
  label: string;
};

export type ProjectCardSummary = {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  year: number;
  shortDescription: string;
  thumbnailUrl: string;
  category: { id: string; name: string; slug: string };
  catalog: { id: string; name: string; brandName: string } | null;
};

export type ProjectLinkSummary = {
  id: string;
  title: string;
  slug: string;
};

export type AdminProjectSummary = {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  year: number;
  status: "draft" | "published";
  thumbnailUrl: string;
  category: { name: string };
  catalog: { name: string; brandName: string } | null;
};

function mapProject(row: ProjectRow): PortfolioProject {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    clientName: row.brand?.name ?? (row.client_name as string) ?? "",
    brand: row.brand ?? null,
    category: row.category ?? { id: "", name: "Uncategorized", slug: "uncategorized" },
    catalog: row.catalog
      ? {
          id: row.catalog.id,
          name: row.catalog.name,
          slug: row.catalog.slug,
          brandName: row.catalog.brand_name,
          brandSlug: ""
        }
      : null,
    year: row.year as number,
    role: row.role as string,
    tools: row.tools as string,
    shortDescription: row.short_description as string,
    fullDescription: row.full_description as string,
    challenge: row.challenge as string,
    process: row.process as string,
    result: row.result as string,
    thumbnailUrl: row.thumbnail_url as string,
    status: row.status as "draft" | "published",
    media: (row.media ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        mediaType: item.media_type,
        mediaUrl: item.media_url,
        altText: item.alt_text,
        sortOrder: item.sort_order
      }))
  };
}

function mapProjectCard(row: ProjectRow): ProjectCardSummary {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    clientName: row.brand?.name ?? (row.client_name as string) ?? "",
    year: row.year as number,
    shortDescription: row.short_description as string,
    thumbnailUrl: row.thumbnail_url as string,
    category: row.category ?? { id: "", name: "Uncategorized", slug: "uncategorized" },
    catalog: row.catalog
      ? {
          id: row.catalog.id,
          name: row.catalog.name,
          brandName: row.catalog.brand_name
        }
      : null
  };
}

function mapAdminProject(row: Record<string, unknown>): AdminProjectSummary {
  const brand = row.brand as { name: string } | null;
  const category = row.category as { name: string } | null;
  const catalog = row.catalog as { name: string; brand_name: string } | null;

  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    clientName: brand?.name ?? (row.client_name as string) ?? "",
    year: row.year as number,
    status: row.status as "draft" | "published",
    thumbnailUrl: row.thumbnail_url as string,
    category: category ?? { name: "Uncategorized" },
    catalog: catalog ? { name: catalog.name, brandName: catalog.brand_name } : null
  };
}

function sampleAdminProjects(): AdminProjectSummary[] {
  return sampleProjects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    clientName: project.clientName,
    year: project.year,
    status: project.status,
    thumbnailUrl: project.thumbnailUrl,
    category: { name: project.category.name },
    catalog: project.catalog
      ? { name: project.catalog.name, brandName: project.catalog.brandName }
      : null
  }));
}

async function fetchPublishedProjects(): Promise<PortfolioProject[]> {
  if (!isSupabaseConfigured()) {
    return sampleProjects.filter((project) => project.status === "published");
  }

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return (data as unknown as ProjectRow[]).map(mapProject);
  } catch {
    return sampleProjects.filter((project) => project.status === "published");
  }
}

export const getPublishedProjects = nextCache(fetchPublishedProjects, ["published-projects"], {
  revalidate: PUBLIC_CACHE_SECONDS,
  tags: [PUBLIC_CACHE_TAG]
});

async function fetchPublishedProjectCards(): Promise<ProjectCardSummary[]> {
  if (!isSupabaseConfigured()) {
    return sampleProjects
      .filter((project) => project.status === "published")
      .map((project) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        clientName: project.clientName,
        year: project.year,
        shortDescription: project.shortDescription,
        thumbnailUrl: project.thumbnailUrl,
        category: project.category,
        catalog: project.catalog
          ? {
              id: project.catalog.id,
              name: project.catalog.name,
              brandName: project.catalog.brandName
            }
          : null
      }));
  }

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_CARD_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return (data as unknown as ProjectRow[]).map(mapProjectCard);
  } catch {
    return sampleProjects
      .filter((project) => project.status === "published")
      .map((project) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        clientName: project.clientName,
        year: project.year,
        shortDescription: project.shortDescription,
        thumbnailUrl: project.thumbnailUrl,
        category: project.category,
        catalog: project.catalog
          ? {
              id: project.catalog.id,
              name: project.catalog.name,
              brandName: project.catalog.brandName
            }
          : null
      }));
  }
}

export const getPublishedProjectCards = nextCache(
  fetchPublishedProjectCards,
  ["published-project-cards"],
  {
    revalidate: PUBLIC_CACHE_SECONDS,
    tags: [PUBLIC_CACHE_TAG]
  }
);

async function fetchPublishedProjectLinks(): Promise<ProjectLinkSummary[]> {
  if (!isSupabaseConfigured()) {
    return sampleProjects
      .filter((project) => project.status === "published")
      .map((project) => ({ id: project.id, title: project.title, slug: project.slug }));
  }

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_LINK_SELECT)
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return data.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug
    }));
  } catch {
    return sampleProjects
      .filter((project) => project.status === "published")
      .map((project) => ({ id: project.id, title: project.title, slug: project.slug }));
  }
}

export const getPublishedProjectLinks = nextCache(
  fetchPublishedProjectLinks,
  ["published-project-links"],
  {
    revalidate: PUBLIC_CACHE_SECONDS,
    tags: [PUBLIC_CACHE_TAG]
  }
);

export async function getAdminProjectSummaries(): Promise<AdminProjectSummary[]> {
  if (!isSupabaseAdminConfigured()) return sampleAdminProjects();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select(ADMIN_PROJECT_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return (data as unknown[]).map((row) => mapAdminProject(row as Record<string, unknown>));
  } catch {
    return sampleAdminProjects();
  }
}

export async function getAdminDashboardData() {
  if (!isSupabaseAdminConfigured()) {
    const projects = sampleAdminProjects();
    const published = projects.filter((project) => project.status === "published").length;
    return {
      total: projects.length,
      published,
      draft: projects.length - published,
      recentProjects: projects.slice(0, 5)
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const totalQuery = supabase.from("projects").select("id", { count: "exact", head: true });
    const publishedQuery = supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    const draftQuery = supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft");
    const recentQuery = supabase
      .from("projects")
      .select(ADMIN_PROJECT_SELECT)
      .order("created_at", { ascending: false })
      .limit(5);

    const [total, published, draft, recent] = await Promise.all([
      totalQuery,
      publishedQuery,
      draftQuery,
      recentQuery
    ]);

    if (total.error || published.error || draft.error || recent.error || !recent.data) {
      throw total.error ?? published.error ?? draft.error ?? recent.error;
    }

    return {
      total: total.count ?? 0,
      published: published.count ?? 0,
      draft: draft.count ?? 0,
      recentProjects: (recent.data as unknown[]).map((row) =>
        mapAdminProject(row as Record<string, unknown>)
      )
    };
  } catch {
    const projects = sampleAdminProjects();
    const published = projects.filter((project) => project.status === "published").length;
    return {
      total: projects.length,
      published,
      draft: projects.length - published,
      recentProjects: projects.slice(0, 5)
    };
  }
}

export async function getAllProjects(): Promise<PortfolioProject[]> {
  if (!isSupabaseAdminConfigured()) return sampleProjects;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return (data as unknown as ProjectRow[]).map(mapProject);
  } catch {
    return sampleProjects;
  }
}

export async function getProjectById(id: string): Promise<PortfolioProject | null> {
  if (!isSupabaseAdminConfigured()) {
    return sampleProjects.find((project) => project.id === id) ?? null;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProject(data as unknown as ProjectRow) : null;
  } catch {
    return sampleProjects.find((project) => project.id === id) ?? null;
  }
}

async function fetchProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  if (!isSupabaseConfigured()) {
    return (
      sampleProjects.find(
        (project) => project.slug === slug && project.status === "published"
      ) ?? null
    );
  }

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data ? mapProject(data as unknown as ProjectRow) : null;
  } catch {
    return (
      sampleProjects.find(
        (project) => project.slug === slug && project.status === "published"
      ) ?? null
    );
  }
}

export const getProjectBySlug = nextCache(fetchProjectBySlug, ["project-by-slug"], {
  revalidate: PUBLIC_CACHE_SECONDS,
  tags: [PUBLIC_CACHE_TAG]
});

export async function getCatalogs(): Promise<CatalogOption[]> {
  const mapCatalog = (catalog: Catalog, brandId: string | null): CatalogOption => ({
    ...catalog,
    brandId,
    label: `${catalog.brandName} / ${catalog.name}`
  });

  if (!isSupabaseConfigured()) {
    return sampleCatalogs.map((catalog) =>
      mapCatalog(catalog, sampleBrands.find((b) => b.slug === catalog.brandSlug)?.id ?? null)
    );
  }

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("catalogs")
      .select("id,name,slug,brand_name,brand_id")
      .order("brand_name", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error || !data) throw error;
    return data.map((catalog) =>
      mapCatalog(
        {
          id: catalog.id,
          name: catalog.name,
          slug: catalog.slug,
          brandName: catalog.brand_name,
          brandSlug: ""
        },
        catalog.brand_id ?? null
      )
    );
  } catch {
    return sampleCatalogs.map((catalog) =>
      mapCatalog(catalog, sampleBrands.find((b) => b.slug === catalog.brandSlug)?.id ?? null)
    );
  }
}

export async function getBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return sampleBrands;

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug")
      .order("name", { ascending: true });
    if (error || !data) throw error;
    return data as Brand[];
  } catch {
    return sampleBrands;
  }
}

export async function getCategories() {
  if (!isSupabaseConfigured()) return sampleCategories;

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug")
      .order("name", { ascending: true });
    if (error || !data) throw error;
    return data;
  } catch {
    return sampleCategories;
  }
}

export async function getProfile() {
  if (!isSupabaseConfigured()) return sampleProfile;

  try {
    const supabase = createSupabasePublicReadClient();
    const { data, error } = await supabase
      .from("profile")
      .select(
        "id,name,headline,bio,profile_image_url,email,whatsapp,instagram_url,linkedin_url,cv_url"
      )
      .maybeSingle();
    if (error) throw error;
    if (!data) return sampleProfile;
    return {
      id: data.id,
      name: data.name,
      headline: data.headline,
      bio: data.bio,
      profileImageUrl: data.profile_image_url,
      email: data.email,
      whatsapp: data.whatsapp,
      instagramUrl: data.instagram_url,
      linkedinUrl: data.linkedin_url,
      cvUrl: data.cv_url
    };
  } catch {
    return sampleProfile;
  }
}
