import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

// Timer for search input debouncing
let searchDebounceTimer = null;

/**
 * Fetches blockchain transactions with multiple filter options and pagination
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 * @param {string} account - Connected wallet address for filtering
 */
const fetchTransactions = async (state, setState, account) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    // Only pass wallet address if filter is enabled
    const walletAddress = state.filterByWallet && account ? account : null;
    const response = await apiService.getTransactions(walletAddress, state.limit);

    let filteredTransactions = response.transactions || [];

    // Client-side search filter by ID, addresses, type, or hash
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filteredTransactions = filteredTransactions.filter(tx => {
        return (
          tx.id.toLowerCase().includes(searchLower) ||
          tx.from.toLowerCase().includes(searchLower) ||
          tx.to.toLowerCase().includes(searchLower) ||
          tx.type.toLowerCase().includes(searchLower) ||
          tx.blockchainTxHash.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply type filter (consent_approval, data_access, etc.)
    if (state.filterType !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === state.filterType);
    }

    // Apply status filter (confirmed, pending)
    if (state.filterStatus !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === state.filterStatus);
    }

    // Client-side pagination calculation
    const totalItems = filteredTransactions.length;
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    setState(prev => ({
      ...prev,
      transactions: paginatedTransactions,
      allTransactions: filteredTransactions,
      pagination: {
        page: state.currentPage,
        limit: state.itemsPerPage,
        total: totalItems,
        totalPages: totalPages
      },
      loading: false,
      isInitialLoad: false
    }));
  } catch (err) {
    setState(prev => ({
      ...prev,
      error: err.message,
      loading: false,
      isInitialLoad: false
    }));
    toast.error(`Failed to fetch transactions: ${err.message}`);
  }
};

/**
 * Debounces search input with 500ms delay
 * @param {string} searchInput - Current search input value
 * @param {Function} setState - State setter function
 */
const handleSearchDebounce = (searchInput, setState) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    setState(prev => ({ ...prev, searchTerm: searchInput, currentPage: 1 }));
  }, 500);
};

/**
 * Toggles filter to show only connected wallet's transactions
 * @param {Function} setState - State setter function
 */
const handleFilterByWalletToggle = (setState) => {
  setState(prev => ({ ...prev, filterByWallet: !prev.filterByWallet, currentPage: 1 }));
};

/**
 * Changes transaction type filter and resets to first page
 * @param {string} newFilter - Filter value ('all', 'consent_approval', 'data_access')
 * @param {Function} setState - State setter function
 */
const handleTypeFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterType: newFilter, currentPage: 1 }));
};

/**
 * Changes transaction status filter and resets to first page
 * @param {string} newFilter - Filter value ('all', 'confirmed', 'pending')
 * @param {Function} setState - State setter function
 */
const handleStatusFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterStatus: newFilter, currentPage: 1 }));
};

/**
 * Changes items per page and resets to first page
 * @param {string|number} value - New items per page value
 * @param {Function} setState - State setter function
 */
const handleItemsPerPageChange = (value, setState) => {
  setState(prev => ({
    ...prev,
    itemsPerPage: parseInt(value),
    currentPage: 1
  }));
};

/**
 * Navigates to previous page
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const handlePreviousPage = (state, setState) => {
  if (state.currentPage > 1) {
    setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
  }
};

/**
 * Navigates to next page
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const handleNextPage = (state, setState) => {
  if (state.pagination && state.currentPage < state.pagination.totalPages) {
    setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  }
};

/**
 * Formats date string to readable format with time
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date with time or 'N/A'
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncates wallet addresses for display
 * @param {string} address - Full wallet address
 * @returns {string} Truncated address (first 10 + last 8 chars) or 'N/A'
 */
const formatAddress = (address) => {
  if (!address) return 'N/A';
  if (address.length <= 20) return address;

  return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
};

/**
 * Truncates long blockchain hash strings for display
 * @param {string} hash - Full hash string
 * @returns {string} Truncated hash (first 10 + last 8 chars) or 'N/A'
 */
const truncateHash = (hash) => {
  if (!hash) return 'N/A';
  if (hash.length <= 20) return hash;

  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

/**
 * Formats transaction type label from snake_case to Title Case
 * @param {string} type - Transaction type in snake_case (e.g., 'consent_approval')
 * @returns {string} Formatted type label (e.g., 'Consent Approval') or 'N/A'
 */
const formatTypeLabel = (type) => {
  if (!type) return 'N/A';
  // Split by underscore, capitalize each word, and join with spaces
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export {
  fetchTransactions,
  handleSearchDebounce,
  handleFilterByWalletToggle,
  handleTypeFilterChange,
  handleStatusFilterChange,
  handleItemsPerPageChange,
  handlePreviousPage,
  handleNextPage,
  formatDate,
  formatAddress,
  truncateHash,
  formatTypeLabel
};
