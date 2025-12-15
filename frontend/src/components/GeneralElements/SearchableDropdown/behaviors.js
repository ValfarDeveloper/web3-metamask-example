/**
 * Loads and formats dropdown options asynchronously based on search input
 * @param {string} inputValue - User's search input
 * @param {Function} fetchFunction - Async function to fetch data from API
 * @param {Function} formatOption - Function to format raw data into option objects
 * @returns {Promise<Array>} Array of formatted options for dropdown
 */
const loadOptions = async (inputValue, fetchFunction, formatOption) => {
  try {
    const data = await fetchFunction(inputValue);
    // Transform raw data into react-select format {value, label, ...}
    return data.map(formatOption);
  } catch (error) {
    console.error('Error loading options:', error);
    return [];
  }
};

/**
 * Handles dropdown selection change
 * @param {Object|null} selectedOption - Selected option object or null if cleared
 * @param {Function} onChange - Callback to propagate selection change
 */
const handleChange = (selectedOption, onChange) => {
  onChange(selectedOption);
};

export {
  loadOptions,
  handleChange
};
