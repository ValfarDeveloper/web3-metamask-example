import { useState, useEffect } from 'react';
import './index.css';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  fetchStats,
  prepareChartData,
  prepareConsentChartData,
  getStatCardConfig,
  formatNumber
} from './behaviors';

const StatsDashboard = () => {
  const [state, setState] = useState({
    stats: null,
    loading: true,
    isInitialLoad: true,
    error: null
  });

  useEffect(() => {
    fetchStats(setState);
  }, []);

  if (state.isInitialLoad && state.loading) {
    return (
      <div className="stats-dashboard-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (state.error || !state.stats) {
    return (
      <div className="stats-dashboard-container">
        <div className="error">
          Error loading statistics: {state.error || 'No data available'}
        </div>
      </div>
    );
  }

  const chartData = prepareChartData(state.stats);
  const consentChartData = prepareConsentChartData(state.stats);

  return (
    <div className="stats-dashboard-container">
      <div className="dashboard-header">
        <h2>Platform Statistics</h2>
        <p className="dashboard-subtitle">
          Real-time overview of your healthcare data management platform
        </p>
      </div>

      <div className="stats-grid">
        {Object.entries(state.stats).map(([key, value]) => {
          const config = getStatCardConfig(key, value, state.stats);
          return (
            <div key={key} className="stat-card">
              <div className="stat-card-inner" style={{ background: config.gradient }}>
                <div className="stat-icon">{config.icon}</div>
                <div className="stat-content">
                  <div className="stat-label">{config.label}</div>
                  <div className="stat-value">{formatNumber(value)}</div>
                  <div className="stat-description">{config.description}</div>
                  {config.percentage !== undefined && (
                    <div className="stat-percentage">{config.percentage}% of total</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Platform Overview</h3>
            <p>Distribution of key metrics across the platform</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#4a5568"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              />
              <YAxis
                stroke="#4a5568"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontWeight: 700, color: '#2d3748' }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: '0.875rem', fontWeight: 600 }}
              />
              <Bar
                dataKey="value"
                fill="#667eea"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Consent Status Distribution</h3>
            <p>Breakdown of consent agreements by status</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={consentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {consentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.875rem', fontWeight: 600 }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <h4>Data Integrity</h4>
            <p>
              All {state.stats.totalRecords} medical records are securely stored and verified
              on the blockchain with {state.stats.totalTransactions} transactions.
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🔒</div>
          <div className="summary-content">
            <h4>Consent Management</h4>
            <p>
              {state.stats.activeConsents} active consents out of {state.stats.totalConsents} total,
              ensuring patient privacy and data control.
            </p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚡</div>
          <div className="summary-content">
            <h4>Platform Activity</h4>
            <p>
              Managing {state.stats.totalPatients} patients with comprehensive health data
              and consent tracking capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
