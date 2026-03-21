import { useState, useRef } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';

const getCookie = (name) => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
};

export function ImageUpload({ value, onChange, label = 'Gambar', className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    if (uploading) return;

    // Allowed MIME types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    // Allowed extensions
    const allowedExtensions = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'
    ];

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext)) {
      setError('Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, atau PDF.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const csrfToken = getCookie('ppds_csrf');

      const res = await fetch('/api/upload.php', {
        method: 'POST',
        credentials: 'include', // 🔥 WAJIB untuk httpOnly cookie
        body: formData,
        ...(csrfToken ? { headers: { 'X-CSRF-Token': csrfToken } } : {}),
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.error || 'Upload gagal');
        }
        throw new Error('Upload gagal');
      }

      const data = await res.json();
      onChange(data.url);

    } catch (err) {
      setError(err.message || 'Upload gagal. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input agar bisa upload file yang sama
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      {/* Preview jika sudah ada gambar */}
      {value ? (
        <div className="relative group">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.svg';
              }}
            />
            {/* Overlay dengan tombol */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-lg"
              >
                Hapus
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 truncate">{value}</p>
        </div>
      ) : (
        /* Dropzone jika belum ada gambar */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Klik untuk upload atau <span className="text-emerald-600">drag & drop</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP, PDF (Maks. 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
