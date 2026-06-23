import Image from "next/image";
import Link from "next/link";

type ProjectCardProject = {
  title: string;
  slug: string;
  clientName: string;
  year: number;
  thumbnailUrl: string;
  category: { name: string };
  catalog?: { name: string; brandName: string } | null;
};

type ProjectCardProps = {
  project: ProjectCardProject;
  priority?: boolean;
  sizes?: string;
  /**
   * Title type-scale classes. Defaults to viewport breakpoints (homepage).
   * The portfolio grid passes CONTAINER-query classes so the title tracks
   * the card's own width as the user resizes cards — needs `@container` on
   * the root (always set below).
   */
  titleClassName?: string;
};

export function ProjectCard({
  project,
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
  titleClassName = "text-2xl sm:text-4xl"
}: ProjectCardProps) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="group block @container">
      <div className="editorial-image aspect-[1.18/1]">
        <Image
          src={project.thumbnailUrl}
          alt={`${project.title} thumbnail`}
          width={1200}
          height={920}
          priority={priority}
          sizes={sizes}
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="eyebrow">{project.catalog?.name ?? project.category.name}</p>
          <h3 className={`mt-2 font-black uppercase leading-none ${titleClassName}`}>
            {project.title}
          </h3>
        </div>
        <div className="text-right text-xs font-bold uppercase leading-5 text-muted">
          <p>{project.clientName}</p>
          <p>{project.year}</p>
        </div>
      </div>
    </Link>
  );
}
