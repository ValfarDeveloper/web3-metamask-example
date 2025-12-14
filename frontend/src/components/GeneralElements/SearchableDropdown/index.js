import AsyncSelect from 'react-select/async';
import './index.css';
import { loadOptions, handleChange } from './behaviors';

const SearchableDropdown = ({
  value,
  onChange,
  fetchFunction,
  formatOption,
  placeholder = "Search...",
  isDisabled = false,
  isClearable = true
}) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '10px',
      border: `2px solid ${state.isFocused ? '#667eea' : '#e2e8f0'}`,
      boxShadow: state.isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none',
      padding: '0.25rem',
      background: state.isDisabled ? '#f7fafc' : '#ffffff',
      '&:hover': {
        borderColor: '#667eea'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#667eea'
        : state.isFocused
        ? '#f7fafc'
        : 'white',
      color: state.isSelected ? 'white' : '#2d3748',
      cursor: 'pointer',
      padding: '0.75rem 1rem',
      '&:active': {
        backgroundColor: '#5568d3'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      border: '2px solid #e2e8f0',
      overflow: 'hidden'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a0aec0'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#2d3748'
    })
  };

  return (
    <AsyncSelect
      value={value}
      onChange={(option) => handleChange(option, onChange)}
      loadOptions={(inputValue) => loadOptions(inputValue, fetchFunction, formatOption)}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      styles={customStyles}
      className="searchable-dropdown"
      classNamePrefix="searchable-dropdown"
      defaultOptions
      cacheOptions
    />
  );
};

export default SearchableDropdown;
