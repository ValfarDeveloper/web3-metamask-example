const loadOptions = async (inputValue, fetchFunction, formatOption) => {
  try {
    const data = await fetchFunction(inputValue);
    return data.map(formatOption);
  } catch (error) {
    console.error('Error loading options:', error);
    return [];
  }
};

const handleChange = (selectedOption, onChange) => {
  onChange(selectedOption);
};

export {
  loadOptions,
  handleChange
};
