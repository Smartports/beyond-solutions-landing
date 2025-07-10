import React, { useEffect, useState, ReactNode } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MAPS_CONFIG } from './config';

// Tipos
interface MapLoaderProps {
  children: ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  apiKey?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

/**
 * Componente que carga la API de Google Maps antes de renderizar los children
 */
export const MapLoader: React.FC<MapLoaderProps> = ({
  children,
  onLoad,
  onError,
  apiKey = MAPS_CONFIG.API_KEY,
  loadingComponent = <DefaultLoading />,
  errorComponent = <DefaultError />,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'drawing', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
        if (onLoad) onLoad();
      })
      .catch((err: Error) => {
        console.error('Error cargando Google Maps API:', err);
        setError(err);
        if (onError) onError(err);
      });
  }, [apiKey, onLoad, onError]);

  if (error) {
    return <>{errorComponent}</>;
  }

  if (!isLoaded) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
};

// Componente de carga por defecto
const DefaultLoading = () => (
  <div className="flex items-center justify-center p-8 min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">Cargando mapa...</p>
    </div>
  </div>
);

// Componente de error por defecto
const DefaultError = () => (
  <div className="flex items-center justify-center p-8 min-h-[400px] bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
    <div className="text-center">
      <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-full inline-flex mb-4">
        <svg
          className="w-8 h-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
        Error al cargar el mapa
      </h3>
      <p className="text-red-600 dark:text-red-300">
        No se pudo cargar Google Maps. Por favor, verifica tu conexión e inténtalo de nuevo.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Reintentar
      </button>
    </div>
  </div>
);
