import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Plus, Trash2, X, User, Briefcase, AlignLeft, UserStar } from 'lucide-react';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ConfirmDialog } from '../../components/ui/Dialog';

export function AdminPengasuh() {
  const { user } = useAuth();
  const { pengasuh, addPengasuh, updatePengasuh, deletePengasuh } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', image: '', bio: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  // 🔐 Defensive route guard
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  // 🔒 Safe image whitelist
  const safeImage = (url) => {
    if (!url) return '/images/placeholder.svg';
    if (
      url.startsWith('/uploads/') ||
      url.startsWith(window.location.origin)
    ) {
      return url;
    }
    return '/images/placeholder.svg';
  };

  const resetForm = () => {
    setForm({ name: '', role: '', image: '', bio: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (form.name && form.role) {
      if (editingId) {
        await updatePengasuh(editingId, form);
      } else {
        await addPengasuh(form);
      }
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || '',
      role: item.role || '',
      image: item.image || '',
      bio: item.bio || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    deletePengasuh(id);
    setDeleteConfirm({ isOpen: false, id: null });
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Section - Compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserStar className="text-emerald-600" size={19} />
            Data Pengasuh
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
			Manajemen profil ustadz, ustadzah, dan pengasuh pondok
		  </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              return;
            }
            setShowForm(true);
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
            showForm 
              ? 'bg-white text-slate-600 border border-slate-200' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {showForm ? <><X size={14} /> Batal</> : <><Plus size={14} /> Tambah Pengasuh</>}
        </button>
      </div>

      {/* Add Form Section - Compact */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 p-4 mb-6 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
            <User size={13} /> {editingId ? 'Edit Data Pengasuh' : 'Entri Data Baru'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Foto Upload Kolom */}
            <div className="lg:col-span-4">
              <ImageUpload
                label="Foto Profil"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
            </div>
            
            {/* Data Input Kolom */}
            <div className="lg:col-span-8 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-300" size={14} />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700"
                      placeholder="Contoh: KH. Ahmad Dahlan"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jabatan / Peran</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 text-slate-300" size={14} />
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700"
                      placeholder="Contoh: Pengasuh Utama"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biodata Singkat</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-2.5 text-slate-300" size={14} />
                  <textarea
                    rows={2}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700 resize-none"
                    placeholder="Tuliskan pengalaman atau riwayat singkat..."
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSave}
                  disabled={!form.name || !form.role}
                  className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-30"
                >
                  {editingId ? 'Update Profil' : 'Simpan Profil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Section - Compact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">
        {pengasuh.map((item) => (
          <div key={item.id} className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
            {/* Image Section */}
            <div className="w-full sm:w-32 md:w-36 aspect-square sm:aspect-auto overflow-hidden bg-slate-100 shrink-0">
              <img 
                src={safeImage(item.image)} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            
            {/* Content Section */}
            <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
              <div className="relative">
                <div className="absolute top-0 right-0">
                   <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-black text-slate-900 leading-tight pr-6 truncate">{item.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">
                  {item.role}
                </span>
                <p className="mt-2 text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {item.bio || 'Tidak ada biodata tersedia.'}
                </p>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-300 uppercase">ID: {item.id.toString().substring(0, 8)}</span>
                <button
                  onClick={() => handleEdit(item)}
                  className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:underline"
                >
                  Edit Profil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Hapus Pengasuh"
        message="Data profil pengasuh ini akan dihapus permanen dari sistem dan website."
      />
    </div>
  );
}
