import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/public-header";
import { getCategories, getPublishedProjectCards } from "@/lib/portfolio";
import { PortfolioBrowser } from "./portfolio-browser";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Published creative projects by Ridho Firdaus."
};

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([getPublishedProjectCards(), getCategories()]);

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <p className="eyebrow">Published Work</p>
        <h1 className="display-type mt-5 max-w-[11ch]">CREATIVE WORKS</h1>
        <p className="mt-8 max-w-2xl text-xl font-medium leading-8 text-[#555555]">
          Editorial project archive for campaign visuals, catalogs, video edits, and brand content.
        </p>
      </section>
      <section className="container-shell pb-24">
        <PortfolioBrowser projects={projects} categories={categories} />
      </section>
    </main>
  );
}
