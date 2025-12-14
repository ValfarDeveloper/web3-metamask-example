import { useState, useEffect } from 'react';
import './index.css';
import { fetchConsentAndPatientData } from './behaviors';
import { formatDate, truncateHash } from '../../behaviors';

const ConsentDetailView = ({ consentId }) => {
  const [state, setState] = useState({
    consent: null,
    patient: null,
    records: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (consentId) {
      fetchConsentAndPatientData(consentId, setState);
    }
  }, [consentId]);

  if (state.loading) {
    return (
      <div className="consent-detail-view">
        <div className="loading">Loading consent details...</div>
      </div>
    );
  }

  if (state.error || !state.consent || !state.patient) {
    return (
      <div className="consent-detail-view">
        <div className="error">Error loading consent details: {state.error}</div>
      </div>
    );
  }

  return (
    <div className="consent-detail-view">
      <div className="consent-detail-section">
        <h3>Consent Information</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Purpose</span>
            <span className="detail-value">{state.consent.purpose}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className={`consent-status-badge ${state.consent.status}`}>
              {state.consent.status}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created At</span>
            <span className="detail-value">{formatDate(state.consent.createdAt)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Wallet Address</span>
            <span className="detail-value wallet-text">{truncateHash(state.consent.walletAddress)}</span>
          </div>
          {state.consent.signature && (
            <div className="detail-item full-width">
              <span className="detail-label">Signature</span>
              <span className="detail-value signature-text">{truncateHash(state.consent.signature)}</span>
            </div>
          )}
          {state.consent.blockchainTxHash && (
            <div className="detail-item full-width">
              <span className="detail-label">Blockchain Transaction Hash</span>
              <span className="detail-value hash-text">{truncateHash(state.consent.blockchainTxHash)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="patient-detail-section">
        <h3>Patient Information</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name</span>
            <span className="detail-value">{state.patient.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Patient ID</span>
            <span className="detail-value">{state.patient.patientId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{state.patient.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{state.patient.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date of Birth</span>
            <span className="detail-value">{formatDate(state.patient.dateOfBirth)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gender</span>
            <span className="detail-value">{state.patient.gender}</span>
          </div>
          <div className="detail-item full-width">
            <span className="detail-label">Address</span>
            <span className="detail-value">{state.patient.address}</span>
          </div>
          <div className="detail-item full-width">
            <span className="detail-label">Wallet Address</span>
            <span className="detail-value wallet-text">{state.patient.walletAddress}</span>
          </div>
        </div>
      </div>

      {state.records.length > 0 && (
        <div className="records-detail-section">
          <h3>Medical Records ({state.records.length})</h3>
          <div className="records-summary">
            {state.records.map((record) => (
              <div key={record.id} className="record-summary-card">
                <div className="record-summary-header">
                  <span className="record-title">{record.title}</span>
                  <span className="record-type">{record.type}</span>
                </div>
                <div className="record-summary-meta">
                  <span>📅 {formatDate(record.date)}</span>
                  <span>👨‍⚕️ {record.doctor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentDetailView;
