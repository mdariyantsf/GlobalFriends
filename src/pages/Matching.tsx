import { useEffect, useMemo, useState } from "react";
import { rankPeers } from "../lib/matching";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import Notice from "../components/Notice";

type Props = { userId?: string };
const blank: Profile = { id: "current", display_name: "You", country: "", language: "English", bio: "", interests: [], skills: [], learning_goals: [] };

export default function Matching({ userId }: Props) {
  const [current, setCurrent] = useState<Profile>(blank);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      if (!supabase || !userId) { setCandidates([]); setLoading(false); return; }
      const [mine, others, blocks] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("*").neq("id", userId).limit(100),
        supabase.from("blocks").select("blocked_id").eq("blocker_id", userId)
      ]);
      if (!active) return;
      if (mine.error) setError(mine.error.message);
      if (mine.data) setCurrent(mine.data as Profile);
      if (others.error) setError(others.error.message);
      if (blocks.error) setError(blocks.error.message);
      const blocked = new Set((blocks.data ?? []).map((row) => row.blocked_id as string));
      setCandidates(((others.data ?? []) as Profile[]).filter((profile) => !blocked.has(profile.id)));
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  const matches = useMemo(() => rankPeers(current, candidates), [current, candidates]);

  return <div className="gf-page">
    <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">Smart peer discovery</p><h1 className="mt-2 text-3xl font-extrabold text-forest-950">Find your learning match</h1><p className="mt-2 max-w-2xl gf-muted">Suggestions use shared interests, skills, learning goals and complementary skills.</p></div>
    <div className="mb-5"><Notice>Transparency: matching uses a deterministic, hand-written scoring algorithm. It is not a generative AI model or trained machine-learning system.</Notice></div>
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    {!userId ? <Notice>Sign in and complete your profile to discover real member matches.</Notice> : loading ? <div className="gf-card p-6 text-sm gf-muted">Finding members…</div> : matches.length === 0 ? <div className="gf-card p-6"><h2 className="font-bold text-forest-950">No matches yet</h2><p className="mt-2 text-sm gf-muted">There are no matching member profiles yet. Add interests, skills and learning goals to your profile. Suggestions will appear when compatible members join.</p></div> : <div className="grid gap-4 md:grid-cols-2">{matches.map((item) => <article key={item.profile.id} className="gf-card p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-forest-950">{item.profile.display_name}</h2><p className="text-xs gf-muted">{item.profile.country || "Country not added"}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-forest-800">{item.score}% match</span></div>{item.sharedInterests.length > 0 && <p className="mt-4 text-sm"><b>Shared interests:</b> {item.sharedInterests.join(", ")}</p>}{item.sharedSkills.length > 0 && <p className="mt-2 text-sm"><b>Shared skills:</b> {item.sharedSkills.join(", ")}</p>}{item.sharedGoals.length > 0 && <p className="mt-2 text-sm"><b>Shared goals:</b> {item.sharedGoals.join(", ")}</p>}{item.complementarySkills.length > 0 && <p className="mt-2 text-sm"><b>Complementary skills:</b> {item.complementarySkills.join(", ")}</p>}{item.reasons.length > 0 && <div className="mt-4 rounded-xl bg-emerald-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-forest-700">Why this may work</p><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-forest-900">{item.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}</article>)}</div>}
  </div>;
}
