import { useEffect, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Plus, Trash2, X, Save, Edit3, BookOpen, Search } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { Modal, ConfirmDialog } from '../../components/ui/Dialog';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

export function AdminPojokSantri() {
  const { pojokSantri, addPojokSantri, updatePojokSantri, deletePojokSantri, refreshPojokSantri } = useData();
  const { showToast } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const defaultCategories = ['Prestasi', 'Tips & Trik', 'Kegiatan', 'Opini', 'Cerita'];
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    authorRole: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    category: 'Kegiatan',
    status: 'published',
  });

  useEffect(() => {
    refreshPojokSantri('all').catch(() => {
      showToast('Gagal memuat data artikel dari database', 'error');
    });
  }, [refreshPojokSantri, showToast]);

  useEffect(() => {
    const fromData = (Array.isArray(pojokSantri) ? pojokSantri : [])
      .map((item) => (item.category || '').trim())
      .filter(Boolean);

    setCategoryOptions((prev) => Array.from(new Set([...prev, ...fromData])));
  }, [pojokSantri]);

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      author: '',
      authorRole: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      category: 'Kegiatan',
      status: 'published',
    });
    setEditingId(null);
    setAddingCategory(false);
    setNewCategory('');
    setShowForm(false);
  };

  const handleEdit = (article) => {
    const currentCategory = article.category || 'Kegiatan';
    setCategoryOptions((prev) =>
      prev.includes(currentCategory) ? prev : [...prev, currentCategory]
    );

    setForm({
      title: article.title || '',
      content: article.content || '',
      author: article.author || '',
      authorRole: article.authorRole || '',
      date: article.date || new Date().toISOString().split('T')[0],
      image: article.image || '',
      category: currentCategory,
      status: article.status || 'published',
    });
    setAddingCategory(false);
    setNewCategory('');
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleCategoryChange = (value) => {
    if (value === '__add__') {
      setAddingCategory(true);
      return;
    }

    setAddingCategory(false);
    setNewCategory('');
    setForm({ ...form, category: value });
  };

  const handleAddCategory = () => {
    const category = newCategory.trim();
    if (!category) {
      showToast('Nama kategori tidak boleh kosong', 'error');
      return;
    }

    if (category.length > 50) {
      showToast('Kategori maksimal 50 karakter', 'error');
      return;
    }

    setCategoryOptions((prev) => (prev.includes(category) ? prev : [...prev, category]));
    setForm({ ...form, category });
    setAddingCategory(false);
    setNewCategory('');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      showToast('Judul, Penulis, dan Konten wajib diisi', 'error');
      return;
    }

    try {
      if (editingId) {
        await updatePojokSantri(editingId, form);
        showToast('Artikel berhasil diperbarui', 'success');
      } else {
        await addPojokSantri(form);
        showToast('Artikel baru berhasil ditambahkan', 'success');
      }

      resetForm();
    } catch (err) {
      showToast('Gagal menyimpan artikel', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePojokSantri(id);
      showToast('Artikel telah dihapus', 'success');
    } catch {
      showToast('Gagal menghapus artikel', 'error');
    }

    setDeleteConfirm({ isOpen: false, id: null });
  };

  const safeImage = (url) => {
    if (!url) return null;
    if (url.startsWith('/uploads/') || url.startsWith(window.location.origin)) {
      return url;
    }
    return null;
  };

  const filteredArticles = pojokSantri.filter((a) =>
    (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-600" />
            Pojok Santri
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Kelola artikel dan tulisan santri ({pojokSantri.length})</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Artikel
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Artikel' : 'Tambah Artikel Baru'}
            </h2>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
            >
              <X size={16} /> Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                placeholder="Judul artikel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penulis *</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                placeholder="Nama penulis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas/Jabatan</label>
              <input
                type="text"
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                placeholder="Cth: Kelas XII MA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__add__">+ Tambah Kategori</option>
              </select>
              {addingCategory && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nama kategori baru"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Tambah
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none bg-white text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                label="Gambar Artikel"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Konten *</label>
              <RichTextEditor
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                placeholder="Isi artikel..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={resetForm} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
              Batal
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
            >
              <Save size={18} /> {editingId ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={() => handleDelete(deleteConfirm.id)}
        title="Hapus Artikel"
        message="Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan."
      />

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari artikel berdasarkan judul, penulis, atau kategori..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none bg-white focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p>Tidak ada artikel ditemukan.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                {article.image && (
                  <img
                    src={safeImage(article.image)}
                    alt={article.title}
                    className="w-full sm:w-32 h-24 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{article.category}</span>
                        <span className="text-xs text-gray-400">{article.date}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 truncate">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{article.author} • {article.authorRole}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(article)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: article.id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
