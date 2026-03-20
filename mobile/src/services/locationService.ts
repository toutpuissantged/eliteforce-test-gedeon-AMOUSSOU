import axios from 'axios';

export interface AddressSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address: {
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

export class LocationService {
    static async searchAddress(query: string): Promise<AddressSuggestion[]> {
        if (!query || query.length < 3) return [];

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    limit: 5,
                },
                headers: {
                    'User-Agent': 'EliteForceApp/1.0', // Required by Nominatim policy
                }
            });

            return response.data;
        } catch (error) {
            console.error('❌ [LocationService]: Error fetching address', error);
            return [];
        }
    }
}
