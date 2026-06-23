import Link from "next/link";
import { FeaturedSlider } from "@/components/public/featured-slider";
import { HeroVideo } from "@/components/public/hero-video";
import { PublicHeader } from "@/components/public/public-header";
import { ServicesSection } from "@/components/public/services-section";
import { StickyCardNav, type Chapter } from "@/components/public/sticky-card-nav";
import { Testimonials } from "@/components/public/testimonials";
import { ConvergeHeadline } from "@/components/scroll/converge-scroll";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getProfile, getPublishedProjectCards } from "@/lib/portfolio";
import { aboutHeroImage, getBrandBlurb, portfolioPdfUrl, siteContact } from "@/lib/site";

export default async function HomePage() {
  const [projects, profile] = await Promise.all([getPublishedProjectCards(), getProfile()]);

  // Featured gallery — the first 14 uploaded projects (oldest first), unique covers.
  const seenFeatured = new Set<string>();
  const featuredItems = [...projects]
    .reverse()
    .filter((project) => {
      if (!project.thumbnailUrl || seenFeatured.has(project.thumbnailUrl)) return false;
      seenFeatured.add(project.thumbnailUrl);
      return true;
    })
    .slice(0, 14)
    .map((project) => ({
      slug: project.slug,
      title: project.title,
      clientName: project.clientName,
      year: project.year,
      thumbnailUrl: project.thumbnailUrl,
      blurb: getBrandBlurb(project.clientName)
    }));

  // Chapter covers are HAND-PICKED so they never duplicate and each image truly
  // represents its pillar. `resolveCover(pick, i)` accepts: a published project's
  // slug (resolved to its thumbnail), a /public path, or an allowed image URL.
  // An empty `pick` falls back to a DISTINCT auto cover (deduped, newest-first).
  // 👉 To curate a chapter, set its `pick` (1st arg) to your chosen slug/URL/path.
  const uniqueCovers = Array.from(
    new Set(projects.map((project) => project.thumbnailUrl).filter(Boolean))
  );
  const bySlug = (slug: string) => projects.find((project) => project.slug === slug)?.thumbnailUrl;
  const resolveCover = (pick: string, autoIndex: number) => {
    const value = pick.trim();
    // A value with "/" or "." is used literally (a /public path or image URL); a
    // bare token is treated as a project slug and degrades to the deduped auto
    // cover when it doesn't resolve — so a slug typo never becomes a broken src.
    const resolved = value ? (/[/.]/.test(value) ? value : bySlug(value)) : undefined;
    return resolved || uniqueCovers[autoIndex] || "";
  };

  // The deck IS the homepage's primary navigation: four work pillars that
  // resolve on an About chapter, pulling the visitor down toward the story.
  const chapters: Chapter[] = [
    {
      id: "social",
      index: "01",
      kicker: "Social & Campaign",
      title: "SOCIAL\nCONTENT",
      teaser:
        "Sistem konten feed, story & carousel yang tayang konsisten tiap minggu — dan bikin engagement naik.",
      meta: "Social Media Design",
      href: "/portfolio",
      cta: "Lihat Karya",
      image: resolveCover("", 0)
    },
    {
      id: "catalog",
      index: "02",
      kicker: "E-commerce",
      title: "PRODUCT\nCATALOGS",
      teaser:
        "Layout katalog & lookbook yang rapi dan meyakinkan — mempercepat launching dan membantu jualan online.",
      meta: "Product Catalog",
      href: "/portfolio",
      cta: "Lihat Karya",
      image: resolveCover("", 1)
    },
    {
      id: "campaign",
      index: "03",
      kicker: "Key Visual",
      title: "CAMPAIGN\nVISUALS",
      teaser:
        "Key visual & poster kampanye yang menonjol, menjangkau pasar lebih luas, dan dipakai berulang.",
      meta: "Campaign Visual",
      href: "/portfolio",
      cta: "Lihat Karya",
      image: resolveCover("", 2)
    },
    {
      id: "motion",
      index: "04",
      kicker: "Motion / Reels",
      title: "STORIES IN\nMOTION",
      teaser:
        "Edit reels & TikTok dengan pacing rapi, subtitle, dan color grading yang menjaga perhatian penonton.",
      meta: "Video Editing",
      href: "/portfolio",
      cta: "Lihat Karya",
      image: resolveCover("", 3)
    },
    {
      id: "about",
      index: "05",
      kicker: "The Maker",
      title: "ABOUT\nRIDHO",
      teaser:
        "Satu orang di balik setiap visual — teliti, komunikatif, dan fokus pada hasil yang benar-benar menjual.",
      meta: "Profile / Story",
      href: "/about",
      cta: "Tentang Ridho",
      image: aboutHeroImage,
      bare: true
    }
  ];

  return (
    <main>
      <PublicHeader variant="overlay" />
      <HeroVideo
        videoSrc="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_070729_32a7eb4e-d6e2-4571-badc-91b4dab1ecbe.mp4"
        eyebrow="Portfolio / Creative Designer"
        headline={
          <>
            Built <span className="italic">with</span>{" "}
            <span className="font-sans font-extrabold tracking-tight">intent.</span>
          </>
        }
        subline="Creative, story & production for brands that want to stand out."
      />

      {/* Primary navigation — a cinematic chapter deck. Its dark stage flows
          straight out of the hero video and funnels down into About. */}
      <section className="chapter-stage relative overflow-hidden">
        <div className="container-shell py-20 text-white sm:py-28">
          <Reveal>
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-white/50">
              Explore — In Chapters
            </p>
          </Reveal>
          <RevealText
            as="h2"
            className="mt-5 max-w-[18ch] text-4xl font-black uppercase leading-[0.92] sm:text-7xl"
            delay={0.05}
          >
            Five chapters. One body of work.
          </RevealText>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/70">
              Scroll untuk menjelajah tiap bagian — dari konten sosial sampai cerita di
              balik layar. Tiap kartu adalah pintu masuk ke karyanya.
            </p>
          </Reveal>
        </div>
      </section>

      <StickyCardNav chapters={chapters} />

      <section className="surface-inverse py-24">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <RevealText as="p" className="eyebrow text-muted">
              About Preview
            </RevealText>
            <ConvergeHeadline
              as="h2"
              className="mt-4 text-5xl font-black uppercase leading-none sm:text-8xl"
              text="VISUAL SYSTEMS MADE FOR IMPACT"
            />
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

      <ServicesSection />

      {featuredItems.length > 0 && <FeaturedSlider items={featuredItems} />}

      <Testimonials />

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
