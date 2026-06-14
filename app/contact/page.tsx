import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/contact-form";
import { PublicHeader } from "@/components/public/public-header";
import { getProfile } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ridho Firdaus for creative design, video editing, and campaign visual projects."
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <p className="eyebrow">Contact / Hire Me</p>
        <h1 className="display-type mt-5 max-w-[12ch]">LET&apos;S BUILD SOMETHING VISUAL</h1>
      </section>
      <section className="container-shell grid gap-12 pb-24 lg:grid-cols-[0.7fr_1fr]">
        <aside className="border-y border-[#d9d9d9] py-8">
          <p className="text-2xl font-semibold leading-9 text-[#444444]">
            Send a project brief, campaign need, or collaboration idea. You can also reach Ridho directly through email, WhatsApp, or social links.
          </p>
          <div className="mt-8 grid gap-4 text-sm font-black uppercase">
            <Link href={`mailto:${profile.email}`}>{profile.email}</Link>
            <Link href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}>WhatsApp</Link>
            {profile.instagramUrl && <Link href={profile.instagramUrl}>Instagram</Link>}
            {profile.linkedinUrl && <Link href={profile.linkedinUrl}>LinkedIn</Link>}
          </div>
        </aside>
        <ContactForm />
      </section>
    </main>
  );
}
