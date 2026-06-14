import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_ROOT = "D:\\DIGIVISE CREATIVE\\Backup Rido\\PORTOFOLIO";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif"
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const rootArg = process.argv.find((arg) => arg.startsWith("--root="));
const sourceRoot = path.resolve(rootArg ? rootArg.slice("--root=".length) : DEFAULT_ROOT);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type ImageFile = {
  absolutePath: string;
  name: string;
  extension: string;
  size: number;
};

type UploadUnit = {
  title: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  folderPath: string;
  images: ImageFile[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalize(value: string) {
  return slugify(value).replace(/-/g, "");
}

function displayName(value: string) {
  const upperNames = new Set([
    "arsy",
    "channira",
    "digivise",
    "doschas",
    "hyundai",
    "kunakun",
    "lilis",
    "menliving",
    "popskin",
    "rtsr",
    "wellborn"
  ]);
  return upperNames.has(value.toLowerCase()) ? value.toUpperCase() : value;
}

async function directImages(folderPath: string): Promise<ImageFile[]> {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const extension = path.extname(entry.name).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(extension)) return null;
        const absolutePath = path.join(folderPath, entry.name);
        const info = await stat(absolutePath);
        return { absolutePath, name: entry.name, extension, size: info.size };
      })
  );

  return files
    .filter((file): file is ImageFile => Boolean(file))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

async function allImages(folderPath: string): Promise<ImageFile[]> {
  const entries = await readdir(folderPath, { withFileTypes: true });
  const images = await directImages(folderPath);
  for (const entry of entries.filter((item) => item.isDirectory())) {
    images.push(...(await allImages(path.join(folderPath, entry.name))));
  }
  return images.sort((a, b) =>
    a.absolutePath.localeCompare(b.absolutePath, undefined, { numeric: true })
  );
}

