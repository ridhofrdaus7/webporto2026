import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/public/project-gallery";
import { PublicHeader } from "@/components/public/public-header";
import { Reveal } from "@/components/scroll/reveal";
import { RevealText } from "@/components/scroll/reveal-text";
import { getProjectBySlug, getPublishedProjectLinks } from "@/lib/portfolio";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getPublishedProjectLinks();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: [project.thumbnailUrl]
    }
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjectLinks()
  ]);
  if (!project) notFound();

  const nextProject = projects.find((item) => item.slug !== project.slug) ?? null;
  const gallery = [
    { mediaUrl: project.thumbnailUrl, altText: project.title, mediaType: "image" as const },
    ...project.media
  ];

  return (
    <main>
      <PublicHeader />
      <section className="container-shell py-12 sm:py-20">
        <p className="eyebrow">{project.category.name} / {project.year}</p>
        <RevealText
          as="h1"
          className="mt-5 max-w-[20ch] text-5xl font-black uppercase leading-[0.95] sm:text-6xl lg:text-7xl"
        >
          {project.title}
        </RevealText>
        <div className="mt-10 grid gap-4 border-y border-line py-6 text-xs font-black uppercase text-muted md:grid-cols-5">
          <p>Client<br /><span className="text-ink">{project.clientName}</span></p>
          <p>Category<br /><span className="text-ink">{project.category.name}</span></p>
          <p>Role<br /><span className="text-ink">{project.role}</span></p>
          <p>Catalog<br /><span className="text-ink">{project.catalog?.name ?? "-"}</span></p>
          <p>Tools<br /><span className="text-ink">{project.tools}</span></p>
        </div>
      </section>

      <section className="container-shell">
        <h2 className="mb-8 text-5xl font-black uppercase">Gallery</h2>
        <ProjectGallery gallery={gallery} />
      </section>

      <section className="container-shell section-pad">
        <div className="grid gap-12 lg:grid-cols-[0.45fr_1fr]">
          <p className="eyebrow">Overview</p>
          <div className="grid gap-12">
            {[
              ["Overview", project.fullDescription],
              ["Problem", project.challenge],
              ["Creative Direction", project.process],
              ["Execution", project.result],
              ["Final Output", project.shortDescription]
            ].map(([title, body], index) => (
              <Reveal key={title} delay={index * 0.06}>
                <article className="grid gap-4 border-t border-line pt-6 md:grid-cols-[0.35fr_1fr]">
                  <h2 className="text-sm font-black uppercase">{title}</h2>
                  <p className="text-xl font-medium leading-9 text-neutral-700">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-inverse py-20">
        <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-muted">Next Project</p>
            <RevealText as="h2" className="mt-3 text-5xl font-black uppercase leading-none">
              {nextProject?.title ?? "Project Archive"}
            </RevealText>
          </div>
          <Link href={nextProject ? `/portfolio/${nextProject.slug}` : "/portfolio"} className="button-pill button-light">
            Continue
          </Link>
        </div>
      </section>
    </main>
  );
}
