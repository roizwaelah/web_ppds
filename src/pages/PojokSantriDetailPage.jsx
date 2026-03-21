import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock3, Link2, Check, MessageCircle, Download, Send, MessagesSquare, CornerDownRight, X } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';
import { stripHTML } from '../utils/text';
import { createArticleSeo } from '../utils/seo';
import { createPojokSantriComment, getPojokSantriComments } from '../lib/api';

const FALLBACK_IMAGE = 'https://placehold.co/1200x675?text=Pojok+Santri';

function toSafeImage(url) {
  if (!url) return FALLBACK_IMAGE;
  const normalized = String(url).trim();
  if (!normalized) return FALLBACK_IMAGE;

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return normalized;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  if (!normalized.includes('/')) return `/uploads/${normalized}`;
  if (normalized.startsWith('/')) return normalized;

  return FALLBACK_IMAGE;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function estimateReadTime(content = '') {
  const words = stripHTML(content).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

function countAllComments(items = []) {
  return items.reduce((total, item) => total + 1 + countAllComments(item.replies || []), 0);
}

function findCommentById(items = [], targetId) {
  for (const item of items) {
    if (String(item.id) === String(targetId)) return item;
    const nested = findCommentById(item.replies || [], targetId);
    if (nested) return nested;
  }
  return null;
}

function CommentCard({ item, level = 0, onReply }) {
  return (
    <article className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${level > 0 ? 'ml-0 md:ml-8 mt-4' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">{item.commenter_name}</p>
          <p className="text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          {level > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              <CornerDownRight size={12} /> Balasan
            </span>
          )}
          <button
            type="button"
            onClick={() => onReply(item)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 hover:bg-emerald-100"
          >
            <MessageCircle size={12} /> Balas
          </button>
        </div>
      </div>
      {item.parent_commenter_name && (
        <p className="mt-3 text-xs font-semibold text-slate-500">Membalas {item.parent_commenter_name}</p>
      )}
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{item.comment}</p>

      {Array.isArray(item.replies) && item.replies.length > 0 && (
        <div className="mt-4 border-l border-slate-200 pl-0 md:pl-2">
          {item.replies.map((reply) => (
            <CommentCard key={reply.id} item={reply} level={level + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </article>
  );
}

export function PojokSantriDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { pojokSantri } = useData();
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', comment: '' });

  const publishedList = useMemo(() => {
    const list = Array.isArray(pojokSantri) ? pojokSantri : [];
    return list.filter((item) => (item.status || 'published') === 'published');
  }, [pojokSantri]);

  const article = useMemo(
    () => publishedList.find((item) => String(item.id) === String(id)),
    [publishedList, id]
  );

  const related = useMemo(
    () => publishedList.filter((item) => String(item.id) !== String(id)).slice(0, 6),
    [publishedList, id]
  );

  const totalComments = useMemo(() => countAllComments(comments), [comments]);
  const replyTarget = useMemo(() => findCommentById(comments, replyTargetId), [comments, replyTargetId]);

  useEffect(() => {
    let active = true;

    const loadComments = async () => {
      if (!id) return;
      try {
        setCommentsLoading(true);
        setCommentError('');
        const response = await getPojokSantriComments({ articleId: id, status: 'approved', limit: 100 });
        if (!active) return;
        setComments(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        if (!active) return;
        setCommentError(error.message || 'Gagal memuat komentar');
      } finally {
        if (active) setCommentsLoading(false);
      }
    };

    loadComments();
    return () => {
      active = false;
    };
  }, [id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Baca artikel ${article?.title || ''} di ${shareUrl}`)}`;

  const handleDownloadPdf = () => {
    if (typeof window === 'undefined') return;

    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
    if (!printWindow) return;

    const printableContent = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${article?.title || 'Artikel Pojok Santri'}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; line-height: 1.7; }
      img { max-width: 100%; height: auto; border-radius: 12px; margin-bottom: 24px; }
      h1 { font-size: 32px; margin-bottom: 8px; }
      .meta { color: #475569; font-size: 14px; margin-bottom: 24px; }
      .content { font-size: 16px; }
      .content a { color: #047857; }
    </style>
  </head>
  <body>
    <h1>${article?.title || ''}</h1>
    <div class="meta">${article?.author || 'Tim Redaksi'} • ${formatDate(article?.date || article?.created_at)}</div>
    ${article?.image ? `<img src="${toSafeImage(article.image)}" alt="${article.title || ''}" />` : ''}
    <div class="content">${article?.content || ''}</div>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.focus();

    const triggerPrint = () => {
      printWindow.print();
      printWindow.close();
    };

    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      printWindow.onload = triggerPrint;
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setCommentSuccess('');
    setCommentError('');

    try {
      setSubmittingComment(true);
      await createPojokSantriComment({
        articleId: Number(id),
        parentId: replyTargetId ? Number(replyTargetId) : null,
        name: commentForm.name,
        email: commentForm.email,
        comment: commentForm.comment,
      });
      setCommentForm({ name: '', email: '', comment: '' });
      setReplyTargetId(null);
      setCommentSuccess(replyTargetId
        ? 'Balasan berhasil dikirim dan akan tampil setelah disetujui admin.'
        : 'Komentar berhasil dikirim dan akan tampil setelah disetujui admin.');
    } catch (error) {
      setCommentError(error.message || 'Gagal mengirim komentar');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!pojokSantri) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel tidak ditemukan</h1>
          <Link to="/pojok-santri" className="text-emerald-700 hover:text-emerald-800 font-medium">
            Kembali ke Pojok Santri
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const seo = createArticleSeo(article, location.pathname);

  return (
    <PublicLayout seo={seo}>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Link to="/pojok-santri" className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-semibold">
            <ArrowLeft size={16} /> Kembali ke Pojok Santri
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Pojok Santri</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-black text-slate-900 leading-tight max-w-5xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1"><User size={14} /> {article.author || 'Tim Redaksi'}</span>
            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {formatDate(article.date || article.created_at)}</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {estimateReadTime(article.content)}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <article>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
              <img
                src={toSafeImage(article.image)}
                alt={article.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-56 sm:h-72 md:h-[420px] object-cover"
              />
              <div className="p-5 md:p-8">
                <div className="max-w-none prose prose-slate prose-lg prose-headings:font-black prose-a:text-emerald-700 hover:prose-a:text-emerald-800 prose-img:rounded-lg">
                  <PublicRichTextRenderer content={article.content} />
                </div>
              </div>
            </div>
          </article>

          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Diskusi</p>
                <h2 className="mt-1 text-xl font-black text-slate-900 flex items-center gap-2">
                  <MessagesSquare className="text-emerald-600" size={20} />
                  Komentar ({totalComments})
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-sm">Komentar dan balasan baru akan tampil setelah melalui moderasi admin untuk menjaga diskusi tetap sehat.</p>
            </div>

            <div className="p-5 md:p-6 space-y-6">
              <form onSubmit={handleCommentSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{replyTarget ? 'Balas komentar' : 'Tulis komentar'}</p>
                    <p className="text-xs text-slate-500">{replyTarget ? `Balasan akan diarahkan ke ${replyTarget.commenter_name}.` : 'Isi form di bawah untuk ikut berdiskusi.'}</p>
                  </div>
                  {replyTarget && (
                    <button
                      type="button"
                      onClick={() => setReplyTargetId(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
                    >
                      <X size={14} /> Batal balas
                    </button>
                  )}
                </div>

                {replyTarget && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <p className="font-semibold">Membalas komentar {replyTarget.commenter_name}</p>
                    <p className="mt-1 line-clamp-2 text-emerald-700">{replyTarget.comment}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama *</label>
                    <input
                      type="text"
                      value={commentForm.name}
                      onChange={(e) => setCommentForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Nama Anda"
                      maxLength={120}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={commentForm.email}
                      onChange={(e) => setCommentForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      placeholder="email@contoh.com"
                      maxLength={190}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{replyTarget ? 'Balasan *' : 'Komentar *'}</label>
                  <textarea
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm((prev) => ({ ...prev, comment: e.target.value }))}
                    className="w-full min-h-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder={replyTarget ? 'Tulis balasan Anda untuk komentar ini' : 'Tulis tanggapan atau pertanyaan Anda terkait artikel ini'}
                    maxLength={1500}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500 text-right">{commentForm.comment.length}/1500</p>
                </div>

                {commentSuccess && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{commentSuccess}</div>}
                {commentError && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{commentError}</div>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Send size={16} /> {submittingComment ? 'Mengirim...' : (replyTarget ? 'Kirim Balasan' : 'Kirim Komentar')}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {commentsLoading && <div className="text-sm text-slate-500">Memuat komentar...</div>}
                {!commentsLoading && comments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
                    Belum ada komentar yang ditampilkan. Jadilah yang pertama berdiskusi.
                  </div>
                )}

                {!commentsLoading && comments.map((item) => (
                  <CommentCard key={item.id} item={item} onReply={(comment) => setReplyTargetId(comment.id)} />
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-5">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-emerald-700 text-white">
                <h3 className="text-sm font-bold uppercase tracking-wider flex justify-center">Bagikan</h3>
              </div>
              <div className="p-4 flex items-center justify-center gap-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Bagikan ke WhatsApp"
                  title="Bagikan ke WhatsApp"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#25D366] text-white hover:bg-[#1fb85a] transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
                <button
                  onClick={handleDownloadPdf}
                  aria-label="Download PDF"
                  title="Download PDF"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={copyLink}
                  aria-label={copied ? 'Link disalin' : 'Salin link artikel'}
                  title={copied ? 'Link disalin' : 'Salin link artikel'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Artikel Terkait</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {related.map((item) => (
                  <Link key={item.id} to={`/pojok-santri/${item.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                      {item.category || 'Artikel'}
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.date || item.created_at)}</p>
                  </Link>
                ))}
                {related.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">Belum ada artikel terkait.</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
