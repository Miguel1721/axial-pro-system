import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../context/ThemeContext';
import {
  Save,
  Plus,
  Edit,
  Trash2,
  FileText,
  Clock,
  User,
  Calendar,
  X
} from 'lucide-react';

const MedicalNotesEditor = ({ patientId }) => {
  const { isDark } = useTheme();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([
    {
      id: 1,
      date: '2024-05-02',
      time: '10:30',
      doctor: 'Dr. Carlos García',
      content: '<p>Paciente acude por <strong>dolor abdominal persistente</strong> en epigastrio.</p><p>Se realiza examen físico:</p><ul><li>Abdomen blando y depresible</li><li>Dolor a la palpación profunda en epigastrio</li><li>Sin signos de irritación peritoneal</li></ul><p><em>Se prescribe tratamiento con omeprazol 20mg por 14 días.</em></p><p>Se recomienda dieta blanda y evitar irritantes gástricos.</p>',
      type: 'evolucion'
    },
    {
      id: 2,
      date: '2024-04-15',
      time: '15:00',
      doctor: 'Dra. María López',
      content: '<p><strong>Diagnóstico: Gastritis Crónica Superficial</strong></p><p>Paciente presenta mejoría sintomatológica tras 2 semanas de tratamiento.</p><p>Plan:</p><ul><li>Continuar omeprazol 20mg por 4 semanas más</li><li>Controles periódicos</li></ul>',
      type: 'diagnostico'
    }
  ]);
  const [editingId, setEditingId] = useState(null);
  const quillRef = useRef(null);

  // Configuración de Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link'
  ];

  const handleSave = () => {
    if (!note.trim()) return;

    const newNote = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      doctor: 'Dr. Actual',
      content: note,
      type: 'evolucion'
    };

    setNotes([newNote, ...notes]);
    setNote('');
    setEditingId(null);
  };

  const handleEdit = (noteToEdit) => {
    setNote(noteToEdit.content);
    setEditingId(noteToEdit.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (noteId) => {
    if (confirm('¿Eliminar esta nota médica?')) {
      setNotes(notes.filter(n => n.id !== noteId));
    }
  };

  const handleUpdate = () => {
    if (!note.trim() || !editingId) return;

    setNotes(notes.map(n =>
      n.id === editingId
        ? { ...n, content: note }
        : n
    ));

    setNote('');
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl ${isDark ? 'text-white' : 'text-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📝 Notas de Evolución Médica</h2>
            <p className="text-green-100">Registro detallado de la evolución del paciente con editor de texto enriquecido</p>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={32} />
          </div>
        </div>
      </div>

      {/* Editor de notas */}
      <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? 'Editar Nota Médica' : 'Nueva Nota de Evolución'}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Usa el editor para documentar la evolución del paciente. Puedes usar negrita, listas y más formato.
          </p>
        </div>

        {/* Editor Quill */}
        <div className="mb-4">
          <div className={`rounded-lg overflow-hidden ${isDark ? 'quill-dark' : ''}`}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={note}
              onChange={setNote}
              modules={modules}
              formats={formats}
              placeholder="Escribe la nota de evolución médica aquí..."
              style={{
                height: '200px',
                marginBottom: '42px'
              }}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          {editingId ? (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg"
              >
                <Save size={20} />
                Actualizar Nota
              </button>
              <button
                onClick={() => {
                  setNote('');
                  setEditingId(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                <X size={20} />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleSave}
              disabled={!note.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                note.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={20} />
              Guardar Nota
            </button>
          )}
        </div>
      </div>

      {/* Historial de notas */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Historial de Notas ({notes.length})
        </h3>

        {notes.map((noteItem) => (
          <div
            key={noteItem.id}
            className={`rounded-xl p-6 shadow-lg transition-all hover:shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Header de la nota */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>{new Date(noteItem.date).toLocaleDateString('es-ES')}</span>
                  <Clock size={16} />
                  <span>{noteItem.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {noteItem.doctor}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(noteItem)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(noteItem.id)}
                  className={`p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600`}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Contenido de la nota */}
            <div
              className={`prose max-w-none ${isDark ? 'prose-invert' : ''} ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              dangerouslySetInnerHTML={{ __html: noteItem.content }}
            />
          </div>
        ))}
      </div>

      {/* Estilos para Quill en modo oscuro */}
      <style>{`
        .quill-dark .ql-toolbar {
          background-color: #374151 !important;
          border-color: #4B5563 !important;
        }

        .quill-dark .ql-stroke {
          stroke: #D1D5DB !important;
        }

        .quill-dark .ql-fill {
          fill: #D1D5DB !important;
        }

        .quill-dark .ql-editor {
          background-color: #374151 !important;
          color: #F9FAFB !important;
          border-color: #4B5563 !important;
        }

        .quill-dark .ql-container {
          border-color: #4B5563 !important;
        }

        .ql-container {
          font-size: 16px;
          line-height: 1.6;
        }

        .ql-editor ol, .ql-editor ul {
          padding-left: 1.5em;
        }

        .ql-editor li {
          margin-bottom: 0.5em;
        }

        .ql-editor strong {
          font-weight: 700;
          color: #1F2937;
        }

        .quill-dark .ql-editor strong {
          color: #F9FAFB;
        }
      `}</style>
    </div>
  );
};

export default MedicalNotesEditor;
