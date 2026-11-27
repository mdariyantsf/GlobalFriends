import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Notice from "../components/Notice";
import type { Profile } from "../lib/types";

type Props = { userId?: string };

export default function PenPals({ userId }: Props) {
  const [people, setPeople] = useState<Profile[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      if (!supabase || !userId) { setPeople([]); setLoading(false); return; }
      const [profilesResult, requestsResult, blocksResult] = await Promise.all([
        supabase.from("profiles").select("id,display_name,country,language,bio,interests,skills,learning_goals").neq("id", userId).limit(50),
        supabase.from("connections").select("receiver_id,status").eq("requester_id", userId),
        supabase.from("blocks").select("blocked_id").eq("blocker_id", userId)
      ]);
      if (!active) return;
      if (profilesResult.error) setError(profilesResult.error.message);
      if (requestsResult.error) setError(requestsResult.error.message);
      if (blocksResult.error) setError(blocksResult.error.message);
      const blocked = new Set((blocksResult.data ?? []).map((row) => row.blocked_id as string));
      setPeople(((profilesResult.data ?? []) as Profile[]).filter((person) => !blocked.has(person.id)));
      setPendingIds((requestsResult.data ?? []).filter((row) => row.status === "pending").map((row) => row.receiver_id as string));
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  async function requestConnection(receiverId: string) {
    if (!supabase || !userId) return;
    setError("");
    const { error: insertError } = await supabase.from("connections").insert({ requester_id: userId, receiver_id: receiverId });
    if (insertError) setError(insertError.message);
    else { setPendingIds((current) => [...current, receiverId]); setMessage("Connection request sent."); }
  }

  return <div className="gf-page">
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">Pen Pals</p><h1 className="mt-2 text-3xl font-extrabold text-forest-950">Find a learning friend</h1><p className="mt-2 gf-muted">Discover real members and connect through shared learning interests.</p></div>
    {message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    {!userId ? <Notice>Sign in to discover members. Fictional sample profiles are not displayed.</Notice> : loading ? <div className="gf-card p-6 text-sm gf-muted">Loading members…</div> : people.length === 0 ? <div className="gf-card p-7 text-center"><h2 className="font-bold text-forest-950">No other members yet</h2><p className="mt-2 text-sm gf-muted">New members will appear here after they create an account and profile.</p></div> : <div className="grid gap-4 md:grid-cols-2">{people.map((person) => <article key={person.id} className="gf-card p-5"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-lg font-extrabold text-forest-800">{person.display_name.slice(0, 1).toUpperCase()}</div><div><h2 className="font-bold text-forest-950">{person.display_name}</h2><p className="text-xs gf-muted">{person.country || "Country not added"} · {person.language || "Language not added"}</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{person.bio || "This member has not added a bio yet."}</p><div className="mt-3">{(person.interests ?? []).slice(0, 4).map((interest) => <span className="gf-chip" key={interest}>{interest}</span>)}</div><button className="gf-button gf-button-secondary mt-4 w-full" disabled={pendingIds.includes(person.id)} onClick={() => void requestConnection(person.id)}>{pendingIds.includes(person.id) ? "Request sent" : "Send Pen Pal request"}</button></article>)}</div>}
  </div>;
}
