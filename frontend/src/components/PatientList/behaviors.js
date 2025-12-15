import { apiService } from '../../services/apiService';

/**
 * Debounces search input with 300ms delay
 * @param {string} searchInput - Current search input value
 * @param {Function} setState - State setter function
 * @returns {Function} Cleanup function to clear timeout
 */
const handleSearchDebounce = (searchInput, setState) => {
  const timer = setTimeout(() => {
    setState(prev => ({ ...prev, searchTerm: searchInput, currentPage: 1 }));
  }, 300);
  return () => clearTimeout(timer);
};

/**
 * Fetches paginated patients list from API with search support
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const fetchPatients = async (state, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const response = await apiService.getPatients(state.currentPage, state.itemsPerPage, state.searchTerm);
    setState(prev => ({
      ...prev,
      patients: response.patients || [],
      pagination: response.pagination,
      loading: false,
    }));
  } catch (err) {
    setState(prev => ({
      ...prev,
      error: err.message || 'Failed to fetch patients',
      patients: [],
      pagination: null,
      loading: false,
    }));
  } finally {
    // Mark initial load as complete after first fetch attempt
    if (state.isInitialLoad) {
      setState(prev => ({ ...prev, isInitialLoad: false }));
    }
  }
};

/**
 * Changes current page and scrolls to top
 * @param {number} newPage - Page number to navigate to
 * @param {Function} setState - State setter function
 */
const handlePageChange = (newPage, setState) => {
  setState(prev => ({ ...prev, currentPage: newPage }));
  // Smooth scroll to top when changing pages
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Changes items per page and resets to first page
 * @param {string|number} newItemsPerPage - New items per page value
 * @param {Function} setState - State setter function
 */
const handleItemsPerPageChange = (newItemsPerPage, setState) => {
  setState(prev => ({
    ...prev,
    itemsPerPage: Number(newItemsPerPage),
    currentPage: 1,
  }));
};

/**
 * Navigates to previous page with bounds checking
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const handlePreviousPage = (state, setState) => {
  // Ensure we don't go below page 1
  const newPage = Math.max(state.currentPage - 1, 1);
  handlePageChange(newPage, setState);
};

/**
 * Navigates to next page
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const handleNextPage = (state, setState) => {
  handlePageChange(state.currentPage + 1, setState);
};

export {
  handleSearchDebounce,
  fetchPatients,
  handlePageChange,
  handleItemsPerPageChange,
  handlePreviousPage,
  handleNextPage,
};
