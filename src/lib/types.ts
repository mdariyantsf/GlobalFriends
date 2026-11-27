export type Profile = {
  id: string;
  display_name: string;
  country: string;
  language: string;
  bio: string;
  interests: string[];
  skills: string[];
  learning_goals: string[];
  created_at?: string;
};

export type Post = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<Profile, "display_name" | "country"> | null;
  likes?: { user_id: string }[];
  comments?: { id: string; body: string; user_id: string; created_at: string }[];
};

export type Connection = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};
