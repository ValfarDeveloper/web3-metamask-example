import './index.css';
import { handleInputChange } from './behaviors';

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  isSearching = false,
  disabled = false
}) => {
  return (
    <div className="search-input-wrapper">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {isSearching && (
        <span className="search-indicator">Searching...</span>
      )}
    </div>
  );
};

export default SearchInput;
