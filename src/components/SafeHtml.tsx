import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'sup', 'sub', 'code', 'pre',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'title'];

/**
 * Renders WooCommerce HTML descriptions safely after sanitisation.
 * Styled with Tailwind typography utilities for headings, lists, paragraphs, etc.
 */
export const SafeHtml = ({ html, className }: SafeHtmlProps) => {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html || '', {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
      }),
    [html]
  );

  return (
    <div
      className={cn(
        'text-foreground/80 leading-relaxed space-y-3',
        '[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-4 [&_h1]:mb-2',
        '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-4 [&_h2]:mb-2',
        '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-3 [&_h3]:mb-1',
        '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-3 [&_h4]:mb-1',
        '[&_p]:leading-relaxed',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_b]:font-semibold [&_b]:text-foreground',
        '[&_em]:italic [&_i]:italic',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_li]:leading-relaxed',
        '[&_a]:text-accent [&_a]:underline hover:[&_a]:opacity-80',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic',
        '[&_hr]:my-4 [&_hr]:border-border',
        '[&_table]:w-full [&_table]:my-4 [&_table]:border [&_table]:border-border [&_table]:border-collapse [&_table]:text-sm',
        '[&_th]:border [&_th]:border-border [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground',
        '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
        '[&_tr>td:first-child]:whitespace-nowrap [&_tr>th:first-child]:whitespace-nowrap [&_tr>td:first-child]:font-semibold [&_tr>td:first-child]:text-foreground',
        '[&_table>tbody>tr:first-child>td]:bg-muted/40 [&_table>tbody>tr:first-child>td]:font-semibold [&_table>tbody>tr:first-child>td]:text-foreground',
        className
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};
