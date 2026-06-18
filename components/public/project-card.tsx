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
};

export function ProjectCard({
  project,
  priority = false,
  sizes = "(min-width: 768px) 50vw, 100vw"
}: ProjectCardProps) {
  return (
    <Link href={`/portfolio/${project.slug}`} className="content-auto group block">
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
          <h3 className="mt-2 text-2xl font-black uppercase leading-none sm:text-4xl">
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
