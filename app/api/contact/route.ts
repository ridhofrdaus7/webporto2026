import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form data." }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Database is not available. Configure Supabase environment variables." },
      { status: 503 }
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company || null,
    project_need: parsed.data.projectNeed,
    budget: parsed.data.budget || null,
    message: parsed.data.message
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not save the message. Please try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
