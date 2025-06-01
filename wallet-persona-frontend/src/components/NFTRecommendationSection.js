import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NFTRecommendationSection = ({ walletData }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customPreferences, setCustomPreferences] = useState({
    budgetMin: 0.01,
    budgetMax: 5,
    riskTolerance: 'moderate',
    categories: [],
    timeHorizon: 'medium',
    tradingStyle: 'mixed'
  });
  const [showCustomFilters, setShowCustomFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const categories = [
    { value: 'pfp', label: 'Profile Pictures', icon: '🖼️' },
    { value: 'art', label: 'Digital Art', icon: '🎨' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'metaverse', label: 'Metaverse', icon: '🌐' },
    { value: 'utility', label: 'Utility', icon: '🔧' },
    { value: 'music', label: 'Music', icon: '🎵' }
  ];

  const riskLevels = ['conservative', 'moderate', 'aggressive'];
  const timeHorizons = ['short', 'medium', 'long'];
  const tradingStyles = ['holder', 'mixed', 'flipper'];

  useEffect(() => {
    if (walletData?.address) {
      loadRecommendations();
    }
  }, [walletData]);

  const loadRecommendations = async (useCustomPreferences = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = useCustomPreferences 
        ? '/api/nft-recommendations/custom'
        : '/api/nft-recommendations';
        
      const payload = useCustomPreferences
        ? {
            address: walletData.address,
            ...customPreferences
          }
        : {
            address: walletData.address
          };

      const response = await axios.post(`http://localhost:3001${endpoint}`, payload);
      
      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error loading NFT recommendations:', err);
      setError('Failed to load NFT recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPreferenceChange = (field, value) => {
    setCustomPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyCustomFilters = () => {
    loadRecommendations(true);
    setShowCustomFilters(false);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return '#4ade80';
      case 'medium': return '#fbbf24';
      case 'high': return '#f87171';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : '📦';
  };

  const formatPrice = (price) => {
    return price >= 1 ? `${price.toFixed(2)} ETH` : `${(price * 1000).toFixed(0)}m ETH`;
  };

  const filteredRecommendations = recommendations
    .filter(rec => selectedCategory === 'all' || rec.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.recommendationScore - a.recommendationScore;
        case 'price_low':
          return a.floorPrice - b.floorPrice;
        case 'price_high':
          return b.floorPrice - a.floorPrice;
        case 'volume':
          return b.volume24h - a.volume24h;
        default:
          return 0;
      }
    });

  if (!walletData?.address) {
    return null;
  }

  return (
    <div className="nft-recommendations-section">
      <div className="section-header">
        <h2>🎭 NFT Recommendations</h2>
        <p className="section-subtitle">
          Personalized NFT suggestions based on your wallet activity and preferences
        </p>
      </div>

      {/* Controls */}
      <div className="recommendations-controls">
        <div className="filter-row">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="score">Recommendation Score</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="volume">24h Volume</option>
            </select>
          </div>

          <button 
            className="custom-preferences-btn"
            onClick={() => setShowCustomFilters(!showCustomFilters)}
          >
            ⚙️ Custom Preferences
          </button>

          <button 
            className="refresh-btn"
            onClick={() => loadRecommendations()}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Custom Preferences Panel */}
        {showCustomFilters && (
          <div className="custom-preferences-panel">
            <h3>Customize Your Preferences</h3>
            
            <div className="preference-grid">
              <div className="preference-group">
                <label>Budget Range (ETH)</label>
                <div className="budget-inputs">
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={customPreferences.budgetMin}
                    onChange={(e) => handleCustomPreferenceChange('budgetMin', parseFloat(e.target.value))}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min="0.001"
                    step="0.1"
                    value={customPreferences.budgetMax}
                    onChange={(e) => handleCustomPreferenceChange('budgetMax', parseFloat(e.target.value))}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="preference-group">
                <label>Risk Tolerance</label>
                <select
                  value={customPreferences.riskTolerance}
                  onChange={(e) => handleCustomPreferenceChange('riskTolerance', e.target.value)}
                >
                  {riskLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="preference-group">
                <label>Time Horizon</label>
                <select
                  value={customPreferences.timeHorizon}
                  onChange={(e) => handleCustomPreferenceChange('timeHorizon', e.target.value)}
                >
                  {timeHorizons.map(horizon => (
                    <option key={horizon} value={horizon}>
                      {horizon.charAt(0).toUpperCase() + horizon.slice(1)}-term
                    </option>
                  ))}
                </select>
              </div>

              <div className="preference-group">
                <label>Trading Style</label>
                <select
                  value={customPreferences.tradingStyle}
                  onChange={(e) => handleCustomPreferenceChange('tradingStyle', e.target.value)}
                >
                  {tradingStyles.map(style => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="preference-group categories-group">
                <label>Preferred Categories</label>
                <div className="categories-checkboxes">
                  {categories.map(cat => (
                    <label key={cat.value} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={customPreferences.categories.includes(cat.value)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...customPreferences.categories, cat.value]
                            : customPreferences.categories.filter(c => c !== cat.value);
                          handleCustomPreferenceChange('categories', newCategories);
                        }}
                      />
                      <span>{cat.icon} {cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="preference-actions">
              <button 
                className="apply-preferences-btn"
                onClick={applyCustomFilters}
                disabled={loading}
              >
                Apply Preferences
              </button>
              <button 
                className="cancel-preferences-btn"
                onClick={() => setShowCustomFilters(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analyzing your wallet and generating personalized NFT recommendations...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={() => loadRecommendations()}>Try Again</button>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && !error && filteredRecommendations.length > 0 && (
        <div className="recommendations-grid">
          {filteredRecommendations.map((recommendation, index) => (
            <div key={`${recommendation.contractAddress}-${index}`} className="recommendation-card">
              <div className="card-header">
                <div className="collection-info">
                  <h3 className="collection-name">
                    {getCategoryIcon(recommendation.category)} {recommendation.collectionName}
                  </h3>
                  <div className="collection-stats">
                    <span className="floor-price">{formatPrice(recommendation.floorPrice)}</span>
                    <span 
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(recommendation.riskLevel) }}
                    >
                      {recommendation.riskLevel} risk
                    </span>
                  </div>
                </div>
                
                <div className="recommendation-score">
                  <div className="score-circle">
                    <span className="score-value">{Math.round(recommendation.recommendationScore)}</span>
                    <span className="score-label">Score</span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <p className="recommendation-reason">
                  <strong>Why recommended:</strong> {recommendation.recommendationReason}
                </p>

                {recommendation.aiInsight && (
                  <div className="ai-insight">
                    <span className="ai-label">🤖 AI Insight:</span>
                    <p>{recommendation.aiInsight}</p>
                  </div>
                )}

                <div className="market-stats">
                  {recommendation.volume24h > 0 && (
                    <div className="stat">
                      <span className="stat-label">24h Volume:</span>
                      <span className="stat-value">{recommendation.volume24h.toFixed(2)} ETH</span>
                    </div>
                  )}
                  
                  {recommendation.priceChange24h !== undefined && (
                    <div className="stat">
                      <span className="stat-label">24h Change:</span>
                      <span 
                        className={`stat-value ${recommendation.priceChange24h >= 0 ? 'positive' : 'negative'}`}
                      >
                        {recommendation.priceChange24h >= 0 ? '+' : ''}{recommendation.priceChange24h.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  {recommendation.holderCount && (
                    <div className="stat">
                      <span className="stat-label">Holders:</span>
                      <span className="stat-value">{recommendation.holderCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="view-collection-btn"
                  onClick={() => window.open(`https://opensea.io/collection/${recommendation.contractAddress}`, '_blank')}
                >
                  View on OpenSea
                </button>
                
                <button 
                  className="explore-btn"
                  onClick={() => window.open(`https://etherscan.io/address/${recommendation.contractAddress}`, '_blank')}
                >
                  View Contract
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRecommendations.length === 0 && recommendations.length > 0 && (
        <div className="empty-filtered-state">
          <p>No recommendations match your current filters.</p>
          <button onClick={() => setSelectedCategory('all')}>Clear Filters</button>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="empty-state">
          <h3>No Recommendations Available</h3>
          <p>We couldn't generate NFT recommendations for this wallet. Try adjusting your preferences or check back later.</p>
        </div>
      )}

      <style jsx>{`
        .nft-recommendations-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 30px;
          margin: 25px 0;
          color: white;
        }

        .section-header h2 {
          font-size: 28px;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          opacity: 0.9;
          font-size: 16px;
          margin-bottom: 25px;
        }

        .recommendations-controls {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .filter-row {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 500;
          white-space: nowrap;
        }

        .filter-select {
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          background: white;
          color: #333;
          font-size: 14px;
        }

        .custom-preferences-btn, .refresh-btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: 2px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .custom-preferences-btn:hover, .refresh-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.5);
        }

        .custom-preferences-panel {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 20px;
          margin-top: 15px;
        }

        .custom-preferences-panel h3 {
          margin-bottom: 20px;
          font-size: 18px;
        }

        .preference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .preference-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .preference-group input, .preference-group select {
          width: 100%;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          background: white;
          color: #333;
        }

        .budget-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .budget-inputs input {
          flex: 1;
        }

        .categories-checkboxes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .category-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .preference-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .apply-preferences-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .cancel-preferences-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 40px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .recommendation-card {
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .recommendation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .collection-name {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .collection-stats {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .floor-price {
          font-weight: bold;
          font-size: 16px;
        }

        .risk-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }

        .score-circle {
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .score-value {
          font-size: 16px;
          font-weight: bold;
        }

        .score-label {
          font-size: 10px;
          opacity: 0.8;
        }

        .recommendation-reason {
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .ai-insight {
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }

        .ai-label {
          font-weight: 500;
          font-size: 14px;
        }

        .market-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.8;
        }

        .stat-value {
          font-weight: 500;
        }

        .stat-value.positive {
          color: #10b981;
        }

        .stat-value.negative {
          color: #ef4444;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .view-collection-btn, .explore-btn {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .view-collection-btn:hover, .explore-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .empty-filtered-state, .empty-state {
          text-align: center;
          padding: 40px;
          opacity: 0.8;
        }

        .empty-filtered-state button, .error-state button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
};

export default NFTRecommendationSection; 