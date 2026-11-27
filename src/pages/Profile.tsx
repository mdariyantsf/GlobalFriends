import { useEffect, useState } from "react";
import Notice from "../components/Notice";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";

type Props = { userId?: string };

const splitList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 12);

export default function ProfilePage({ userId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("English");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [goals, setGoals] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!userId || !supabase) return;
      const { data, error: queryError } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (!active) return;
      if (queryError) { setError(queryError.message); return; }
      const p = data as Profile | null;
      setProfile(p);
      setName(p?.display_name ?? "");
      setCountry(p?.country ?? "");
      setLanguage(p?.language ?? "English");
      setBio(p?.bio ?? "");
      setInterests((p?.interests ?? []).join(", "));
      setSkills((p?.skills ?? []).join(", "));
      setGoals((p?.learning_goals ?? []).join(", "));
    }
    void load();
    return () => { active = false; };
  }, [userId]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase || !userId) return;
    const payload = {
      id: userId, display_name: name.trim(), country: country.trim(), language: language.trim(),
      bio: bio.trim(), interests: splitList(interests), skills: splitList(skills), learning_goals: splitList(goals)
    };
    const { data, error: saveError } = await supabase.from("profiles").upsert(payload).select().single();
    if (saveError) setError(saveError.message);
    else { setProfile(data as Profile); setMessage("Profile saved."); }
  }

  if (!userId) {
    return <div className="gf-page"><div className="gf-card p-7"><h1 className="text-2xl font-extrabold text-forest-950">Student profile</h1><p className="mt-2 gf-muted">Sign in to create and manage your profile.</p></div></div>;
  }

  return <div className="gf-page max-w-3xl">
    <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">Your learning identity</p><h1 className="mt-2 text-3xl font-extrabold text-forest-950">Student profile</h1><p className="mt-2 gf-muted">Share learning interests, not sensitive personal details.</p></div>
    <form onSubmit={save} className="gf-card space-y-4 p-6 md:p-8">
      {error && <Notice kind="error">{error}</Notice>}{message && <Notice kind="success">{message}</Notice>}
      <label className="block"><span className="gf-label">Display name</span><input className="gf-input" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)}/></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><span className="gf-label">Country (no exact address)</span><input className="gf-input" maxLength={60} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Bangladesh"/></label>
        <label className="block"><span className="gf-label">Languages</span><input className="gf-input" maxLength={80} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English, Bengali"/></label>
      </div>
      <label className="block"><span className="gf-label">Short bio</span><textarea className="gf-input min-h-24" maxLength={350} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What are you curious about?"/></label>
      <label className="block"><span className="gf-label">Interests (comma-separated)</span><input className="gf-input" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Climate science, robotics, writing"/></label>
      <label className="block"><span className="gf-label">Skills (comma-separated)</span><input className="gf-input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, design, research"/></label>
      <label className="block"><span className="gf-label">Learning goals (comma-separated)</span><input className="gf-input" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Build a project, learn data analysis"/></label>
      <button className="gf-button" type="submit">Save profile</button>
      {profile && <p className="text-xs gf-muted">Last saved profile is connected to your account.</p>}
    </form>
  </div>;
}
