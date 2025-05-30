import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Chrono } from 'react-chrono';
import './WalletJourneyTimeline.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icon } from '@fortawesome/fontawesome-svg-core';
import {
    faSpinner, faExchangeAlt, faPaperPlane, faHandHoldingUsd,
    faFileContract, faQuestionCircle, faShoppingCart, faTags, faPlusCircle,
    faMinusCircle, faUserCheck, faUserTimes,
    faArrowUp, faArrowDown, faCalendarDay, faCalendarWeek, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
        case 'send': return faPaperPlane;
        case 'receive': return faHandHoldingUsd;
        case 'nft send': return faArrowUp;
        case 'nft receive': return faArrowDown;
        case 'token send': return faArrowUp;
        case 'token receive': return faArrowDown;
        case 'deposit': return faPlusCircle;
        case 'withdraw': return faMinusCircle;
        case 'token swap': return faExchangeAlt;
        case 'airdrop': return faTags;
        case 'mint': return faPlusCircle;
        case 'burn': return faMinusCircle;
        case 'nft purchase': return faShoppingCart;
        case 'nft sale': return faHandHoldingUsd;
        case 'borrow': return faHandHoldingUsd;
        case 'approve': return faUserCheck;
        case 'revoke': return faUserTimes;
        case 'contract interaction': return faFileContract;
        default: return faQuestionCircle;
    }
};

const getIconHTML = (iconObject) => {
    if (!iconObject) return '';
    const abstractIcon = icon(iconObject);
    if (!abstractIcon || !abstractIcon.html) return '';
    return abstractIcon.html.join('');
};

