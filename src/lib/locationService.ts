// Location service for ZIP code detection and proximity calculations

export interface LocationData {
  zipCode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface NearbyLocation {
  zipCode: string;
  city: string;
  state: string;
  distance: number; // in miles
}

// Get user's current location using browser geolocation
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Convert latitude/longitude to ZIP code using reverse geocoding
export const getZipCodeFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    // Using a free geocoding service (you could also use Google Maps API)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    return data.postcode || '';
  } catch (error) {
    console.error('Error getting ZIP code from coordinates:', error);
    throw error;
  }
};

// Calculate distance between two ZIP codes (using Haversine formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Get coordinates for a ZIP code
export const getCoordinatesFromZipCode = async (zipCode: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Using a free geocoding service
    const response = await fetch(
      `https://api.zippopotam.us/us/${zipCode}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.places && data.places.length > 0) {
      return {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates from ZIP code:', error);
    return null;
  }
};

// Find nearby ZIP codes within a radius
export const findNearbyZipCodes = async (centerZip: string, radiusMiles: number): Promise<string[]> => {
  try {
    const centerCoords = await getCoordinatesFromZipCode(centerZip);
    if (!centerCoords) return [];

    // This is a simplified version - in production you'd want a more comprehensive ZIP code database
    // For now, we'll generate some nearby ZIP codes based on the center ZIP
    const nearbyZips: string[] = [];
    const baseZip = parseInt(centerZip);
    
    // Generate ZIP codes in a rough radius (this is approximate)
    for (let i = -100; i <= 100; i++) {
      const testZip = (baseZip + i).toString().padStart(5, '0');
      if (testZip !== centerZip && testZip.length === 5) {
        const testCoords = await getCoordinatesFromZipCode(testZip);
        if (testCoords) {
          const distance = calculateDistance(
            centerCoords.lat, centerCoords.lng,
            testCoords.lat, testCoords.lng
          );
          if (distance <= radiusMiles) {
            nearbyZips.push(testZip);
          }
        }
      }
      // Limit to prevent too many API calls
      if (nearbyZips.length >= 20) break;
    }
    
    return nearbyZips;
  } catch (error) {
    console.error('Error finding nearby ZIP codes:', error);
    return [];
  }
};

// Get city and state information for a ZIP code
export const getCityStateFromZip = async (zipCode: string): Promise<{ city: string; state: string } | null> => {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.places && data.places.length > 0) {
      return {
        city: data.places[0]['place name'],
        state: data['state abbreviation']
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting city/state from ZIP:', error);
    return null;
  }
};

// Auto-detect user's current ZIP code
export const autoDetectZipCode = async (): Promise<string> => {
  try {
    const position = await getCurrentLocation();
    const zipCode = await getZipCodeFromCoordinates(
      position.coords.latitude,
      position.coords.longitude
    );
    return zipCode;
  } catch (error) {
    console.error('Error auto-detecting ZIP code:', error);
    throw new Error('Could not detect your current location. Please enter your ZIP code manually.');
  }
};

// Filter listings by proximity to a ZIP code
export const filterListingsByProximity = async (
  listings: any[], 
  centerZip: string, 
  radiusMiles: number
): Promise<any[]> => {
  try {
    const nearbyZips = await findNearbyZipCodes(centerZip, radiusMiles);
    nearbyZips.push(centerZip); // Include the center ZIP
    
    return listings.filter(listing => 
      nearbyZips.includes(listing.zipCode)
    );
  } catch (error) {
    console.error('Error filtering listings by proximity:', error);
    return listings; // Return all listings if filtering fails
  }
};

// Get suggested nearby cities for browsing
export const getNearbyChurchCommunities = async (zipCode: string, radius: number): Promise<NearbyLocation[]> => {
  try {
    const nearbyZips = await findNearbyZipCodes(zipCode, radius);
    const communities: NearbyLocation[] = [];
    
    const centerCoords = await getCoordinatesFromZipCode(zipCode);
    if (!centerCoords) return [];
    
    for (const zip of nearbyZips.slice(0, 10)) { // Limit to 10 nearby locations
      const cityState = await getCityStateFromZip(zip);
      const coords = await getCoordinatesFromZipCode(zip);
      
      if (cityState && coords) {
        const distance = calculateDistance(
          centerCoords.lat, centerCoords.lng,
          coords.lat, coords.lng
        );
        
        communities.push({
          zipCode: zip,
          city: cityState.city,
          state: cityState.state,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        });
      }
    }
    
    // Sort by distance
    return communities.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error getting nearby church communities:', error);
    return [];
  }
};
