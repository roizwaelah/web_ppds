import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CornerDownRight,
  MessageSquare,
  Send,
  Trash2,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmDialog, Modal } from '../../components/ui/Dialog';
import {
  createPojokSantriComment,
  deletePojokSantriCommentApi,
  getPojokSantriComments,
  updatePojokSantriCommentStatusApi,
} from '../../lib/api';

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

const STATUS_OPTIONS = ['all', 'pending', 'approved', 'rejected'];
const INITIAL_REPLY_FORM = { name: '', email: '', comment: '' };

const ACTION_META = {
  reply: {
    label: 'Balas',
    icon: MessageSquare,
    className: 'text-sky-700 hover:text-sky-800',
  },
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

function CommentRow({ comment, onReply, onStatusChange, onDelete }) {
  const isReply = Boolean(comment.parent_id);
  const actions = STATUS_OPTIONS.filter((item) => item !== 'all' && item !== comment.status);

  return (
    <article className="border-b border-slate-200 bg-white transition hover:bg-slate-50/70 last:border-b-0">
      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,2.6fr)_minmax(220px,1fr)] lg:px-5">
        <div className="min-w-0 space-y-3">

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
            <button
              onClick={() => onReply(comment)}
              className={`inline-flex items-center gap-1.5 transition ${ACTION_META.reply.className}`}
            >
              <MessageSquare size={14} />
              {ACTION_META.reply.label}
            </button>
            <span className="text-slate-300">|</span>
            {actions.map((actionKey) => {
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
                  <span className="text-slate-300">|</span>
                </div>
              );
            })}
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
          <p className="mt-1 font-semibold text-slate-800">{formatDateTime(comment.created_at)}</p>

          {isReply && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Membalas</p>
              <p className="mt-1 font-semibold text-slate-800">
                {comment.parent_commenter_name || `Komentar #${comment.parent_id}`}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={comment.status} />
            {isReply && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                <CornerDownRight size={12} />
                Balasan
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function AdminKomentar() {
  const { showToast } = useNotification();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyForm, setReplyForm] = useState(INITIAL_REPLY_FORM);
  const [submittingReply, setSubmittingReply] = useState(false);

  const currentStatusMeta = status === 'all' ? { label: 'Semua' } : (STATUS_META[status] || STATUS_META.pending);
  const totalComments = useMemo(
    () => STATUS_OPTIONS.reduce((total, item) => total + (summary[item] ?? 0), 0),
    [summary],
  );

  const closeReplyModal = useCallback(() => {
    setReplyTarget(null);
    setReplyForm({
      ...INITIAL_REPLY_FORM,
      name: user?.name || '',
    });
  }, [user?.name]);

  const loadComments = useCallback(async (selectedStatus = status) => {
    try {
      setLoading(true);
      const response = await getPojokSantriComments({ status: selectedStatus === 'all' ? undefined : selectedStatus, limit: 100 });
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

  useEffect(() => {
    setReplyForm((prev) => (prev.name ? prev : { ...prev, name: user?.name || '' }));
  }, [user?.name]);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await updatePojokSantriCommentStatusApi(id, { status: nextStatus });
      showToast('Status komentar berhasil diperbarui', 'success');
      await loadComments(status);
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui status komentar', 'error');
    }
  };

  const handleReply = (comment) => {
    setReplyTarget(comment);
    setReplyForm({
      name: user?.name || '',
      email: '',
      comment: '',
    });
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!replyTarget) return;

    try {
      setSubmittingReply(true);
      const response = await createPojokSantriComment({
        articleId: Number(replyTarget.article_id),
        parentId: Number(replyTarget.id),
        name: replyForm.name.trim(),
        email: replyForm.email.trim(),
        comment: replyForm.comment.trim(),
      });

      if (response?.id) {
        await updatePojokSantriCommentStatusApi(response.id, { status: 'approved' });
      }

      showToast(`Balasan untuk ${replyTarget.commenter_name} berhasil dikirim`, 'success');
      closeReplyModal();
      await loadComments(status);
    } catch (error) {
      showToast(error.message || 'Gagal mengirim balasan', 'error');
    } finally {
      setSubmittingReply(false);
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
          <div>
            <h1 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900">
              <MessageSquare className="text-emerald-600" />
              Komentar
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Moderasi komentar dan balasan dari halaman detail Pojok Santri.
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-slate-500">
              {STATUS_OPTIONS.map((item, index) => {
                const meta = item === 'all' ? { label: 'All' } : STATUS_META[item];
                const isActive = status === item;

                return (
                  <div key={item} className="flex items-center gap-3">
                    <button
                      onClick={() => setStatus(item)}
                      className={`transition ${isActive ? 'text-emerald-700' : 'hover:text-slate-700'}`}
                    >
                      {meta.label} <span className="text-slate-400">({item === 'all' ? totalComments : (summary[item] ?? 0)})</span>
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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-800">Penulis</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-800">Komentar</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-800">Detail</p>
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
              onReply={handleReply}
              onStatusChange={handleStatusChange}
              onDelete={(id) => setDeleteConfirm({ isOpen: true, id })}
            />
          ))}
        </div>
      </section>

      <Modal
        isOpen={Boolean(replyTarget)}
        onClose={closeReplyModal}
        title={replyTarget ? `Balas komentar ${replyTarget.commenter_name}` : 'Balas komentar'}
      >
        {replyTarget && (
          <form onSubmit={handleReplySubmit} className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Komentar asal</p>
              <p className="mt-2 font-semibold">{replyTarget.commenter_name}</p>
              <p className="mt-1 whitespace-pre-line text-emerald-700">{replyTarget.comment}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama *</label>
                <input
                  type="text"
                  value={replyForm.name}
                  onChange={(event) => setReplyForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Nama admin"
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={replyForm.email}
                  onChange={(event) => setReplyForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="email@contoh.com"
                  maxLength={190}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Balasan *</label>
              <textarea
                value={replyForm.comment}
                onChange={(event) => setReplyForm((prev) => ({ ...prev, comment: event.target.value }))}
                className="min-h-36 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Tulis balasan admin untuk komentar ini"
                maxLength={1500}
                required
              />
              <p className="mt-1 text-right text-xs text-slate-500">{replyForm.comment.length}/1500</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReplyModal}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                Batal
              </button>
              <button
                type="submit"
                disabled={submittingReply}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={16} />
                {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

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
