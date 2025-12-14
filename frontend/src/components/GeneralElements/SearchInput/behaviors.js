const handleInputChange = (value, setState) => {
  setState(prev => ({ ...prev, searchInput: value }));
};

export {
  handleInputChange
};
