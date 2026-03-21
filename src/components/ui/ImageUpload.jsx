import { useRef, useState } from 'react';
import { FolderOpen, Loader2, Upload, X } from 'lucide-react';
import { uploadMediaApi } from '../../lib/api';
import { MediaLibraryModal } from './MediaLibraryModal';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, WebP, atau SVG.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file maksimal 5MB');
  }
}

export function ImageUpload({ value, onChange, label = 'Gambar', className = '' }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    if (uploading) return;

    try {
      validateFile(file);
      setError('');
      setUploading(true);
      const data = await uploadMediaApi(file);
      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Upload gagal. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  const handleSelectFromLibrary = (url) => {
    onChange(url);
    setError('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      {value ? (
        <div className="relative group">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = '/images/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg"
              >
                Ganti Upload
              </button>
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="bg-white text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Media Library
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
        <div className="space-y-3">
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
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP, SVG (Maks. 5MB)</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:border-emerald-200 hover:text-emerald-700 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            Pilih dari Media Library
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleSelectFromLibrary}
        selectedUrl={value}
      />
    </div>
  );
}