async function childDirectories(folderPath: string) {
  return (await readdir(folderPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

async function collectUnits(): Promise<UploadUnit[]> {
  const topFolders = await childDirectories(sourceRoot);
  const units: UploadUnit[] = [];

  for (const topFolder of topFolders) {
    const topPath = path.join(sourceRoot, topFolder.name);
    const brandName = displayName(topFolder.name);
    const brandSlug = slugify(topFolder.name);
    const topImages = await directImages(topPath);
    if (topImages.length > 0) {
      units.push({
        title: brandName,
        slug: brandSlug,
        brandName,
        brandSlug,
        folderPath: topPath,
        images: topImages
      });
    }

    const children = await childDirectories(topPath);
    for (const child of children) {
      const childPath = path.join(topPath, child.name);
      const images = await allImages(childPath);
      if (images.length === 0) continue;

      if (child.name.toLowerCase().startsWith("drive-download")) {
        const grandchildren = await childDirectories(childPath);
        for (const grandchild of grandchildren) {
          const grandchildPath = path.join(childPath, grandchild.name);
          const grandchildImages = await allImages(grandchildPath);
          if (grandchildImages.length === 0) continue;
          const title = `${brandName} ${grandchild.name}`;
          units.push({
            title,
            slug: slugify(title),
            brandName,
            brandSlug,
            folderPath: grandchildPath,
            images: grandchildImages
          });
        }
        continue;
      }

      const title = `${brandName} ${child.name}`;
      units.push({
        title,
        slug: slugify(title),
        brandName,
        brandSlug,
        folderPath: childPath,
        images
      });
    }
  }

  return units;
}

function isExistingUnit(
  unit: UploadUnit,
  existingProjects: Array<{ title: string; slug: string }>
) {
  const unitTitle = normalize(unit.title);
  const unitBrand = normalize(unit.brandName);
  return existingProjects.some((project) => {
    const title = normalize(project.title);
    const slug = normalize(project.slug);
    if (slug === normalize(unit.slug) || title === unitTitle) return true;
    return unit.slug === unit.brandSlug && (title === unitBrand || title.startsWith(unitBrand));
  });
}

async function ensureBrand(name: string, slug: string, brands: Map<string, string>) {
  const key = normalize(name);
  const existing = brands.get(key);
  if (existing) return existing;
  if (dryRun) return `dry-brand-${slug}`;

  const { data, error } = await supabase
    .from("brands")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error(`Failed to create brand ${name}`);
  brands.set(key, data.id);
  return data.id as string;
}

async function uploadImage(file: ImageFile, unit: UploadUnit) {
  const buffer = await readFile(file.absolutePath);
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
  const objectPath = `ridho-portfolio/${unit.slug}/${hash}${file.extension}`;
  if (dryRun) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
  }

  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    cacheControl: "31536000",
    contentType: MIME_TYPES[file.extension] ?? "application/octet-stream",
    upsert: false
  });

  if (error && !error.message.toLowerCase().includes("already exists")) throw error;
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

async function main() {
  const units = await collectUnits();
  const [{ data: existingProjects, error: projectsError }, { data: categories, error: categoriesError }, { data: brands, error: brandsError }] =
    await Promise.all([
      supabase.from("projects").select("id,title,slug"),
      supabase.from("categories").select("id,name,slug"),
      supabase.from("brands").select("id,name,slug")
    ]);
  if (projectsError) throw projectsError;
  if (categoriesError) throw categoriesError;
  if (brandsError) throw brandsError;

  const category =
    categories?.find((item) => item.slug === "product-catalog") ??
    categories?.find((item) => item.slug === "social-media-design") ??
    categories?.[0];
  if (!category) throw new Error("No category found in Supabase.");

  const brandIds = new Map<string, string>();
  for (const brand of brands ?? []) brandIds.set(normalize(brand.name), brand.id);

  const skipped = units.filter((unit) => isExistingUnit(unit, existingProjects ?? []));
  const pending = units.filter((unit) => !isExistingUnit(unit, existingProjects ?? []));

  console.log(
    JSON.stringify(
      {
        dryRun,
        sourceRoot,
        totalUnits: units.length,
        skippedExisting: skipped.map((unit) => ({ title: unit.title, images: unit.images.length })),
        pending: pending.map((unit) => ({ title: unit.title, slug: unit.slug, images: unit.images.length })),
        pendingImageCount: pending.reduce((sum, unit) => sum + unit.images.length, 0),
        pendingSizeMB: Number(
          (pending.reduce((sum, unit) => sum + unit.images.reduce((n, image) => n + image.size, 0), 0) / 1024 / 1024).toFixed(2)
        )
      },
      null,
      2
    )
  );

  if (dryRun) return;

  for (const unit of pending) {
    console.log(`Uploading ${unit.title} (${unit.images.length} images)`);
    const brandId = await ensureBrand(unit.brandName, unit.brandSlug, brandIds);
    const urls = [];
    for (const image of unit.images) {
      urls.push(await uploadImage(image, unit));
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        title: unit.title,
        slug: unit.slug,
        client_name: unit.brandName,
        brand_id: brandId,
        category_id: category.id,
        catalog_id: null,
        year: 2026,
        role: "Creative Designer",
        tools: "Photoshop, Illustrator, Figma, Canva",
        short_description: `Portfolio visual untuk ${unit.title}.`,
        full_description: `Kumpulan karya visual ${unit.title} yang diunggah dari arsip portofolio lokal.`,
        challenge: "Menjaga visual tetap rapi, jelas, dan siap ditampilkan sebagai portofolio digital.",
        process: "Aset dipilih dari folder portofolio lokal dan diunggah sebagai galeri gambar.",
        result: "Galeri portofolio sudah tersedia di website dengan aset gambar yang dapat dilihat publik.",
        thumbnail_url: urls[0],
        status: "published"
      })
      .select("id")
      .single();
    if (projectError || !project) {
      throw projectError ?? new Error(`Failed to create project ${unit.title}`);
    }

    const mediaRows = urls.map((url, index) => ({
      project_id: project.id,
      media_type: "image",
      media_url: url,
      alt_text: `${unit.title} image ${index + 1}`,
      sort_order: index
    }));
    const { error: mediaError } = await supabase.from("project_media").insert(mediaRows);
    if (mediaError) throw mediaError;
  }

  console.log(`Uploaded ${pending.length} new projects.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
