import { Link } from "react-router-dom";

export default function NotFound() {
  return <div className="gf-page"><div className="gf-card p-8 text-center"><p className="text-5xl font-extrabold text-forest-800">404</p><h1 className="mt-3 text-2xl font-extrabold text-forest-950">Page not found</h1><p className="mt-2 gf-muted">That page may have moved.</p><Link className="gf-button mt-5" to="/">Return home</Link></div></div>;
}
