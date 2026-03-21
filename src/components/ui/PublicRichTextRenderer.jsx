import { cn } from '../../utils/cn';

export function PublicRichTextRenderer({ content, className }) {
  if (!content) return null;

  return (
    <div
      className={cn(
        `
        prose max-w-none
        text-gray-700
        leading-relaxed
        
        /* Paragraph spacing */
        [&_p]:my-5
        
        /* ========================= */
        /* ===== HEADINGS STYLE ==== */
        /* ========================= */
        [&_h1]:text-3xl
        [&_h1]:font-bold
        [&_h1]:mt-10
        [&_h1]:mb-4
        
        [&_h2]:text-2xl
        [&_h2]:font-semibold
        [&_h2]:mt-8
        [&_h2]:mb-3
        
        [&_h3]:text-xl
        [&_h3]:font-semibold
        [&_h3]:mt-6
        [&_h3]:mb-2
        
        /* ========================= */
        /* ===== ORDERED LIST ====== */
        /* ========================= */
        [&_ol]:list-decimal
        [&_ol]:pl-7
        [&_ol]:my-5
        
        [&_ol>li]:pl-2
        [&_li]:my-2
        
        /* Premium marker */
        [&_ol>li::marker]:font-semibold
        [&_ol>li::marker]:text-emerald-600
        
        /* ========================= */
        /* ===== BULLET LIST ======= */
        /* ========================= */
        [&_ul]:list-disc
        [&_ul]:pl-7
        [&_ul]:my-5
        
        [&_ul>li::marker]:text-emerald-500
        
        /* Nested list spacing */
        [&_ol_ol]:pl-6
        [&_ul_ul]:pl-6
        
        /* ========================= */
        /* ===== BLOCKQUOTE ======== */
        /* ========================= */
        [&_blockquote]:border-l-4
        [&_blockquote]:border-emerald-500
        [&_blockquote]:pl-5
        [&_blockquote]:italic
        [&_blockquote]:text-gray-600
        [&_blockquote]:my-6
        
        /* ========================= */
        /* ===== LINKS STYLE ======= */
        /* ========================= */
        [&_a]:text-emerald-600
        [&_a]:font-medium
        [&_a]:underline
        [&_a]:underline-offset-4
        [&_a:hover]:text-emerald-700
        
        /* ========================= */
        /* ===== IMAGES ============ */
        /* ========================= */
        [&_img]:max-w-full
        [&_img]:h-auto
        [&_img]:rounded-2xl
        [&_img]:shadow-md
        [&_img]:my-6
        
        /* ========================= */
        /* ===== ALIGN SUPPORT ===== */
        /* ========================= */
        [&_.ql-align-center]:text-center
        [&_.ql-align-left]:text-left
        [&_.ql-align-right]:text-right
        [&_.ql-align-justify]:text-justify
        
        break-words
      `,
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
