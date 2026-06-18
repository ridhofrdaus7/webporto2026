import type { Metadata } from "next";
import Image from "next/image";
import { PublicHeader } from "@/components/public/public-header";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getProfile } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "About",
  description: "About Ridho Firdaus, creative designer and video editor."
};

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <RevealText as="p" className="eyebrow">
          Profile
        </RevealText>
        <RevealText as="h1" className="display-type mt-5 max-w-[11ch]" delay={0.08}>
          RIDHO FIRDAUS
        </RevealText>
      </section>
      <section className="container-shell grid gap-12 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="editorial-image aspect-[0.9/1]">
          <Image
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
            alt="Abstract editorial profile visual"
            width={1000}
            height={1200}
            priority
          />
        </Reveal>
        <Reveal className="self-end" delay={0.1}>
          <h2 className="text-5xl font-black uppercase leading-none sm:text-7xl">{profile.headline}</h2>
          <p className="mt-8 text-2xl font-medium leading-10 text-neutral-700">{profile.bio}</p>
          <div className="mt-10 grid gap-6 border-y border-line py-8 text-sm font-black uppercase text-muted sm:grid-cols-2">
            <p>Skills<br /><span className="text-ink">Graphic Design / Video Editing / Campaign Visual / UI Design</span></p>
            <p>Tools<br /><span className="text-ink">Adobe Photoshop / Premiere Pro / Figma / Canva / AI Tools</span></p>
            <p>Email<br /><span className="text-ink">{profile.email}</span></p>
            <p>WhatsApp<br /><span className="text-ink">{profile.whatsapp}</span></p>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
