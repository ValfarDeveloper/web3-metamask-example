import { apiService } from '../../services/apiService';

const fetchPatientData = async (patientId, state, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getRecordTypeClass = (type) => {
  const typeMap = {
    'Diagnostic': 'diagnostic',
    'Treatment': 'treatment',
    'Lab Results': 'lab',
    'Lab': 'lab'
  };

  return typeMap[type] || 'diagnostic';
};

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
