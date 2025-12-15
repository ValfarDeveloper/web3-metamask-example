/**
 * Handles navigation to previous page
 * @param {number} currentPage - Current page number
 * @param {Function} onPreviousPage - Callback to execute when navigating to previous page
 */
const handlePreviousPage = (currentPage, onPreviousPage) => {
  if (currentPage > 1 && onPreviousPage) {
    onPreviousPage();
  }
};

/**
 * Handles navigation to next page
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {Function} onNextPage - Callback to execute when navigating to next page
 */
const handleNextPage = (currentPage, totalPages, onNextPage) => {
  if (currentPage < totalPages && onNextPage) {
    onNextPage();
  }
};

/**
 * Returns singular or plural form of item label based on count
 * @param {string} itemLabel - Singular form of item label (e.g., 'patient', 'consent')
 * @param {number} total - Total count of items
 * @returns {string} Pluralized label (e.g., 'patient' or 'patients')
 */
const getItemLabel = (itemLabel, total) => {
  if (!itemLabel) return 'items';

  // Return singular form for exactly 1 item
  if (total === 1) {
    return itemLabel;
  }

  // Return plural form (simple 's' suffix)
  return `${itemLabel}s`;
};

export {
  handlePreviousPage,
  handleNextPage,
  getItemLabel
};
