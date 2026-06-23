import type { Metadata } from "next";
import Image from "next/image";
import { PublicHeader } from "@/components/public/public-header";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getProfile } from "@/lib/portfolio";
import { aboutHeroImage, siteContact } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About Ridho Firdaus, creative designer and video editor."
};

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-10 sm:py-14">
        <RevealText as="p" className="eyebrow">
          Profile
        </RevealText>
        <RevealText as="h1" className="display-type mt-5 max-w-[11ch]" delay={0.08}>
          RIDHO FIRDAUS
        </RevealText>
      </section>

      {/* Ridho's "Hello" banner — a finished light composition (photo + name + bio).
          Full 16:9 on larger screens; a person-focused crop on phones, where the
          baked text would be too small (the real bio sits below for content/SEO). */}
      <section className="container-shell">
        <Reveal className="editorial-image aspect-[4/5] sm:aspect-[16/9]">
          <Image
            src={aboutHeroImage}
            alt="Ridho Firdaus — Graphic Designer & Video Editor"
            width={1920}
            height={1080}
            priority
            sizes="(min-width: 1320px) 1320px, 100vw"
            className="object-cover object-left sm:object-center"
          />
        </Reveal>
      </section>

      <section className="container-shell grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <h2 className="text-5xl font-black uppercase leading-none sm:text-7xl">{profile.headline}</h2>
        </Reveal>
        <Reveal className="self-end" delay={0.1}>
          <p className="text-2xl font-medium leading-10 text-neutral-700">{profile.bio}</p>
          <div className="mt-10 grid gap-6 border-y border-line py-8 text-sm font-black uppercase text-muted sm:grid-cols-2">
            <p>Skills<br /><span className="text-ink">Graphic Design / Video Editing / Campaign Visual / UI Design</span></p>
            <p>Tools<br /><span className="text-ink">Adobe Photoshop / Premiere Pro / Figma / Canva / AI Tools</span></p>
            <p>Email<br /><span className="text-ink">{siteContact.email}</span></p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
