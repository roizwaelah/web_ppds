import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CornerDownRight,
  MessageSquare,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { deletePojokSantriCommentApi, getPojokSantriComments, updatePojokSantriCommentStatusApi } from '../../lib/api';

const STATUS_META = {
  pending: {
    label: 'Menunggu',
    shortLabel: 'Pending',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: Clock3,
  },
  approved: {
    label: 'Disetujui',
    shortLabel: 'Disetujui',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Ditolak',
    shortLabel: 'Ditolak',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    icon: XCircle,
  },
};

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const ACTION_META = {
  approved: {
    label: 'Setujui',
    icon: CheckCircle2,
    className: 'text-emerald-700 hover:text-emerald-800',
  },
  rejected: {
    label: 'Tolak',
    icon: XCircle,
    className: 'text-rose-700 hover:text-rose-800',
  },
  pending: {
    label: 'Tandai Pending',
    icon: Clock3,
    className: 'text-amber-700 hover:text-amber-800',
  },
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

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${meta.badge}`}>
      <Icon size={13} />
      {meta.shortLabel}
    </span>
  );
}

function CommentRow({ comment, onStatusChange, onDelete }) {
  const meta = STATUS_META[comment.status] || STATUS_META.pending;
  const isReply = Boolean(comment.parent_id);
  const actions = STATUS_OPTIONS.filter((item) => item !== comment.status);

  return (
    <article className="border-b border-slate-200 bg-white transition hover:bg-slate-50/70 last:border-b-0">
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,2.6fr)_minmax(220px,1fr)] lg:px-5">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={comment.status} />
            {isReply && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                <CornerDownRight size={12} />
                Balasan
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <UserRound size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{comment.commenter_name}</p>
                <p className="break-all text-xs text-slate-500">{comment.commenter_email || 'Tanpa email'}</p>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {comment.article_title || `Artikel #${comment.article_id}`}
            </p>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
            <p className="text-sm leading-6 whitespace-pre-line text-slate-700">{comment.comment}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
            {actions.map((actionKey, index) => {
              const action = ACTION_META[actionKey];
              const Icon = action.icon;

              return (
                <div key={actionKey} className="flex items-center gap-3">
                  <button
                    onClick={() => onStatusChange(comment.id, actionKey)}
                    className={`inline-flex items-center gap-1.5 transition ${action.className}`}
                  >
                    <Icon size={14} />
                    {action.label}
                  </button>
                  {index < actions.length - 1 && <span className="text-slate-300">|</span>}
                </div>
              );
            })}
            {actions.length > 0 && <span className="text-slate-300">|</span>}
            <button
              onClick={() => onDelete(comment.id)}
              className="inline-flex items-center gap-1.5 text-rose-700 transition hover:text-rose-800"
            >
              <Trash2 size={14} />
              Hapus
            </button>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tanggal</p>
            <p className="mt-1 font-semibold text-slate-800">{formatDateTime(comment.created_at)}</p>
          </div>

          {isReply && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Membalas</p>
              <p className="mt-1 font-semibold text-slate-800">
                {comment.parent_commenter_name || `Komentar #${comment.parent_id}`}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Ringkasan Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Komentar ini saat ini berstatus {meta.label.toLowerCase()}.</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminKomentar() {
  const { showToast } = useNotification();
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const currentStatusMeta = STATUS_META[status] || STATUS_META.pending;
  const totalComments = useMemo(
    () => STATUS_OPTIONS.reduce((total, item) => total + (summary[item] ?? 0), 0),
    [summary],
  );

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
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-white px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900">
                <MessageSquare className="text-emerald-600" />
                Komentar
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Moderasi komentar dan balasan dari halaman detail Pojok Santri dengan pola navigasi ala WordPress.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Total</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{totalComments}</p>
              </div>
              {STATUS_OPTIONS.map((item) => {
                const meta = STATUS_META[item];
                return (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{meta.label}</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{summary[item] ?? 0}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-500">
              {STATUS_OPTIONS.map((item, index) => {
                const meta = STATUS_META[item];
                const isActive = status === item;

                return (
                  <div key={item} className="flex items-center gap-3">
                    <button
                      onClick={() => setStatus(item)}
                      className={`transition ${isActive ? 'text-emerald-700' : 'hover:text-slate-700'}`}
                    >
                      {meta.label} <span className="text-slate-400">({summary[item] ?? 0})</span>
                    </button>
                    {index < STATUS_OPTIONS.length - 1 && <span className="text-slate-300">|</span>}
                  </div>
                );
              })}
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Menampilkan: {currentStatusMeta.label}
            </div>
          </div>
        </div>

        <div className="hidden border-b border-slate-200 bg-slate-50/80 px-5 py-3 lg:grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,2.6fr)_minmax(220px,1fr)] lg:gap-4 lg:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Penulis</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Komentar</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Detail</p>
        </div>

        <div>
          {loading && (
            <div className="px-5 py-12 text-center text-sm font-medium text-slate-500 lg:px-6">
              Memuat komentar...
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="px-5 py-12 text-center lg:px-6">
              <div className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
                <p className="text-sm font-semibold text-slate-700">Belum ada komentar pada status {currentStatusMeta.label.toLowerCase()}.</p>
                <p className="mt-2 text-sm text-slate-500">Coba pindah tab moderasi lain untuk melihat antrean komentar yang berbeda.</p>
              </div>
            </div>
          )}

          {!loading && comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onStatusChange={handleStatusChange}
              onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
            />
          ))}
        </div>
      </section>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Hapus komentar"
        message="Komentar atau balasan yang dihapus tidak bisa dikembalikan. Lanjutkan?"
        confirmText="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
}
