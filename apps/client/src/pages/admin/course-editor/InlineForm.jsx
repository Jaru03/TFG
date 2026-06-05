// Formulario inline reutilizable (crear/editar) con botones de acción.
export default function InlineForm({ children, onCancel, onSave, saveLabel = 'Guardar' }) {
  return (
    <div className="editor-inline-form">
      {children}
      <div className="admin-form-actions">
        <button className="admin-btn-secondary" onClick={onCancel}>Cancelar</button>
        <button className="admin-btn-save" onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  );
}
