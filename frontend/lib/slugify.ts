export function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w஀-௿-]/g, "").replace(/-+/g, "-");
}
