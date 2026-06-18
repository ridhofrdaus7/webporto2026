import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { PublicHeader } from "@/components/public/public-header";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { portfolioPdfUrl, siteContact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ridho Firdaus for creative design, video editing, and campaign visual projects."
};

export default function ContactPage() {
  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <RevealText as="p" className="eyebrow">
          Contact / Hire Me
        </RevealText>
        <RevealText as="h1" className="display-type mt-5 max-w-[12ch]" delay={0.08}>
          LET&apos;S BUILD SOMETHING VISUAL
        </RevealText>
      </section>
      <section className="container-shell grid gap-12 pb-24 lg:grid-cols-[0.7fr_1fr]">
        <Reveal as="aside" className="border-y border-line py-8">
          <p className="text-2xl font-semibold leading-9 text-neutral-700">
            Kirim brief project, kebutuhan kampanye, atau ide kolaborasi. {siteContact.responseTime}.
          </p>
          <div className="mt-8 grid gap-4 text-sm font-black uppercase">
            <a
              href={siteContact.waLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp · {siteContact.phoneDisplay}
            </a>
            <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>
            <a href={portfolioPdfUrl} download className="text-muted hover:text-ink">
              Download Portfolio (PDF)
            </a>
          </div>
        </Reveal>
        <ContactForm />
      </section>
    </main>
  );
}
