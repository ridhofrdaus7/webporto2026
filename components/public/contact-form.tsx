"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validation";
import type { z } from "zod";

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  async function onSubmit(values: ContactFormValues) {
    setState("sending");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setState("error");
      return;
    }

    reset();
    setState("sent");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="field" placeholder="Name" {...register("name")} />
        <input className="field" placeholder="Email" {...register("email")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="field" placeholder="Company / Brand" {...register("company")} />
        <input className="field" placeholder="Budget (optional)" {...register("budget")} />
      </div>
      <input className="field" placeholder="Project need" {...register("projectNeed")} />
      <textarea className="field min-h-40 resize-y" placeholder="Message" {...register("message")} />
      <div className="min-h-6 text-sm font-semibold text-[#777777]">
        {Object.values(errors)[0]?.message?.toString()}
        {state === "sent" && "Message saved. Ridho will reply soon."}
        {state === "error" && "Could not send the message. Please try again."}
      </div>
      <button className="button-pill button-dark w-fit" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
