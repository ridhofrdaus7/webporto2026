import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/public-header";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getCategories, getPublishedProjectCards } from "@/lib/portfolio";
import { PortfolioBrowser } from "./portfolio-browser";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Published creative projects by Ridho Firdaus."
};

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([getPublishedProjectCards(), getCategories()]);
  // Earliest-uploaded first (matches the homepage hero ordering); newest fall to the bottom.
  const orderedProjects = [...projects].reverse();

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <RevealText as="p" className="eyebrow">
          Published Work
        </RevealText>
        <RevealText as="h1" className="display-type mt-5 max-w-[11ch]" delay={0.08}>
          CREATIVE WORKS
        </RevealText>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-xl font-medium leading-8 text-neutral-600">
            Editorial project archive for campaign visuals, catalogs, video edits, and brand content.
          </p>
        </Reveal>
      </section>
      <section className="container-shell pb-24">
        <PortfolioBrowser projects={orderedProjects} categories={categories} />
      </section>
    </main>
  );
}
