import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

let searchDebounceTimer = null;

const fetchTransactions = async (state, setState, account) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const walletAddress = state.filterByWallet && account ? account : null;
    const response = await apiService.getTransactions(walletAddress, state.limit);

    let filteredTransactions = response.transactions || [];

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

    if (state.filterType !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === state.filterType);
    }

    if (state.filterStatus !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === state.filterStatus);
    }

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

const handleSearchDebounce = (searchInput, setState) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    setState(prev => ({ ...prev, searchTerm: searchInput, currentPage: 1 }));
  }, 500);
};

const handleFilterByWalletToggle = (setState) => {
  setState(prev => ({ ...prev, filterByWallet: !prev.filterByWallet, currentPage: 1 }));
};

const handleTypeFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterType: newFilter, currentPage: 1 }));
};

const handleStatusFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterStatus: newFilter, currentPage: 1 }));
};

const handleItemsPerPageChange = (value, setState) => {
  setState(prev => ({
    ...prev,
    itemsPerPage: parseInt(value),
    currentPage: 1
  }));
};

const handlePreviousPage = (state, setState) => {
  if (state.currentPage > 1) {
    setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
  }
};

const handleNextPage = (state, setState) => {
  if (state.pagination && state.currentPage < state.pagination.totalPages) {
    setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  }
};

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

const formatAddress = (address) => {
  if (!address) return 'N/A';
  if (address.length <= 20) return address;

  return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
};

const truncateHash = (hash) => {
  if (!hash) return 'N/A';
  if (hash.length <= 20) return hash;

  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

const formatTypeLabel = (type) => {
  if (!type) return 'N/A';
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
