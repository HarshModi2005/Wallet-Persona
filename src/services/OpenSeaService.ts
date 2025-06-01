import axios from 'axios';
import { OpenSeaCollection, OpenSeaApiResponse } from '../types/opensea.types';

const OPENSEA_API_BASE_URL = 'https://api.opensea.io/api/v2';

export class OpenSeaService {
  private apiKey: string;
  private cache: Map<string, { timestamp: number; data: OpenSeaCollection[] }> = new Map();
  private cacheDurationMs: number = 10 * 60 * 1000; // 10 minutes

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      console.warn('[OpenSeaService] API key is missing. OpenSea API calls will likely fail.');
      this.apiKey = ''; // Avoid undefined errors, but calls will fail
    } else {
      this.apiKey = apiKey;
    }
  }

  private async _fetchFromApi(endpoint: string, params: Record<string, any>): Promise<OpenSeaCollection[]> {
    if (!this.apiKey) {
      console.error('[OpenSeaService] Cannot fetch from API: API key is not configured.');
      return [];
    }

    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const cachedEntry = this.cache.get(cacheKey);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < this.cacheDurationMs)) {
      console.log(`[OpenSeaService] Returning cached data for ${endpoint}`);
      return cachedEntry.data;
    }

    try {
      console.log(`[OpenSeaService] Fetching collections from OpenSea. Endpoint: ${endpoint}, Params:`, params);
      const response = await axios.get<OpenSeaApiResponse>(`${OPENSEA_API_BASE_URL}${endpoint}`, {
        headers: {
          'accept': 'application/json',
          'X-API-KEY': this.apiKey,
        },
        params,
      });

      const collections = response.data?.collections || [];
      console.log(`[OpenSeaService] Fetched ${collections.length} collections from OpenSea.`);
      
      this.cache.set(cacheKey, { timestamp: Date.now(), data: collections });
      return collections;

    } catch (error: any) {
      console.error(`[OpenSeaService] Error fetching collections from OpenSea API (endpoint: ${endpoint}):`, error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.error('[OpenSeaService] OpenSea API request unauthorized. Check your API key.');
      } else if (error.response?.status === 429) {
        console.warn('[OpenSeaService] OpenSea API rate limit hit.');
      }
      return []; // Return empty array on error to prevent downstream issues
    }
  }

  /**
   * Get a list of OpenSea collections, ordered by a specified metric.
   * @param orderBy - The order in which to sort the collections. Default: 'seven_day_volume'.
   *                  Other options: 'created_date', 'one_day_volume', 'seven_day_change', etc.
   * @param limit - The number of collections to return. Must be between 1 and 100. Default: 30.
   * @param chain - The blockchain to filter results on. Default: 'ethereum'.
   * @returns A promise that resolves to an array of OpenSeaCollection objects.
   */
  async getRankedCollections(
    orderBy: string = 'seven_day_volume',
    limit: number = 30, // Fetch a bit more for AI to choose from
    chain: string = 'ethereum'
  ): Promise<OpenSeaCollection[]> {
    const validLimit = Math.max(1, Math.min(100, limit)); // Ensure limit is within 1-100
    return this._fetchFromApi('/collections', {
      chain_identifier: chain, // Updated based on typical OpenSea usage, though API doc said 'chain'
      limit: validLimit,
      order_by: orderBy,
    });
  }
} 