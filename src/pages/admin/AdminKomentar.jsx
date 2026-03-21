import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquare, Trash2, XCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { deletePojokSantriCommentApi, getPojokSantriComments, updatePojokSantriCommentStatusApi } from '../../lib/api';

const STATUS_META = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Disetujui', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Ditolak', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
};

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminKomentar() {
  const { showToast } = useNotification();
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const loadComments = useCallback(async (selectedStatus = status) => {
    try {
      setLoading(true);
      const response = await getPojokSantriComments({ status: selectedStatus, limit: 100 });
      setComments(Array.isArray(response?.data) ? response.data : []);
      setSummary(response?.summary || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      showToast(error.message || 'Gagal memuat komentar', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, status]);

  useEffect(() => {
    loadComments(status);
  }, [loadComments, status]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updatePojokSantriCommentStatusApi(id, { status: nextStatus });
      showToast('Status komentar berhasil diperbarui', 'success');
      await loadComments(status);
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui status komentar', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePojokSantriCommentApi(deleteConfirm.id);
      showToast('Komentar berhasil dihapus', 'success');
      await loadComments(status);
    } catch (error) {
      showToast(error.message || 'Gagal menghapus komentar', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-emerald-600" />
            Komentar
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
            Moderasi komentar dari halaman detail Pojok Santri.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          {[
            { key: 'pending', label: 'Pending', icon: Clock3 },
            { key: 'approved', label: 'Disetujui', icon: CheckCircle2 },
            { key: 'rejected', label: 'Ditolak', icon: XCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = status === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setStatus(item.key)}
                className={`rounded-2xl border px-2 text-left transition ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} /> {item.label}
                </div>
                <p className="mt-1 text-sm font-black text-center text-slate-900">{summary[item.key] ?? 0}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Memuat komentar...
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Belum ada komentar pada status ini.
          </div>
        )}

        {!loading && comments.map((comment) => {
          const meta = STATUS_META[comment.status] || STATUS_META.pending;

          return (
            <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-500">{formatDateTime(comment.created_at)}</span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900">{comment.commenter_name}</p>
                    <p className="text-xs text-slate-500 break-all">{comment.commenter_email || 'Tanpa email'}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-sm whitespace-pre-line leading-6 text-slate-700">{comment.comment}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-700">Artikel</p>
                    <p className="text-sm font-semibold text-slate-800">{comment.article_title || `Artikel #${comment.article_id}`}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:w-52 lg:justify-end">
                  {comment.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange(comment.id, 'approved')}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={16} /> Setujui
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange(comment.id, 'rejected')}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <XCircle size={16} /> Tolak
                    </button>
                  )}
                  {comment.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(comment.id, 'pending')}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      <Clock3 size={16} /> Pending
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: comment.id })}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus komentar"
        message="Komentar yang dihapus tidak bisa dikembalikan. Lanjutkan?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}