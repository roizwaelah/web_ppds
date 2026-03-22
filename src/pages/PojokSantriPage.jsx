import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, Search, UserRound } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { createPojokSantri } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';
import { stripHTML } from '../utils/text';
import { RichTextEditor } from '../components/ui/RichTextEditor';

const FALLBACK_IMAGE = '/images/placeholder.svg';

function toSafeImage(url) {
  if (!url) return FALLBACK_IMAGE;
  const normalized = String(url).trim();
  if (!normalized) return FALLBACK_IMAGE;

  if (/^https?:\/\//i.test(normalized)) return FALLBACK_IMAGE;
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

function estimateReadTime(content = '') {
  const words = stripHTML(content).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

export function PojokSantriPage() {
  const { pojokSantri, refreshPojokSantri } = useData();
  const { showToast } = useNotification();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    authorRole: '',
    category: 'Cerita',
  });

  useEffect(() => {
    refreshPojokSantri('published').catch(() => {
      showToast('Gagal memuat artikel terbaru.', 'error');
    });
  }, [refreshPojokSantri, showToast]);

  const publishedArticles = useMemo(() => {
    const list = Array.isArray(pojokSantri)
      ? pojokSantri.filter((item) => (item.status || 'published') === 'published')
      : [];

    return [...list].sort((a, b) => {
      const aTime = new Date(a.date || a.created_at || 0).getTime();
      const bTime = new Date(b.date || b.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [pojokSantri]);

  const featured = publishedArticles[0] || null;
  const popularItems = publishedArticles.slice(0, 5);
  const nonHeadlineItems = publishedArticles.slice(1);
  const formCategoryOptions = useMemo(() => {
    const base = ['Cerita', 'Prestasi', 'Kegiatan', 'Opini', 'Tips'];
    const dynamic = publishedArticles
      .map((item) => (item.category || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...base, ...dynamic]));
  }, [publishedArticles]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return nonHeadlineItems.filter((item) => {
      if (!q) return true;

      const haystack = [
        item.title,
        item.author,
        item.category,
        stripHTML(item.content || ''),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [nonHeadlineItems, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const plainContent = stripHTML(form.content || '').trim();

    if (!form.title.trim() || !plainContent || !form.author.trim()) {
      showToast('Judul, Isi, dan Nama Penulis wajib diisi', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await createPojokSantri({
        ...form,
        image: '',
        category: form.category || 'Cerita',
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
      });

      showToast('Artikel berhasil dikirim, menunggu review admin.', 'success');
      setForm({ title: '', content: '', author: '', authorRole: '', category: 'Cerita' });
      setShowForm(false);
    } catch {
      showToast('Gagal mengirim artikel. Silakan coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pojokSantri) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="border-b border-slate-200 bg-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300">Kanal Artikel</p>
              <h1 className="mt-2 text-3xl md:text-4xl font-black  text-white">Pojok Santri</h1>
              <p className="mt-2 text-emerald-300 max-w-2xl">Warta seputar dunia pesantren, pendidikan dan kebudayaan.</p>
            </div>

            <div className="w-full md:w-[360px] space-y-3 md:ml-auto">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-yellow-300 text-slate-900 text-sm font-bold hover:bg-yellow-500 transition-colors w-fit"
                >
                  Kirim Artikel
                </button>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul, isi, penulis..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {showForm && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kirim Artikel Pojok Santri</h2>
            <p className="text-sm text-gray-500 mb-6">Artikel baru akan masuk sebagai <span className="font-semibold text-emerald-700">draf</span> untuk direview admin.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                  placeholder="Tulis judul artikel"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penulis *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas/Jabatan (opsional)</label>
                  <input
                    type="text"
                    value={form.authorRole}
                    onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm"
                    placeholder="Misal: Kelas XI MA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm bg-white"
                  >
                    {formCategoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Isi Artikel *</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(value) => setForm({ ...form, content: value })}
                  placeholder="Tulis artikel, berita, opini, cerita atau pengalaman Anda di sini..."
                  className="rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Artikel'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8">
            {featured ? (
              <>
                <Link to={`/pojok-santri/${featured.id}`} className="group block border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <img
                    src={toSafeImage(featured.image)}
                    alt={featured.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="p-5 md:p-6">
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-700">Headline</p>
                    <h2 className="mt-2 text-2xl md:text-[2rem] leading-tight font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-slate-600 line-clamp-2">
                      {stripHTML(featured.content || '').substring(0, 170)}...
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><UserRound size={13} /> {featured.author || 'Tim Redaksi'}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDate(featured.date || featured.created_at)}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 size={13} /> {estimateReadTime(featured.content)}</span>
                    </div>
                  </div>
                </Link>

                <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-white p-4 md:p-5">
                  <div className="text-xs text-slate-500">
                    Menampilkan {filteredItems.length} artikel
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pagedItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/pojok-santri/${item.id}`}
                        className="group block border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img
                          src={toSafeImage(item.image)}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3.5">
                          <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                            {item.category || 'Artikel'}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                            {stripHTML(item.content || '').substring(0, 100)}...
                          </p>
                          <p className="mt-2 text-xs text-slate-500">{formatDate(item.date || item.created_at)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {pagedItems.length === 0 && (
                    <div className="mt-4 rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                      Tidak ada artikel yang cocok dengan pencarian/filter.
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 text-sm rounded-md border ${
                            page === currentPage
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm rounded-md border border-slate-300 text-slate-700 disabled:opacity-50"
                      >
                        Berikutnya
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                Belum ada artikel yang dipublikasikan.
              </div>
            )}
          </main>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-emerald-700 text-white">
                <h3 className="text-sm font-bold uppercase tracking-wider">Terpopuler</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {popularItems.map((item, idx) => (
                  <Link key={item.id} to={`/pojok-santri/${item.id}`} className="flex gap-3 p-4 hover:bg-slate-50 transition-colors">
                    <span className="text-2xl leading-none font-black text-emerald-700 w-7 text-center">{idx + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(item.date || item.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
