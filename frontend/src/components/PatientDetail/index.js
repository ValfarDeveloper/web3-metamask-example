import { useState, useEffect } from 'react';
import './index.css';
import { fetchPatientData, formatDate, getRecordTypeClass, truncateHash } from './behaviors';

const PatientDetail = ({ patientId }) => {
  const [state, setState] = useState({
    patient: null,
    records: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData(patientId, state, setState);
    }
  }, [patientId]);

  if (state.loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (state.error || !state.patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">Error loading patient: {state.error || 'Patient not found'}</div>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-content">
        <div className="patient-info-section">
          <h2>Patient Information</h2>
          <div className="patient-info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{state.patient.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Patient ID</span>
              <span className="info-value">{state.patient.patientId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{state.patient.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{formatDate(state.patient.dateOfBirth)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gender</span>
              <span className="info-value">{state.patient.gender}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{state.patient.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{state.patient.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Wallet Address</span>
              <span className="info-value wallet">{state.patient.walletAddress}</span>
            </div>
          </div>
        </div>

        <div className="patient-records-section">
          <h2>Medical Records ({state.records.length})</h2>
          {state.records.length === 0 ? (
            <div className="placeholder">
              <p>No medical records found for this patient</p>
            </div>
          ) : (
            <div className="records-list">
              {state.records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <h3 className="record-title">{record.title}</h3>
                    <span className={`record-type ${getRecordTypeClass(record.type)}`}>
                      {record.type}
                    </span>
                  </div>
                  <p className="record-description">{record.description}</p>
                  <div className="record-meta">
                    <div className="record-meta-item">
                      <span>📅 {formatDate(record.date)}</span>
                    </div>
                    <div className="record-meta-item">
                      <span>👨‍⚕️ {record.doctor}</span>
                    </div>
                    <div className="record-meta-item">
                      <span>🏥 {record.hospital}</span>
                    </div>
                    <div className="record-meta-item">
                      <span className={`record-status ${record.status}`}>
                        {record.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="record-meta-item" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#667eea' }}>
                    <span>🔗 {truncateHash(record.blockchainHash)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
