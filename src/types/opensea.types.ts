export interface OpenSeaContract {
  address: string;
  chain: string;
}

export interface OpenSeaCollectionStats {
  seven_day_volume?: number;
  seven_day_change?: number;
  total_volume?: number;
  // Add other stats if needed from OpenSea API, e.g., floor_price, num_owners
}

export interface OpenSeaCollection {
  collection: string; // slug
  name: string;
  description: string | null;
  image_url: string | null;
  banner_image_url: string | null;
  owner: string; // wallet address
  safelist_status: string; // e.g., "verified", "approved", "not_requested"
  category: string | null; // e.g., "pfps", "art"
  is_disabled: boolean;
  is_nsfw: boolean;
  trait_offers_enabled: boolean;
  collection_offers_enabled: boolean;
  opensea_url: string; // Link to OpenSea page
  project_url: string | null; // Link to project's own website
  wiki_url: string | null;
  discord_url: string | null;
  telegram_url: string | null;
  twitter_username: string | null;
  instagram_username: string | null;
  contracts: OpenSeaContract[];
  stats?: OpenSeaCollectionStats; // Optional: if we fetch detailed stats later
}

export interface OpenSeaApiResponse {
  collections: OpenSeaCollection[];
  next: string | null; // Cursor for pagination
}

// For AI Recommendation result
export interface NftRecommendationResult {
  collection: OpenSeaCollection;
  reason: string;
} 