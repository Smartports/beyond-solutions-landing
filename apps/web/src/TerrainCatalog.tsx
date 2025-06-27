import React, { useState, useEffect } from 'react';

// Tipos
export interface TerrainCatalogProps {
  onTerrainSelect?: (terrain: TerrainItem) => void;
  className?: string;
}

export interface TerrainItem {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  area: number;
  price: number;
  imageUrl?: string;
  description?: string;
}

/**
 * Datos mock para el catálogo de terrenos
 */
const MOCK_TERRAINS: TerrainItem[] = [
  {
    id: 'terrain-001',
    name: 'Lote Residencial - Bosques del Lago',
    location: { lat: 19.4326, lng: -99.1332 },
    area: 500,
    price: 2500000,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bGFuZHxlbnwwfHwwfHw%3D&w=300&q=80',
    description: 'Terreno en exclusiva zona residencial con todos los servicios.'
  },
  {
    id: 'terrain-002',
    name: 'Terreno Comercial - Centro',
    location: { lat: 19.4287, lng: -99.1359 },
    area: 800,
    price: 5000000,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGxhbmR8ZW58MHx8MHx8&w=300&q=80',
    description: 'Ubicación estratégica para negocio con alto flujo peatonal.'
  },
  {
    id: 'terrain-003',
    name: 'Lote Industrial - Zona Norte',
    location: { lat: 19.4412, lng: -99.1280 },
    area: 2000,
    price: 8000000,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bGFuZHxlbnwwfHwwfHw%3D&w=300&q=80',
    description: 'Ideal para nave industrial o bodega con acceso a vías principales.'
  },
  {
    id: 'terrain-004',
    name: 'Terreno Campestre - Valle Verde',
    location: { lat: 19.4500, lng: -99.1400 },
    area: 1500,
    price: 3000000,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGxhbmR8ZW58MHx8MHx8&w=300&q=80',
    description: 'Hermoso terreno con vista panorámica y clima privilegiado.'
  }
];

/**
 * Componente de catálogo de terrenos predefinidos
 */
export const TerrainCatalog: React.FC<TerrainCatalogProps> = ({
  onTerrainSelect,
  className = ''
}) => {
  const [terrains, setTerrains] = useState<TerrainItem[]>([]);
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  
  // Cargar terrenos (simulación de API)
  useEffect(() => {
    // Simular carga de datos
    const loadTerrains = async () => {
      // En una implementación real, aquí haríamos un fetch a una API
      await new Promise(resolve => setTimeout(resolve, 500));
      setTerrains(MOCK_TERRAINS);
    };
    
    loadTerrains();
  }, []);
  
  // Filtrar terrenos por nombre
  const filteredTerrains = terrains.filter(terrain => 
    terrain.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  // Manejar selección de terreno
  const handleTerrainSelect = (terrain: TerrainItem) => {
    setSelectedTerrain(terrain.id);
    
    if (onTerrainSelect) {
      onTerrainSelect(terrain);
    }
  };
  
  return (
    <div className={`terrain-catalog ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-primary-800 dark:text-accent-50">
        Catálogo de Terrenos
      </h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar terrenos..."
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-800 dark:bg-gray-800 dark:text-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      
      {terrains.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando terrenos...</p>
          </div>
        </div>
      ) : filteredTerrains.length === 0 ? (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron terrenos con ese nombre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerrains.map(terrain => (
            <div
              key={terrain.id}
              className={`cursor-pointer rounded-lg overflow-hidden border transition-all ${
                selectedTerrain === terrain.id
                  ? 'border-primary-800 ring-2 ring-primary-800 dark:border-accent-300 dark:ring-accent-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-accent-700'
              }`}
              onClick={() => handleTerrainSelect(terrain)}
            >
              <div className="flex flex-col h-full">
                {terrain.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={terrain.imageUrl}
                      alt={terrain.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4 flex-grow bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-primary-900 dark:text-accent-100">
                    {terrain.name}
                  </h3>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Área:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">{terrain.area} m²</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Precio:</span>
                      <span className="ml-1 text-gray-800 dark:text-gray-200">
                        ${terrain.price.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </div>
                  
                  {terrain.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {terrain.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 