const EventDetailModal = ({ event, onClose }) => {
    console.log('[EventDetailModal] Props received:', { event, onClose });
    if (!event) {
        console.log('[EventDetailModal] Rendering null because event is null or undefined');
        return null;
    }
    console.log('[EventDetailModal] Rendering with event (this is the raw event from API):', event);

    const isValidDate = (dateString) => dateString && !isNaN(new Date(dateString).getTime());

    const renderTransferDetail = (transfer, type, eventContext) => {
        let valueDisplay = 'N/A';
        if (type === 'nft') {
            valueDisplay = `${transfer.name || 'Unknown NFT'} (ID: ${transfer.tokenId || 'N/A'})`;
            if (transfer.amount && parseInt(transfer.amount) > 1) {
                valueDisplay += ` x ${transfer.amount}`;
            }
        } else if (type === 'erc20') {
            valueDisplay = `${transfer.valueFormatted || (transfer.value ? ethers.formatUnits(transfer.value, transfer.decimals || 18) : 'N/A')}`;
            valueDisplay += ` ${transfer.tokenSymbol || transfer.tokenName || ''}`;
        } else if (type === 'native') {
            valueDisplay = transfer.valueFormatted || (transfer.value ? ethers.formatEther(transfer.value) + ' ETH' : 'N/A');
        }

        return (
            <div key={type + (transfer.tokenAddress || '') + (transfer.tokenId || '') + transfer.fromAddress + transfer.toAddress} className="transfer-detail-item">
                <p><strong>Type:</strong> {transfer.contractType || type.toUpperCase()}</p>
                <p><strong>Direction:</strong> <span style={{ color: transfer.direction === 'send' ? 'var(--bs-danger)' : 'var(--bs-success)' }}>{transfer.direction?.toUpperCase()}</span></p>
                <p><strong>From:</strong> {transfer.fromAddressLabel || transfer.fromAddress || 'N/A'}</p>
                <p><strong>To:</strong> {transfer.toAddressLabel || transfer.toAddress || 'N/A'}</p>
                <p><strong>Asset:</strong> {valueDisplay}</p>
                {type === 'nft' && transfer.image && <img src={transfer.image} alt={transfer.name || 'NFT'} style={{ maxWidth: '100px', borderRadius: '4px', marginTop: '5px' }} />}
            </div>
        );
    };

    const formatFee = (fee) => {
        if (!fee) return 'N/A';
        try {
            return parseFloat(ethers.formatEther(fee)).toFixed(6) + ' ETH';
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="modal-close-btn">&times;</button>
                <h4><FontAwesomeIcon icon={getCategoryIcon(event.category)} className="me-2" /> Event Details</h4>
                <hr />
                <p><strong>Hash:</strong> <a href={`https://etherscan.io/tx/${event.hash}`} target="_blank" rel="noopener noreferrer">{event.hash?.substring(0, 10)}...{event.hash?.substring(event.hash.length - 8)}</a></p>
                <p><strong>Timestamp:</strong> {isValidDate(event.timestamp) ? new Date(event.timestamp).toLocaleString() : 'N/A'}</p>
                <p><strong>Block:</strong> {event.blockNumber || 'N/A'}</p>
                <p><strong>Category:</strong> {event.category?.toUpperCase()}</p>
                <p><strong>Summary:</strong> {event.summary || 'N/A'}</p>

                <h5 className="mt-3">Transaction Info:</h5>
                <p><strong>From:</strong> {event.details?.fromAddressLabel || event.details?.fromAddress || 'N/A'}</p>
                <p><strong>To:</strong> {event.details?.toAddressLabel || event.details?.toAddress || 'N/A'}</p>

                <p><strong>Value:</strong> {event.details?.displayValue || formatFee(event.details?.value) || 'N/A'}</p>
                <p><strong>Fee:</strong> {event.details?.transactionFee ? formatFee(event.details?.transactionFee) : 'N/A'}</p>
                <p><strong>Status:</strong> <span style={{ color: event.details?.receiptStatus === '1' ? 'var(--bs-success)' : 'var(--bs-danger)' }}>
                    {event.details?.receiptStatus === '1' ? 'Success' : (event.details?.receiptStatus === '0' ? 'Failed' : 'Unknown')}
                </span></p>
                {event.details?.methodLabel && <p><strong>Method:</strong> {event.details.methodLabel}</p>}

                {event.details?.contractInteraction && (
                    <div className="mt-3 contract-interaction-details">
                        <h5>Contract Interaction:</h5>
                        {event.details.contractInteraction.methodSignature && <p><strong>Method Signature:</strong> {event.details.contractInteraction.methodSignature}</p>}
                        {event.details.contractInteraction.inputData && (
                            <>
                                <p><strong>Input Data:</strong></p>
                                <pre className="input-data-box">{event.details.contractInteraction.inputData.length > 200 ? event.details.contractInteraction.inputData.substring(0, 200) + "..." : event.details.contractInteraction.inputData}</pre>
                            </>
                        )}
                    </div>
                )}

                {event.details?.nftTransfers && event.details.nftTransfers.length > 0 && (
                    <div className="mt-3">
                        <h5>NFT Transfers ({event.details.nftTransfers.length}):</h5>
                        {event.details.nftTransfers.map(nft => renderTransferDetail(nft, 'nft', event))}
                    </div>
                )}
                {event.details?.erc20Transfers && event.details.erc20Transfers.length > 0 && (
                    <div className="mt-3">
                        <h5>Token Transfers ({event.details.erc20Transfers.length}):</h5>
                        {event.details.erc20Transfers.map(erc20 => renderTransferDetail(erc20, 'erc20', event))}
                    </div>
                )}
                {event.details?.nativeTransfers && event.details.nativeTransfers.length > 0 && (
                    <div className="mt-3">
                        <h5>Native Transfers ({event.details.nativeTransfers.length}):</h5>
                        {event.details.nativeTransfers.map(native => renderTransferDetail(native, 'native', event))}
                    </div>
                )}

            </div>
        </div>
    );
};

const WalletJourneyTimeline = ({ walletAddress, onPersonaProgressUpdate }) => {
    const [allFetchedEvents, setAllFetchedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedEventForModal, setSelectedEventForModal] = useState(null);

    const [chronoItems, setChronoItems] = useState([]);
    const [chronoMode, setChronoMode] = useState('VERTICAL_ALTERNATING');

    useEffect(() => {
        const mappedItems = allFetchedEvents.map(event => {
            let media = null;
            if (event.details?.nftTransfers && event.details.nftTransfers.length > 0) {
                const firstNft = event.details.nftTransfers[0];
                if (firstNft.image) {
                    media = {
                        type: 'IMAGE',
                        source: { url: firstNft.image },
                        name: firstNft.name || 'NFT Image'
                    };
                }
            } else if (event.details?.erc20Transfers && event.details.erc20Transfers.length > 0) {
                const firstToken = event.details.erc20Transfers[0];
                if (firstToken.tokenLogo) {
                    media = {
                        type: 'IMAGE',
                        source: { url: firstToken.tokenLogo },
                        name: firstToken.tokenSymbol || 'Token Logo'
                    };
                }
            }

            return {
                title: new Date(event.timestamp).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                cardTitle: event.category || 'Transaction',
                cardSubtitle: event.summary || `Value: ${event.details?.displayValue || 'N/A'}`,
                cardDetailedText: `Hash: ${event.hash}
From: ${event.details?.fromAddress}
To: ${event.details?.toAddress}
Fee: ${formatFee(event.details?.transactionFee)}`,
                media: media,
                originalEvent: event,
                id: event.hash
            };
        });
        setChronoItems(mappedItems);
    }, [allFetchedEvents]);

    const formatFee = (fee) => {
        if (!fee) return 'N/A';
        try {
            return parseFloat(ethers.formatEther(fee)).toFixed(6) + ' ETH';
        } catch (e) {
            return 'N/A';
        }
    };

    const fetchJourney = useCallback(async (currentCursor = null) => {
        if (!walletAddress) {
            console.log('[WalletJourneyTimeline] fetchJourney skipped: no walletAddress');
            return;
        }
        console.log(`[WalletJourneyTimeline] fetchJourney called. Wallet: ${walletAddress}, Cursor: ${currentCursor}`);
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/wallet-journey/${walletAddress}`, {
                params: { limit: 50, cursor: currentCursor }
            });
            const sortedNewEvents = response.data.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            setAllFetchedEvents(prevEvents => currentCursor ? [...prevEvents, ...sortedNewEvents] : sortedNewEvents);
            setCursor(response.data.nextCursor);
            setHasMore(response.data.hasMore);
        } catch (err) {
            console.error("Error fetching wallet journey:", err);
            setError(err.response?.data?.error || 'Failed to fetch wallet journey. Check console for details.');
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => {
        setAllFetchedEvents([]);
        setCursor(null);
        setHasMore(true);
        fetchJourney(null);
    }, [walletAddress, fetchJourney]);

    useEffect(() => {
        if (allFetchedEvents.length > 0 && typeof onPersonaProgressUpdate === 'function') {
            const progressionPoints = [];
            if (allFetchedEvents.length > 0) progressionPoints.push({ timestamp: allFetchedEvents[0].timestamp, summary: `Initial Activity: ${allFetchedEvents[0].summary || allFetchedEvents[0].category}` });
            if (allFetchedEvents.length > 2) progressionPoints.push({ timestamp: allFetchedEvents[Math.floor(allFetchedEvents.length / 2)].timestamp, summary: `Mid-Journey: ${allFetchedEvents[Math.floor(allFetchedEvents.length / 2)].summary || allFetchedEvents[Math.floor(allFetchedEvents.length / 2)].category}` });
            if (allFetchedEvents.length > 1) progressionPoints.push({ timestamp: allFetchedEvents[allFetchedEvents.length - 1].timestamp, summary: `Latest Activity: ${allFetchedEvents[allFetchedEvents.length - 1].summary || allFetchedEvents[allFetchedEvents.length - 1].category}` });
            onPersonaProgressUpdate(progressionPoints);
        }
    }, [allFetchedEvents, onPersonaProgressUpdate]);

    const handleLoadMore = () => {
        console.log('[WalletJourneyTimeline] handleLoadMore called. Cursor:', cursor, 'HasMore:', hasMore, 'IsLoading:', isLoading);
        if (cursor && hasMore && !isLoading) {
            fetchJourney(cursor);
        }
    };

    const handleTimelineItemClick = (item) => {
        console.log('[WalletJourneyTimeline] Chrono item clicked:', item);
        if (item && item.originalEvent) {
            setSelectedEventForModal(item.originalEvent);
        }
    };

    if (!walletAddress) {
        return <div className="wallet-journey-container"><p>Please enter a wallet address to see its journey.</p></div>;
    }

    return (
        <div className="wallet-journey-container">
            <h3>Wallet Journey Timeline</h3>
            <div className="granularity-controls">
                <button onClick={() => setChronoMode('VERTICAL_ALTERNATING')} className={chronoMode === 'VERTICAL_ALTERNATING' ? 'active' : ''}>Alternating</button>
                <button onClick={() => setChronoMode('VERTICAL')} className={chronoMode === 'VERTICAL' ? 'active' : ''}>Vertical</button>
                <button onClick={() => setChronoMode('HORIZONTAL')} className={chronoMode === 'HORIZONTAL' ? 'active' : ''}>Horizontal</button>
            </div>

            {isLoading && chronoItems.length === 0 && <div className="loading-state"><FontAwesomeIcon icon={faSpinner} spin size="2x" /> <p>Loading journey...</p></div>}
            {error && <div className="error-message">Error: {error}</div>}

            {chronoItems.length > 0 && (
                <div style={{ width: '100%', height: chronoMode === 'HORIZONTAL' ? '400px' : 'calc(100vh - 300px)' }}>
                    <Chrono
                        items={chronoItems}
                        mode={chronoMode}
                        onItemSelected={handleTimelineItemClick}
                        scrollable={{ scrollbar: true }}
                        enableOutline
                        cardHeight={chronoMode === 'HORIZONTAL' ? 200 : 150}
                        slideShow={false}
                    />
                </div>
            )}

            {chronoItems.length === 0 && !isLoading && !error && <p>No journey events found for this wallet.</p>}

            {isLoading && chronoItems.length > 0 && <div className="loading-state loading-more"><FontAwesomeIcon icon={faSpinner} spin /> Loading more...</div>}
            {hasMore && !isLoading && chronoItems.length > 0 && (
                <button onClick={handleLoadMore} disabled={isLoading} className="load-more-button">
                    Load More Events
                </button>
            )}
            <EventDetailModal
                event={selectedEventForModal}
                onClose={() => setSelectedEventForModal(null)}
            />
        </div>
    );
};

export default WalletJourneyTimeline; 