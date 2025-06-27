import React, { useState, useCallback } from 'react';
import { MapLoader } from './MapLoader';
import { MapContainer } from './MapContainer';
import { SearchBox } from './SearchBox';
import { MapControls } from './MapControls';
import { MAPS_CONFIG } from './config';

// Tipos
export interface MapPickerProps {
  apiKey?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onLocationSelect?: (location: google.maps.LatLngLiteral) => void;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
}

/**
 * Componente principal para seleccionar ubicaciones en un mapa
 * Integra búsqueda, controles y mapa en un solo componente
 */
export const MapPicker: React.FC<MapPickerProps> = ({
  apiKey = MAPS_CONFIG.API_KEY,
  initialCenter = MAPS_CONFIG.DEFAULT_OPTIONS.center,
  initialZoom = MAPS_CONFIG.DEFAULT_OPTIONS.zoom,
  onLocationSelect,
  onMapLoad,
  className = ''
}) => {
  // Estado del mapa
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  // Manejar carga del mapa
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Notificar al componente padre
    if (onMapLoad) {
      onMapLoad(mapInstance);
    }
  }, [onMapLoad]);

  // Manejar clic en el mapa
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!map || !event.latLng) return;
    
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    // Actualizar marcador
    if (marker) {
      marker.setPosition(event.latLng);
    } else {
      const newMarker = new window.google.maps.Marker({
        position: event.latLng,
        map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });
      
      // Escuchar eventos de arrastre del marcador
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          
          // Notificar al componente padre
          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }
        }
      });
      
      setMarker(newMarker);
    }
    
    // Actualizar estado y notificar
    setSelectedLocation(clickedLocation);
    if (onLocationSelect) {
      onLocationSelect(clickedLocation);
    }
  }, [map, marker, onLocationSelect]);

  // Manejar selección de lugar desde el SearchBox
  const handlePlaceSelected = useCallback((place: google.maps.places.PlaceResult) => {
    if (!map || !place.geometry?.location) return;
    
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    
    // Actualizar marcador
    if (marker) {
      marker.setPosition(place.geometry.location);
    } else {
      const newMarker = new window.google.maps.Marker({
        position: place.geometry.location,
        map,
        draggable: true
      });
      
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng()
          };
          setSelectedLocation(newLocation);
          
          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }
        }
      });
      
      setMarker(newMarker);
    }
    
    // Actualizar estado y notificar
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // Ajustar el mapa
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  }, [map, marker, onLocationSelect]);

  // Controles del mapa
  const handleZoomIn = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || initialZoom) + 1);
    }
  }, [map, initialZoom]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || initialZoom) - 1);
    }
  }, [map, initialZoom]);

  const handleMyLocation = useCallback(() => {
    if (!map) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          map.setCenter(location);
          map.setZoom(17);
          
          // Crear marcador si no existe
          if (marker) {
            marker.setPosition(location);
          } else {
            const newMarker = new window.google.maps.Marker({
              position: location,
              map,
              draggable: true
            });
            setMarker(newMarker);
          }
          
          // Actualizar estado y notificar
          setSelectedLocation(location);
          if (onLocationSelect) {
            onLocationSelect(location);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos de ubicación.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }, [map, marker, onLocationSelect]);

  const handleToggleSatellite = useCallback(() => {
    if (map) {
      const newMapTypeId = isSatellite ? 'roadmap' : 'satellite';
      map.setMapTypeId(newMapTypeId as google.maps.MapTypeId);
      setIsSatellite(!isSatellite);
    }
  }, [map, isSatellite]);

  return (
    <MapLoader apiKey={apiKey}>
      <div className={`relative ${className}`}>
        <div className="mb-4">
          <SearchBox 
            map={map ?? undefined} 
            onPlaceSelected={handlePlaceSelected} 
            placeholder="Buscar dirección o lugar..." 
          />
        </div>
        
        <div className="relative">
          <MapContainer 
            onMapLoad={handleMapLoad}
            onClick={handleMapClick}
            center={initialCenter}
            zoom={initialZoom}
            mapTypeId={(isSatellite ? 'satellite' : 'roadmap') as google.maps.MapTypeId}
            className="w-full h-[500px] rounded-lg shadow-md"
          />
          
          <div className="absolute top-4 right-4">
            <MapControls 
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onMyLocation={handleMyLocation}
              onToggleSatellite={handleToggleSatellite}
              isSatelliteActive={isSatellite}
            />
          </div>
        </div>
        
        {selectedLocation && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación seleccionada:</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${selectedLocation.lat.toFixed(6)},${selectedLocation.lng.toFixed(6)}`);
                }}
                className="text-primary-800 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-200 text-sm"
                title="Copiar coordenadas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </MapLoader>
  );
}; 