/**
 * Closes modal when clicking on backdrop (not on modal content)
 * @param {Event} e - Click event
 * @param {Function} onClose - Callback to close modal
 */
const handleBackdropClick = (e, onClose) => {
  // Only close if clicking directly on backdrop, not on modal content
  if (e.target === e.currentTarget) {
    onClose();
  }
};

/**
 * Executes modal close callback
 * @param {Function} onClose - Callback to close modal
 */
const handleClose = (onClose) => {
  onClose();
};

/**
 * Manages body scroll behavior when modal is open/closed
 * @param {boolean} isOpen - Modal open state
 * @returns {Function} Cleanup function to reset body overflow
 */
const handleBodyOverflow = (isOpen) => {
  if (isOpen) {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  // Cleanup function for useEffect
  return () => {
    document.body.style.overflow = 'unset';
  };
};

export {
  handleBackdropClick,
  handleClose,
  handleBodyOverflow
};
