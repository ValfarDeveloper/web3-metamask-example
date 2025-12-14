import { useState, useEffect } from 'react';
import './index.css';
import SearchInput from '../GeneralElements/SearchInput';
import {
  fetchTransactions,
  handleSearchDebounce,
  handleFilterByWalletToggle,
  handleTypeFilterChange,
  handleStatusFilterChange,
  handleItemsPerPageChange,
  handlePreviousPage,
  handleNextPage,
  formatDate,
  formatAddress,
  truncateHash,
  formatTypeLabel
} from './behaviors';

const TransactionHistory = ({ account }) => {
  const [state, setState] = useState({
    transactions: [],
    allTransactions: [],
    loading: true,
    isInitialLoad: true,
    error: null,
    filterByWallet: false,
    filterType: 'all',
    filterStatus: 'all',
    searchInput: '',
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 10,
    limit: 20,
    pagination: null
  });

  useEffect(() => handleSearchDebounce(state.searchInput, setState), [state.searchInput]);

  useEffect(() => {
    fetchTransactions(state, setState, account);
  }, [
    account,
    state.filterByWallet,
    state.filterType,
    state.filterStatus,
    state.searchTerm,
    state.currentPage,
    state.itemsPerPage,
    state.limit
  ]);

  if (state.isInitialLoad && state.loading) {
    return (
      <div className="transaction-history-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading transactions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history-container">
      <div className="transaction-header">
        <h2>Transaction History</h2>
        {account && (
          <div className="wallet-filter-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={state.filterByWallet}
                onChange={() => handleFilterByWalletToggle(setState)}
              />
              <span className="toggle-text">Filter by my wallet</span>
              <span className="wallet-address">{formatAddress(account)}</span>
            </label>
          </div>
        )}
      </div>

      <div className="transaction-controls">
        <SearchInput
          value={state.searchInput}
          onChange={(value) => setState(prev => ({ ...prev, searchInput: value }))}
          placeholder="Search by ID, address, type, or hash..."
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

      <div className="transaction-filters">
        <div className="filter-group">
          <span className="filter-group-label">Type:</span>
          <button
            className={state.filterType === 'all' ? 'active' : ''}
            onClick={() => handleTypeFilterChange('all', setState)}
          >
            All
          </button>
          <button
            className={state.filterType === 'consent_approval' ? 'active' : ''}
            onClick={() => handleTypeFilterChange('consent_approval', setState)}
          >
            Consent Approval
          </button>
          <button
            className={state.filterType === 'data_access' ? 'active' : ''}
            onClick={() => handleTypeFilterChange('data_access', setState)}
          >
            Data Access
          </button>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Status:</span>
          <button
            className={state.filterStatus === 'all' ? 'active' : ''}
            onClick={() => handleStatusFilterChange('all', setState)}
          >
            All
          </button>
          <button
            className={state.filterStatus === 'confirmed' ? 'active' : ''}
            onClick={() => handleStatusFilterChange('confirmed', setState)}
          >
            Confirmed
          </button>
          <button
            className={state.filterStatus === 'pending' ? 'active' : ''}
            onClick={() => handleStatusFilterChange('pending', setState)}
          >
            Pending
          </button>
        </div>
      </div>

      <div className="transactions-list">
        {state.transactions.length === 0 ? (
          <div className="placeholder">
            <div className="placeholder-icon">📊</div>
            <p>No transactions found</p>
            {(state.filterType !== 'all' || state.filterStatus !== 'all' || state.searchTerm || state.filterByWallet) && (
              <p>Try adjusting your filters or search terms</p>
            )}
          </div>
        ) : (
          state.transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="transaction-header-info">
                <span className={`transaction-type ${tx.type}`}>
                  {formatTypeLabel(tx.type)}
                </span>
                <span className={`transaction-status ${tx.status}`}>
                  {tx.status === 'confirmed' && '✓ '}
                  {tx.status}
                </span>
              </div>

              <div className="transaction-details">
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">From</span>
                  <span className="transaction-detail-value address">
                    {formatAddress(tx.from)}
                  </span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">To</span>
                  <span className="transaction-detail-value address">
                    {formatAddress(tx.to)}
                  </span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Amount</span>
                  <span className="transaction-amount">
                    {tx.amount} {tx.currency}
                  </span>
                </div>
                <div className="transaction-detail-item">
                  <span className="transaction-detail-label">Timestamp</span>
                  <span className="transaction-timestamp">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
                <div className="transaction-detail-item full-width">
                  <span className="transaction-detail-label">Blockchain Hash</span>
                  <span className="transaction-detail-value hash">
                    {truncateHash(tx.blockchainTxHash)}
                  </span>
                </div>
                {tx.blockNumber && (
                  <div className="transaction-detail-item">
                    <span className="transaction-detail-label">Block Number</span>
                    <span className="transaction-detail-value">
                      {tx.blockNumber.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
                {state.pagination.total} total transactions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
