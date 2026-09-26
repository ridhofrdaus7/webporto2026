/**
 * Horizontal brand ticker ("running text"). A single track holds the brand
 * list rendered twice and scrolls left by exactly half its width, so the loop
 * is seamless. CSS-only (no JS): pauses on hover, fades at both edges, and
 * freezes flat under prefers-reduced-motion. Colours come from design tokens,
 * so it flips with dark mode.
 */
export function BrandMarquee({
  brands,
  label = "Trusted by"
}: {
  brands: string[];
  label?: string;
}) {
  if (brands.length === 0) return null;

  // Render the list twice for the seamless -50% loop; the copy is hidden from
  // assistive tech so the names aren't announced twice.
  const track = [...brands.map((name) => ({ name, dup: false })), ...brands.map((name) => ({ name, dup: true }))];

  return (
    <section aria-label={`Brands: ${brands.join(", ")}`} className="border-y border-line bg-paper py-9 sm:py-12">
      <style>{css}</style>
      <p className="container-shell eyebrow text-muted">{label}</p>
      <div className="bm-marquee mt-6">
        <ul className="bm-track" role="list">
          {track.map((item, index) => (
            <li key={index} className="bm-item" aria-hidden={item.dup}>
              <span className="bm-name">{item.name}</span>
              <span className="bm-sep" aria-hidden>
                ✳
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const css = `
  .bm-marquee {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
  }
  .bm-track {
    display: flex;
    width: max-content;
    align-items: center;
    animation: bm-scroll 42s linear infinite;
  }
  .bm-marquee:hover .bm-track {
    animation-play-state: paused;
  }
  .bm-item {
    display: inline-flex;
    align-items: center;
  }
  .bm-name {
    padding: 0 clamp(1.25rem, 3vw, 2.75rem);
    font-weight: 900;
    font-size: clamp(1.6rem, 4.2vw, 3.25rem);
    line-height: 1;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--color-ink);
  }
  .bm-sep {
    font-size: clamp(0.9rem, 2vw, 1.5rem);
    color: var(--color-muted);
  }
  @keyframes bm-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bm-track { animation: none; }
    .bm-marquee {
      -webkit-mask-image: none;
      mask-image: none;
    }
  }
`;
