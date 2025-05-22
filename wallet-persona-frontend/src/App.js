import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(true);

  // Sample data for demo
  const sampleData = {
    success: true,
    address: "0xD9521775d6A2018747A5803DC9741472F640A9b8",
    details: {
      balance: "0.00023008245147874",
      age: 9, // days
      transactions: {
        inflow: [0.5, 0.2, 0.3, 0.6, 0.9, 0.4],
        outflow: [0.1, 0.1, 0.15, 0.1, 0.3, 0.15],
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      lastActivity: "22/05/2025",
      totalInflow: "19435500000000000.0000",
      totalOutflow: "0.0000"
    },
    persona: {
      category: "Blockchain Explorer",
      tags: ["Casual", "Low Balance"],
      bio: "A blockchain explorer venturing through the Ethereum ecosystem. Casual on the network. Frequently interacts with MATIC, POL.",
      activityLevel: "Casual",
      tradingFrequency: "Low",
      riskScore: 50,
      riskFactors: [
        "Moderate wallet age",
        "Some interaction with unverified tokens"
      ],
      assets: {
        eth: 100,
        tokens: ["MATIC", "POL"]
      },
      recommendations: {
        tokens: ["ETH", "LINK", "UNI", "ARB"],
        apps: ["Uniswap", "OpenSea", "Lido"]
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For demo, use sample data instead of actual API call
      // Uncomment the real API call for production
      /*
      const response = await axios.post('http://localhost:3001/api/analyze-wallet', { address });
      
      // Ensure recommendations is an array
      if (response.data && response.data.persona && !Array.isArray(response.data.persona.recommendations)) {
        response.data.persona.recommendations = [];
      }
      
      // Ensure tags is an array
      if (response.data && response.data.persona && !Array.isArray(response.data.persona.tags)) {
        response.data.persona.tags = [];
      }
      
      setWalletData(response.data);
      */
      
      // Using sample data for demo
      setWalletData(sampleData);
      setShowSearch(false);
      
    } catch (err) {
      console.error('Error analyzing wallet:', err);
      setError('Failed to analyze wallet. Please try again.');
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchForm = () => (
    <>
      <h1 className="text-center mb-4">Wallet Persona Analyzer</h1>
      <div className="card p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Enter Ethereum Wallet Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="form-text text-muted">
              Enter a valid Ethereum wallet address to analyze its on-chain persona.
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Analyzing...</span>
              </>
            ) : (
              'Analyze Wallet'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </>
  );

  const renderWalletPersona = () => {
    if (!walletData || !walletData.persona) return null;
    
    const { address, details, persona } = walletData;
    
    return (
      <>
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Wallet Persona Analysis</h1>
          <button 
            className="btn btn-outline-primary"
            onClick={() => setShowSearch(true)}
          >
            Analyze Another Wallet
          </button>
        </div>
        
        <div className="dashboard-grid">
          {/* Wallet Profile Card */}
          <div className="card">
            <div className="card-header wallet-profile-header">
              <i className="fas fa-wallet"></i>
              <h2>Wallet Profile</h2>
            </div>
            
            <div className="address-section">
              <div className="address-label">Address</div>
              <div className="address-value">{address}</div>
            </div>
            
            <div className="balance-section">
              <div className="address-label">Balance</div>
              <div className="balance-amount">
                <i className="fas fa-arrow-up"></i>
                {details?.balance} ETH (${(parseFloat(details?.balance || 0) * 3000).toFixed(2)})
              </div>
            </div>
            
            <div className="wallet-age">
              <i className="fas fa-calendar"></i>
              <span>{details?.age || 0} days</span>
            </div>
            
            <div className="persona-summary">
              "{persona?.bio || 'No bio available'}"
            </div>
          </div>
          
          {/* Activity Metrics Card */}
          <div className="card">
            <div className="card-header activity-metrics-header">
              <i className="fas fa-chart-line"></i>
              <h2>Activity Metrics</h2>
            </div>
            
            <div className="activity-metrics">
              <div className="mb-3">
                <strong>Activity Level</strong>
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  {persona?.activityLevel || 'Unknown'}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Trading Frequency</strong>
                <div className="d-flex align-items-center">
                  <i className="fas fa-exchange-alt text-success me-2"></i>
                  {persona?.tradingFrequency || 'Unknown'}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Last Activity</strong>
                <div>{details?.lastActivity || 'Unknown'}</div>
              </div>
              
              <div className="metrics-details">
                <div className="metric-item">
                  <span>Total Inflow</span>
                  <span className="text-success">{details?.totalInflow || '0'} ETH</span>
                </div>
                <div className="metric-item">
                  <span>Total Outflow</span>
                  <span className="text-danger">{details?.totalOutflow || '0'} ETH</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Categories & Tags Card */}
          <div className="card">
            <div className="card-header categories-header">
              <i className="fas fa-tags"></i>
              <h2>Categories & Tags</h2>
            </div>
            
            <div className="categories-section">
              <div>
                <strong>Primary Categories</strong>
                <div className="mt-2">{persona?.category || 'Unknown'}</div>
              </div>
              
              <div className="mt-3">
                <strong>Tags</strong>
                <div className="tag-container">
                  {Array.isArray(persona?.tags) && persona.tags.map((tag, index) => (
                    <span key={index} className={`tag ${tag === 'Casual' ? 'active' : tag === 'Low Balance' ? 'balance' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Risk Assessment Card */}
          <div className="card">
            <div className="card-header risk-header">
              <i className="fas fa-shield-alt"></i>
              <h2>Risk Assessment</h2>
            </div>
            
            <div className="risk-section">
              <div className="risk-score">{persona?.riskScore || 0}/100</div>
              
              <div className="risk-bar">
                <div className="risk-level" style={{ width: `${persona?.riskScore || 0}%` }}></div>
              </div>
              
              <div className="risk-label">Medium Risk</div>
              
              <div className="risk-factors">
                <strong>Risk Factors:</strong>
                <ul>
                  {Array.isArray(persona?.riskFactors) ? 
                    persona.riskFactors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    )) : 
                    <li>No risk factors available</li>
                  }
                </ul>
              </div>
            </div>
          </div>
          
          {/* Asset Distribution Card */}
          <div className="card">
            <div className="card-header asset-header">
              <i className="fas fa-chart-pie"></i>
              <h2>Asset Distribution</h2>
            </div>
            
            <div className="asset-distribution">
              <div className="donut-chart">
                {/* This would be a chart in a real app */}
                <div style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  background: '#d9534f',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '50px',
                    left: '50px'
                  }}></div>
                </div>
              </div>
              
              <div className="mt-3">
                <strong>Top Tokens</strong>
                <div className="tokens-list">
                  {Array.isArray(persona?.assets?.tokens) ? 
                    persona.assets.tokens.map((token, index) => (
                      <span key={index} className="token-badge">{token}</span>
                    )) : 
                    <span>No tokens available</span>
                  }
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommendations Card */}
          <div className="card">
            <div className="card-header recommendations-header">
              <i className="fas fa-lightbulb"></i>
              <h2>Recommendations</h2>
            </div>
            
            <div className="recommendations">
              <div className="tokens-to-explore">
                <div className="recommendation-type">
                  <i className="fas fa-arrow-circle-up me-2"></i>
                  Tokens to Explore
                </div>
                <div className="tokens-list">
                  {Array.isArray(persona?.recommendations?.tokens) ? 
                    persona.recommendations.tokens.map((token, index) => (
                      <div key={index}>{token}</div>
                    )) : 
                    <div>No token recommendations available</div>
                  }
                </div>
              </div>
              
              <div className="recommended-apps">
                <div className="recommendation-type">
                  <i className="fas fa-mobile-alt me-2"></i>
                  Recommended dApps
                </div>
                <ul className="app-list">
                  {Array.isArray(persona?.recommendations?.apps) ? 
                    persona.recommendations.apps.map((app, index) => (
                      <li key={index} className="app-item">{app}</li>
                    )) : 
                    <li className="app-item">No app recommendations available</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="container py-5">
      {showSearch ? renderSearchForm() : renderWalletPersona()}
    </div>
  );
}

export default App; 