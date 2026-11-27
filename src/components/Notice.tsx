type NoticeProps = { children: React.ReactNode; kind?: "info" | "success" | "error" };

export default function Notice({ children, kind = "info" }: NoticeProps) {
  const className = kind === "success" ? "gf-alert gf-success" : kind === "error" ? "gf-alert gf-error" : "gf-alert";
  return <div className={className} role="status">{children}</div>;
}
