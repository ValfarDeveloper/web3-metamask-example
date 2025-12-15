import './index.css';
import { handlePreviousPage, handleNextPage, getItemLabel } from './behaviors';

const Pagination = ({
  pagination,
  currentPage,
  onPreviousPage,
  onNextPage,
  itemLabel = 'item'
}) => {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-buttons">
        <button
          onClick={() => handlePreviousPage(currentPage, onPreviousPage)}
          disabled={currentPage <= 1}
        >
          ← Previous
        </button>
        <button
          onClick={() => handleNextPage(currentPage, pagination.totalPages, onNextPage)}
          disabled={currentPage >= pagination.totalPages}
        >
          Next →
        </button>
      </div>

      <div className="pagination-info">
        <div className="pagination-info-current">
          Page <span className="highlight">{pagination.page}</span> of{' '}
          <span className="highlight">{pagination.totalPages}</span>
        </div>
        {pagination.total !== undefined && (
          <div className="pagination-info-total">
            {pagination.total} total {getItemLabel(itemLabel, pagination.total)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
