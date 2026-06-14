import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  SUPABASE_STORAGE_BUCKET,
  isSupabaseAdminConfigured
} from "@/lib/supabase/config";
import { allowedUploadTypes } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase Storage is not configured." },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (!allowedUploadTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, and MP4 files are allowed." },
      { status: 400 }
    );
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be 20MB or smaller." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.type === "video/mp4" ? "mp4" : file.type.split("/")[1];
  const objectPath = `ridho-portfolio/${randomUUID()}.${extension}`;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(objectPath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(objectPath);

  return NextResponse.json({ url: publicUrl });
}
