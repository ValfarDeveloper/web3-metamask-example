import { apiService } from '../../../../services/apiService';

const fetchConsentAndPatientData = async (consentId, setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const consent = await apiService.getConsent(consentId);
    const patient = await apiService.getPatient(consent.patientId);
    const recordsResponse = await apiService.getPatientRecords(consent.patientId);

    setState(prev => ({
      ...prev,
      consent,
      patient,
      records: recordsResponse.records || [],
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

export {
  fetchConsentAndPatientData
};
