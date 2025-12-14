const handleCardClick = (patientId, onSelectPatient) => {
  if (onSelectPatient) {
    onSelectPatient(patientId);
  }
};

const truncateAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export { handleCardClick, truncateAddress };
