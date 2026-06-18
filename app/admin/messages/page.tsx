import { AdminShell } from "@/components/admin/admin-shell";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

async function getMessages() {
  if (!isSupabaseAdminConfigured()) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("id,name,email,company,project_need,budget,message,status,created_at")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      company: row.company as string | null,
      projectNeed: row.project_need as string,
      message: row.message as string,
      status: row.status as string
    }));
  } catch {
    return [];
  }
}

export default async function ContactMessagesPage() {
  const messages = await getMessages();

  return (
    <AdminShell>
      <div className="grid gap-8">
        <div className="border-b border-line pb-8">
          <p className="eyebrow">Contact Messages</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">Inbox</h1>
        </div>
        <div className="border border-line bg-card">
          {messages.length === 0 ? (
            <div className="p-8 font-bold text-muted">
              No saved messages yet. Messages will appear here after PostgreSQL is connected and visitors submit the contact form.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {messages.map((message) => (
                <article key={message.id} className="grid gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-black uppercase">{message.name}</h2>
                    <p className="text-xs font-black uppercase text-muted">{message.status}</p>
                  </div>
                  <p className="text-sm font-bold text-muted">{message.email} / {message.company ?? "No company"}</p>
                  <p className="font-black uppercase">{message.projectNeed}</p>
                  <p className="leading-7 text-neutral-700">{message.message}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
