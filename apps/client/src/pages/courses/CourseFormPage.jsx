import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Check, ImagePlus, X } from 'lucide-react';
import './CourseFormPage.css';

export default function CourseFormPage({ user }) {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await axios.get(`/api/courses/${editId}`);
        setTitle(res.data.title);
        setDescription(res.data.description || '');
        setExistingCover(res.data.cover_image || null);
      } catch {
        setError('No se pudo cargar el curso.');
      }
    })();
  }, [editId]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCover(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      if (coverFile) fd.append('cover', coverFile);

      if (isEditing) {
        await axios.put(`/api/courses/${editId}`, fd);
        setSuccess('Curso actualizado correctamente.');
      } else {
        await axios.post('/api/courses', fd);
        setSuccess('Curso creado correctamente.');
        setTitle('');
        setDescription('');
        setCoverFile(null);
        setCoverPreview(null);
      }
      setTimeout(() => navigate('/courses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el curso.');
    } finally {
      setLoading(false);
    }
  };

  const previewSrc = coverPreview || existingCover;

  return (
    <div className="course-form-page">
      <div className="course-form-container">
        <div className="course-form-header">
          <Link to="/courses" className="course-form-back">
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Link>
        </div>

        <div className="course-form-card">
          <div className="course-form-title">
            <h1>{isEditing ? 'Editar curso' : 'Crear nuevo curso'}</h1>
            <p>{isEditing ? 'Actualiza los datos de tu curso' : 'Completa la información para crear tu curso'}</p>
          </div>

          {error && (
            <div className="course-form-alert course-form-alert-error">{error}</div>
          )}
          {success && (
            <div className="course-form-alert course-form-alert-success">
              <Check size={18} />{success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Cover image picker */}
            <div className="course-form-group">
              <label>Imagen de portada</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverChange}
                disabled={loading}
              />
              {previewSrc ? (
                <div className="course-cover-preview">
                  <img src={previewSrc} alt="Portada" />
                  <button
                    type="button"
                    className="course-cover-remove"
                    onClick={removeCover}
                    disabled={loading}
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                  <button
                    type="button"
                    className="course-cover-change"
                    onClick={() => fileRef.current?.click()}
                    disabled={loading}
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="course-cover-picker"
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                >
                  <ImagePlus size={22} />
                  <span>Añadir imagen de portada</span>
                  <small>JPG, PNG o WebP · máx. 5 MB</small>
                </button>
              )}
            </div>

            <div className="course-form-group">
              <label htmlFor="title">Título del curso</label>
              <input
                id="title"
                type="text"
                placeholder="Ej: Introducción a JavaScript"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="course-form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                placeholder="Describe el contenido y objetivos del curso..."
                rows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="course-form-actions">
              <button
                type="button"
                className="course-form-btn course-form-btn-secondary"
                onClick={() => navigate('/courses')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="course-form-btn course-form-btn-primary"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear curso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
