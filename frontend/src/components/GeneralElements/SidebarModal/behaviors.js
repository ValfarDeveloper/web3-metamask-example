const handleBackdropClick = (e, onClose) => {
  if (e.target === e.currentTarget) {
    onClose();
  }
};

const handleClose = (onClose) => {
  onClose();
};

const handleBodyOverflow = (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
};

export {
  handleBackdropClick,
  handleClose,
  handleBodyOverflow
};
