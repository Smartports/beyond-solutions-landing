import React, { useRef, useEffect } from 'react';
import { MAPS_CONFIG } from './config';

// Tipos
export interface MapContainerProps {
  apiKey?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  mapTypeId?: google.maps.MapTypeId;
  onMapLoad?: (map: google.maps.Map) => void;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente contenedor para el mapa de Google
 * Requiere que MapLoader haya cargado la API previamente
 */
export const MapContainer: React.FC<MapContainerProps> = ({
  center = MAPS_CONFIG.DEFAULT_OPTIONS.center,
  zoom = MAPS_CONFIG.DEFAULT_OPTIONS.zoom,
  mapTypeId = MAPS_CONFIG.DEFAULT_OPTIONS.mapTypeId as google.maps.MapTypeId,
  onMapLoad,
  onClick,
  className = '',
  style = {},
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Crear nueva instancia del mapa
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        ...MAPS_CONFIG.DEFAULT_OPTIONS,
        center,
        zoom,
        mapTypeId,
        styles: MAPS_CONFIG.MAP_STYLES,
      });

      // Configurar eventos
      if (onClick) {
        mapInstance.addListener('click', onClick);
      }

      // Notificar al padre
      if (onMapLoad) onMapLoad(mapInstance);

      // Limpieza al desmontar
      return () => {
        if (onClick) {
          window.google.maps.event.clearListeners(mapInstance, 'click');
        }
      };
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }, [center, zoom, mapTypeId, onMapLoad, onClick]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-96 rounded-lg ${className}`}
      style={{ ...style }}
      aria-label="Mapa interactivo"
      role="application"
    />
  );
};
