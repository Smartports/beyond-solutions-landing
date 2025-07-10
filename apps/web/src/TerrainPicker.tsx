/// <reference types="google.maps" />

import React, { useState, useCallback, useEffect } from 'react';
import { MapPicker } from '@beyond/maps';

// Tipos
export interface TerrainPickerProps {
  onTerrainSelected?: (terrain: {
    location: { lat: number; lng: number };
    address?: string;
    area?: number;
  }) => void;
  className?: string;
}

/**
 * Componente para seleccionar un terreno en el mapa
 */
export const TerrainPicker: React.FC<TerrainPickerProps> = ({
  onTerrainSelected,
  className = '',
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [address, setAddress] = useState<string>('');
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Check if Google Maps is already loaded or wait for it
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) {
      return;
    }

    // Listen for the custom event when Google Maps loads
    const handleGoogleMapsLoaded = () => {
      if (checkGoogleMaps()) {
        setIsGoogleMapsLoaded(true);
      }
    };

    window.addEventListener('google-maps-loaded', handleGoogleMapsLoaded);

    // Fallback: check periodically
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        setIsGoogleMapsLoaded(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.removeEventListener('google-maps-loaded', handleGoogleMapsLoaded);
      clearInterval(interval);
    };
  }, []);

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = useCallback(
    (location: { lat: number; lng: number }) => {
      setSelectedLocation(location);

      // Intentar obtener la dirección mediante geocoding inverso
      if (isGoogleMapsLoaded && window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location },
          (results: any[] | null, status: any) => {
            if (status === 'OK' && results && results[0]) {
              setAddress(results[0].formatted_address);

              // Notificar al componente padre
              if (onTerrainSelected) {
                onTerrainSelected({
                  location,
                  address: results[0].formatted_address,
                  // En una implementación real, aquí calcularíamos el área con la API de Google Maps
                  area: 0,
                });
              }
            } else {
              console.error('Error en geocoding inverso:', status);
              setAddress('');

              // Notificar al componente padre solo con la ubicación
              if (onTerrainSelected) {
                onTerrainSelected({
                  location,
                  address: '',
                  area: 0,
                });
              }
            }
          },
        );
      } else {
        // Notificar al componente padre solo con la ubicación
        if (onTerrainSelected) {
          onTerrainSelected({
            location,
            address: '',
            area: 0,
          });
        }
      }
    },
    [onTerrainSelected, isGoogleMapsLoaded],
  );

  if (!isGoogleMapsLoaded) {
    return (
      <div className={`terrain-picker ${className}`}>
        <h2 className="text-xl font-bold mb-4 text-primary-800 dark:text-accent-50">
          Selecciona la ubicación del terreno
        </h2>
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`terrain-picker ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-primary-800 dark:text-accent-50">
        Selecciona la ubicación del terreno
      </h2>

      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Haz clic en el mapa para seleccionar la ubicación de tu terreno o busca una dirección
        específica.
      </p>

      <MapPicker onLocationSelect={handleLocationSelect} className="mb-4" />

      {selectedLocation && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-primary-800 dark:text-accent-100">
            Información del terreno
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordenadas</p>
              <p className="text-gray-800 dark:text-gray-200">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</p>
              <p className="text-gray-800 dark:text-gray-200">
                {address || 'Obteniendo dirección...'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-2"
              onClick={() => {
                if (selectedLocation && onTerrainSelected) {
                  onTerrainSelected({
                    location: selectedLocation,
                    address,
                    area: 0,
                  });
                }
              }}
            >
              Confirmar ubicación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
