import React from 'react';
import './BasicWalletInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faCalendarAlt, faChartPie, faCopy, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatWalletAge = (dateString) => {
    if (!dateString) return 'N/A';
    const startDate = new Date(dateString);
    if (isNaN(startDate.getTime())) return 'N/A';
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Created today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

const truncateAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const BasicWalletInfo = ({ details }) => {
    if (!details || !details.profile || !details.balance) {
        return <div className="basic-wallet-info-loading">Loading basic info...</div>;
    }

    const { profile, balance, nfts } = details;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // Maybe show a small notification or change icon briefly
            console.log('Address copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy address: ', err);
        });
    };

    return (
        <div className="basic-wallet-info-container container mt-4 mb-4">
            <div className="row gy-4">
                {/* Card 1: Identity & Core Value */}
                <div className="col-lg-4 col-md-6">
                    <div className="stat-card h-100">
                        <div className="card-header">
                            <FontAwesomeIcon icon={faWallet} className="me-2" /> Identity & Value
                        </div>
                        <div className="card-body">
                            <p><strong>Address:</strong>
                                <span title={profile.address} className="address-text">{truncateAddress(profile.address)}</span>
                                <button onClick={() => copyToClipboard(profile.address)} className="btn btn-sm btn-outline-light ms-2 copy-btn" title="Copy address">
                                    <FontAwesomeIcon icon={faCopy} />
                                </button>
                                <a href={`https://etherscan.io/address/${profile.address}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light ms-1" title="View on Etherscan">
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                </a>
                            </p>
                            {profile.ensName && <p><strong>ENS:</strong> {profile.ensName}</p>}
                            {profile.unstoppableDomain && <p><strong>Unstoppable:</strong> {profile.unstoppableDomain}</p>}
                            <hr />
                            <p><strong>Balance:</strong> {parseFloat(balance.native).toFixed(5)} ETH</p>
                            <p><strong>Value:</strong> ${balance.usdValue ? balance.usdValue.toFixed(2) : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Activity Snapshot */}
                <div className="col-lg-4 col-md-6">
                    <div className="stat-card h-100">
                        <div className="card-header">
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" /> Activity Snapshot
                        </div>
                        <div className="card-body">
                            <p><strong>Wallet Age:</strong> {formatWalletAge(profile.firstTransactionDate)}</p>
                            <p><strong>First Active:</strong> {formatDate(profile.firstTransactionDate)}</p>
                            <p><strong>Last Active:</strong> {formatDate(profile.lastTransactionDate)}</p>
                            <p><strong>Total Transactions:</strong> {profile.totalTransactions !== undefined ? profile.totalTransactions.toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Card 3: Portfolio & Chain Glimpse */}
                <div className="col-lg-4 col-md-12">
                    <div className="stat-card h-100">
                        <div className="card-header">
                            <FontAwesomeIcon icon={faChartPie} className="me-2" /> Portfolio & Chains
                        </div>
                        <div className="card-body">
                            <p><strong>Token Diversity:</strong> {profile.uniqueTokenCount !== undefined ? `${profile.uniqueTokenCount} unique token type(s)` : 'N/A'}</p>
                            {nfts && nfts.length !== undefined && <p><strong>NFT Holdings:</strong> {nfts.length} NFT(s)</p>}
                            <p><strong>Primary Network:</strong> Ethereum</p> {/* Assuming Ethereum for now based on context */}
                            {profile.activeChains && profile.activeChains.length > 0 ? (
                                <p><strong>Other Active Chains:</strong> {profile.activeChains.join(', ')}</p>
                            ) : (
                                <p><strong>Other Active Chains:</strong> No other active chains found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicWalletInfo; 