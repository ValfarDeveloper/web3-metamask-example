import { useState, useEffect } from 'react';
import './index.css';
import PatientCard from './components/PatientCard';
import SidebarModal from '../GeneralElements/SidebarModal';
import PatientDetail from '../PatientDetail';
import {
  handleSearchDebounce,
  fetchPatients,
  handleItemsPerPageChange,
  handlePreviousPage,
  handleNextPage,
} from './behaviors';

const PatientList = () => {
  const [state, setState] = useState({
    patients: [],
    loading: false,
    isInitialLoad: true,
    error: null,
    searchInput: '',
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 10,
    pagination: null,
    selectedPatientId: null,
    isModalOpen: false,
  });

  useEffect(() => handleSearchDebounce(state.searchInput, setState), [state.searchInput]);

  useEffect(() => {
    fetchPatients(state, setState);
  }, [state.currentPage, state.itemsPerPage, state.searchTerm]);

  if (state.isInitialLoad && state.loading) {
    return (
      <div className="patient-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading patients...</span>
        </div>
      </div>
    );
  }

  if (state.isInitialLoad && state.error) {
    return (
      <div className="patient-list-container">
        <div className="error">
          ❌ Error: {state.error}
        </div>
      </div>
    );
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h1 className="patient-list-title">Patients Directory</h1>

        <div className="patient-list-controls">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              className="search-input"
              value={state.searchInput}
              onChange={(e) => setState(prev => ({ ...prev, searchInput: e.target.value }))}
            />
            {state.searchInput !== state.searchTerm && state.searchInput && (
              <span className="search-indicator">Searching...</span>
            )}
          </div>

          <div className="items-per-page-wrapper">
            <label className="items-per-page-label">Show:</label>
            <select
              className="items-per-page-select"
              value={state.itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value, setState)}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      <div className="patient-list">
        {state.patients.length === 0 ? (
          <div className="placeholder">
            <div className="placeholder-icon">🔍</div>
            <p>No patients found</p>
            {state.searchTerm && <p>Try adjusting your search terms</p>}
          </div>
        ) : (
          state.patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onSelectPatient={(id) => setState(prev => ({
                ...prev,
                selectedPatientId: id,
                isModalOpen: true
              }))}
            />
          ))
        )}
      </div>

      {state.pagination && state.pagination.totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-buttons">
            <button
              onClick={() => handlePreviousPage(state, setState)}
              disabled={state.currentPage <= 1}
            >
              ← Previous
            </button>
            <button
              onClick={() => handleNextPage(state, setState)}
              disabled={state.currentPage >= state.pagination.totalPages}
            >
              Next →
            </button>
          </div>

          <div className="pagination-info">
            <div className="pagination-info-current">
              Page <span className="highlight">{state.pagination.page}</span> of{' '}
              <span className="highlight">{state.pagination.totalPages}</span>
            </div>
            {state.pagination.total !== undefined && (
              <div className="pagination-info-total">
                {state.pagination.total} total patients
              </div>
            )}
          </div>
        </div>
      )}

      <SidebarModal
        isOpen={state.isModalOpen}
        onClose={() => setState(prev => ({
          ...prev,
          isModalOpen: false,
          selectedPatientId: null
        }))}
        title="Patient Details"
      >
        {state.selectedPatientId && (
          <PatientDetail patientId={state.selectedPatientId} />
        )}
      </SidebarModal>
    </div>
  );
};

export default PatientList;
