import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <section className="container-shell section-pad">
      <div className="grid gap-8 border-t border-line pt-8 md:grid-cols-[0.4fr_1fr]">
        <RevealText as="p" className="eyebrow">
          Kata Klien
        </RevealText>
        <RevealText
          as="h2"
          className="max-w-3xl text-3xl font-black uppercase leading-[0.98] sm:text-5xl"
        >
          Hasil yang bikin klien balik lagi.
        </RevealText>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {testimonials.map((item, index) => (
          <Reveal key={item.author + index} delay={index * 0.06}>
            <figure className="flex h-full flex-col justify-between gap-6 border border-line p-7">
              <blockquote className="text-lg font-medium leading-8 text-ink sm:text-xl">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="text-xs font-black uppercase tracking-wide text-muted">
                {item.author} — <span className="text-ink">{item.brand}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
