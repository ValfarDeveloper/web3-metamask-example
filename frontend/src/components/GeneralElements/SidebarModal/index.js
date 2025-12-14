import { useEffect } from 'react';
import './index.css';
import { handleBackdropClick, handleClose, handleBodyOverflow } from './behaviors';

const SidebarModal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => handleBodyOverflow(isOpen), [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sidebar-modal-backdrop" onClick={(e) => handleBackdropClick(e, onClose)}>
      <div className="sidebar-modal">
        <div className="sidebar-modal-header">
          <h2 className="sidebar-modal-title">{title}</h2>
          <button
            className="sidebar-modal-close"
            onClick={() => handleClose(onClose)}
          >
            ✕
          </button>
        </div>
        <div className="sidebar-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarModal;
