import { useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { MediaLibraryModal } from './MediaLibraryModal';

export function RichTextEditor({ value, onChange, placeholder = 'Tulis konten di sini...', className = '' }) {
  const quillRef = useRef(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const handleSelectImage = (url) => {
    if (!url) return;
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertEmbed(index, 'image', url, 'user');
    editor.setSelection(index + 1, 0);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ direction: 'rtl' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: () => setShowMediaModal(true),
      },
    },
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'indent', 'color', 'background', 'align',
    'blockquote', 'code-block', 'link', 'image'
  ];

  return (
    <>
      <div className={`rounded-xl border border-gray-300 overflow-hidden ${className}`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className="min-h-[200px]
                  [&_.ql-toolbar]:border-b!
                  [&_.ql-toolbar]:border-gray-200!
                  [&_.ql-toolbar]:bg-gray-50!
                  [&_.ql-container]:border-0!
                  [&_.ql-editor]:min-h-[200px]
                  focus:[&_.ql-container]:ring-2
                  focus:[&_.ql-container]:ring-emerald-200
                  focus:[&_.ql-container]:border-emerald-500"
        />
      </div>
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleSelectImage}
      />
    </>
  );
}
