import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api';
import { ArrowLeft, ImagePlus, X } from 'lucide-react';
import Alert from '../../components/Alert';
import AutoTextarea from '../../components/AutoTextarea';
import './CourseFormPage.css';

export default function CourseFormPage() {
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile]   = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const { data: courseData } = useQuery({
    queryKey: ['courses', editId],
    queryFn: () => coursesApi.get(editId),
    enabled: isEditing,
  });

  // Vuelca los datos del curso en el formulario cuando llegan (modo edición).
  // Sembrar un formulario editable desde datos asíncronos es el patrón estándar
  // (ver React docs); la regla set-state-in-effect no aplica a este caso.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (courseData) {
      setTitle(courseData.title);
      setDescription(courseData.description || '');
      setExistingCover(courseData.cover_image || null);
    }
  }, [courseData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const saveMutation = useMutation({
    mutationFn: (fd) => (isEditing ? coursesApi.update(editId, fd) : coursesApi.create(fd)),
    onSuccess: () => {
      setSuccess(isEditing ? 'Curso actualizado correctamente.' : 'Curso creado correctamente.');
      if (!isEditing) {
        setTitle('');
        setDescription('');
        setCoverFile(null);
        setCoverPreview(null);
      }
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setTimeout(() => navigate('/'), 1500);
    },
    onError: (err) => setError(err.response?.data?.message || 'Error al guardar el curso.'),
  });

  const loading = saveMutation.isPending;

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

  const handleSubmit = (ev) => {
    ev.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('description', description.trim());
    if (coverFile) fd.append('cover', coverFile);

    saveMutation.mutate(fd);
  };

  const previewSrc = coverPreview || existingCover;

  return (
    <div className="course-form-page">
      <div className="course-form-container">
        <div className="course-form-header">
          <Link to="/" className="course-form-back">
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        <div className="course-form-card">
          <div className="course-form-title">
            <h1>{isEditing ? 'Editar curso' : 'Crear nuevo curso'}</h1>
            <p>{isEditing ? 'Actualiza los datos de tu curso' : 'Completa la información para crear tu curso'}</p>
          </div>

          {error && <Alert>{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

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
              <AutoTextarea
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
                onClick={() => navigate('/')}
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
