import { useState, useEffect } from 'react';
import { getRoles } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Plus, Pencil, Trash2, Save, Search, UserCircle, AlertTriangle, Key, AtSign, User } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, ConfirmDialog } from '../../components/ui/Dialog';

const emptyForm = { name: '', username: '', password: '', role_id: '' };

export function AdminUsers() {
  const { user: currentUser, users, addUser, updateUser, deleteUser } = useAuth();
  const { showToast } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, user: null });
  const [roles, setRoles] = useState([]);

  if ((currentUser?.level || 0) < 5) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-in fade-in zoom-in duration-300">
        <div className="text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-lg">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-slate-800 mb-1.5 tracking-tight">Akses Ditolak</h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">Anda tidak memiliki izin administrator untuk mengelola akun pengguna.</p>
        </div>
      </div>
    );
  }

  const availableRoles = roles.filter(
    r => r.level <= currentUser.level
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      username: u.username,
      password: '',
      role_id: roles.find(r => r.name === u.role)?.id || ''
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) {
      showToast('Nama dan Username wajib diisi', 'error');
      return;
    }

    if (!editingId && !form.password.trim()) {
      showToast('Password wajib diisi untuk user baru', 'error');
      return;
    }

    if (!form.role_id) {
      showToast('Role wajib dipilih', 'error');
      return;
    }

    try {
      const success = editingId
        ? await updateUser(editingId, form)
        : await addUser(form);

      if (success) {
        showToast(
          `User berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`,
          'success'
        );
        setShowForm(false);
      } else {
        showToast('Username sudah digunakan', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan sistem', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      showToast('User berhasil dihapus', 'success');
    } catch {
      showToast('Gagal menghapus user', 'error');
    }
    setDeleteConfirm({ isOpen: false, user: null });
  };

  const getRoleBadge = (level, roleName) => {
    const isSuper = level >= 10;
    const isAdmin = level >= 5;

    let color = 'bg-blue-50 text-blue-600 border-blue-100';
    let icon = <UserCircle size={10} />;

    if (isSuper) {
      color = 'bg-purple-50 text-purple-600 border-purple-100';
      icon = <Shield size={10} />;
    } else if (isAdmin) {
      color = 'bg-rose-50 text-rose-600 border-rose-100';
      icon = <Shield size={10} />;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${color}`}>
        {icon}
        {roleName}
      </span>
    );
  };

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data || []);
      } catch (err) {
        console.error('Gagal memuat roles', err);
      }
    };

    loadRoles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-6">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            Manajemen Akun
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1">
            Total: {users.length} User
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Tambah
          </button>
        </div>
      </div>

      {/* Table Section - Compact */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Profil</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Username</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Otoritas</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-emerald-50/30 transition-all">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner ${
                        u.level >= 10
                          ? 'bg-linear-to-br from-purple-400 to-purple-600'
                          : u.level >= 5
                          ? 'bg-linear-to-br from-rose-400 to-rose-600'
                          : 'bg-linear-to-br from-blue-400 to-blue-600'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                        {u.id === currentUser?.id && (
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Aktif</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                      <AtSign size={10} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{getRoleBadge(u.level, u.role)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm transition-all border border-transparent hover:border-blue-100">
                        <Pencil size={13} />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => setDeleteConfirm({ isOpen: true, user: u })} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg shadow-sm transition-all border border-transparent hover:border-rose-100">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Info Footer - Compact */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-rose-50 rounded-xl text-rose-500 shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">Administrator</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">Akses penuh ke semua pengaturan sistem dan manajemen user.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-500 shrink-0">
            <UserCircle size={18} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-tight">Content Editor</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">Dapat memperbarui konten tanpa akses pengaturan user.</p>
          </div>
        </div>
      </div>

      {/* Form Modal - Compact */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Update User' : 'Buat Akun Baru'}>
        <div className="space-y-4 p-1.5">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <User size={10} /> Nama Lengkap
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold"
              placeholder="Contoh: Ahmad Fauzi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                <AtSign size={10} /> Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold"
                placeholder="ahmad_123"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                <Shield size={10} /> Otoritas
              </label>
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none text-sm font-bold"
              >
                <option value="">Pilih Role</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <Key size={10} /> Kata Sandi {editingId && <span className="text-[8px] lowercase font-medium text-slate-300">(opsional)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold"
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-3 flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Batal</button>
            <button onClick={handleSave} className="flex-2 py-2 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5">
              <Save size={13} /> Simpan
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
        onConfirm={() => handleDelete(deleteConfirm.user?.id)}
        title="Hapus Akun"
        message={`Hapus akun ${deleteConfirm.user?.name}? Akses akan dicabut permanen.`}
      />
    </div>
  );
}
