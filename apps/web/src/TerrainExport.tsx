import React, { useState } from 'react';

// Tipos
export interface TerrainExportProps {
  terrainData?: {
    location?: { lat: number; lng: number };
    address?: string;
    polygon?: Array<[number, number]>;
    elevation?: {
      averageHeight: number;
      slope?: number;
    };
    area?: number;
    perimeter?: number;
  };
  className?: string;
}

/**
 * Componente para exportar los datos del terreno
 */
export const TerrainExport: React.FC<TerrainExportProps> = ({ terrainData, className = '' }) => {
  const [exportFormat, setExportFormat] = useState<'geojson' | 'json'>('geojson');

  // Verificar si hay datos para exportar
  const hasData =
    terrainData &&
    (terrainData.location || (terrainData.polygon && terrainData.polygon.length > 0));

  // Generar datos en formato GeoJSON
  const generateGeoJSON = () => {
    if (!terrainData || !terrainData.polygon || terrainData.polygon.length < 3) {
      return JSON.stringify({ error: 'Datos insuficientes para generar GeoJSON' }, null, 2);
    }

    // Cerrar el polígono (el último punto debe ser igual al primero)
    const coordinates = [...terrainData.polygon];
    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0]);
    }

    const geoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: 'Terreno',
            address: terrainData.address || '',
            area: terrainData.area || 0,
            perimeter: terrainData.perimeter || 0,
            elevation: terrainData.elevation?.averageHeight || 0,
            slope: terrainData.elevation?.slope || 0,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      ],
    };

    return JSON.stringify(geoJSON, null, 2);
  };

  // Generar datos en formato JSON
  const generateJSON = () => {
    if (!terrainData) {
      return JSON.stringify({ error: 'No hay datos disponibles' }, null, 2);
    }

    return JSON.stringify(terrainData, null, 2);
  };

  // Obtener datos según el formato seleccionado
  const getExportData = () => {
    if (exportFormat === 'geojson') {
      return generateGeoJSON();
    } else {
      return generateJSON();
    }
  };

  // Manejar descarga del archivo
  const handleDownload = () => {
    if (!hasData) return;

    const data = getExportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `terreno-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();

    // Limpiar
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className={`terrain-export ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-primary-800 dark:text-accent-50">
        Exportar Terreno
      </h2>

      {!hasData ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
          <p>
            No hay datos suficientes para exportar. Por favor, completa la información del terreno.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Formato de exportación
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-800 focus:ring-primary-800"
                  name="export-format"
                  value="geojson"
                  checked={exportFormat === 'geojson'}
                  onChange={() => setExportFormat('geojson')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">GeoJSON</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary-800 focus:ring-primary-800"
                  name="export-format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">JSON</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Vista previa
            </label>
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-60 text-xs">
              {getExportData()}
            </pre>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-primary-800 text-white rounded-md hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-2"
            >
              Descargar {exportFormat === 'geojson' ? 'GeoJSON' : 'JSON'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-primary-800 dark:text-accent-100">
              Resumen del terreno
            </h3>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {terrainData.location && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Coordenadas:</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    Lat: {terrainData.location.lat.toFixed(6)}, Lng:{' '}
                    {terrainData.location.lng.toFixed(6)}
                  </div>
                </>
              )}

              {terrainData.address && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Dirección:</div>
                  <div className="text-gray-800 dark:text-gray-200">{terrainData.address}</div>
                </>
              )}

              {terrainData.area !== undefined && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Área:</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {terrainData.area.toFixed(2)} m²
                  </div>
                </>
              )}

              {terrainData.perimeter !== undefined && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Perímetro:</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {terrainData.perimeter.toFixed(2)} m
                  </div>
                </>
              )}

              {terrainData.elevation && (
                <>
                  <div className="text-gray-500 dark:text-gray-400">Elevación:</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {terrainData.elevation.averageHeight} m.s.n.m.
                    {terrainData.elevation.slope !== undefined &&
                      ` (Pendiente: ${terrainData.elevation.slope}%)`}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
