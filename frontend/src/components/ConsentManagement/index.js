import { useState, useEffect } from 'react';
import './index.css';
import { useWeb3 } from '../../hooks/useWeb3';
import SearchInput from '../GeneralElements/SearchInput';
import SearchableDropdown from '../GeneralElements/SearchableDropdown';
import SidebarModal from '../GeneralElements/SidebarModal';
import ConsentDetailView from './components/ConsentDetailView';
import {
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
} from './behaviors';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [state, setState] = useState({
    consents: [],
    allConsents: [],
    patientsMap: {},
    loading: true,
    isInitialLoad: true,
    error: null,
    filterStatus: 'all',
    searchInput: '',
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 10,
    pagination: null,
    showCreateForm: false,
    creating: false,
    selectedConsentId: null,
    isModalOpen: false,
    formData: {
      selectedPatient: null,
      purpose: ''
    }
  });

  useEffect(() => {
    fetchPatientsMap(setState);
  }, []);

  useEffect(() => handleSearchDebounce(state.searchInput, setState), [state.searchInput]);

  useEffect(() => {
    if (Object.keys(state.patientsMap).length > 0) {
      fetchConsents(state, setState);
    }
  }, [state.filterStatus, state.searchTerm, state.currentPage, state.itemsPerPage, state.patientsMap]);

  if (state.isInitialLoad && state.loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading consents...</span>
        </div>
      </div>
    );
  }

  const selectedConsent = state.consents.find(c => c.id === state.selectedConsentId);

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => handleToggleForm(setState)}
          disabled={!account}
        >
          {state.showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {state.showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={(e) => handleCreateConsent(e, state, setState, account, signMessage)}>
            <div className="form-group">
              <label>Select Patient</label>
              <SearchableDropdown
                value={state.formData.selectedPatient}
                onChange={(option) => handleFormChange('selectedPatient', option, setState)}
                fetchFunction={loadPatientOptions}
                formatOption={formatPatientOption}
                placeholder="Search patients by name or ID..."
                isDisabled={state.creating}
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={state.formData.purpose}
                onChange={(e) => handleFormChange('purpose', e.target.value, setState)}
                required
                disabled={state.creating}
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">Research Study Participation</option>
                <option value="Data Sharing with Research Institution">Data Sharing with Research Institution</option>
                <option value="Third-Party Analytics Access">Third-Party Analytics Access</option>
                <option value="Insurance Provider Access">Insurance Provider Access</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={state.creating}>
              {state.creating ? 'Signing & Creating...' : 'Sign & Create Consent'}
            </button>
          </form>
        </div>
      )}

      <div className="consent-controls">
        <SearchInput
          value={state.searchInput}
          onChange={(value) => setState(prev => ({ ...prev, searchInput: value }))}
          placeholder="Search by patient name, ID, or purpose..."
          isSearching={state.searchInput !== state.searchTerm && state.searchInput}
        />

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

      <div className="consent-filters">
        <button
          className={state.filterStatus === 'all' ? 'active' : ''}
          onClick={() => handleFilterChange('all', setState)}
        >
          All
        </button>
        <button
          className={state.filterStatus === 'active' ? 'active' : ''}
          onClick={() => handleFilterChange('active', setState)}
        >
          Active
        </button>
        <button
          className={state.filterStatus === 'pending' ? 'active' : ''}
          onClick={() => handleFilterChange('pending', setState)}
        >
          Pending
        </button>
        <button
          className={state.filterStatus === 'revoked' ? 'active' : ''}
          onClick={() => handleFilterChange('revoked', setState)}
        >
          Revoked
        </button>
      </div>

      <div className="consents-list">
        {state.consents.length === 0 ? (
          <div className="placeholder">
            <div className="placeholder-icon">📋</div>
            <p>No consents found</p>
            {(state.filterStatus !== 'all' || state.searchTerm) && (
              <p>Try adjusting your filters or search terms</p>
            )}
          </div>
        ) : (
          state.consents.map((consent) => {
            const patient = state.patientsMap[consent.patientId];
            return (
              <div
                key={consent.id}
                className="consent-card"
                onClick={() => handleConsentClick(consent.id, setState)}
              >
                <div className="consent-header-info">
                  <div className="consent-purpose">{consent.purpose}</div>
                  <span className={`consent-status ${consent.status}`}>
                    {consent.status}
                  </span>
                </div>

                <div className="consent-details">
                  {patient && (
                    <div className="consent-detail-item">
                      <strong>Patient:</strong>
                      <span>{patient.name}</span>
                    </div>
                  )}
                  <div className="consent-detail-item">
                    <strong>Patient ID:</strong>
                    <span>{consent.patientId}</span>
                  </div>
                  <div className="consent-detail-item">
                    <strong>Wallet:</strong>
                    <span className="consent-wallet">{truncateHash(consent.walletAddress)}</span>
                  </div>
                  <div className="consent-detail-item">
                    <strong>Created:</strong>
                    <span>{formatDate(consent.createdAt)}</span>
                  </div>
                  {consent.blockchainTxHash && (
                    <div className="consent-detail-item">
                      <strong>Blockchain Hash:</strong>
                      <span className="consent-tx-hash">{truncateHash(consent.blockchainTxHash)}</span>
                    </div>
                  )}
                </div>

                {consent.status === 'pending' && (
                  <div className="consent-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(consent.id, 'active', state, setState);
                      }}
                    >
                      Activate
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateStatus(consent.id, 'revoked', state, setState);
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            );
          })
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
                {state.pagination.total} total consents
              </div>
            )}
          </div>
        </div>
      )}

      <SidebarModal
        isOpen={state.isModalOpen}
        onClose={() => handleCloseModal(setState)}
        title={selectedConsent ? `Consent: ${selectedConsent.purpose}` : 'Consent Details'}
      >
        {state.selectedConsentId && (
          <ConsentDetailView consentId={state.selectedConsentId} />
        )}
      </SidebarModal>
    </div>
  );
};

export default ConsentManagement;
