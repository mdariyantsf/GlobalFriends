import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/auth";
import Notice from "../components/Notice";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await signIn(email.trim(), password); navigate("/community"); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not sign in."); }
    finally { setBusy(false); }
  }

  return <div className="gf-page max-w-xl">
    <div className="gf-card p-7 md:p-9">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">Welcome back</p>
      <h1 className="mt-2 text-3xl font-extrabold text-forest-950">Sign in to GlobalFriends</h1>
      <p className="mt-2 text-sm gf-muted">Continue learning and collaborating with the community.</p>
      {!isSupabaseConfigured && <div className="mt-5"><Notice kind="info">Supabase is not connected yet. Add your project URL and anon key to <code>.env.local</code> after following README.md.</Notice></div>}
      {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block"><span className="gf-label">Email</span><input className="gf-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}/></label>
        <label className="block"><span className="gf-label">Password</span><input className="gf-input" type="password" autoComplete="current-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)}/></label>
        <button className="gf-button w-full" disabled={busy || !isSupabaseConfigured}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-5 text-sm gf-muted">New here? <Link className="font-bold text-forest-700" to="/register">Create an account</Link></p>
    </div>
  </div>;
}
