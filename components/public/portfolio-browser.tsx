"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/public/project-card";

type Project = {
  title: string;
  slug: string;
  clientName: string;
  year: number;
  thumbnailUrl: string;
  category: { name: string; slug: string };
  catalog?: { name: string; brandName: string } | null;
};

export function PortfolioBrowser({
  projects,
  categories
}: {
  projects: Project[];
  categories: Array<{ name: string; slug: string }>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        category === "all" || project.category.slug === category;
      const haystack = [
        project.title,
        project.clientName,
        project.category.name,
        project.catalog?.brandName,
        project.catalog?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && haystack.includes(query.toLowerCase());
    });
  }, [category, projects, query]);

  return (
    <div className="grid gap-10">
      <div className="flex flex-col gap-4 border-y border-[#d9d9d9] py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`button-pill ${category === "all" ? "button-dark" : "button-light"}`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              onClick={() => setCategory(item.slug)}
              className={`button-pill ${category === item.slug ? "button-dark" : "button-light"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field max-w-md"
          placeholder="Search work"
        />
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
      {!filtered.length ? (
        <p className="border-t border-[#d9d9d9] pt-8 text-2xl font-black uppercase">
          No published projects found.
        </p>
      ) : null}
    </div>
  );
}
