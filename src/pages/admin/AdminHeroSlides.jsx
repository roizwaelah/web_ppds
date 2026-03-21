import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Trash2, X, Save, CheckCircle, Edit3, Image, Info, ExternalLink } from 'lucide-react';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ConfirmDialog } from '../../components/ui/Dialog';

const isValidUrl = (value) => {
  if (!value) return true; // kosong masih boleh
  try {
    const url = new URL(value, window.location.origin);
    return (
      ['http:', 'https:'].includes(url.protocol) ||
      value.startsWith('/') // untuk internal route
    );
  } catch {
    return false;
  }
};

export function AdminHeroSlides() {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
  });

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', image_url: '', button_text: '', button_link: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (slide) => {
    setForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      image_url: slide.image_url || '',
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
    });
    setEditingId(slide.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (!isValidUrl(form.button_link) || !isValidUrl(form.image_url)) {
      alert('Link tidak valid.');
      return;
    }
    setLoading(true);

    try {
      if (editingId) {
        await updateHeroSlide(editingId, form);
      } else {
        await addHeroSlide(form);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const handleDelete = (id) => {
    deleteHeroSlide(id);
    setDeleteConfirm({ isOpen: false, id: null });
  };

  return (
    <div className="max-w-6xl mx-auto pb-6">
      {/* Header Section - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1.5 sm:px-0">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Image className="text-emerald-600" size={19} />
            Hero Slides
          </h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">
			Visual utama halaman depan ({heroSlides.length})
		  </p>
        </div>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
            showForm 
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
          }`}
        >
          {showForm ? <><X size={16} /> Batal</> : <><Plus size={16} /> Tambah Slide</>}
        </button>
      </div>

      {saved && (
        <div className="mb-4 mx-1.5 sm:mx-0 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} className="shrink-0" />
          <span className="text-xs font-bold">Slide berhasil diperbarui!</span>
        </div>
      )}

      {/* Form Section - Compact */}
      {showForm && (
        <div className="mx-1.5 sm:mx-0 bg-white rounded-2xl border border-slate-100 shadow-lg p-4 sm:p-5 mb-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Edit3 size={16} />
            </div>
            <h2 className="text-base font-black text-slate-900">
              {editingId ? 'Edit Detail Slide' : 'Slide Baru'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-slate-700">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Utama *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                placeholder="Cth: Selamat Datang di PP Darussalam"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sub Judul</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                placeholder="Teks kecil di atas judul"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Pendek</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-sm font-medium"
                placeholder="Berikan sedikit konteks tentang slide ini..."
              />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Visual Background"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teks Tombol</label>
              <input
                type="text"
                value={form.button_text}
                onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                placeholder="Cth: Daftar Sekarang"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Link Tujuan</label>
              <input
                type="text"
                value={form.button_link}
                onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                placeholder="Cth: /pendaftaran atau https://..."
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-50">
            <button onClick={resetForm} className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-50 rounded-xl transition-all">
              Batalkan
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 px-6 py-2.5 
              ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} 
              text-white text-sm font-bold rounded-xl transition-all`}
            >
              <Save size={14} />
              {loading ? 'Menyimpan...' : editingId ? 'Simpan' : 'Terbitkan'}
            </button>
          </div>
        </div>
      )}

      {/* Slide List - Compact Cards */}
      <div className="grid grid-cols-1 gap-4 px-1.5 sm:px-0">
        {heroSlides.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Image size={28} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Belum Ada Banner</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5">Halaman depan Anda masih kosong. Tambahkan slide pertama Anda!</p>
          </div>
        ) : (
          heroSlides.map((slide, index) => (
            <div key={slide.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Visual Preview */}
                <div className="lg:w-56 h-40 lg:h-auto relative shrink-0 overflow-hidden">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Image size={28} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      {slide.subtitle && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 mb-1">
                          {slide.subtitle}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-2 truncate">{slide.title}</h3>
                      {slide.description && (
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 italic mb-3">
                          "{slide.description}"
                        </p>
                      )}
                    </div>
                    
                    {/* Floating Desktop Actions */}
                    <div className="hidden sm:flex flex-col gap-1.5">
                      <button onClick={() => handleEdit(slide)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all" title="Edit Slide">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: slide.id })} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all" title="Hapus Slide">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips & Mobile Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1.5">
                      {slide.button_text && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 text-[9px] font-bold rounded border border-slate-100">
                          <Info size={10} /> {slide.button_text}
                        </div>
                      )}
                      {slide.button_link && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded border border-emerald-100">
                          <ExternalLink size={10} /> Link Terpasang
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile Only Actions */}
                    <div className="flex sm:hidden gap-1.5 pt-1.5">
                      <button onClick={() => handleEdit(slide)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs">
                        <Edit3 size={14} /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: slide.id })} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 text-rose-600 rounded-lg font-bold text-xs">
                        <Trash2 size={14} /> Hapus
                      </button>
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
        title="Hapus Slide Utama"
        message="Slide ini akan hilang dari halaman depan. Anda yakin ingin menghapusnya?"
      />
    </div>
  );
}
