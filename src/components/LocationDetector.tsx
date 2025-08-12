'use client';

import { useState } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { autoDetectZipCode, getCityStateFromZip, getNearbyChurchCommunities, NearbyLocation } from '@/lib/locationService';

interface LocationDetectorProps {
  onLocationDetected: (zipCode: string) => void;
  currentZip?: string;
  showNearbyLocations?: boolean;
}

export default function LocationDetector({ 
  onLocationDetected, 
  currentZip, 
  showNearbyLocations = false 
}: LocationDetectorProps) {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [detectedZip, setDetectedZip] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [showNearby, setShowNearby] = useState(false);

  const handleDetectLocation = async () => {
    try {
      setDetecting(true);
      setError('');
      
      const zipCode = await autoDetectZipCode();
      setDetectedZip(zipCode);
      
      // Get city name for the detected ZIP
      const cityState = await getCityStateFromZip(zipCode);
      if (cityState) {
        setDetectedCity(`${cityState.city}, ${cityState.state}`);
      }
      
      onLocationDetected(zipCode);
      
      // Optionally load nearby locations
      if (showNearbyLocations) {
        const nearby = await getNearbyChurchCommunities(zipCode, 25);
        setNearbyLocations(nearby);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
    }
    setDetecting(false);
  };

  const handleUseNearbyLocation = (zipCode: string) => {
    onLocationDetected(zipCode);
    setShowNearby(false);
  };

  return (
    <div className="space-y-3">
      {/* Compact Location Detection */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDetectLocation}
          disabled={detecting}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-[#665CF0] text-white rounded-md hover:bg-[#5A52E8] disabled:opacity-50 transition-colors"
        >
          <MapPinIcon className="w-3 h-3" />
          <span>{detecting ? 'Detecting...' : 'Auto-detect'}</span>
        </button>
        
        {showNearbyLocations && nearbyLocations.length > 0 && (
          <button
            onClick={() => setShowNearby(!showNearby)}
            className="text-xs text-[#665CF0] hover:text-[#5A52E8] transition-colors"
          >
            Browse nearby
          </button>
        )}
      </div>

      {/* Compact Status Messages */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}

      {detectedZip && (
        <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded flex items-center space-x-1">
          <MapPinIcon className="w-3 h-3" />
          <span>{detectedZip} {detectedCity && `- ${detectedCity}`}</span>
        </div>
      )}

      {/* Compact Nearby Locations */}
      {showNearby && nearbyLocations.length > 0 && (
        <div className="border border-gray-200 rounded-md p-2 max-h-32 overflow-y-auto">
          <div className="space-y-1">
            {nearbyLocations.slice(0, 5).map((location) => (
              <button
                key={location.zipCode}
                onClick={() => handleUseNearbyLocation(location.zipCode)}
                className="w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{location.city}, {location.state}</span>
                  <span className="text-gray-400">{location.distance}mi</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
