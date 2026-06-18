/**
 * Canonical site content — contact, services, testimonials, brand blurbs.
 * Kept here (not the CMS) so conversion-critical copy is deterministic and
 * easy to edit in one place. Indonesian for the local client market.
 */

export const siteContact = {
  email: "ridhofirdaus077@gmail.com",
  phoneDisplay: "0899-7861-779",
  waNumber: "628997861779",
  waLink: "https://wa.me/628997861779",
  responseTime: "Biasanya saya balas dalam < 24 jam"
};

export const portfolioPdfUrl = "/Ridho-Firdaus-Portfolio.pdf";

export type Service = {
  title: string;
  role: string;
  deliverables: string[];
  outcome: string;
};

export const services: Service[] = [
  {
    title: "Konten & Kampanye Media Sosial",
    role: "Creative / Content Designer",
    deliverables: [
      "Desain feed, story & carousel",
      "Konten promo (payday, flash sale)",
      "Sistem template kampanye"
    ],
    outcome: "Konten tayang konsisten tiap minggu & engagement naik — banyak klien lanjut langganan bulanan."
  },
  {
    title: "Katalog Produk & Visual E-commerce",
    role: "Graphic Designer",
    deliverables: [
      "Layout katalog & lookbook",
      "Editing & retouch foto produk",
      "Banner marketplace & detail produk"
    ],
    outcome: "Katalog rapi dan meyakinkan yang mempercepat launching serta membantu jualan online."
  },
  {
    title: "Campaign & Key Visual",
    role: "Campaign Visual Designer",
    deliverables: [
      "Key visual & poster kampanye",
      "Adaptasi materi multi-ukuran",
      "Konsep tema promo"
    ],
    outcome: "Visual kampanye yang menonjol, menjangkau pasar lebih luas, dan dipakai berulang."
  },
  {
    title: "Video Editing & Motion",
    role: "Video Editor",
    deliverables: [
      "Edit reels & TikTok",
      "Motion grafis ringan & subtitle",
      "Color grading"
    ],
    outcome: "Video yang menjaga perhatian penonton dan siap dipakai untuk ads."
  }
];

export type Testimonial = {
  quote: string;
  author: string;
  brand: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Desainnya bikin konten kami langsung naik kelas. Brief cepat ditangkap, revisi minim, dan hasilnya selalu on-brand. Sekarang jadi andalan tiap kampanye.",
    author: "Marketing Lead",
    brand: "Brand Fashion Streetwear (W•••••rn)"
  },
  {
    quote:
      "Katalog produk kami yang tadinya berantakan jadi rapi dan premium. Foto dan layout-nya meyakinkan, dan penjualan online ikut terbantu.",
    author: "Owner",
    brand: "Brand Skincare (H•••ya)"
  },
  {
    quote:
      "Pengerjaan tepat waktu, komunikatif, dan kualitasnya konsisten. Hampir semua materi promo sekarang kami percayakan ke Ridho.",
    author: "Social Media Officer",
    brand: "Brand Kecantikan (L•••s)"
  },
  {
    quote:
      "Reels hasil editannya jadi konten dengan performa terbaik di akun kami. Sangat worth it — pasti repeat order.",
    author: "Founder",
    brand: "Brand Lifestyle (M•••••ng)"
  }
];

/**
 * "Apa & untuk siapa" per brand. Shown under each brand in the featured
 * slider. Unknown brands fall back to a sensible generic line, so every
 * brand always has a what-and-for-whom description.
 */
const BRAND_BLURBS: Record<string, string> = {
  wellborn: "Konten & katalog streetwear yang menonjolkan karakter produk untuk anak muda urban.",
  hasaya: "Visual bersih yang menonjolkan manfaat produk perawatan untuk keluarga & kulit sensitif.",
  lilis: "Desain promo kecantikan yang menggugah untuk pembeli yang cari produk hemat & terpercaya.",
  menliving: "Sistem konten sosial yang rapi untuk audiens pria yang peduli gaya hidup.",
  "love lola": "Katalog fashion wanita yang premium untuk pembeli online yang mengutamakan tampilan.",
  digivise: "Materi kampanye digital untuk brand yang ingin tampil menonjol di media sosial.",
  rtsr: "Katalog & visual produk untuk brand yang butuh tampilan konsisten dan siap jual."
};

const BRAND_BLURB_FALLBACK =
  "Visual & konten yang dirancang untuk memperkuat citra brand di mata audiensnya.";

export function getBrandBlurb(brandName: string): string {
  const key = brandName.trim().toLowerCase();
  if (BRAND_BLURBS[key]) return BRAND_BLURBS[key];
  const partial = Object.keys(BRAND_BLURBS).find(
    (name) => key.includes(name) || name.includes(key)
  );
  return partial ? BRAND_BLURBS[partial] : BRAND_BLURB_FALLBACK;
}
