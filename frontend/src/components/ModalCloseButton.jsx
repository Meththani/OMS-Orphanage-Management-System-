import { X } from 'lucide-react';
import { closeButtonRed } from '../styles';

export default function ModalCloseButton({ onClick, title = 'Close', style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...closeButtonRed, ...style }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.filter = 'brightness(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter = 'none';
      }}
      title={title}
      aria-label={title}
    >
      <X size={18} strokeWidth={2.5} />
    </button>
  );
}
