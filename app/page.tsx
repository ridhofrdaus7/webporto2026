import Link from "next/link";
import { FeaturedSlider } from "@/components/public/featured-slider";
import { HeroShowcase } from "@/components/public/hero-showcase";
import { ProjectCard } from "@/components/public/project-card";
import { PublicHeader } from "@/components/public/public-header";
import { ServicesSection } from "@/components/public/services-section";
import { Testimonials } from "@/components/public/testimonials";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getProfile, getPublishedProjectCards } from "@/lib/portfolio";
import { getBrandBlurb, portfolioPdfUrl, siteContact } from "@/lib/site";

export default async function HomePage() {
  const [projects, profile] = await Promise.all([getPublishedProjectCards(), getProfile()]);
  const grid = projects.slice(1, 3);

  // `projects` is newest-first; reverse so the hero showcases the
  // earliest-uploaded work, while newer work stays in the sections below.
  const seenThumbs = new Set<string>();
  const heroItems = [...projects]
    .reverse()
    .filter((project) => {
      if (!project.thumbnailUrl || seenThumbs.has(project.thumbnailUrl)) return false;
      seenThumbs.add(project.thumbnailUrl);
      return true;
    })
    .slice(0, 6)
    .map((project) => ({
      src: project.thumbnailUrl,
      title: project.title,
      slug: project.slug
    }));

  // Featured slider — every project (unique covers), newest first.
  const seenFeatured = new Set<string>();
  const featuredItems = projects
    .filter((project) => {
      if (!project.thumbnailUrl || seenFeatured.has(project.thumbnailUrl)) return false;
      seenFeatured.add(project.thumbnailUrl);
      return true;
    })
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      clientName: project.clientName,
      year: project.year,
      thumbnailUrl: project.thumbnailUrl,
      blurb: getBrandBlurb(project.clientName)
    }));

  return (
    <main>
      <PublicHeader />
      <HeroShowcase
        items={heroItems}
        eyebrow="Portfolio / Creative Designer"
        headline={
          <>
            Built <span className="italic">with</span>{" "}
            <span className="font-sans font-extrabold tracking-tight">intent.</span>
          </>
        }
        subline="Creative, story & production for brands that want to stand out."
      />

      <section className="container-shell border-y border-line py-14">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[0.35fr_1fr]">
            <p className="eyebrow">Selected works</p>
            <p className="max-w-4xl text-3xl font-black uppercase leading-[0.98] sm:text-5xl">
              Selected works from social media campaigns, product catalogs, video edits,
              and AI-assisted creative production.
            </p>
          </div>
        </Reveal>
      </section>

      {featuredItems.length > 0 && (
        <section className="container-shell section-pad">
          <Reveal>
            <FeaturedSlider items={featuredItems} />
          </Reveal>
        </section>
      )}

      <ServicesSection />

      <section className="container-shell pb-24">
        <div className="mb-9 flex items-end justify-between border-t border-line pt-8">
          <RevealText as="h2" className="headline-type max-w-[10ch]">
            WORK ARCHIVE
          </RevealText>
          <Link href="/portfolio" className="button-pill button-light hidden sm:inline-flex">
            View All Work
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {grid.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.08}>
              <ProjectCard project={project} sizes="(min-width: 768px) 50vw, calc(100vw - 40px)" />
            </Reveal>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="surface-inverse py-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <RevealText as="p" className="eyebrow text-muted">
              About Preview
            </RevealText>
            <RevealText
              as="h2"
              className="mt-4 text-5xl font-black uppercase leading-none sm:text-8xl"
              delay={0.06}
            >
              VISUAL SYSTEMS MADE FOR IMPACT
            </RevealText>
          </div>
          <Reveal className="self-end" delay={0.12}>
            <p className="text-2xl font-semibold leading-9">{profile.bio}</p>
            <div className="mt-8 grid gap-4 border-y border-line py-6 text-sm font-black uppercase text-muted sm:grid-cols-2">
              <p>Skills<br /><span className="text-ink">Design / Video / Campaign</span></p>
              <p>Tools<br /><span className="text-ink">Photoshop / Figma / CapCut</span></p>
            </div>
            <Link href="/about" className="button-pill button-light mt-8">
              About Ridho
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="container-shell section-pad">
        <div className="border-t border-line pt-8">
          <RevealText
            as="h2"
            className="max-w-[16ch] text-4xl font-black uppercase leading-[0.98] sm:text-6xl"
          >
            Punya project yang ingin terlihat beda?
          </RevealText>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-neutral-700">
              Cerita & visual yang menjual untuk brand kamu. {siteContact.responseTime}.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={`mailto:${siteContact.email}`} className="button-pill button-dark">
                Email Saya
              </a>
              <Link href="/contact" className="button-pill button-light">
                Isi Form Kontak
              </Link>
              <a href={portfolioPdfUrl} download className="button-pill button-light">
                Download Portfolio (PDF)
              </a>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted">
              {siteContact.email}
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
