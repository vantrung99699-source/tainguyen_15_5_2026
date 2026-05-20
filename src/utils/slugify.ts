/** Tạo slug URL từ tiêu đề (tiếng Việt không dấu). */
export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function resolveExtraPageSlug(title: string, customSlug: string, existingSlugs: string[], selfId?: string) {
  const trimmed = customSlug.trim().toLowerCase().replace(/\s+/g, '-');
  let base = trimmed ? slugifyTitle(trimmed) : slugifyTitle(title);
  if (!base) base = `trang-${Date.now()}`;

  const others = existingSlugs.filter((s) => s !== base);
  if (!others.includes(base)) return base;

  let i = 2;
  while (others.includes(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
