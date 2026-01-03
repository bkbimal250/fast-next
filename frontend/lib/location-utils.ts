/**
 * Utility functions for location-based routing and slug generation
 */

/**
 * Generate a slug from location names
 * Example: "Vashi", "Navi Mumbai" -> "vashi-navi-mumbai"
 */
export function generateLocationSlug(area?: string, city?: string, state?: string): string {
  const parts: string[] = [];
  
  if (area) {
    parts.push(area.toLowerCase().trim().replace(/\s+/g, '-'));
  }
  if (city) {
    parts.push(city.toLowerCase().trim().replace(/\s+/g, '-'));
  }
  if (state && !city) { // Only add state if no city (for city-only slugs)
    parts.push(state.toLowerCase().trim().replace(/\s+/g, '-'));
  }
  
  return parts.join('-');
}

/**
 * Parse a location slug to extract area and city
 * Example: "vashi-navi-mumbai" -> { area: "Vashi", city: "Navi Mumbai" }
 * Example: "navi-mumbai" -> { city: "Navi Mumbai" }
 */
export function parseLocationSlug(slug: string): { area?: string; city?: string; state?: string } {
  const parts = slug.split('-');
  
  // Try to match with known locations
  // This is a simple approach - in production, you'd query the database
  // For now, we'll return the parts and let the page component match them
  
  if (parts.length >= 2) {
    // Likely format: area-city or city-state
    // We'll need to check against actual location data
    return {
      area: parts[0] ? formatLocationName(parts[0]) : undefined,
      city: parts.slice(1).join(' ') ? formatLocationName(parts.slice(1).join(' ')) : undefined,
    };
  } else if (parts.length === 1) {
    // Single part - likely a city
    return {
      city: formatLocationName(parts[0]),
    };
  }
  
  return {};
}

/**
 * Format location name from slug (capitalize words)
 */
export function formatLocationName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Find location IDs from names (area, city, state)
 * This will be used in the page component to fetch jobs
 * Improved matching: tries multiple combinations to find the best match
 */
export async function findLocationIds(
  areaName?: string,
  cityName?: string,
  stateName?: string
): Promise<{ areaId?: number; cityId?: number; stateId?: number }> {
  const { locationAPI } = await import('@/lib/location');
  const result: { areaId?: number; cityId?: number; stateId?: number } = {};
  
  try {
    // Get all locations
    const [cities, areas] = await Promise.all([
      locationAPI.getCities(undefined, undefined, 0, 1000),
      locationAPI.getAreas(undefined, 0, 1000),
    ]);
    
    // Strategy 1: If we have both area and city, find exact match
    if (areaName && cityName) {
      // Find city first
      const city = cities.find((c: any) => 
        c.name.toLowerCase().trim() === cityName.toLowerCase().trim()
      );
      
      if (city) {
        result.cityId = city.id;
        
        // Find area within this city
        const cityAreas = areas.filter((a: any) => a.city_id === city.id);
        const area = cityAreas.find((a: any) => 
          a.name.toLowerCase().trim() === areaName.toLowerCase().trim()
        );
        
        if (area) {
          result.areaId = area.id;
        }
      }
    }
    
    // Strategy 2: If we only have city name
    if (!result.cityId && cityName) {
      const city = cities.find((c: any) => 
        c.name.toLowerCase().trim() === cityName.toLowerCase().trim()
      );
      if (city) {
        result.cityId = city.id;
      }
    }
    
    // Strategy 3: If we only have area name, find it and get its city
    if (!result.areaId && areaName && !cityName) {
      const area = areas.find((a: any) => 
        a.name.toLowerCase().trim() === areaName.toLowerCase().trim()
      );
      if (area) {
        result.areaId = area.id;
        result.cityId = area.city_id;
      }
    }
    
    // Strategy 4: If we have state name and no city/area found
    if (!result.cityId && !result.areaId && stateName) {
      const states = await locationAPI.getStates(undefined, 0, 1000);
      const state = states.find((s: any) => 
        s.name.toLowerCase().trim() === stateName.toLowerCase().trim()
      );
      if (state) {
        result.stateId = state.id;
      }
    }
  } catch (error) {
    console.error('Error finding location IDs:', error);
  }
  
  return result;
}

/**
 * Smart slug parsing - tries to match against actual location data
 * Example: "vashi-navi-mumbai" -> tries to match "Vashi" as area and "Navi Mumbai" as city
 */
export async function parseLocationSlugSmart(slug: string): Promise<{
  area?: string;
  city?: string;
  state?: string;
  areaId?: number;
  cityId?: number;
  stateId?: number;
}> {
  const { locationAPI } = await import('@/lib/location');
  const parts = slug.split('-');
  
  try {
    // Get all locations for matching
    const [cities, areas] = await Promise.all([
      locationAPI.getCities(undefined, undefined, 0, 1000),
      locationAPI.getAreas(undefined, 0, 1000),
    ]);
    
    // Try different combinations
    // Format 1: area-city (e.g., "vashi-navi-mumbai")
    if (parts.length >= 2) {
      // Try first part as area, rest as city
      const potentialArea = parts[0];
      const potentialCity = parts.slice(1).join(' ');
      
      // Find matching area
      const matchingArea = areas.find((a: any) => {
        const areaSlug = a.name.toLowerCase().replace(/\s+/g, '-');
        return areaSlug === potentialArea || a.name.toLowerCase() === potentialArea.replace(/-/g, ' ');
      });
      
      if (matchingArea) {
        // Find city for this area
        const city = cities.find((c: any) => c.id === matchingArea.city_id);
        if (city) {
          const citySlug = city.name.toLowerCase().replace(/\s+/g, '-');
          const cityNameLower = city.name.toLowerCase();
          const potentialCityLower = potentialCity.toLowerCase();
          
          // Check if city matches
          if (citySlug === potentialCity.replace(/-/g, '-') || 
              cityNameLower === potentialCityLower.replace(/-/g, ' ')) {
            return {
              area: matchingArea.name,
              city: city.name,
              areaId: matchingArea.id,
              cityId: city.id,
            };
          }
        }
      }
      
      // Try as city only (e.g., "navi-mumbai")
      const cityName = parts.join(' ');
      const matchingCity = cities.find((c: any) => {
        const citySlug = c.name.toLowerCase().replace(/\s+/g, '-');
        return citySlug === slug || c.name.toLowerCase() === cityName.toLowerCase();
      });
      
      if (matchingCity) {
        return {
          city: matchingCity.name,
          cityId: matchingCity.id,
        };
      }
    }
    
    // Single part - try as city or area
    if (parts.length === 1) {
      const name = parts[0];
      
      // Try as city
      const city = cities.find((c: any) => {
        const citySlug = c.name.toLowerCase().replace(/\s+/g, '-');
        return citySlug === name || c.name.toLowerCase() === name.replace(/-/g, ' ');
      });
      
      if (city) {
        return {
          city: city.name,
          cityId: city.id,
        };
      }
      
      // Try as area
      const area = areas.find((a: any) => {
        const areaSlug = a.name.toLowerCase().replace(/\s+/g, '-');
        return areaSlug === name || a.name.toLowerCase() === name.replace(/-/g, ' ');
      });
      
      if (area) {
        const city = cities.find((c: any) => c.id === area.city_id);
        return {
          area: area.name,
          city: city?.name,
          areaId: area.id,
          cityId: city?.id,
        };
      }
    }
  } catch (error) {
    console.error('Error in smart slug parsing:', error);
  }
  
  // Fallback to simple parsing
  return parseLocationSlug(slug);
}

