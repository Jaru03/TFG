import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import './PointsField.css';

// Control para el valor de una pregunta, compartido por la vista del profesor
// y el panel de administración. Un toggle elige entre reparto "Automático"
// (value = '') o "Personalizado" (value = número). Emite el nuevo valor por
// onChange (cadena vacía = automático).
export default function PointsField({ value, onChange }) {
  const [custom, setCustom] = useState(value !== '' && value != null);
  // Mientras se anima la altura necesitamos overflow:hidden; al terminar de
  // abrirse lo liberamos para que el anillo de foco del input no se recorte.
  const [overflowHidden, setOverflowHidden] = useState(true);
  const reduceMotion = useReducedMotion();

  const selectAuto = () => { setOverflowHidden(true); setCustom(false); onChange(''); };
  const selectCustom = () => { setCustom(true); };

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="points-field">
      <span className="points-field-label">Valor de la pregunta</span>

      <div className="points-seg">
        <button
          type="button"
          className={`points-seg-btn ${!custom ? 'is-active' : ''}`}
          onClick={selectAuto}
        >
          <Sparkles size={14} /> Automático
        </button>
        <button
          type="button"
          className={`points-seg-btn ${custom ? 'is-active' : ''}`}
          onClick={selectCustom}
        >
          <SlidersHorizontal size={14} /> Personalizado
        </button>
      </div>

      <AnimatePresence initial={false}>
        {custom && (
          <motion.div
            key="pts"
            className="points-input-collapse"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            style={{ overflow: overflowHidden ? 'hidden' : 'visible' }}
            onAnimationComplete={() => { if (custom) setOverflowHidden(false); }}
          >
            <div className="points-input-wrap">
              <input
                type="number"
                min="0"
                step="0.01"
                value={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder="0"
              />
              <span className="points-input-suffix">pts</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="points-field-help">
        {custom
          ? 'Esta pregunta valdrá los puntos que indiques.'
          : 'Reparte el valor del test a partes iguales con las demás preguntas automáticas.'}
      </p>
    </div>
  );
}
