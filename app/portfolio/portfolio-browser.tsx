"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/public/project-card";
import type { ProjectCardSummary } from "@/lib/portfolio";

export function PortfolioBrowser({
  projects,
  categories
}: {
  projects: ProjectCardSummary[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = category === "all" || project.category.slug === category;
      const search = [
        project.title,
        project.clientName,
        project.category.name,
        project.catalog?.brandName,
        project.catalog?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && search.includes(query.toLowerCase());
    });
  }, [category, projects, query]);

  return (
    <div>
      <div className="mb-10 grid gap-4 border-y border-[#d9d9d9] py-5 lg:grid-cols-[1fr_0.45fr]">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategory("all")} className={`button-pill ${category === "all" ? "button-dark" : "button-light"}`}>
            All
          </button>
          {categories.map((item) => (
            <button key={item.id} onClick={() => setCategory(item.slug)} className={`button-pill ${category === item.slug ? "button-dark" : "button-light"}`}>
              {item.name}
            </button>
          ))}
        </div>
        <input
          className="field"
          placeholder="Search work"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="border border-[#d9d9d9] bg-white p-10 text-xl font-black uppercase">
          No published projects found.
        </div>
      ) : (
        <div className="grid gap-12 md:grid-cols-2">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              priority={index < 2}
              sizes="(min-width: 768px) 50vw, calc(100vw - 40px)"
            />
          ))}
        </div>
      )}
    </div>
  );
}
