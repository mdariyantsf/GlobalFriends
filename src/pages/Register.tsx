import { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../lib/auth";
import Notice from "../components/Notice";
import { isSupabaseConfigured } from "../lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      const result = await signUp(email.trim(), password, name.trim());
      setMessage(result.session ? "Your account is ready. You can sign in now." : "Check your email for the confirmation link, then sign in.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create account."); }
    finally { setBusy(false); }
  }

  return <div className="gf-page max-w-xl">
    <div className="gf-card p-7 md:p-9">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">Join a global learning community</p>
      <h1 className="mt-2 text-3xl font-extrabold text-forest-950">Create your account</h1>
      <p className="mt-2 text-sm gf-muted">Use a display name. Do not include your phone number, exact address, or school timetable.</p>
      {!isSupabaseConfigured && <div className="mt-5"><Notice>Connect Supabase first. Setup steps are in README.md.</Notice></div>}
      {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}
      {message && <div className="mt-4"><Notice kind="success">{message}</Notice></div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block"><span className="gf-label">Display name</span><input className="gf-input" required minLength={2} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="How should the community know you?"/></label>
        <label className="block"><span className="gf-label">Email</span><input className="gf-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}/></label>
        <label className="block"><span className="gf-label">Password (at least 8 characters)</span><input className="gf-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)}/></label>
        <label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" required className="mt-1"/>I agree to be respectful, avoid sharing sensitive personal information, and use reporting tools responsibly.</label>
        <button className="gf-button w-full" disabled={busy || !isSupabaseConfigured}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="mt-5 text-sm gf-muted">Already registered? <Link className="font-bold text-forest-700" to="/login">Sign in</Link></p>
    </div>
  </div>;
}
