type ProfileUser = {
  email?: string | null;
  user_metadata?: {
    full_name?: string | null;
    name?: string | null;
    email?: string | null;
  } | null;
} | null;

export function slugifyUserName(value?: string | null) {
  return (
    value
      ?.normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/@.*$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user"
  );
}

export function getUserProfileBase(user?: ProfileUser) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    user?.user_metadata?.email;

  return `/profile/${slugifyUserName(displayName)}`;
}

export function getCurrentProfileBase(pathname: string, user?: ProfileUser) {
  const match = pathname.match(/^\/profile\/[^/]+/);
  return match?.[0] || getUserProfileBase(user);
}

export function joinProfilePath(base: string, subPath = "") {
  const cleanBase = base.replace(/\/$/, "");
  const cleanSubPath = subPath.replace(/^\//, "");

  return cleanSubPath ? `${cleanBase}/${cleanSubPath}` : cleanBase;
}
