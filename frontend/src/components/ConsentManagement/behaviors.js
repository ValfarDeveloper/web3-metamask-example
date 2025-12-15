import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

// Timer for search input debouncing
let searchDebounceTimer = null;

/**
 * Fetches consents from API with filtering, searching, and pagination
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const fetchConsents = async (state, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    // Convert 'all' filter to null for API call
    const status = state.filterStatus === 'all' ? null : state.filterStatus;
    const response = await apiService.getConsents(null, status);

    let filteredConsents = response.consents || [];

    // Client-side search filtering by patient ID, name, or purpose
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filteredConsents = filteredConsents.filter(consent => {
        const patient = state.patientsMap[consent.patientId];
        const patientName = patient ? patient.name.toLowerCase() : '';
        return (
          consent.patientId.toLowerCase().includes(searchLower) ||
          patientName.includes(searchLower) ||
          consent.purpose.toLowerCase().includes(searchLower)
        );
      });
    }

    // Client-side pagination calculation
    const totalItems = filteredConsents.length;
    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const paginatedConsents = filteredConsents.slice(startIndex, endIndex);

    setState(prev => ({
      ...prev,
      consents: paginatedConsents,
      allConsents: filteredConsents,
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
    toast.error(`Failed to fetch consents: ${err.message}`);
  }
};

/**
 * Fetches all patients and creates a lookup map for quick access
 * @param {Function} setState - State setter function
 */
const fetchPatientsMap = async (setState) => {
  try {
    const response = await apiService.getPatients(1, 1000);
    // Build patient ID to patient object mapping
    const patientsMap = {};
    response.patients.forEach(patient => {
      patientsMap[patient.id] = patient;
    });
    setState(prev => ({ ...prev, patientsMap }));
  } catch (err) {
    console.error('Error fetching patients:', err);
  }
};

/**
 * Loads patient options for searchable dropdown
 * @param {string} inputValue - Search input value
 * @returns {Array} Array of patient objects
 */
const loadPatientOptions = async (inputValue) => {
  try {
    const response = await apiService.getPatients(1, 50, inputValue);
    return response.patients || [];
  } catch (err) {
    console.error('Error loading patients:', err);
    return [];
  }
};

/**
 * Formats patient object for dropdown display
 * @param {Object} patient - Patient object
 * @returns {Object} Formatted option with value, label, and patient data
 */
const formatPatientOption = (patient) => ({
  value: patient.id,
  label: `${patient.name} (Patient ID: ${patient.patientId})`,
  patient: patient
});

/**
 * Creates new consent with MetaMask signature
 * @param {Event} e - Form submit event
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 * @param {string} account - Connected wallet address
 * @param {Function} signMessage - MetaMask sign function
 */
const handleCreateConsent = async (e, state, setState, account, signMessage) => {
  e.preventDefault();

  if (!account) {
    toast.warning('Please connect your wallet first');
    return;
  }

  if (!state.formData.selectedPatient || !state.formData.purpose) {
    toast.warning('Please fill in all fields');
    return;
  }

  setState(prev => ({ ...prev, creating: true }));

  try {
    // Create consent message and request MetaMask signature
    const message = `I consent to: ${state.formData.purpose} for patient: ${state.formData.selectedPatient.patient.patientId}`;
    const signature = await signMessage(message);

    const consentData = {
      patientId: state.formData.selectedPatient.value,
      purpose: state.formData.purpose,
      walletAddress: account,
      signature: signature
    };

    await apiService.createConsent(consentData);

    // Reset form and refresh consents list
    setState(prev => ({
      ...prev,
      showCreateForm: false,
      formData: { selectedPatient: null, purpose: '' },
      creating: false,
      currentPage: 1
    }));

    await fetchConsents(state, setState);

    toast.success('Consent created successfully!');
  } catch (err) {
    setState(prev => ({ ...prev, creating: false }));
    toast.error(`Failed to create consent: ${err.message}`);
  }
};

/**
 * Updates consent status (pending → active/revoked)
 * @param {string} consentId - Consent ID to update
 * @param {string} newStatus - New status value
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const handleUpdateStatus = async (consentId, newStatus, state, setState) => {
  try {
    // Generate mock blockchain transaction hash for active consents
    const blockchainTxHash = newStatus === 'active'
      ? `0x${Math.random().toString(16).substring(2, 66)}`
      : null;

    await apiService.updateConsent(consentId, {
      status: newStatus,
      blockchainTxHash
    });

    await fetchConsents(state, setState);

    toast.success(`Consent status updated to ${newStatus}`);
  } catch (err) {
    toast.error(`Failed to update consent: ${err.message}`);
  }
};

/**
 * Changes consent status filter and resets to first page
 * @param {string} newFilter - Filter value ('all', 'active', 'pending', 'revoked')
 * @param {Function} setState - State setter function
 */
const handleFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterStatus: newFilter, currentPage: 1 }));
};

/**
 * Toggles create consent form visibility
 * @param {Function} setState - State setter function
 */
const handleToggleForm = (setState) => {
  setState(prev => ({
    ...prev,
    showCreateForm: !prev.showCreateForm,
    formData: { selectedPatient: null, purpose: '' }
  }));
};

/**
 * Updates form field value
 * @param {string} field - Field name to update
 * @param {*} value - New field value
 * @param {Function} setState - State setter function
 */
const handleFormChange = (field, value, setState) => {
  setState(prev => ({
    ...prev,
    formData: { ...prev.formData, [field]: value }
  }));
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
 * Opens consent detail modal
 * @param {string} consentId - ID of consent to view
 * @param {Function} setState - State setter function
 */
const handleConsentClick = (consentId, setState) => {
  setState(prev => ({
    ...prev,
    selectedConsentId: consentId,
    isModalOpen: true
  }));
};

/**
 * Closes consent detail modal
 * @param {Function} setState - State setter function
 */
const handleCloseModal = (setState) => {
  setState(prev => ({
    ...prev,
    selectedConsentId: null,
    isModalOpen: false
  }));
};

/**
 * Formats date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Truncates long hash strings for display
 * @param {string} hash - Full hash string
 * @returns {string} Truncated hash (first 10 + last 8 chars) or 'N/A'
 */
const truncateHash = (hash) => {
  if (!hash) return 'N/A';
  if (hash.length <= 20) return hash;

  return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
};

export {
  fetchConsents,
  fetchPatientsMap,
  loadPatientOptions,
  formatPatientOption,
  handleCreateConsent,
  handleUpdateStatus,
  handleFilterChange,
  handleToggleForm,
  handleFormChange,
  handleSearchDebounce,
  handleItemsPerPageChange,
  handlePreviousPage,
  handleNextPage,
  handleConsentClick,
  handleCloseModal,
  formatDate,
  truncateHash
};
