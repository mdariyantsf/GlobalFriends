// Only used to show the Admin link. Real admin permission is enforced in the database (see supabase/schema.sql).
export const ADMIN_EMAIL = "ariyantsf@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
}
