import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Trash2, X, Save, Edit3, Megaphone, Search, AlertCircle, Calendar, ChevronRight } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

export function AdminPengumuman() {
  const { pengumuman, addPengumuman, updatePengumuman, deletePengumuman } = useData();
  const { showToast } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    important: false,
  });

  const resetForm = () => {
    setForm({ title: '', content: '', date: new Date().toISOString().split('T')[0], important: false });
    setEditingId(null);
    setShowForm(false);
  };

  const stripHtml = (html) =>
    html.replace(/<[^>]+>/g, '');

  const handleEdit = (item) => {
    setForm({
      title: item.title || '',
      content: item.content || '',
      date: item.date || new Date().toISOString().split('T')[0],
      important: item.important || false,
    });
    setEditingId(item.id);
    setShowForm(true);
    // Scroll ke atas agar form terlihat jelas
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Judul dan Konten wajib diisi', 'error');
      return;
    }

    try {
      if (editingId) {
        await updatePengumuman(editingId, form);
      } else {
        await addPengumuman(form);
      }

      showToast(`Pengumuman berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`, 'success');
      resetForm();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePengumuman(id);
      showToast('Pengumuman berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus', 'error');
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const filteredPengumuman = pengumuman.filter(
    (a) => (a.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="text-emerald-600" size={22} />
            Pengumuman
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Total: {pengumuman.length} Informasi Resmi
          </p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
          >
            <Plus size={16} /> Buat Pengumuman Baru
          </button>
        )}
      </div>

      {/* INLINE FORM - Tampil di bawah judul */}
      {showForm && (
        <div className="mb-10 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-top duration-500">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              {editingId ? <Edit3 size={16} className="text-blue-500" /> : <Plus size={16} className="text-emerald-500" />}
              {editingId ? 'Update Pengumuman' : 'Tulis Pengumuman Baru'}
            </h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Left Side */}
              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Utama</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold text-slate-700"
                    placeholder="Masukkan judul informasi..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Isi Detail Pengumuman</label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val })}
                    placeholder="Tuliskan detail pengumuman di sini..."
                  />
                </div>
              </div>

              {/* Form Right Side */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal Terbit</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  
                  <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-rose-200 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Status Penting</span>
                      <span className="text-[9px] text-slate-400 font-medium">Prioritaskan informasi</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.important}
                      onChange={(e) => setForm({ ...form, important: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 transition-all cursor-pointer"
                    />
                  </label>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                  >
                    <Save size={14} /> {editingId ? 'Simpan Update' : 'Terbitkan'}
                  </button>
                  <button 
                    onClick={resetForm} 
                    className="px-4 py-3 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar - Tampil setelah header/form */}
      <div className="relative group max-w-sm mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari pengumuman..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* Main List */}
      <div className="space-y-3 pb-10">
        {filteredPengumuman.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Megaphone size={32} />
            </div>
            <p className="text-sm text-slate-500 font-bold">Belum ada pengumuman yang sesuai.</p>
          </div>
        ) : (
          filteredPengumuman.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all overflow-hidden"
            >
              <div className="flex items-stretch">
                <div className={`w-1.5 shrink-0 ${item.important ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 p-4">
                  <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0 min-w-[100px] shrink-0">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-tighter">
                      <Calendar size={12} /> {item.date}
                    </div>
                    {item.important && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 uppercase tracking-widest">
                        <AlertCircle size={10} /> Penting
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1 leading-relaxed">
                      {stripHtml(item.content)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ isOpen: true, id: item.id })} 
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="hidden md:block pl-2 text-slate-100">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Hapus Pengumuman"
        message="Yakin ingin menghapus informasi ini?"
        type="warning"
      />
    </div>
  );
}
