import Image from "next/image";
import Link from "next/link";
import { ProjectCard } from "@/components/public/project-card";
import { PublicHeader } from "@/components/public/public-header";
import { getProfile, getPublishedProjectCards } from "@/lib/portfolio";

export default async function HomePage() {
  const [projects, profile] = await Promise.all([getPublishedProjectCards(), getProfile()]);
  const featured = projects[0];
  const grid = projects.slice(1, 3);

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-16 sm:py-24">
        <div className="grid gap-10">
          <div>
            <p className="eyebrow">Portfolio / Creative Designer</p>
            <h1 className="display-type mt-5 max-w-[12ch]">BUILT — INTENT</h1>
          </div>
          <div className="grid gap-8 border-t border-[#d9d9d9] pt-8 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-2xl text-xl font-medium leading-8 text-[#333333] sm:text-2xl">
              Graphic design, video editing, and digital campaign visuals crafted for brands.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/portfolio" className="button-pill button-dark">
                View Works
              </Link>
              <Link href="/contact" className="button-pill button-light">
                Hire Me
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell border-y border-[#d9d9d9] py-14">
        <div className="grid gap-8 md:grid-cols-[0.35fr_1fr]">
          <p className="eyebrow">Selected works</p>
          <p className="max-w-4xl text-3xl font-black uppercase leading-[0.98] sm:text-5xl">
            Selected works from social media campaigns, product catalogs, video edits,
            and AI-assisted creative production.
          </p>
        </div>
      </section>

      {featured && (
        <section className="container-shell section-pad">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="reveal-lite">
              <div className="editorial-image aspect-[1.05/1]">
                <Image
                  src={featured.thumbnailUrl}
                  alt={featured.title}
                  width={1200}
                  height={1200}
                  sizes="(min-width: 1024px) 56vw, calc(100vw - 40px)"
                  priority
                />
              </div>
            </div>
            <div className="reveal-lite reveal-lite-delay">
              <p className="eyebrow">Featured Work / {featured.year}</p>
              <h2 className="mt-4 text-5xl font-black uppercase leading-none sm:text-7xl">
                {featured.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#555555]">{featured.shortDescription}</p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[#d9d9d9] py-5 text-xs font-black uppercase text-[#777777]">
                <p>Client<br /><span className="text-[#050505]">{featured.clientName}</span></p>
                <p>Category<br /><span className="text-[#050505]">{featured.category.name}</span></p>
              </div>
              <Link href={`/portfolio/${featured.slug}`} className="button-pill button-dark mt-8">
                View Case Study
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="container-shell pb-24">
        <div className="mb-9 flex items-end justify-between border-t border-[#d9d9d9] pt-8">
          <h2 className="headline-type max-w-[10ch]">WORK ARCHIVE</h2>
          <Link href="/portfolio" className="button-pill button-light hidden sm:inline-flex">
            View All Work
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {grid.map((project) => (
            <ProjectCard key={project.id} project={project} sizes="(min-width: 768px) 50vw, calc(100vw - 40px)" />
          ))}
        </div>
      </section>

      <section className="bg-[#050505] py-24 text-white">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-[#9a9a9a]">About Preview</p>
            <h2 className="mt-4 text-5xl font-black uppercase leading-none sm:text-8xl">
              VISUAL SYSTEMS MADE FOR IMPACT
            </h2>
          </div>
          <div className="self-end">
            <p className="text-2xl font-semibold leading-9 text-[#d8d8d8]">{profile.bio}</p>
            <div className="mt-8 grid gap-4 border-y border-[#333333] py-6 text-sm font-black uppercase text-[#999999] sm:grid-cols-2">
              <p>Skills<br /><span className="text-white">Design / Video / Campaign</span></p>
              <p>Tools<br /><span className="text-white">Photoshop / Figma / CapCut</span></p>
            </div>
            <Link href="/about" className="button-pill mt-8 border-white text-white">
              About Ridho
            </Link>
          </div>
        </div>
      </section>

      <section className="container-shell section-pad">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <h2 className="headline-type max-w-[12ch]">LET&apos;S BUILD SOMETHING VISUAL</h2>
          <Link href="/contact" className="button-pill button-dark w-fit">
            Contact
          </Link>
        </div>
      </section>
    </main>
  );
}
