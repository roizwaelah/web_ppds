import { useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Calendar, Check, Download, Link2, MessageCircle } from 'lucide-react';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';
import { createAnnouncementSeo } from '../utils/seo';

const stripHtml = (html = '') =>
  html
    .replace(/<(br|\/p|\/li|\/ol|\/ul|\/h[1-6])>/gi, '\n')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

const normalizePdfText = (value = '') =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, '');

const escapePdfText = (value = '') =>
  value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const wrapPdfText = (text, maxChars = 86) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxChars) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) lines.push(currentLine);

    if (word.length <= maxChars) {
      currentLine = word;
      return;
    }

    const chunks = word.match(new RegExp(`.{1,${maxChars}}`, 'g')) || [word];
    lines.push(...chunks.slice(0, -1));
    currentLine = chunks[chunks.length - 1];
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

const buildPdfBlob = ({ title, date, content }) => {
  const pageHeight = 841.89;
  const marginX = 56;
  const topY = 780;
  const bottomY = 60;
  const titleLineHeight = 24;
  const bodyLineHeight = 16;
  const paragraphGap = 8;

  const titleLines = wrapPdfText(normalizePdfText(title), 52);
  const bodyParagraphs = normalizePdfText(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) => [...wrapPdfText(paragraph), '']);

  const pages = [];
  let pageLines = [];
  let y = topY;

  const pushPage = () => {
    pages.push(pageLines);
    pageLines = [];
    y = topY;
  };

  const addLine = (textValue, fontSize = 12, lineHeight = bodyLineHeight) => {
    if (y - lineHeight < bottomY) pushPage();
    pageLines.push({ text: textValue, x: marginX, y, fontSize });
    y -= lineHeight;
  };

  titleLines.forEach((line) => addLine(line, 18, titleLineHeight));
  addLine(`Tanggal: ${normalizePdfText(date)}`, 11, 22);
  y -= 6;

  bodyParagraphs.forEach((line) => {
    if (!line) {
      y -= paragraphGap;
      return;
    }
    addLine(line, 12, bodyLineHeight);
  });

  if (pageLines.length) pushPage();

  const objects = [];
  const addObject = (contentValue) => {
    objects.push(contentValue);
    return objects.length;
  };

  const catalogId = addObject('');
  const pagesId = addObject('');
  const pageIds = [];
  const contentIds = [];

  pages.forEach((page) => {
    const streamLines = ['BT'];
    let currentFontSize = null;

    page.forEach((line) => {
      if (currentFontSize !== line.fontSize) {
        streamLines.push(`/F1 ${line.fontSize} Tf`);
        currentFontSize = line.fontSize;
      }
      streamLines.push(`1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj`);
    });

    streamLines.push('ET');
    const stream = streamLines.join('\n');
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject('');
    contentIds.push(contentId);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  pageIds.forEach((pageId, index) => {
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentIds[index]} 0 R >>`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

export function PengumumanDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { pengumuman } = useData();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!pengumuman) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  const item = pengumuman.find((a) => String(a.id) === String(id));

  if (!item) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengumuman tidak ditemukan</h1>
          <Link to="/pengumuman" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Kembali ke Pengumuman
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const seo = createAnnouncementSeo(item, location.pathname);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://ppds.local${location.pathname}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Pengumuman PPDS: ${item.title}\n${pageUrl}`)}`;
  const formattedDate = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const pdfContent = useMemo(() => stripHtml(item.content), [item.content]);

  const copyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    setIsDownloading(true);
    try {
      const blob = buildPdfBlob({
        title: item.title,
        date: formattedDate,
        content: pdfContent,
      });
      const fileName = `${item.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '') || 'pengumuman'}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PublicLayout seo={seo}>
      <div className="bg-emerald-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/pengumuman" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Kembali ke Pengumuman
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.important && (
                  <span className="text-xs font-semibold text-red-300 bg-red-500/30 px-2.5 py-0.5 rounded-full">Penting</span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{item.title}</h1>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <Calendar size={14} />
                {formattedDate}
              </div>
            </div>

            <aside className="lg:col-span-4 w-full">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 sm:p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-100 mb-4">Bagikan</h3>
                <div className="space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1fba57] transition-colors"
                  >
                    <MessageCircle size={16} />
                    Bagikan ke WhatsApp
                  </a>
                  <button
                    onClick={downloadPdf}
                    disabled={isDownloading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-emerald-200/30 bg-white/90 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download size={16} />
                    {isDownloading ? 'Menyiapkan PDF...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={copyLink}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                    {copied ? 'Link disalin' : 'Salin link pengumuman'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <PublicRichTextRenderer content={item.content} className="prose-lg max-w-none" />
        </div>
      </div>
    </PublicLayout>
  );
}
