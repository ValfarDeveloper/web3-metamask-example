import React from 'react';
import './index.css';
import { handleCardClick, truncateAddress } from './behaviors';

const PatientCard = ({ patient, onSelectPatient }) => {
  return (
    <div
      className="patient-card"
      onClick={() => handleCardClick(patient.id, onSelectPatient)}
    >
      <div className="patient-card-header">
        <div>
          <div className="patient-name">{patient.name}</div>
          <div className="patient-id">{patient.id}</div>
        </div>
      </div>

      <div className="patient-info">
        <div className="patient-info-item">
          <span className="icon">📧</span>
          <span className="label">Email:</span>
          <span className="value">{patient.email}</span>
        </div>
        <div className="patient-info-item">
          <span className="icon">📱</span>
          <span className="label">Phone:</span>
          <span className="value">{patient.phone}</span>
        </div>
        <div className="patient-info-item">
          <span className="icon">👤</span>
          <span className="label">Gender:</span>
          <span className="value">{patient.gender}</span>
        </div>
        <div className="patient-info-item">
          <span className="icon">🎂</span>
          <span className="label">DOB:</span>
          <span className="value">{patient.dateOfBirth}</span>
        </div>
      </div>

      {patient.walletAddress && (
        <div className="patient-wallet">
          <span className="icon">🔐</span>
          <span className="address">{truncateAddress(patient.walletAddress)}</span>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
