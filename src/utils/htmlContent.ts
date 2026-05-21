/** Gỡ thẻ HTML để hiển thị tóm tắt (chuông, danh sách) */
export function stripHtml(html: string): string {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isLikelyHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

export const RICH_HTML_PROSE_CLASS =
  'text-[13px] leading-relaxed text-slate-600 break-words ' +
  '[&_h3]:mb-2 [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-bold [&_li]:my-0.5 ' +
  '[&_p]:my-1.5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 ' +
  '[&_img]:my-3 [&_img]:block [&_img]:max-h-48 [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-lg ' +
  '[&_img]:border [&_img]:border-zinc-200 [&_a]:text-brand-primary [&_a]:underline [&_strong]:font-bold';
