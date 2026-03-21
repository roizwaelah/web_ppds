import { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function RichTextEditor({ value, onChange, placeholder = 'Tulis konten di sini...', className = '' }) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'indent', 'color', 'background', 'align',
    'blockquote', 'code-block', 'link', 'image'
  ];

  return (
    <div className={`rounded-xl border border-gray-300 overflow-hidden ${className}`}>
      <ReactQuill
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
  );
}
