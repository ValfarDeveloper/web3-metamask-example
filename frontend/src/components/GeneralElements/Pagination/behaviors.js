const handlePreviousPage = (currentPage, onPreviousPage) => {
  if (currentPage > 1 && onPreviousPage) {
    onPreviousPage();
  }
};

const handleNextPage = (currentPage, totalPages, onNextPage) => {
  if (currentPage < totalPages && onNextPage) {
    onNextPage();
  }
};

const getItemLabel = (itemLabel, total) => {
  if (!itemLabel) return 'items';

  if (total === 1) {
    return itemLabel;
  }

  return `${itemLabel}s`;
};

export {
  handlePreviousPage,
  handleNextPage,
  getItemLabel
};
