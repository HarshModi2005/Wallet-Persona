import React from 'react';
import {
    faPiggyBank, faChartLine, faBalanceScale, faProjectDiagram, faLink, faPercent, faHeartbeat, faCalendarAlt, faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DeFiSummarySection.css';

const formatNumber = (num, precision = 2) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toFixed(precision);
};

const DeFiSummarySection = ({ defiSummary }) => {
    if (!defiSummary || !defiSummary.protocols || defiSummary.protocols.length === 0) {
        return (
            <div className="defi-summary-section card shadow-sm mb-4">
                <div className="card-header">
                    <h3><FontAwesomeIcon icon={faPiggyBank} className="me-2" />DeFi Portfolio Summary</h3>
                </div>
                <div className="card-body text-center">
                    <p className="text-muted">No DeFi positions found for this wallet or data is currently unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="defi-summary-section card shadow-sm mb-4">
            <div className="card-header">
                <h3><FontAwesomeIcon icon={faPiggyBank} className="me-2" />DeFi Portfolio Summary</h3>
            </div>
            <div className="card-body">
                <div className="row mb-4 overall-stats">
                    <div className="col-md-3 col-6 stat-item">
                        <strong><FontAwesomeIcon icon={faProjectDiagram} className="me-1" /> Active Protocols:</strong>
                        <p>{defiSummary.active_protocols}</p>
                    </div>
                    <div className="col-md-3 col-6 stat-item">
                        <strong><FontAwesomeIcon icon={faChartLine} className="me-1" /> Total Positions:</strong>
                        <p>{defiSummary.total_positions}</p>
                    </div>
                    <div className="col-md-3 col-6 stat-item">
                        <strong><FontAwesomeIcon icon={faBalanceScale} className="me-1" /> Total Value (USD):</strong>
                        <p>${formatNumber(defiSummary.total_usd_value)}</p>
                    </div>
                    <div className="col-md-3 col-6 stat-item">
                        <strong><FontAwesomeIcon icon={faFileInvoiceDollar} className="me-1" /> Unclaimed (USD):</strong>
                        <p>${formatNumber(defiSummary.total_unclaimed_usd_value)}</p>
                    </div>
                </div>

                <h4>Protocols Involved:</h4>
                {defiSummary.protocols.map((protocol, index) => (
                    <div key={protocol.protocol_id || index} className="protocol-card card mb-3">
                        <div className="card-header protocol-header">
                            <img src={protocol.protocol_logo} alt={`${protocol.protocol_name} logo`} className="protocol-logo me-2" />
                            <a href={protocol.protocol_url} target="_blank" rel="noopener noreferrer">
                                {protocol.protocol_name} <FontAwesomeIcon icon={faLink} size="xs" />
                            </a>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <p><strong>Value in Protocol:</strong> ${formatNumber(protocol.total_usd_value)}</p>
                                    <p><strong>Positions:</strong> {protocol.positions}</p>
                                    {protocol.total_unclaimed_usd_value !== null && (
                                        <p><strong>Unclaimed:</strong> ${formatNumber(protocol.total_unclaimed_usd_value)}</p>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    {protocol.account_data && (
                                        <>
                                            <p><strong><FontAwesomeIcon icon={faPercent} className="me-1" /> Net APY:</strong> {formatNumber(protocol.account_data.net_apy)}%</p>
                                            {protocol.account_data.health_factor !== null && (
                                                <p><strong><FontAwesomeIcon icon={faHeartbeat} className="me-1" /> Health Factor:</strong> {formatNumber(protocol.account_data.health_factor, 4)}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    {protocol.total_projected_earnings_usd && (
                                        <>
                                            <p><strong><FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Projected Earnings (USD):</strong></p>
                                            <ul>
                                                <li>Daily: ${formatNumber(protocol.total_projected_earnings_usd.daily, 4)}</li>
                                                <li>Weekly: ${formatNumber(protocol.total_projected_earnings_usd.weekly, 4)}</li>
                                                <li>Monthly: ${formatNumber(protocol.total_projected_earnings_usd.monthly, 2)}</li>
                                                <li>Yearly: ${formatNumber(protocol.total_projected_earnings_usd.yearly, 2)}</li>
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeFiSummarySection; 