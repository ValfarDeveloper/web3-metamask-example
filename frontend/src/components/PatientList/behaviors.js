import { apiService } from '../../services/apiService';

const handleSearchDebounce = (searchInput, setState) => {
  const timer = setTimeout(() => {
    setState(prev => ({ ...prev, searchTerm: searchInput, currentPage: 1 }));
  }, 300);
  return () => clearTimeout(timer);
};

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
    if (state.isInitialLoad) {
      setState(prev => ({ ...prev, isInitialLoad: false }));
    }
  }
};

const handlePageChange = (newPage, setState) => {
  setState(prev => ({ ...prev, currentPage: newPage }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleItemsPerPageChange = (newItemsPerPage, setState) => {
  setState(prev => ({
    ...prev,
    itemsPerPage: Number(newItemsPerPage),
    currentPage: 1,
  }));
};

const handlePreviousPage = (state, setState) => {
  const newPage = Math.max(state.currentPage - 1, 1);
  handlePageChange(newPage, setState);
};

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
