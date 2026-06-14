"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { ProjectFormState } from "@/lib/admin-actions";
import type { CatalogOption } from "@/lib/portfolio";
import type { PortfolioProject } from "@/lib/sample-data";
import { useToast } from "@/components/admin/toast";

type GalleryItem = {
  mediaUrl: string;
  altText: string;
  mediaType: "image" | "video";
};

type UploadTarget = "thumbnail" | "gallery";

function mediaTypeFromFile(file: File): GalleryItem["mediaType"] {
  return file.type.startsWith("video/") ? "video" : "image";
}

function cleanAltText(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Project media";
}

export function ProjectForm({
  action,
  brands,
  categories,
  catalogs,
  project
}: {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  catalogs: CatalogOption[];
  project?: PortfolioProject;
}) {
  const toast = useToast();
  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state, toast]);

  const [brandId, setBrandId] = useState(project?.brand?.id ?? "");
  const [catalogId, setCatalogId] = useState(project?.catalog?.id ?? "");
  const visibleCatalogs = useMemo(
    () => catalogs.filter((catalog) => !brandId || catalog.brandId === brandId),
    [catalogs, brandId]
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(project?.thumbnailUrl ?? "");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    () =>
      project?.media?.map((media) => ({
        mediaUrl: media.mediaUrl,
        altText: media.altText,
        mediaType: media.mediaType
      })) ?? []
  );
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const galleryValue = useMemo(
    () =>
      galleryItems
        .map((media) => `${media.mediaUrl}|${media.altText}|${media.mediaType}`)
        .join("\n"),
    [galleryItems]
  );

  async function uploadFiles(files: FileList | null, target: UploadTarget) {
    if (!files?.length) return;

    setUploading(target);
    setUploadMessage(null);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
          });
          const payload = (await response.json()) as { url?: string; error?: string };
          if (!response.ok || !payload.url) {
            throw new Error(payload.error ?? "Upload failed.");
          }

          return {
            mediaUrl: payload.url,
            altText: cleanAltText(file.name),
            mediaType: mediaTypeFromFile(file)
          } satisfies GalleryItem;
        })
      );

      if (target === "thumbnail") {
        setThumbnailUrl(uploaded[0]?.mediaUrl ?? "");
        setUploadMessage("Thumbnail uploaded.");
        return;
      }

      setGalleryItems((current) => [...current, ...uploaded]);
      setUploadMessage(`${uploaded.length} media uploaded.`);
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  function removeGalleryItem(index: number) {
    setGalleryItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="title" className="field" defaultValue={project?.title} placeholder="Project title" required />
        <input name="slug" className="field" defaultValue={project?.slug} placeholder="clean-project-slug" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <select
          name="brandId"
          className="field"
          required
          value={brandId}
          onChange={(event) => {
            const nextBrand = event.target.value;
            setBrandId(nextBrand);
            const stillValid = catalogs.some(
              (catalog) => catalog.id === catalogId && catalog.brandId === nextBrand
            );
            if (!stillValid) setCatalogId("");
          }}
        >
          <option value="" disabled>
            Select brand
          </option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
        <select name="categoryId" className="field" defaultValue={project?.category.id} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          name="catalogId"
          className="field"
          value={catalogId}
          onChange={(event) => setCatalogId(event.target.value)}
        >
          <option value="">No sub-catalog</option>
          {visibleCatalogs.map((catalog) => (
            <option key={catalog.id} value={catalog.id}>{catalog.label}</option>
          ))}
        </select>
        <input name="year" className="field" defaultValue={project?.year ?? new Date().getFullYear()} placeholder="Year" required />
        <select name="status" className="field" defaultValue={project?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input name="role" className="field" defaultValue={project?.role} placeholder="Role" required />
        <input name="tools" className="field" defaultValue={project?.tools} placeholder="Tools" required />
      </div>

      <section className="grid gap-4 border border-[#d9d9d9] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Thumbnail</p>
            <p className="mt-2 text-sm font-semibold text-[#777777]">Upload JPG, PNG, or WEBP for the project cover.</p>
          </div>
          <label className="button-pill button-light w-fit cursor-pointer">
            {uploading === "thumbnail" ? "Uploading" : "Upload Cover"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading !== null}
              onChange={(event) => uploadFiles(event.target.files, "thumbnail")}
            />
          </label>
        </div>
        <input
          name="thumbnailUrl"
          className="field"
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          placeholder="Thumbnail URL"
          required
        />
        {thumbnailUrl ? (
          <div className="relative aspect-[1.6/1] overflow-hidden rounded-2xl bg-[#f5f5f2]">
            <Image src={thumbnailUrl} alt="Project thumbnail preview" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 border border-[#d9d9d9] bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Gallery Media</p>
            <p className="mt-2 text-sm font-semibold text-[#777777]">Upload multiple images or videos for one brand, then save the project.</p>
          </div>
          <label className="button-pill button-light w-fit cursor-pointer">
            {uploading === "gallery" ? "Uploading" : "Upload Media"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple
              className="sr-only"
              disabled={uploading !== null}
              onChange={(event) => uploadFiles(event.target.files, "gallery")}
            />
          </label>
        </div>

        <input type="hidden" name="galleryItems" value={galleryValue} />

        {galleryItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {galleryItems.map((media, index) => (
              <article key={`${media.mediaUrl}-${index}`} className="grid gap-3 border border-[#d9d9d9] p-3">
                <div className="relative aspect-[1.35/1] overflow-hidden rounded-xl bg-[#f5f5f2]">
                  {media.mediaType === "video" ? (
                    <video src={media.mediaUrl} className="h-full w-full object-cover" muted playsInline controls />
                  ) : (
                    <Image src={media.mediaUrl} alt={media.altText} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw" className="object-cover" />
                  )}
                </div>
                <input
                  className="field rounded-xl px-3 py-2 text-sm"
                  value={media.altText}
                  onChange={(event) =>
                    setGalleryItems((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, altText: event.target.value } : item
                      )
                    )
                  }
                  placeholder="Alt text"
                />
                <button type="button" className="button-pill button-light min-h-9 px-4" onClick={() => removeGalleryItem(index)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="border border-dashed border-[#d9d9d9] p-5 text-sm font-bold uppercase text-[#777777]">
            No gallery media yet.
          </p>
        )}
      </section>

      {uploadMessage ? (
        <p className="text-sm font-black uppercase text-[#777777]">{uploadMessage}</p>
      ) : null}

      <textarea name="shortDescription" className="field min-h-24" defaultValue={project?.shortDescription} placeholder="Short description" required />
      <textarea name="fullDescription" className="field min-h-32" defaultValue={project?.fullDescription} placeholder="Full description" required />
      <textarea name="challenge" className="field min-h-28" defaultValue={project?.challenge} placeholder="Challenge / Problem" required />
      <textarea name="process" className="field min-h-28" defaultValue={project?.process} placeholder="Creative direction / Process" required />
      <textarea name="result" className="field min-h-28" defaultValue={project?.result} placeholder="Result / Final output" required />
      {state?.error ? (
        <p className="border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700">
          {state.error}
        </p>
      ) : null}
      <button className="button-pill button-dark w-fit">Save Project</button>
    </form>
  );
}
