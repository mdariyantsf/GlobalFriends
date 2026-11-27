import { useCallback, useEffect, useState } from "react";
import { Send, RefreshCw } from "lucide-react";
import Notice from "../components/Notice";
import PostCard from "../components/PostCard";
import { supabase } from "../lib/supabase";
import type { Post } from "../lib/types";

type Props = { userId?: string };

export default function Community({ userId }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    if (!supabase) {
      setPosts([]);
      setError("Supabase is not configured. Check the Vercel environment variables.");
      setLoading(false);
      return;
    }
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    const { data: blockedRows, error: blockError } = await supabase
      .from("blocks").select("blocked_id").eq("blocker_id", userId);
    if (blockError) {
      setError(blockError.message);
      setLoading(false);
      return;
    }
    const blockedIds = new Set((blockedRows ?? []).map((row) => row.blocked_id as string));
    const { data, error: queryError } = await supabase
      .from("posts")
      .select("id,author_id,body,created_at,profiles(display_name,country),likes(user_id),comments(id,body,user_id,created_at)")
      .order("created_at", { ascending: false }).limit(50);
    if (queryError) setError(queryError.message);
    else setPosts(((data ?? []) as unknown as Post[]).filter((post) => !blockedIds.has(post.author_id)));
    setLoading(false);
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  async function createPost() {
    if (!supabase || !userId || !body.trim()) return;
    setBusy(true); setError("");
    const { error: insertError } = await supabase.from("posts").insert({ author_id: userId, body: body.trim() });
    if (insertError) setError(insertError.message);
    else { setBody(""); await load(); }
    setBusy(false);
  }

  async function likePost(postId: string) {
    if (!supabase || !userId) return;
    const existing = posts.find((post) => post.id === postId)?.likes?.some((like) => like.user_id === userId);
    const result = existing
      ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
      : await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    if (result.error) setError(result.error.message);
    await load();
  }

  async function commentPost(postId: string, text: string) {
    if (!supabase || !userId || !text.trim()) return;
    const { error: commentError } = await supabase.from("comments").insert({ post_id: postId, user_id: userId, body: text.trim() });
    if (commentError) setError(commentError.message);
    await load();
  }

  async function reportPost(postId: string) {
    if (!supabase || !userId) return;
    const reason = window.prompt("Briefly describe why this post should be reviewed:");
    if (!reason?.trim()) return;
    const { error: reportError } = await supabase.from("reports").insert({ reporter_id: userId, target_type: "post", target_id: postId, reason: reason.trim() });
    if (reportError) setError(reportError.message);
    else window.alert("Report submitted.");
  }

  async function blockUser(blockedId: string) {
    if (!supabase || !userId || !window.confirm("Block this account?")) return;
    const { error: blockError } = await supabase.from("blocks").insert({ blocker_id: userId, blocked_id: blockedId });
    if (blockError) setError(blockError.message);
    await load();
  }

  return <div className="gf-page max-w-3xl">
    <div className="mb-7 flex items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-700">The student commons</p><h1 className="mt-2 text-3xl font-extrabold text-forest-950">Community</h1><p className="mt-2 gf-muted">Share ideas and learn with real GlobalFriends members.</p></div>
      <button className="gf-button gf-button-secondary" onClick={() => void load()} aria-label="Refresh feed"><RefreshCw size={16}/> Refresh</button>
    </div>
    {!userId && <div className="mb-5"><Notice>Sign in to view the member feed and publish posts. No sample posts are displayed.</Notice></div>}
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    {userId && <div className="gf-card mb-5 p-4"><label className="gf-label" htmlFor="new-post">Share with the community</label><textarea id="new-post" className="gf-input min-h-28 resize-y" maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="What are you learning, wondering, or working on?"/><div className="mt-3 flex items-center justify-between"><span className="text-xs gf-muted">{body.length}/2000</span><button className="gf-button" disabled={busy || !body.trim()} onClick={() => void createPost()}><Send size={15}/>{busy ? "Posting…" : "Publish"}</button></div></div>}
    {loading ? <div className="gf-card p-6 text-sm gf-muted">Loading community posts…</div> : posts.length === 0 ? <div className="gf-card p-7 text-center"><h2 className="font-bold text-forest-950">No community posts yet</h2><p className="mt-2 text-sm gf-muted">When members publish posts, they will appear here. We do not show fictional sample posts.</p></div> : <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} currentUserId={userId} onLike={userId ? likePost : undefined} onComment={userId ? commentPost : undefined} onReport={userId ? reportPost : undefined} onBlock={userId ? blockUser : undefined}/>)}</div>}
  </div>;
}
