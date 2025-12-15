/**
 * Updates search input value in state
 * @param {string} value - New search input value
 * @param {Function} setState - State setter function
 */
const handleInputChange = (value, setState) => {
  setState(prev => ({ ...prev, searchInput: value }));
};

export {
  handleInputChange
};
