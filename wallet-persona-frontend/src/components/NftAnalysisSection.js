import React from 'react';
import './NftAnalysisSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImages, faLayerGroup, faPalette, faExternalLinkAlt, faCopy, faSpinner } from '@fortawesome/free-solid-svg-icons';

const MAX_COLLECTION_NAME_LENGTH = 30;
const MAX_NFT_NAME_LENGTH = 25;

const truncateName = (name, maxLength) => {
    if (!name) return 'Unnamed';
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength - 3)}...`;
};

const NftSampleItem = ({ nft }) => {
    const [imgSrc, setImgSrc] = React.useState(nft.imageUrl?.startsWith('ipfs://') ? nft.imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/') : nft.imageUrl);
    const [imgError, setImgError] = React.useState(false);

    const onError = () => {
        if (!imgError) { // Prevent infinite loop if placeholder also fails, though unlikely
            setImgError(true);
            setImgSrc('https://via.placeholder.com/80?text=No+Image'); // Fallback placeholder
        }
    };

    const nftName = truncateName(nft.name || `NFT #${nft.tokenId}`, MAX_NFT_NAME_LENGTH);

    return (
        <div className="nft-sample-item" title={`${nft.name || 'NFT'} - ID: ${nft.tokenId}`}>
            <div className="nft-sample-image-container">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={nft.name || `NFT ${nft.tokenId}`}
                        onError={onError}
                        className="nft-sample-image"
                    />
                ) : (
                    <div className="nft-image-placeholder">No Image</div>
                )}
            </div>
            <div className="nft-sample-info">
                <p className="nft-sample-name">{nftName}</p>
                <p className="nft-sample-id">ID: {truncateName(nft.tokenId, 10)}</p>
            </div>
        </div>
    );
};

const CollectionCard = ({ collection }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy address: ', err));
    };

    const collectionName = truncateName(collection.name, MAX_COLLECTION_NAME_LENGTH);

    return (
        <div className="collection-card">
            <div className="collection-header">
                <div className="collection-logo-container">
                    {collection.collectionLogo ? (
                        <img src={collection.collectionLogo.startsWith('ipfs://') ? collection.collectionLogo.replace('ipfs://', 'https://ipfs.io/ipfs/') : collection.collectionLogo} alt={`${collection.name || 'Collection'} Logo`} className="collection-logo" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                        <FontAwesomeIcon icon={faPalette} className="collection-logo-placeholder" />
                    )}
                </div>
                <div className="collection-title-group">
                    <h4 className="collection-name" title={collection.name}>{collectionName}</h4>
                    {collection.symbol && <p className="collection-symbol">({collection.symbol})</p>}
                </div>
                <div className="collection-count-badge">{collection.count} NFTs</div>
            </div>
            <div className="collection-address-info">
                <span className="collection-address-label">Contract:</span>
                <span className="collection-address" title={collection.contractAddress}>{truncateName(collection.contractAddress, 15)}</span>
                <button onClick={() => copyToClipboard(collection.contractAddress)} className="btn btn-sm btn-outline-secondary ms-2 copy-btn-xs" title="Copy Address">
                    <FontAwesomeIcon icon={faCopy} size="xs" />
                </button>
                <a href={`https://etherscan.io/address/${collection.contractAddress}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary ms-1 copy-btn-xs" title="View on Etherscan">
                    <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                </a>
            </div>

            {collection.nfts && collection.nfts.length > 0 && (
                <div className="sample-nfts-grid">
                    {collection.nfts.map((nft, index) => (
                        <NftSampleItem key={nft.tokenId || index} nft={nft} />
                    ))}
                </div>
            )}
        </div>
    );
};

const NftAnalysisSection = ({ profile }) => {
    // Outer card structure for consistent header and padding, even during loading or error states.
    const renderCardShell = (content) => (
        <div className="nft-analysis-section card">
            <div className="card-header section-header">
                <h3><FontAwesomeIcon icon={faImages} className="me-2" />NFT Portfolio Analysis</h3>
            </div>
            <div className="card-body">
                {content}
            </div>
        </div>
    );

    if (!profile) {
        // This case might occur if profile is null/undefined due to a higher-level error or initial loading.
        // The main App.js loader should ideally cover this.
        // However, providing a fallback within the component is robust.
        return renderCardShell(
            <p>NFT data is currently unavailable. It might be loading or there was an issue.</p>
        );
    }

    const nftDataIsPending =
        profile.totalNftsHeld === undefined &&
        profile.uniqueNftCollectionsCount === undefined &&
        profile.topNftCollections === undefined;

    if (nftDataIsPending) {
        return renderCardShell(
            <div className="text-center p-3">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-2" />
                <p>Loading NFT details...</p>
            </div>
        );
    }

    const { totalNftsHeld, uniqueNftCollectionsCount, topNftCollections } = profile;

    // Handle case where NFT data is present, but indicates no NFTs held.
    if (totalNftsHeld === 0 && (!topNftCollections || topNftCollections.length === 0)) {
        return renderCardShell(
            <p className="text-center mt-2">This wallet does not appear to hold any NFTs.</p>
        );
    }

    // Handle cases where some NFT data might be missing but not all (e.g. totalNftsHeld is defined but topCollections is not)
    // This check is a bit more lenient than the initial strict check for component loading/error
    if (totalNftsHeld === undefined && (!topNftCollections || topNftCollections.length === 0)) {
        return renderCardShell(
            <p>NFT data is partially available or could not be fully determined.</p>
        );
    }

    return renderCardShell(
        <>
            <div className="nft-summary-stats">
                <div className="stat-item-nft">
                    <FontAwesomeIcon icon={faImages} size="2x" className="stat-icon mb-2" />
                    <h4>{totalNftsHeld !== undefined ? totalNftsHeld.toLocaleString() : 'N/A'}</h4>
                    <p>Total NFTs Held</p>
                </div>
                <div className="stat-item-nft">
                    <FontAwesomeIcon icon={faLayerGroup} size="2x" className="stat-icon mb-2" />
                    <h4>{uniqueNftCollectionsCount !== undefined ? uniqueNftCollectionsCount.toLocaleString() : 'N/A'}</h4>
                    <p>Unique Collections</p>
                </div>
            </div>

            {topNftCollections && topNftCollections.length > 0 ? (
                <div className="top-collections-section">
                    <h4 className="mt-4 mb-3 text-center collections-showcase-title">Top Collections Showcase</h4>
                    <div className="collections-grid">
                        {topNftCollections.map(collection => (
                            <CollectionCard key={collection.contractAddress} collection={collection} />
                        ))}
                    </div>
                </div>
            ) : (
                totalNftsHeld > 0 && <p className="text-center mt-4">No specific top collections data to display, but the wallet holds {totalNftsHeld} NFT(s).</p>
            )}
        </>
    );
};

export default NftAnalysisSection; 