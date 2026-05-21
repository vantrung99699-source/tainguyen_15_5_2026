import { isLikelyHtml, RICH_HTML_PROSE_CLASS } from '../../utils/htmlContent';

interface HtmlContentProps {
  html: string;
  className?: string;
  as?: 'div' | 'p' | 'span';
}

export function HtmlContent({ html, className = '', as = 'div' }: HtmlContentProps) {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) return null;

  const Tag = as;
  const base = `${RICH_HTML_PROSE_CLASS} ${className}`.trim();

  if (!isLikelyHtml(trimmed)) {
    return <Tag className={base}>{trimmed}</Tag>;
  }

  return <Tag className={base} dangerouslySetInnerHTML={{ __html: trimmed }} />;
}
