import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Image as ImageIcon, Loader2, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react';
import { deleteMediaApi, getMediaLibrary, uploadMediaApi } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmDialog } from './Dialog';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const MAX_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function validateFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, atau SVG.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file maksimal 5MB');
  }
}

function Portal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export function MediaLibraryModal({ isOpen, onClose, onSelect, selectedUrl = '' }) {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);
  const canDelete = (user?.level || 0) >= 5;

  const loadMedia = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);

    try {
      const data = await getMediaLibrary();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast(error.message || 'Gagal memuat media', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => (
      item.name.toLowerCase().includes(keyword)
      || item.extension.toLowerCase().includes(keyword)
    ));
  }, [items, search]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || uploading) return;

    try {
      validateFile(file);
      setUploading(true);
      const data = await uploadMediaApi(file);
      showToast('Media berhasil diupload', 'success');
      await loadMedia({ silent: true });
      if (data?.url) {
        onSelect?.(data.url);
      }
      onClose?.();
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMediaApi(deleteTarget.name);
      setItems((prev) => prev.filter((item) => item.name !== deleteTarget.name));
      if (selectedUrl === deleteTarget.url) {
        onSelect?.('');
      }
      showToast('Media berhasil dihapus', 'success');
    } catch (error) {
      showToast(error.message || 'Gagal menghapus media', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-90 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-slate-900">Media Library</h3>
              <p className="text-xs text-slate-500">Pilih gambar untuk field aktif atau upload media baru.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama file..."
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => loadMedia()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition-all"
              >
                <RefreshCw size={14} /> Refresh
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-70"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Uploading...' : 'Upload Gambar'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5 bg-slate-50/70">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-sm font-medium">Memuat media...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-7 h-7 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Media belum ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1">Upload gambar baru atau ubah kata kunci pencarian.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
                {filteredItems.map((item) => {
                  const isSelected = item.url === selectedUrl;

                  return (
                    <div
                      key={item.name}
                      className={`rounded-3xl overflow-hidden border bg-white shadow-sm transition-all ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-200'}`}
                    >
                      <div className="relative aspect-4/3 bg-slate-100 group overflow-hidden">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-x-0 top-0 flex justify-between items-start p-3">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                              <Check size={12} /> Terpilih
                            </span>
                          ) : <span />}

                          <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.url)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg hover:text-emerald-600 transition"
                              title="Copy URL"
                              aria-label={`Copy URL ${item.name}`}
                            >
                              <Copy size={15} />
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-lg hover:text-red-600 transition"
                                title="Hapus gambar"
                                aria-label={`Hapus ${item.name}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate" title={item.name}>{item.name}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{formatBytes(item.size)} • {item.extension.toUpperCase()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onSelect?.(item.url);
                            onClose?.();
                          }}
                          className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[11px] font-bold transition-all ${isSelected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                          <ImageIcon size={14} />
                          {isSelected ? 'Sedang Dipakai' : 'Pakai Gambar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus media ini?"
        message={deleteTarget ? `File ${deleteTarget.name} akan dihapus dari folder uploads.` : ''}
        type="danger"
      />
    </Portal>
  );
}
