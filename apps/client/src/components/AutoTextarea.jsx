import { useRef, useLayoutEffect } from 'react';

// Textarea que crece en alto según su contenido (sin barra de scroll).
export default function AutoTextarea({ value, onChange, style, rows = 2, ...props }) {
  const ref = useRef(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Ajusta la altura al montar y cada vez que cambia el valor (también en edición).
  useLayoutEffect(() => { resize(); }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      onChange={(e) => { onChange?.(e); resize(); }}
      style={{ overflow: 'hidden', resize: 'none', minHeight: `${rows * 1.6}em`, ...style }}
      {...props}
    />
  );
}
