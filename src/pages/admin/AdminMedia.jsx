import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, FolderOpen, Image as ImageIcon, Loader2, RefreshCw, Search, Trash2, Upload } from 'lucide-react';
import { deleteMediaApi, getMediaLibrary, uploadMediaApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../../components/ui/Dialog';

const acceptedTypes = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID');
}

export function AdminMedia() {
  const { showToast } = useNotification();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const loadMedia = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const data = await getMediaLibrary();
      setMediaItems(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message || 'Gagal memuat media', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return mediaItems;

    return mediaItems.filter((item) => (
      item.name.toLowerCase().includes(keyword)
      || item.extension.toLowerCase().includes(keyword)
    ));
  }, [mediaItems, search]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || uploading) return;

    setUploading(true);
    try {
      await uploadMediaApi(file);
      showToast('Media berhasil diupload', 'success');
      await loadMedia({ silent: true });
    } catch (error) {
      showToast(error.message || 'Upload gagal', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (url) => {
    const absoluteUrl = `${window.location.origin}${url}`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(absoluteUrl);
      showToast('URL media berhasil disalin', 'success');
      return;
    }

    window.prompt('Salin URL media berikut:', absoluteUrl);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMediaApi(deleteTarget.name);
      setMediaItems((prev) => prev.filter((item) => item.name !== deleteTarget.name));
      showToast('Media berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.message || 'Gagal menghapus media', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-emerald-600" />
            </div>
            Media Uploads
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1">
            Kelola gambar yang tersimpan di folder uploads
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama file..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => loadMedia()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md disabled:opacity-70"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? 'Uploading...' : 'Upload Gambar'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Total File</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{mediaItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Hasil Filter</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{filteredItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Total Ukuran</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatBytes(mediaItems.reduce((sum, item) => sum + (item.size || 0), 0))}</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Memuat media...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <ImageIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Belum ada media yang cocok</h2>
          <p className="text-xs text-slate-500 mt-1">Upload gambar baru atau ubah kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.name} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-x-0 top-0 flex justify-end gap-2 p-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.url)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg transition hover:bg-white hover:text-emerald-600"
                    aria-label={`Copy URL ${item.name}`}
                    title="Copy URL"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-lg transition hover:bg-white hover:text-red-600"
                    aria-label={`Hapus ${item.name}`}
                    title="Hapus gambar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs font-bold text-slate-900 truncate" title={item.name}>{item.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">{formatBytes(item.size)} • {formatDate(item.modified_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Hapus media ini?"
        message={deleteTarget ? `File ${deleteTarget.name} akan dihapus dari folder uploads.` : ''}
        type="danger"
      />
    </div>
  );
}
