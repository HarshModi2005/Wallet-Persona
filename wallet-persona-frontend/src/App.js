import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MainPersonaSection from './components/MainPersonaSection';
import BasicWalletInfo from './components/BasicWalletInfo';
import DetailedAnalysisSection from './components/DetailedAnalysisSection';
import NftAnalysisSection from './components/NftAnalysisSection';
import AssetDistributionChart from './components/AssetDistributionChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWallet, faArrowUp, faCalendar, faChartLine, faInfoCircle,
  faExchangeAlt, faTags, faShieldAlt, faChartPie, faLightbulb,
  faArrowCircleUp, faMobileAlt, faSearch, faSync, faSpinner,
  faFileInvoiceDollar, faClock, faUsers, faNetworkWired, faHandHoldingUsd, faBalanceScale
} from '@fortawesome/free-solid-svg-icons';

function App() {
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(true);

  // Refs for sections to observe
  const mainPersonaRef = useRef(null);
  const basicInfoRef = useRef(null);
  const nftAnalysisRef = useRef(null);
  const analyticsDashboardRef = useRef(null); // For the new "Analytics Section"
  // DetailedTransactionAnalysis is inside analyticsDashboardRef, so it might not need its own direct observer
  // or it could if its content is also animated separately. For now, assume parent handles it.
  // const detailedTxAnalysisRef = useRef(null); 
  // const walletJourneyRef = useRef(null); // For future Wallet Journey section

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const observerOptions = {
      root: null, // relative to document viewport
      rootMargin: '0px',
      threshold: 0.1 // 10% of the item is visible
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
        // Optional: remove 'visible' when it goes out of view if you want animation to replay
        // else {
        //   entry.target.classList.remove('visible');
        // }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = [
      mainPersonaRef.current,
      basicInfoRef.current,
      nftAnalysisRef.current,
      analyticsDashboardRef.current,
      // detailedTxAnalysisRef.current,
      // walletJourneyRef.current
    ].filter(Boolean); // Filter out null refs if sections aren't rendered

    sections.forEach(section => {
      observer.observe(section);
    });

    return () => { // Cleanup observer on component unmount
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, [walletData]); // Re-run when walletData changes, so new sections are observed

  const handleAnalyze = async () => {
    if (!address) {
      setError('Please enter a wallet address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/analyze-wallet`, { address });
      setWalletData(response.data);
      setShowSearch(false); 
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError(err.response?.data?.error || 'Failed to fetch wallet data. Please check the address or try again later.');
      setShowSearch(true); 
      setWalletData(null);
    }
    setLoading(false);
  };

  const handleNewSearch = () => {
    setAddress('');
    setWalletData(null);
    setError(null);
    setLoading(false);
    setShowSearch(true);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const addressFromQuery = queryParams.get('address');
    if (addressFromQuery) {
      setAddress(addressFromQuery);
      setTimeout(() => handleAnalyze(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && showSearch) {
    return (
      <div className="container mt-4 text-center app-global-loader">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="mb-3 app-spinner-icon" style={{ color: 'var(--bs-info)' }} />
        <h4 style={{ color: 'var(--bs-light)' }}>Analyzing Wallet...</h4>
        <p className="text-muted">Fetching on-chain data and generating persona. This might take a moment.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 app-container">
      <header className="text-center mb-4 app-header">
        <div className="logo-title-container">
          {/* Assuming logo is in public folder */}
          <img src={process.env.PUBLIC_URL + '/logo_transparent.png'} alt="Wallet Persona Logo" className="app-logo" />
          <h1 style={{ color: 'var(--bs-light)' }}>Wallet Persona Engine</h1>
        </div>
        <p className="lead app-lead-text" style={{ color: 'var(--bs-gray-400)' }}>Enter a wallet address to generate its on-chain persona and detailed analysis.</p>
      </header>

      {showSearch && !loading && (
        <div className="full-page-section visible">
          <div className="container">
            <div className="row justify-content-center mb-4 search-form-container">
              <div className="col-md-8 col-lg-6">
                <div className="input-group input-group-lg shadow-sm">
                  <span className="input-group-text search-icon-wallet"><FontAwesomeIcon icon={faWallet} /></span>
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Enter Wallet Address (e.g., 0x... or ENS)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                  <button className="btn btn-primary search-button" onClick={handleAnalyze} >
                    <FontAwesomeIcon icon={faSearch} className="me-1" /> Analyze
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && !showSearch && (
        <div className="text-center app-loader full-page-section visible">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="app-spinner-icon" style={{ color: 'var(--bs-info)' }} />
          <p className="mt-2" style={{ color: 'var(--bs-light)' }}>Updating analysis...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center mt-3 app-error-alert full-page-section visible" role="alert">
          <strong>Error:</strong> {error}
          <button onClick={handleNewSearch} className="btn btn-link p-0 ms-2 new-search-link">Try New Search</button>
        </div>
      )}

      {!loading && walletData && !showSearch && (
        <>
          <div className="text-center mb-4 new-analysis-button-container">
            <button onClick={handleNewSearch} className="btn btn-outline-secondary new-analysis-button">
              <FontAwesomeIcon icon={faSync} className="me-2" />Analyze Another Wallet
            </button>
          </div>

          <section id="main-persona" className="mb-4 full-page-section" ref={mainPersonaRef}>
            <MainPersonaSection persona={walletData.persona} />
          </section>

          {walletData.details && walletData.details.profile && (
            <>
              <section id="basic-info" className="mb-4 full-page-section" ref={basicInfoRef}>
                <BasicWalletInfo details={{ ...walletData.details, nfts: walletData.details.nfts }} />
              </section>

              <section id="analytics-dashboard" className="mb-4 full-page-section" ref={analyticsDashboardRef}>
                <div className="container-fluid">
                  <h2 className="text-center mb-4" style={{ color: 'var(--bs-light)' }}>Analytics Dashboard</h2>
                  <div className="dashboard-grid">

                    <div className="dashboard-card card">
                      <div className="card-header">
                        <h3><FontAwesomeIcon icon={faChartPie} className="me-2" />Asset Distribution</h3>
                      </div>
                      <div className="card-body">
                        {walletData.details && (walletData.details.tokens || walletData.details.balance) ? (
                          <AssetDistributionChart
                            tokens={walletData.details.tokens}
                            nativeBalance={walletData.details.balance}
                          />
                        ) : (
                          <p className="text-muted mt-2">Asset data not available.</p>
                        )}
                      </div>
                    </div>

                    <div className="dashboard-card card">
                      <div className="card-header">
                        <h3><FontAwesomeIcon icon={faShieldAlt} className="me-2" />Risk Assessment</h3>
                      </div>
                      <div className="card-body">
                        <p><strong>Score:</strong> {walletData.persona?.riskScore || 0}/100</p>
                        <div className="progress mt-1 mb-2" style={{ height: '10px' }}>
                          <div className={`progress-bar ${getRiskColor(walletData.persona?.riskScore)}`} role="progressbar" style={{ width: `${walletData.persona?.riskScore || 0}%` }} aria-valuenow={walletData.persona?.riskScore || 0} aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <p><strong>Risk Factors:</strong></p>
                        <ul>
                          {Array.isArray(walletData.persona?.riskFactorsDetails) && walletData.persona.riskFactorsDetails.length > 0 ?
                            walletData.persona.riskFactorsDetails.map((factor, index) => (
                              <li key={index}>{factor.description} ({factor.type})</li>
                            )) :
                            (Array.isArray(walletData.persona?.riskFactors) && walletData.persona.riskFactors.length > 0 ?
                              walletData.persona.riskFactors.map((factor, index) => (<li key={index}>{factor}</li>))
                              : <li>No specific risk factors identified.</li>)
                          }
                        </ul>
                      </div>
                    </div>

                    <div className="dashboard-card card">
                      <div className="card-header">
                        <h3><FontAwesomeIcon icon={faChartLine} className="me-2" />Activity Metrics</h3>
                      </div>
                      <div className="card-body">
                        <p><strong>Monthly Activity:</strong></p>
                        {walletData.details?.historicalActivity && walletData.details.historicalActivity.length > 0 ? (
                          <p className="text-muted">Graph coming soon. Data available for {walletData.details.historicalActivity.length} months.</p>
                        ) : <p>No historical activity data available.</p>}
                      </div>
                    </div>

                    <div className="dashboard-card card">
                      <div className="card-header">
                        <h3><FontAwesomeIcon icon={faInfoCircle} className="me-2" />Wallet Profile Highlights</h3>
                      </div>
                      <div className="card-body">
                        <p><strong>ENS:</strong> {walletData.details.profile.ensName || 'N/A'}</p>
                        <p><strong>Unstoppable Domain:</strong> {walletData.details.profile.unstoppableDomain || 'N/A'}</p>
                        <p><strong>Total Transactions:</strong> {walletData.details.profile.totalTransactions}</p>
                        <p><strong>Active Since:</strong> {walletData.details.profile.firstTransactionDate ? new Date(walletData.details.profile.firstTransactionDate).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Categories:</strong> {walletData.persona?.category || 'N/A'}</p>
                        <div><strong>Tags:</strong>
                          {Array.isArray(walletData.persona?.tags) && walletData.persona.tags.length > 0 ?
                            walletData.persona.tags.map((tag, index) => (
                              <span key={index} className={`badge bg-secondary me-1`}>{tag}</span>
                            )) : 'N/A'}
                        </div>

                        <hr className="my-3" />
                        <h5><FontAwesomeIcon icon={faBalanceScale} className="me-2" />Token Holdings (Ethereum Mainnet):</h5>
                        {walletData.details?.tokens && walletData.details.tokens.length > 0 ? (
                          <div className="token-holdings-list mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-group list-group-flush">
                              {walletData.details.tokens.map(token => (
                                <li key={token.contractAddress} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 0' }}>
                                  <span>
                                    <strong>{token.name || 'Unknown Token'} ({token.symbol || 'N/S'})</strong><br />
                                    <small className="text-muted">Balance: {parseFloat(token.balance).toFixed(4)}</small>
                                  </span>
                                  <span className="badge bg-primary rounded-pill">${token.usdValue.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : <p className="text-muted">No ERC20 tokens found or reported.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="nft-analysis" className="mb-4 full-page-section" ref={nftAnalysisRef}>
                <div className="container-fluid nft-section-container">
                  {walletData.details.profile.totalNftsHeld !== undefined ? (
                    <NftAnalysisSection profile={walletData.details.profile} nfts={walletData.details.nfts} />
                  ) : (
                    <div className="text-center">
                      <FontAwesomeIcon icon={faSpinner} spin /> Loading NFT Data...
                    </div>
                  )}
                </div>
              </section>

              <section id="detailed-transaction-analysis" className="full-page-section">
                <div className="container-fluid">
                  <h2 className="text-center mb-4" style={{ color: 'var(--bs-light)' }}>Detailed Transaction Analysis</h2>
                  <DetailedAnalysisSection profile={walletData.details.profile} />
                </div>
              </section>
            </>
          )}
        </>
      )}

      <footer className="text-center mt-5 mb-3 app-footer">
        <p style={{ color: 'var(--bs-gray-500)' }}>&copy; {new Date().getFullYear()} Wallet Persona Engine. Hackathon Project.</p>
        <p><small style={{ color: 'var(--bs-gray-600)' }}>Disclaimer: For analytical and entertainment purposes only. Not financial advice.</small></p>
      </footer>
    </div>
  );
}

// Helper function for risk color (example)
const getRiskColor = (score) => {
  if (score === undefined) return 'bg-secondary';
  if (score <= 33) return 'bg-success';
  if (score <= 66) return 'bg-warning';
  return 'bg-danger';
};

export default App; 