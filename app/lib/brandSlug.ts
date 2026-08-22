export function slugifyBrandName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getBrandPath({
  id,
  name,
}: {
  id?: string | null;
  name?: string | null;
}) {
  const slug = name ? slugifyBrandName(name) : "";
  return `/brands/${slug || id || ""}`;
}
