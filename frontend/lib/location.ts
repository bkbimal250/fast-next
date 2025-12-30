import apiClient from './axios';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country?: Country;
}

export interface City {
  id: number;
  name: string;
  slug?: string;
  state_id: number;
  country_id: number;
  state?: State;
  country?: Country;
}

export interface Area {
  id: number;
  name: string;
  city_id: number;
  city?: City;
}

export const locationAPI = {
  // Countries
  getCountries: async (skip: number = 0, limit: number = 100): Promise<Country[]> => {
    const response = await apiClient.get(`/api/locations/countries`, {
      params: { skip, limit },
    });
    return response.data;
  },

  getCountryById: async (id: number): Promise<Country> => {
    const response = await apiClient.get(`/api/locations/countries/${id}`);
    return response.data;
  },

  createCountry: async (data: { name: string }): Promise<Country> => {
    const response = await apiClient.post(`/api/locations/countries`, data);
    return response.data;
  },

  updateCountry: async (id: number, data: { name?: string }): Promise<Country> => {
    const response = await apiClient.put(`/api/locations/countries/${id}`, data);
    return response.data;
  },

  deleteCountry: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/countries/${id}`);
  },

  // States
  getStates: async (countryId?: number, skip: number = 0, limit: number = 100): Promise<State[]> => {
    const response = await apiClient.get(`/api/locations/states`, {
      params: { country_id: countryId, skip, limit },
    });
    return response.data;
  },

  getStateById: async (id: number): Promise<State> => {
    const response = await apiClient.get(`/api/locations/states/${id}`);
    return response.data;
  },

  createState: async (data: { name: string; country_id: number }): Promise<State> => {
    const response = await apiClient.post(`/api/locations/states`, data);
    return response.data;
  },

  updateState: async (id: number, data: { name?: string; country_id?: number }): Promise<State> => {
    const response = await apiClient.put(`/api/locations/states/${id}`, data);
    return response.data;
  },

  deleteState: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/states/${id}`);
  },

  // Cities
  getCities: async (stateId?: number, countryId?: number, skip: number = 0, limit: number = 100): Promise<City[]> => {
    const response = await apiClient.get(`/api/locations/cities`, {
      params: { state_id: stateId, country_id: countryId, skip, limit },
    });
    return response.data;
  },

  getCityById: async (id: number): Promise<City> => {
    const response = await apiClient.get(`/api/locations/cities/${id}`);
    return response.data;
  },

  createCity: async (data: { name: string; state_id: number; country_id: number }): Promise<City> => {
    const response = await apiClient.post(`/api/locations/cities`, data);
    return response.data;
  },

  updateCity: async (id: number, data: { name?: string; state_id?: number; country_id?: number }): Promise<City> => {
    const response = await apiClient.put(`/api/locations/cities/${id}`, data);
    return response.data;
  },

  deleteCity: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/cities/${id}`);
  },

  // Areas
  getAreas: async (cityId?: number, skip: number = 0, limit: number = 100): Promise<Area[]> => {
    const response = await apiClient.get(`/api/locations/areas`, {
      params: { city_id: cityId, skip, limit },
    });
    return response.data;
  },

  getAreaById: async (id: number): Promise<Area> => {
    const response = await apiClient.get(`/api/locations/areas/${id}`);
    return response.data;
  },

  createArea: async (data: { name: string; city_id: number }): Promise<Area> => {
    const response = await apiClient.post(`/api/locations/areas`, data);
    return response.data;
  },

  updateArea: async (id: number, data: { name?: string; city_id?: number }): Promise<Area> => {
    const response = await apiClient.put(`/api/locations/areas/${id}`, data);
    return response.data;
  },

  deleteArea: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/locations/areas/${id}`);
  },
};

/**
 * Get user's current geolocation from browser
 */
export async function getLocationFromIP(): Promise<LocationData | null> {
  try {
    const response = await apiClient.get('/api/locations/location-from-ip');
    if (response.data.success && response.data.location) {
      const loc = response.data.location;
      return {
        latitude: loc.latitude || 0,
        longitude: loc.longitude || 0,
        city: loc.city,
        state: loc.state,
        country: loc.country,
      };
    }
  } catch (error) {
    console.error('Error getting location from IP:', error);
  }
  return null;
}

/**
 * Get user's current geolocation from browser
 */
export async function getUserLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to IP-based location
      getLocationFromIP().then(location => {
        if (location) {
          resolve(location);
        } else {
          reject(new Error('Geolocation is not supported by your browser'));
        }
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to reverse geocode using backend API if available
        try {
          const response = await apiClient.post('/api/locations/reverse-geocode', {
            latitude,
            longitude,
          });
          
          resolve({
            latitude,
            longitude,
            city: response.data.city,
            state: response.data.state,
            country: response.data.country,
          });
        } catch (error) {
          // If reverse geocoding fails, just return coordinates
          console.error('Reverse geocoding failed:', error);
          resolve({
            latitude,
            longitude,
          });
        }
      },
      async (error) => {
        // If geolocation fails, try IP-based location
        const ipLocation = await getLocationFromIP();
        if (ipLocation) {
          resolve(ipLocation);
          return;
        }
        
        let errorMessage = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}
