import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, CornerDownRight, MessageSquare, Trash2, XCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { deletePojokSantriCommentApi, getPojokSantriComments, updatePojokSantriCommentStatusApi } from '../../lib/api';

const STATUS_META = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock3 },
  approved: { label: 'Disetujui', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Ditolak', badge: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle },
};

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'];

const ACTION_META = {
  approved: {
    label: 'Setujui',
    icon: CheckCircle2,
    className: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  rejected: {
    label: 'Tolak',
    icon: XCircle,
    className: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  },
  pending: {
    label: 'Pending',
    icon: Clock3,
    className: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
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

function CommentCard({ comment, onStatusChange, onDelete }) {
  const meta = STATUS_META[comment.status] || STATUS_META.pending;
  const isReply = Boolean(comment.parent_id);
  const actions = STATUS_OPTIONS.filter((item) => item !== comment.status);
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold ${meta.badge}`}>
              <StatusIcon size={14} /> {meta.label}
            </span>
            {isReply && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                <CornerDownRight size={14} /> Balasan
              </span>
            )}
            <span>{formatDateTime(comment.created_at)}</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{comment.commenter_name}</p>
              <span className="text-xs text-slate-400">•</span>
              <p className="text-xs text-slate-500 break-all">{comment.commenter_email || 'Tanpa email'}</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {comment.article_title || `Artikel #${comment.article_id}`}
            </p>
          </div>

          {isReply && (
            <p className="text-sm text-slate-600">
              Membalas <span className="font-semibold text-slate-800">{comment.parent_commenter_name || `#${comment.parent_id}`}</span>
            </p>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm leading-6 whitespace-pre-line text-slate-700">{comment.comment}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:w-52 lg:justify-end">
          {actions.map((actionKey) => {
            const action = ACTION_META[actionKey];
            const Icon = action.icon;

            return (
              <button
                key={actionKey}
                onClick={() => onStatusChange(comment.id, actionKey)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${action.className}`}
              >
                <Icon size={16} /> {action.label}
              </button>
            );
          })}
          <button
            onClick={() => onDelete(comment.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Trash2 size={16} /> Hapus
          </button>
        </div>
      </div>
    </div>
  );
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
          <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-emerald-600" />
            Komentar
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Moderasi komentar dan balasan dari halaman detail Pojok Santri.
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-3 lg:w-auto">
          {STATUS_OPTIONS.map((item) => {
            const meta = STATUS_META[item];
            const Icon = meta.icon;
            const isActive = status === item;

            return (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  {meta.label}
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">{summary[item] ?? 0}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
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

        {!loading && comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onStatusChange={handleStatusChange}
            onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
          />
        ))}
      </div>

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
