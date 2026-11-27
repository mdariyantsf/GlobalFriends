import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Globe2, Handshake, Lightbulb, ShieldCheck, Sparkles, Compass } from "lucide-react";

const features = [
  { icon: <Globe2/>, title: "Meet across borders", body: "Discover students with shared interests and different perspectives." },
  { icon: <BookOpen/>, title: "Share what you know", body: "Exchange learning resources, project ideas, and helpful feedback." },
  { icon: <Handshake/>, title: "Find learning partners", body: "Build respectful peer connections around shared learning goals." },
  { icon: <Compass/>, title: "Plan your next step", body: "Turn a learning goal into a practical, step-by-step roadmap." },
  { icon: <ShieldCheck/>, title: "Community safety first", body: "Use reporting and blocking tools, and keep personal contact details private." }
];

export default function Home() {
  return <div className="gf-page">
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-forest-950 via-forest-800 to-emerald-700 p-8 text-white md:p-14">
      <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10 bg-white/5"/>
      <div className="relative max-w-3xl">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100"><Sparkles size={14}/>A global student collaboration space</span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">Your ideas can travel <span className="text-emerald-200">further.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/90 md:text-lg">Connect with students around the world, share knowledge, and turn curiosity into collaboration.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="gf-button bg-white !text-forest-900 hover:!bg-emerald-50" to="/register">Join the community <ArrowRight size={17}/></Link>
          <Link className="gf-button border border-white/25 !bg-white/10 hover:!bg-white/20" to="/community">Explore community</Link>
        </div>
      </div>
    </section>
    <section className="mt-12">
      <div className="mb-6 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-forest-700">What brings us together</p><h2 className="mt-2 text-3xl font-extrabold text-forest-950">A better way to learn globally.</h2><p className="mt-3 leading-7 gf-muted">A student-led space built around meaningful exchange—not follower counts.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">{features.map((item) => <div key={item.title} className="gf-card p-6"><div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-forest-700">{item.icon}</div><h3 className="text-lg font-bold text-forest-950">{item.title}</h3><p className="mt-2 text-sm leading-6 gf-muted">{item.body}</p></div>)}</div>
    </section>
    <section className="gf-card mt-10 flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Start with one conversation</p><h2 className="mt-2 text-2xl font-extrabold text-forest-950">Learn something new from someone new.</h2></div><div className="flex flex-wrap gap-3"><Link className="gf-button" to="/matching">Find learning peers <ArrowRight size={16}/></Link><Link className="gf-button gf-button-secondary" to="/intelligence">Explore Intelligence <Sparkles size={16}/></Link></div></section>
    <p className="mt-6 flex items-center gap-2 text-xs gf-muted"><Lightbulb size={14}/>Be kind, protect your privacy, and share only what you are comfortable making public.</p>
  </div>;
}
