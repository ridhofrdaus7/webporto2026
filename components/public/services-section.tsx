import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { services } from "@/lib/site";

export function ServicesSection() {
  return (
    <section className="container-shell section-pad">
      <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-[0.4fr_1fr]">
        <RevealText as="p" className="eyebrow">
          Peran & Deliverable
        </RevealText>
        <RevealText
          as="h2"
          className="max-w-3xl font-serif text-2xl font-normal leading-[1.32] text-ink sm:text-[1.9rem] sm:leading-[1.3] lg:text-[2.4rem] lg:leading-[1.25]"
        >
          &ldquo;Setiap project adalah investasi reputasi. Kami kerjakan dengan sepenuh hati sampai klien benar-benar puas, karena kami percaya: portofolio terbaik adalah kunci pembuka pintu kesempatan berikutnya.&rdquo;
        </RevealText>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
        {services.map((service, index) => (
          <Reveal key={service.title} delay={index * 0.06}>
            <article className="flex h-full flex-col gap-4 bg-paper p-7">
              <p className="eyebrow">{service.role}</p>
              <h3 className="text-2xl font-black uppercase leading-tight">{service.title}</h3>
              <ul className="grid gap-1.5 text-sm font-semibold text-neutral-600">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-muted">/</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-line pt-4 text-sm font-bold text-ink">
                {service.outcome}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
