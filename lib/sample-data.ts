export type Brand = {
  id: string;
  name: string;
  slug: string;
};

export type Catalog = {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
};

export type PortfolioProject = {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  brand?: Brand | null;
  category: { id: string; name: string; slug: string };
  catalog?: Catalog | null;
  year: number;
  role: string;
  tools: string;
  shortDescription: string;
  fullDescription: string;
  challenge: string;
  process: string;
  result: string;
  thumbnailUrl: string;
  status: "draft" | "published";
  media: { id: string; mediaType: "image" | "video"; mediaUrl: string; altText: string; sortOrder: number }[];
};

export const categories = [
  { id: "cat-social", name: "Social Media Design", slug: "social-media-design" },
  { id: "cat-catalog", name: "Product Catalog", slug: "product-catalog" },
  { id: "cat-campaign", name: "Campaign Visual", slug: "campaign-visual" },
  { id: "cat-video", name: "Video Editing", slug: "video-editing" }
];

export const brands: Brand[] = [
  { id: "brand-menliving", name: "Menliving", slug: "menliving" },
  { id: "brand-love-lola", name: "Love Lola", slug: "love-lola" },
  { id: "brand-digivise", name: "Digivise", slug: "digivise" },
  { id: "brand-rtsr", name: "RTSR", slug: "rtsr" },
  { id: "brand-independent", name: "Independent Brands", slug: "independent-brands" }
];

export const catalogs: Catalog[] = [
  {
    id: "catalog-rtsr-campaign",
    brandName: "RTSR",
    brandSlug: "rtsr",
    name: "Campaign Catalog",
    slug: "rtsr-campaign-catalog"
  },
  {
    id: "catalog-rtsr-product-detail",
    brandName: "RTSR",
    brandSlug: "rtsr",
    name: "Product Detail Catalog",
    slug: "rtsr-product-detail-catalog"
  },
  {
    id: "catalog-love-lola-main",
    brandName: "Love Lola",
    brandSlug: "love-lola",
    name: "Main Product Catalog",
    slug: "love-lola-main-product-catalog"
  }
];

export const sampleProjects: PortfolioProject[] = [
  {
    id: "project-menliving",
    title: "Social Media Campaign Menliving",
    slug: "social-media-campaign-menliving",
    clientName: "Menliving",
    brand: brands[0],
    category: categories[0],
    year: 2026,
    role: "Creative Designer",
    tools: "Photoshop, Figma, CapCut",
    shortDescription: "A bold content system for social commerce, launch posts, and product storytelling.",
    fullDescription: "Menliving needed a disciplined visual language for fast social publishing without losing the feeling of a premium lifestyle brand.",
    challenge: "The content had to carry product clarity, promotion, and brand tone inside small mobile-first canvases.",
    process: "I built a modular layout language with strong product crops, compact metadata, and reusable typography rules for campaign variants.",
    result: "The final system helped the team ship sharper social visuals with a consistent campaign rhythm.",
    thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    media: [
      {
        id: "media-menliving-1",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
        altText: "Editorial fashion campaign visual",
        sortOrder: 1
      }
    ]
  },
  {
    id: "project-lola",
    title: "Love Lola Product Catalog",
    slug: "love-lola-product-catalog",
    clientName: "Love Lola",
    brand: brands[1],
    category: categories[1],
    catalog: catalogs[2],
    year: 2025,
    role: "Graphic Designer",
    tools: "Photoshop, Canva, Lightroom",
    shortDescription: "Catalog layouts with clean product hierarchy and premium e-commerce detail.",
    fullDescription: "A product catalog direction designed to make every item easy to scan while keeping the brand soft, confident, and commercial.",
    challenge: "The catalog needed to balance many SKUs with a high-end visual feeling.",
    process: "I refined grids, image ratios, caption systems, and section dividers for a calm browsing experience.",
    result: "The output became a practical catalog template for launches, promotions, and collection storytelling.",
    thumbnailUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    media: [
      {
        id: "media-lola-1",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
        altText: "Fashion product catalog composition",
        sortOrder: 1
      }
    ]
  },
  {
    id: "project-digivise",
    title: "Digivise Campaign Design",
    slug: "digivise-campaign-design",
    clientName: "Digivise",
    brand: brands[2],
    category: categories[2],
    year: 2026,
    role: "Campaign Visual Designer",
    tools: "Figma, Photoshop, AI Tools",
    shortDescription: "Digital campaign visuals for offers, brand moments, and performance ads.",
    fullDescription: "A sharp campaign suite designed to keep promotional communication direct, polished, and adaptable across formats.",
    challenge: "Every asset needed to work across different media sizes without becoming noisy.",
    process: "I used a strong typographic grid, controlled contrast, and repeatable art direction for each message family.",
    result: "The final campaign system gave the team a consistent launch look across multiple digital placements.",
    thumbnailUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    media: [
      {
        id: "media-digivise-1",
        mediaType: "image",
        mediaUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
        altText: "Campaign workspace visuals",
        sortOrder: 1
      }
    ]
  },
  {
    id: "project-motion",
    title: "Launch Reel Editing System",
    slug: "launch-reel-editing-system",
    clientName: "Independent Brands",
    brand: brands[4],
    category: categories[3],
    year: 2025,
    role: "Video Editor",
    tools: "Premiere Pro, CapCut, After Effects",
    shortDescription: "Short-form video editing templates for campaign launches and product education.",
    fullDescription: "A repeatable editing language for fast social reels with tight pacing, captions, and visual rhythm.",
    challenge: "The videos needed to feel dynamic while staying clear for brand and product messages.",
    process: "I structured shot pacing, caption hierarchy, transitions, and audio moments into reusable editing patterns.",
    result: "The workflow reduced edit time while keeping each output polished and on-brand.",
    thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80",
    status: "draft",
    media: []
  }
];

export const profile = {
  name: "Ridho Firdaus",
  headline: "Graphic Designer / Video Editor / Creative Designer",
  bio: "I create campaign visuals, social media systems, product catalogs, and edited videos for brands that need clean visual storytelling with commercial intent.",
  email: "ridhofirdaus077@gmail.com",
  whatsapp: "0899-7861-779",
  instagramUrl: "",
  linkedinUrl: ""
};
