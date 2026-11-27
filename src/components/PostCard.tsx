import { useState } from "react";
import { Flag, Heart, MessageCircle, ShieldBan } from "lucide-react";
import type { Post } from "../lib/types";

type Props = {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => Promise<void>;
  onComment?: (postId: string, body: string) => Promise<void>;
  onReport?: (postId: string) => Promise<void>;
  onBlock?: (userId: string) => Promise<void>;
};

export default function PostCard({ post, currentUserId, onLike, onComment, onReport, onBlock }: Props) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const liked = Boolean(post.likes?.some((like) => like.user_id === currentUserId));

  async function submitComment() {
    if (!comment.trim() || !onComment) return;
    setBusy(true);
    try { await onComment(post.id, comment.trim()); setComment(""); }
    finally { setBusy(false); }
  }

  return (
    <article className="gf-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-forest-900">{post.profiles?.display_name ?? "GlobalFriends student"}</p>
          <p className="gf-muted text-xs">{post.profiles?.country ?? "Community"} · {new Date(post.created_at).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          {onReport && <button className="text-amber-700 p-1" aria-label="Report post" title="Report post" onClick={() => onReport(post.id)}><Flag size={17}/></button>}
          {onBlock && post.author_id !== currentUserId && <button className="text-red-700 p-1" aria-label="Block author" title="Block author" onClick={() => onBlock(post.author_id)}><ShieldBan size={17}/></button>}
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">{post.body}</p>
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
        <button disabled={!onLike || !currentUserId} onClick={() => onLike?.(post.id)} className={`inline-flex items-center gap-1 ${liked ? "text-rose-600" : ""}`}><Heart size={17} fill={liked ? "currentColor" : "none"}/>{post.likes?.length ?? 0}</button>
        <span className="inline-flex items-center gap-1"><MessageCircle size={17}/>{post.comments?.length ?? 0}</span>
      </div>
      {post.comments && post.comments.length > 0 && <div className="mt-3 space-y-2">{post.comments.map((item) => <p key={item.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold">Student: </span>{item.body}</p>)}</div>}
      {onComment && currentUserId && <div className="mt-3 flex gap-2"><input className="gf-input" aria-label="Write a comment" placeholder="Add a thoughtful comment…" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500}/><button className="gf-button" disabled={busy || !comment.trim()} onClick={submitComment}>Send</button></div>}
    </article>
  );
}
