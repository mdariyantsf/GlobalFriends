import { useCallback, useEffect, useState } from "react";
import Notice from "../components/Notice";
import { supabase } from "../lib/supabase";

type Props = { isAdmin: boolean; userId?: string };
type Report = { id: string; reporter_id: string; target_type: "post" | "profile" | "comment"; target_id: string; reason: string; status: string; created_at: string };
type Item = Report & { preview: string; profileId: string | null };
type Member = { id: string; display_name: string; country: string };

export default function Admin({ isAdmin, userId }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase || !isAdmin) { setLoading(false); return; }
    setLoading(true); setError("");
    const [reportsResult, membersResult] = await Promise.all([
      supabase.from("reports").select("*").in("status", ["open", "reviewing"]).order("created_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("id,display_name,country").order("created_at", { ascending: false }).limit(100)
    ]);
    if (reportsResult.error) setError(reportsResult.error.message);
    if (membersResult.error) setError(membersResult.error.message);
    setMembers((membersResult.data ?? []) as Member[]);
    const reports = (reportsResult.data ?? []) as Report[];
    const detailed = await Promise.all(reports.map(async (r): Promise<Item> => {
      if (!supabase) return { ...r, preview: "", profileId: null };
      if (r.target_type === "profile") {
        const { data } = await supabase.from("profiles").select("display_name").eq("id", r.target_id).maybeSingle();
        return { ...r, preview: data?.display_name ?? "(profile no longer exists)", profileId: data ? r.target_id : null };
      }
      if (r.target_type === "post") {
        const { data } = await supabase.from("posts").select("body,author_id").eq("id", r.target_id).maybeSingle();
        return { ...r, preview: data?.body ?? "(post no longer exists)", profileId: data?.author_id ?? null };
      }
      const { data } = await supabase.from("comments").select("body,user_id").eq("id", r.target_id).maybeSingle();
      return { ...r, preview: data?.body ?? "(comment no longer exists)", profileId: data?.user_id ?? null };
    }));
    setItems(detailed);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { void load(); }, [load]);

  async function closeReport(id: string, status: "resolved" | "dismissed") {
    if (!supabase) return;
    const { error: updateError } = await supabase.from("reports").update({ status }).eq("id", id);
    if (updateError) setError(updateError.message);
  }

  async function dismiss(id: string) {
    await closeReport(id, "dismissed");
    await load();
  }

  async function removeContent(r: Item) {
    if (!supabase || r.target_type === "profile") return;
    if (!window.confirm("Delete this content?")) return;
    const { error: deleteError } = await supabase.from(r.target_type === "post" ? "posts" : "comments").delete().eq("id", r.target_id);
    if (deleteError) { setError(deleteError.message); return; }
    await closeReport(r.id, "resolved");
    setMessage("Content deleted.");
    await load();
  }

  async function removeProfile(profileId: string, name: string, reportId?: string) {
    if (!supabase) return;
    if (!window.confirm(`Remove ${name}'s profile and all of their content? They will not be able to create a new profile.`)) return;
    const ban = await supabase.from("banned_users").upsert({ user_id: profileId });
    if (ban.error) { setError(ban.error.message); return; }
    const removal = await supabase.from("profiles").delete().eq("id", profileId);
    if (removal.error) { setError(removal.error.message); return; }
    if (reportId) await closeReport(reportId, "resolved");
    setMessage(`${name} was removed.`);
    await load();
  }

  if (!isAdmin) {
    return <div className="gf-page max-w-3xl"><Notice>This page is only for the site administrator.</Notice></div>;
  }

  return <div className="gf-page max-w-4xl">
    <h1 className="text-3xl font-extrabold text-forest-950">Admin</h1>
    <p className="mt-2 gf-muted">Review reports and remove profiles or content that break the community rules.</p>
    {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}
    {message && <div className="mt-4"><Notice kind="success">{message}</Notice></div>}

    <h2 className="mt-8 text-xl font-bold text-forest-950">Open reports ({items.length})</h2>
    {loading ? <div className="gf-card mt-3 p-6 text-sm gf-muted">Loading…</div> : items.length === 0 ? <div className="gf-card mt-3 p-6 text-sm gf-muted">No open reports.</div> :
      <div className="mt-3 space-y-3">{items.map((r) => <div key={r.id} className="gf-card p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-forest-700">{r.target_type} report · {new Date(r.created_at).toLocaleString()}</p>
        <p className="mt-2 text-sm"><b>Reason:</b> {r.reason}</p>
        <p className="mt-1 text-sm gf-muted whitespace-pre-wrap"><b>Content:</b> {r.preview}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {r.target_type !== "profile" && <button className="gf-button-secondary" onClick={() => void removeContent(r)}>Delete {r.target_type}</button>}
          {r.profileId && r.profileId !== userId && <button className="gf-button-danger" onClick={() => void removeProfile(r.profileId as string, "this member", r.id)}>Remove profile</button>}
          <button className="gf-button-secondary" onClick={() => void dismiss(r.id)}>Dismiss</button>
        </div>
      </div>)}</div>}

    <h2 className="mt-10 text-xl font-bold text-forest-950">All members ({members.length})</h2>
    <div className="mt-3 space-y-3">{members.filter((m) => m.id !== userId).map((m) => <div key={m.id} className="gf-card flex items-center justify-between gap-3 p-4">
      <div><b>{m.display_name}</b><p className="text-xs gf-muted">{m.country || "Country not set"}</p></div>
      <button className="gf-button-danger" onClick={() => void removeProfile(m.id, m.display_name)}>Remove profile</button>
    </div>)}</div>
  </div>;
}
