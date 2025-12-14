import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

let searchDebounceTimer = null;

const fetchConsents = async (state, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const status = state.filterStatus === 'all' ? null : state.filterStatus;
    const response = await apiService.getConsents(null, status);

    let filteredConsents = response.consents || [];

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

const fetchPatientsMap = async (setState) => {
  try {
    const response = await apiService.getPatients(1, 1000);
    const patientsMap = {};
    response.patients.forEach(patient => {
      patientsMap[patient.id] = patient;
    });
    setState(prev => ({ ...prev, patientsMap }));
  } catch (err) {
    console.error('Error fetching patients:', err);
  }
};

const loadPatientOptions = async (inputValue) => {
  try {
    const response = await apiService.getPatients(1, 50, inputValue);
    return response.patients || [];
  } catch (err) {
    console.error('Error loading patients:', err);
    return [];
  }
};

const formatPatientOption = (patient) => ({
  value: patient.id,
  label: `${patient.name} (Patient ID: ${patient.patientId})`,
  patient: patient
});

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
    const message = `I consent to: ${state.formData.purpose} for patient: ${state.formData.selectedPatient.patient.patientId}`;
    const signature = await signMessage(message);

    const consentData = {
      patientId: state.formData.selectedPatient.value,
      purpose: state.formData.purpose,
      walletAddress: account,
      signature: signature
    };

    await apiService.createConsent(consentData);

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

const handleUpdateStatus = async (consentId, newStatus, state, setState) => {
  try {
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

const handleFilterChange = (newFilter, setState) => {
  setState(prev => ({ ...prev, filterStatus: newFilter, currentPage: 1 }));
};

const handleToggleForm = (setState) => {
  setState(prev => ({
    ...prev,
    showCreateForm: !prev.showCreateForm,
    formData: { selectedPatient: null, purpose: '' }
  }));
};

const handleFormChange = (field, value, setState) => {
  setState(prev => ({
    ...prev,
    formData: { ...prev.formData, [field]: value }
  }));
};

const handleSearchDebounce = (searchInput, setState) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    setState(prev => ({ ...prev, searchTerm: searchInput, currentPage: 1 }));
  }, 500);
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

const handleConsentClick = (consentId, setState) => {
  setState(prev => ({
    ...prev,
    selectedConsentId: consentId,
    isModalOpen: true
  }));
};

const handleCloseModal = (setState) => {
  setState(prev => ({
    ...prev,
    selectedConsentId: null,
    isModalOpen: false
  }));
};

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
