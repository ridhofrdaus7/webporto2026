"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { profileSchema } from "@/lib/validation";

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: ProfileInput }) {
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile
  });

  async function onSubmit(values: ProfileInput) {
    const response = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    setMessage(response.ok ? "Profile updated." : "Could not update profile.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {["name", "headline", "profileImageUrl", "email", "whatsapp", "instagramUrl", "linkedinUrl", "cvUrl"].map((field) => (
        <label key={field} className="grid gap-2">
          <span className="eyebrow">{field}</span>
          <input className="field" {...register(field as keyof ProfileInput)} />
        </label>
      ))}
      <label className="grid gap-2">
        <span className="eyebrow">bio</span>
        <textarea className="field min-h-48" {...register("bio")} />
      </label>
      <div className="flex items-center gap-4">
        <button className="button-pill button-dark" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : "Save Profile"}
        </button>
        {message ? <p className="font-semibold text-[#777]">{message}</p> : null}
      </div>
    </form>
  );
}
