import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// Modal del editor (cierra con Escape o clic fuera).
export default function EditorModal({ title, onClose, wide, headerAction, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="admin-modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className={`admin-modal editor-modal ${wide ? 'admin-modal--lg' : ''}`}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="admin-modal-header">
          <span className="admin-modal-title">{title}</span>
          <div className="editor-modal-header-actions">
            {headerAction}
            <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="editor-modal-body">{children}</div>
      </motion.div>
    </motion.div>
  );
}
