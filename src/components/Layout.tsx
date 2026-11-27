import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Globe2, LogOut } from "lucide-react";
import { signOut } from "../lib/auth";
import { isAdminEmail } from "../lib/admin";

type LayoutProps = { userEmail?: string | null };

export default function Layout({ userEmail }: LayoutProps) {
  const navigate = useNavigate();
  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="gf-shell">
      <header className="gf-nav">
        <div className="gf-nav-inner">
          <NavLink to="/" className="gf-brand"><span className="inline-flex items-center gap-2"><Globe2 size={23} />GlobalFriends</span></NavLink>
          <nav className="gf-navlinks" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Home</NavLink>
            <NavLink to="/community" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Community</NavLink>
            <NavLink to="/pen-pals" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Pen Pals</NavLink>
            <NavLink to="/matching" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Find peers</NavLink>
            <NavLink to="/intelligence" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Intelligence</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Profile</NavLink>
            {isAdminEmail(userEmail) && <NavLink to="/admin" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Admin</NavLink>}
            {userEmail ? <button className="gf-navlink inline-flex items-center gap-1" onClick={handleSignOut}><LogOut size={15}/>Sign out</button> : <NavLink to="/login" className={({ isActive }) => `gf-navlink ${isActive ? "active" : ""}`}>Sign in</NavLink>}
          </nav>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="gf-footer">GlobalFriends · Learn across borders · Created by Ariyan Tausif</footer>
    </div>
  );
}
