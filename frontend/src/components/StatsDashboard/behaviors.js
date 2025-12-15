import { apiService } from '../../services/apiService';
import { toast } from 'react-toastify';

/**
 * Fetches platform statistics from API
 * @param {Function} setState - State setter function
 */
const fetchStats = async (setState) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const stats = await apiService.getStats();

    setState(prev => ({
      ...prev,
      stats,
      loading: false,
      isInitialLoad: false
    }));
  } catch (err) {
    setState(prev => ({
      ...prev,
      error: err.message,
      loading: false,
      isInitialLoad: false
    }));
    toast.error(`Failed to fetch statistics: ${err.message}`);
  }
};

/**
 * Prepares data for main platform overview bar chart
 * @param {Object} stats - Statistics object from API
 * @returns {Array} Array of chart data objects with name, value, color, and icon
 */
const prepareChartData = (stats) => {
  if (!stats) return [];

  return [
    {
      name: 'Patients',
      value: stats.totalPatients,
      color: '#667eea',
      icon: '👥'
    },
    {
      name: 'Records',
      value: stats.totalRecords,
      color: '#764ba2',
      icon: '📋'
    },
    {
      name: 'Consents',
      value: stats.totalConsents,
      color: '#f093fb',
      icon: '✅'
    },
    {
      name: 'Transactions',
      value: stats.totalTransactions,
      color: '#4facfe',
      icon: '💳'
    }
  ];
};

/**
 * Prepares data for consent status pie chart
 * @param {Object} stats - Statistics object from API
 * @returns {Array} Array of consent status data, filtered to exclude zero values
 */
const prepareConsentChartData = (stats) => {
  if (!stats) return [];

  return [
    {
      name: 'Active',
      value: stats.activeConsents,
      color: '#10b981',
      icon: '✓'
    },
    {
      name: 'Pending',
      value: stats.pendingConsents,
      color: '#f59e0b',
      icon: '⏳'
    },
    {
      name: 'Other',
      value: stats.totalConsents - stats.activeConsents - stats.pendingConsents,
      color: '#6b7280',
      icon: '•'
    }
  ].filter(item => item.value > 0); // Exclude zero values from chart
};

/**
 * Returns configuration object for stat card display
 * @param {string} key - Stat key (e.g., 'totalPatients', 'activeConsents')
 * @param {number} value - Stat value
 * @param {Object} stats - Full statistics object for percentage calculations
 * @returns {Object} Config object with label, icon, gradient, description, and optional percentage
 */
const getStatCardConfig = (key, value, stats) => {
  const configs = {
    totalPatients: {
      label: 'Total Patients',
      icon: '👥',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Registered in the platform'
    },
    totalRecords: {
      label: 'Medical Records',
      icon: '📋',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Total health records stored'
    },
    totalConsents: {
      label: 'Total Consents',
      icon: '✅',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Consent agreements created'
    },
    activeConsents: {
      label: 'Active Consents',
      icon: '✓',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Currently active agreements',
      percentage: stats ? Math.round((value / stats.totalConsents) * 100) : 0
    },
    pendingConsents: {
      label: 'Pending Consents',
      icon: '⏳',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Awaiting activation',
      percentage: stats ? Math.round((value / stats.totalConsents) * 100) : 0
    },
    totalTransactions: {
      label: 'Blockchain Transactions',
      icon: '💳',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      description: 'Recorded on blockchain'
    }
  };

  // Return default config for unknown keys
  return configs[key] || {
    label: key,
    icon: '📊',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Platform metric'
  };
};

/**
 * Formats large numbers with K/M suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., '1.5K', '2.3M', or '123')
 */
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export {
  fetchStats,
  prepareChartData,
  prepareConsentChartData,
  getStatCardConfig,
  formatNumber
};
