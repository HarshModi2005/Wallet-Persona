import React from 'react';
import './NftRecommendations.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faInfoCircle, faLightbulb, faPalette, faRocket } from '@fortawesome/free-solid-svg-icons';

const MAX_COLLECTION_NAME_LENGTH_REC = 35;
const MAX_DESCRIPTION_LENGTH_REC = 120;

const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
};

const RecommendedCollectionCard = ({ recommendation }) => {
    const { collection, reason } = recommendation;

    const [imgSrc, setImgSrc] = React.useState(
        collection.image_url?.startsWith('ipfs://')
            ? collection.image_url.replace('ipfs://', 'https://ipfs.io/ipfs/')
            : collection.image_url
    );
    const [imgError, setImgError] = React.useState(false);

    const onError = () => {
        if (!imgError) {
            setImgError(true);
            setImgSrc('https://via.placeholder.com/150?text=No+Image'); // Fallback placeholder
        }
    };

    const collectionName = truncateText(collection.name, MAX_COLLECTION_NAME_LENGTH_REC);
    const collectionDescription = truncateText(collection.description, MAX_DESCRIPTION_LENGTH_REC);

    return (
        <div className="recommended-collection-card">
            <div className="recommended-collection-image-container">
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={`${collection.name || 'Collection'} image`}
                        onError={onError}
                        className="recommended-collection-image"
                    />
                ) : (
                    <div className="recommended-collection-image-placeholder">
                        <FontAwesomeIcon icon={faPalette} />
                    </div>
                )}
            </div>
            <div className="recommended-collection-info">
                <h5 className="recommended-collection-name" title={collection.name}>
                    {collectionName}
                </h5>
                {collectionDescription && (
                    <p className="recommended-collection-description" title={collection.description}>
                        {collectionDescription}
                    </p>
                )}
                <div className="recommendation-reason">
                    <FontAwesomeIcon icon={faLightbulb} className="reason-icon" />
                    <p className="reason-text">{reason || "Curated for you."}</p>
                </div>
            </div>
            <div className="recommended-collection-links">
                {collection.project_url && (
                    <a href={collection.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light link-button">
                        <FontAwesomeIcon icon={faRocket} className="me-1" /> Visit Project
                    </a>
                )}
                <a href={collection.opensea_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info link-button">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" /> View on OpenSea
                </a>
            </div>
        </div>
    );
};

const NftRecommendations = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="nft-recommendations-section card">
                <div className="card-header section-header">
                    <h3><FontAwesomeIcon icon={faInfoCircle} className="me-2" />NFT Recommendations</h3>
                </div>
                <div className="card-body">
                    <p className="text-center">No specific NFT collection recommendations available at this time. Explore OpenSea for trending collections!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="nft-recommendations-section card">
            <div className="card-header section-header">
                <h3><FontAwesomeIcon icon={faLightbulb} className="me-2" />You Might Also Like...</h3>
            </div>
            <div className="card-body">
                <p className="recommendations-intro">
                    Based on your wallet's profile and NFT holdings, here are a few collections you might find interesting:
                </p>
                <div className="recommendations-grid">
                    {recommendations.map((rec, index) => (
                        <RecommendedCollectionCard key={rec.collection.collection || index} recommendation={rec} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NftRecommendations; 