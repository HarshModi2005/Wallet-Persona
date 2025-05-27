import React from 'react';
import './DetailedAnalysisSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGasPump, faCoins, faLink, faUsers, faChartBar, faClock, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const DetailedAnalysisSection = ({ profile }) => {
    if (!profile) {
        return <div className="detailed-analysis-section-loading">Loading detailed analysis...</div>;
    }

    const {
        totalGasFeesPaidEth,
        totalGasFeesPaidUsd,
        averageGasPriceGwei,
        mostExpensiveTxHash,
        mostExpensiveTxFeeEth,
        mostExpensiveTxFeeUsd,
        avgTxPerDay,
        avgTxPerWeek,
        avgTxPerMonth,
        txCountByDayOfWeek,
        txCountByHourOfDay,
        uniqueInteractedAddressesCount,
        topInteractedAddresses,
        transactionCountInDateRange
    } = profile;

    const formatNumber = (num, digits = 2) => num !== undefined && num !== null ? num.toFixed(digits) : 'N/A';
    const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'N/A';
    const explorerLink = (hash) => `https://etherscan.io/tx/${hash}`;
    const addressExplorerLink = (address) => `https://etherscan.io/address/${address}`;

    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="detailed-analysis-section">
            <h2 className="section-title">Detailed Transaction Analysis</h2>

            {transactionCountInDateRange === 0 && <p>No transactions found for the selected period or wallet.</p>}

            {transactionCountInDateRange > 0 && (
                <>
                    {/* Gas Usage Section */}
                    <div className="analysis-subsection card">
                        <h3 className="subsection-title"><FontAwesomeIcon icon={faGasPump} /> Gas Usage</h3>
                        <div className="stat-grid">
                            <div className="stat-item">
                                <strong>Total Gas Fees:</strong>
                                <span>{formatNumber(totalGasFeesPaidEth, 6)} ETH</span>
                                <small>(${formatNumber(totalGasFeesPaidUsd, 2)} USD)</small>
                            </div>
                            <div className="stat-item">
                                <strong>Avg. Gas Price:</strong>
                                <span>{formatNumber(averageGasPriceGwei, 2)} Gwei</span>
                            </div>
                        </div>
                        {mostExpensiveTxHash && (
                            <div className="stat-item">
                                <strong>Most Expensive Tx:</strong>
                                <a href={explorerLink(mostExpensiveTxHash)} target="_blank" rel="noopener noreferrer">
                                    {formatAddress(mostExpensiveTxHash)} <FontAwesomeIcon icon={faLink} />
                                </a>
                                <span>Fee: {formatNumber(mostExpensiveTxFeeEth, 6)} ETH (${formatNumber(mostExpensiveTxFeeUsd, 2)} USD)</span>
                            </div>
                        )}
                    </div>

                    {/* Temporal Analysis Section */}
                    <div className="analysis-subsection card">
                        <h3 className="subsection-title"><FontAwesomeIcon icon={faClock} /> Activity Patterns</h3>
                        <div className="stat-grid">
                            <div className="stat-item"><strong>Avg. Tx/Day:</strong> {formatNumber(avgTxPerDay, 1)}</div>
                            <div className="stat-item"><strong>Avg. Tx/Week:</strong> {formatNumber(avgTxPerWeek, 1)}</div>
                            <div className="stat-item"><strong>Avg. Tx/Month:</strong> {formatNumber(avgTxPerMonth, 1)}</div>
                        </div>

                        <div className="heatmap-container">
                            <h4><FontAwesomeIcon icon={faCalendarAlt} /> Transactions by Day of Week:</h4>
                            <div className="heatmap-bar-chart">
                                {txCountByDayOfWeek && daysOrder.map(day => (
                                    <div className="bar-item" key={day}>
                                        <span className="bar-label">{day}</span>
                                        <div className="bar" style={{ height: `${(txCountByDayOfWeek[day] || 0) * 5}px`, maxHeight: '100px' }}>
                                            <span className="bar-value">{txCountByDayOfWeek[day] || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h4><FontAwesomeIcon icon={faChartBar} /> Transactions by Hour of Day (UTC):</h4>
                            <div className="heatmap-bar-chart hour-chart">
                                {txCountByHourOfDay && Object.entries(txCountByHourOfDay).sort(([h1], [h2]) => parseInt(h1) - parseInt(h2)).map(([hour, count]) => (
                                    <div className="bar-item" key={hour}>
                                        <span className="bar-label">{String(hour).padStart(2, '0')}</span>
                                        <div className="bar" style={{ height: `${(count || 0) * 2}px`, maxHeight: '80px' }}>
                                            <span className="bar-value">{count || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Counterparty Analysis Section */}
                    <div className="analysis-subsection card">
                        <h3 className="subsection-title"><FontAwesomeIcon icon={faUsers} /> Counterparty Analysis</h3>
                        <div className="stat-item">
                            <strong>Unique Interacted Addresses:</strong>
                            <span>{uniqueInteractedAddressesCount !== undefined ? uniqueInteractedAddressesCount : 'N/A'}</span>
                        </div>
                        {topInteractedAddresses && topInteractedAddresses.length > 0 && (
                            <div className="top-addresses">
                                <h4>Top 5 Interacted Addresses:</h4>
                                <ul>
                                    {topInteractedAddresses.map(item => (
                                        <li key={item.address}>
                                            <a href={addressExplorerLink(item.address)} target="_blank" rel="noopener noreferrer">
                                                {formatAddress(item.address)} <FontAwesomeIcon icon={faLink} />
                                            </a>
                                            <span>(Interactions: {item.count})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DetailedAnalysisSection; 