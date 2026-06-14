import type { Metadata } from "next";
import Image from "next/image";
import { PublicHeader } from "@/components/public/public-header";
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
        <p className="eyebrow">Profile</p>
        <h1 className="display-type mt-5 max-w-[11ch]">RIDHO FIRDAUS</h1>
      </section>
      <section className="container-shell grid gap-12 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="editorial-image aspect-[0.9/1]">
          <Image
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
            alt="Abstract editorial profile visual"
            width={1000}
            height={1200}
            priority
          />
        </div>
        <div className="self-end">
          <h2 className="text-5xl font-black uppercase leading-none sm:text-7xl">{profile.headline}</h2>
          <p className="mt-8 text-2xl font-medium leading-10 text-[#444444]">{profile.bio}</p>
          <div className="mt-10 grid gap-6 border-y border-[#d9d9d9] py-8 text-sm font-black uppercase text-[#777777] sm:grid-cols-2">
            <p>Skills<br /><span className="text-[#050505]">Graphic Design / Video Editing / Campaign Visual / UI Design</span></p>
            <p>Tools<br /><span className="text-[#050505]">Adobe Photoshop / Premiere Pro / Figma / Canva / AI Tools</span></p>
            <p>Email<br /><span className="text-[#050505]">{profile.email}</span></p>
            <p>WhatsApp<br /><span className="text-[#050505]">{profile.whatsapp}</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}
