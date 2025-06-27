import React, { useState, useRef, useEffect } from 'react';

// Tipos
export interface SearchBoxProps {
  map?: google.maps.Map;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de búsqueda de direcciones con autocompletado
 * Requiere que la API de Google Maps esté cargada y la biblioteca 'places'
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  map,
  onPlaceSelected,
  placeholder = 'Buscar dirección...',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

  // Inicializar el SearchBox cuando el componente se monta
  useEffect(() => {
    if (!inputRef.current || !window.google) return;
    
    try {
      // Crear SearchBox
      const searchBoxInstance = new window.google.maps.places.SearchBox(
        inputRef.current,
        { bounds: map?.getBounds() || undefined }
      );
      
      setSearchBox(searchBoxInstance);
      
      // Actualizar los límites del SearchBox cuando el mapa cambia
      if (map) {
        map.addListener('bounds_changed', () => {
          searchBoxInstance.setBounds(map.getBounds() as google.maps.LatLngBounds);
        });
      }
      
      // Escuchar eventos de selección de lugar
      const placesChangedListener = searchBoxInstance.addListener('places_changed', () => {
        const places = searchBoxInstance.getPlaces();
        
        if (!places || places.length === 0) {
          return;
        }
        
        // Notificar sobre el lugar seleccionado
        if (onPlaceSelected && places[0]) {
          onPlaceSelected(places[0]);
        }
        
        // Centrar el mapa en el lugar seleccionado
        if (map && places[0].geometry?.location) {
          map.setCenter(places[0].geometry.location);
          map.setZoom(17); // Zoom cercano para ver detalles
        }
      });
      
      // Limpieza al desmontar
      return () => {
        window.google.maps.event.removeListener(placesChangedListener);
      };
    } catch (error) {
      console.error('Error al inicializar el SearchBox:', error);
    }
  }, [map, onPlaceSelected]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          aria-hidden="true"
        >
          <path 
            fillRule="evenodd" 
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        className="form-input block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-800 focus:border-primary-800 dark:bg-gray-800 dark:text-white"
        placeholder={placeholder}
        aria-label="Buscar dirección"
      />
    </div>
  );
}; 