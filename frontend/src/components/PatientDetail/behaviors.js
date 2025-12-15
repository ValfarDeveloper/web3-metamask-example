import { apiService } from '../../services/apiService';

/**
 * Fetches patient information and medical records in parallel
 * @param {string} patientId - Patient ID to fetch data for
 * @param {Object} state - Component state
 * @param {Function} setState - State setter function
 */
const fetchPatientData = async (patientId, state, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    // Fetch patient info and records in parallel for better performance
    const [patientData, recordsData] = await Promise.all([
      apiService.getPatient(patientId),
      apiService.getPatientRecords(patientId)
    ]);

    setState(prev => ({
      ...prev,
      patient: patientData,
      records: recordsData.records || [],
      loading: false
    }));
  } catch (err) {
    setState(prev => ({
      ...prev,
      error: err.message,
      loading: false
    }));
  }
};

/**
 * Formats date string to readable format (without time)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Maps medical record type to CSS class name
 * @param {string} type - Record type (e.g., 'Diagnostic', 'Treatment', 'Lab Results')
 * @returns {string} CSS class name for styling
 */
const getRecordTypeClass = (type) => {
  const typeMap = {
    'Diagnostic': 'diagnostic',
    'Treatment': 'treatment',
    'Lab Results': 'lab',
    'Lab': 'lab'
  };

  // Default to 'diagnostic' for unknown types
  return typeMap[type] || 'diagnostic';
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

export {
  fetchPatientData,
  formatDate,
  getRecordTypeClass,
  truncateHash
};
