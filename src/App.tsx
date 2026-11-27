import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Community from "./pages/Community";
import ProfilePage from "./pages/Profile";
import PenPals from "./pages/PenPals";
import Matching from "./pages/Matching";
import Intelligence from "./pages/Intelligence";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { supabase } from "./lib/supabase";
import { isAdminEmail } from "./lib/admin";

export default function App() {
  const [userId, setUserId] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user.id);
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
      setUserEmail(session?.user.email ?? null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  return <Routes>
    <Route element={<Layout userEmail={userEmail}/>}>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={userId ? <Navigate to="/community"/> : <Login/>}/>
      <Route path="/register" element={userId ? <Navigate to="/profile"/> : <Register/>}/>
      <Route path="/community" element={<Community userId={userId}/>}/>
      <Route path="/profile" element={<ProfilePage userId={userId}/>}/>
      <Route path="/pen-pals" element={<PenPals userId={userId}/>}/>
      <Route path="/matching" element={<Matching userId={userId}/>}/>
      <Route path="/intelligence" element={<Intelligence/>}/>
      <Route path="/admin" element={<Admin isAdmin={isAdminEmail(userEmail)} userId={userId}/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route>
  </Routes>;
      }
