import React, { useState, useCallback } from 'react';
import { TerrainPicker } from './TerrainPicker';
import { TerrainCatalog, TerrainItem } from './TerrainCatalog';
import { TerrainSketch } from './TerrainSketch';
import { ElevationEditor, ElevationData } from './ElevationEditor';
import { TerrainExport } from './TerrainExport';
import { StepContainer, StepIndicator } from '@beyond/ui';
import TerrainImport from './TerrainImport';
import TerrainAnalysis from './TerrainAnalysis';

// Tipos
export interface TerrainModuleProps {
  onComplete?: (terrainData: any) => void;
  onBack?: () => void;
  className?: string;
}

// Pasos del módulo de terreno
enum TerrainStep {
  SOURCE_SELECTION = 0,
  TERRAIN_PICKER = 1,
  TERRAIN_SKETCH = 2,
  TERRAIN_IMPORT = 3,
  ELEVATION = 4,
  ANALYSIS = 5,
  EXPORT = 6,
}

/**
 * Componente principal del módulo de terreno
 */
export const TerrainModule: React.FC<TerrainModuleProps> = ({
  onComplete,
  onBack,
  className = '',
}) => {
  // Estado del módulo
  const [currentStep, setCurrentStep] = useState<TerrainStep>(TerrainStep.SOURCE_SELECTION);
  const [terrainSource, setTerrainSource] = useState<'own' | 'catalog' | 'import' | null>(null);
  const [terrainData, setTerrainData] = useState<{
    location?: { lat: number; lng: number };
    address?: string;
    polygon?: Array<[number, number]>;
    elevation?: ElevationData;
    area?: number;
    perimeter?: number;
    geoJson?: any;
    analysis?: any;
    importSource?: string;
  }>({});

  // Manejar selección de origen del terreno
  const handleSourceSelect = (source: 'own' | 'catalog' | 'import') => {
    setTerrainSource(source);

    if (source === 'own') {
      setCurrentStep(TerrainStep.TERRAIN_PICKER);
    } else if (source === 'catalog') {
      setCurrentStep(TerrainStep.TERRAIN_PICKER);
    } else if (source === 'import') {
      setCurrentStep(TerrainStep.TERRAIN_IMPORT);
    }
  };

  // Manejar selección de terreno del catálogo
  const handleCatalogSelect = useCallback((terrain: TerrainItem) => {
    setTerrainData({
      location: terrain.location,
      address: terrain.description,
      area: terrain.area,
      // En una implementación real, aquí obtendríamos el polígono del terreno
      polygon: [
        [terrain.location.lng - 0.001, terrain.location.lat - 0.001],
        [terrain.location.lng + 0.001, terrain.location.lat - 0.001],
        [terrain.location.lng + 0.001, terrain.location.lat + 0.001],
        [terrain.location.lng - 0.001, terrain.location.lat + 0.001],
      ],
    });
  }, []);

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = useCallback(
    (terrainInfo: { location: { lat: number; lng: number }; address?: string; area?: number }) => {
      setTerrainData((prev) => ({
        ...prev,
        location: terrainInfo.location,
        address: terrainInfo.address,
        area: terrainInfo.area,
      }));
    },
    [],
  );

  // Manejar completado del polígono
  const handlePolygonComplete = useCallback(
    (polygonData: { coordinates: Array<[number, number]>; area: number; perimeter: number }) => {
      setTerrainData((prev) => ({
        ...prev,
        polygon: polygonData.coordinates,
        area: polygonData.area,
        perimeter: polygonData.perimeter,
      }));
    },
    [],
  );

  // Manejar importación de archivos
  const handleImportComplete = useCallback((importData: any) => {
    setTerrainData((prev) => ({
      ...prev,
      geoJson: importData.geoJson,
      area: importData.area || prev.area,
      perimeter: importData.perimeter || prev.perimeter,
      importSource: importData.fileName,
    }));
    setCurrentStep(TerrainStep.ANALYSIS);
  }, []);

  // Manejar cambio en la elevación
  const handleElevationChange = useCallback((elevation: ElevationData) => {
    setTerrainData((prev) => ({
      ...prev,
      elevation,
    }));
  }, []);

  // Manejar análisis completado
  const handleAnalysisComplete = useCallback((analysisData: any) => {
    setTerrainData((prev) => ({
      ...prev,
      analysis: analysisData,
    }));
    setCurrentStep(TerrainStep.EXPORT);
  }, []);

  // Manejar navegación entre pasos
  const goToNextStep = useCallback(() => {
    if (currentStep < TerrainStep.EXPORT) {
      // Lógica especial para saltar del paso de dibujo al análisis si viene de importación
      if (currentStep === TerrainStep.TERRAIN_SKETCH && terrainSource === 'import') {
        setCurrentStep(TerrainStep.ANALYSIS);
      } else if (currentStep === TerrainStep.ELEVATION) {
        setCurrentStep(TerrainStep.ANALYSIS);
      } else {
        setCurrentStep((prevStep) => (prevStep + 1) as TerrainStep);
      }
    } else if (onComplete) {
      onComplete(terrainData);
    }
  }, [currentStep, terrainData, onComplete, terrainSource]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > TerrainStep.SOURCE_SELECTION) {
      // Lógica especial para retroceder del análisis al paso correspondiente
      if (currentStep === TerrainStep.ANALYSIS) {
        if (terrainSource === 'import') {
          setCurrentStep(TerrainStep.TERRAIN_IMPORT);
        } else {
          setCurrentStep(TerrainStep.ELEVATION);
        }
      } else {
        setCurrentStep((prevStep) => (prevStep - 1) as TerrainStep);
      }
    } else if (onBack) {
      onBack();
    }
  }, [currentStep, onBack, terrainSource]);

  // Verificar si se puede avanzar al siguiente paso
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case TerrainStep.SOURCE_SELECTION:
        return terrainSource !== null;
      case TerrainStep.TERRAIN_PICKER:
        return terrainData.location !== undefined;
      case TerrainStep.TERRAIN_SKETCH:
        return terrainData.polygon !== undefined && terrainData.polygon.length >= 3;
      case TerrainStep.TERRAIN_IMPORT:
        return terrainData.geoJson !== undefined;
      case TerrainStep.ELEVATION:
        return terrainData.elevation !== undefined;
      case TerrainStep.ANALYSIS:
        return true;
      case TerrainStep.EXPORT:
        return true;
      default:
        return false;
    }
  }, [currentStep, terrainSource, terrainData]);

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case TerrainStep.SOURCE_SELECTION:
        return (
          <div className="source-selection">
            <h2 className="text-xl font-bold mb-6 text-primary-800 dark:text-accent-50">
              Selecciona el origen del terreno
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={`cursor-pointer rounded-lg overflow-hidden border transition-all p-6 ${
                  terrainSource === 'own'
                    ? 'border-primary-800 ring-2 ring-primary-800 dark:border-accent-300 dark:ring-accent-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-accent-700'
                }`}
                onClick={() => handleSourceSelect('own')}
              >
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="w-16 h-16 text-primary-800 dark:text-accent-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-accent-100 mb-2">
                    Terreno Propio
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Selecciona la ubicación en el mapa y dibuja tu propio terreno.
                  </p>
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg overflow-hidden border transition-all p-6 ${
                  terrainSource === 'catalog'
                    ? 'border-primary-800 ring-2 ring-primary-800 dark:border-accent-300 dark:ring-accent-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-accent-700'
                }`}
                onClick={() => handleSourceSelect('catalog')}
              >
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="w-16 h-16 text-primary-800 dark:text-accent-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-accent-100 mb-2">
                    Catálogo
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Elige entre una selección de terrenos predefinidos.
                  </p>
                </div>
              </div>

              <div
                className={`cursor-pointer rounded-lg overflow-hidden border transition-all p-6 ${
                  terrainSource === 'import'
                    ? 'border-primary-800 ring-2 ring-primary-800 dark:border-accent-300 dark:ring-accent-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-accent-700'
                }`}
                onClick={() => handleSourceSelect('import')}
              >
                <div className="flex flex-col items-center text-center">
                  <svg
                    className="w-16 h-16 text-primary-800 dark:text-accent-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-accent-100 mb-2">
                    Importar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Importa desde archivos CAD (DXF) o GeoJSON.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case TerrainStep.TERRAIN_PICKER:
        return terrainSource === 'catalog' ? (
          <TerrainCatalog onTerrainSelect={handleCatalogSelect} />
        ) : (
          <TerrainPicker onTerrainSelected={handleLocationSelect} />
        );

      case TerrainStep.TERRAIN_SKETCH:
        return (
          <TerrainSketch
            initialCenter={terrainData.location}
            onPolygonComplete={handlePolygonComplete}
          />
        );

      case TerrainStep.TERRAIN_IMPORT:
        return (
          <TerrainImport
            onImportComplete={handleImportComplete}
            onCancel={() => setCurrentStep(TerrainStep.SOURCE_SELECTION)}
          />
        );

      case TerrainStep.ELEVATION:
        return <ElevationEditor onElevationChange={handleElevationChange} initialElevation={0} />;

      case TerrainStep.ANALYSIS:
        return (
          <TerrainAnalysis
            onComplete={handleAnalysisComplete}
            onCancel={() =>
              terrainSource === 'import'
                ? setCurrentStep(TerrainStep.TERRAIN_IMPORT)
                : setCurrentStep(TerrainStep.ELEVATION)
            }
          />
        );

      case TerrainStep.EXPORT:
        return <TerrainExport terrainData={terrainData} />;

      default:
        return null;
    }
  };

  // Nombres de los pasos
  const getStepNames = () => {
    if (terrainSource === 'import') {
      return [
        { id: 'source', title: 'Origen' },
        { id: 'import', title: 'Importar' },
        { id: 'analysis', title: 'Análisis 3D' },
        { id: 'export', title: 'Exportar' },
      ];
    } else {
      return [
        { id: 'source', title: 'Origen' },
        { id: 'location', title: 'Ubicación' },
        { id: 'sketch', title: 'Dibujo' },
        { id: 'elevation', title: 'Elevación' },
        { id: 'analysis', title: 'Análisis 3D' },
        { id: 'export', title: 'Exportar' },
      ];
    }
  };

  // Mapear el paso actual al índice del paso en el indicador
  const getCurrentStepIndex = () => {
    if (terrainSource === 'import') {
      switch (currentStep) {
        case TerrainStep.SOURCE_SELECTION:
          return 0;
        case TerrainStep.TERRAIN_IMPORT:
          return 1;
        case TerrainStep.ANALYSIS:
          return 2;
        case TerrainStep.EXPORT:
          return 3;
        default:
          return 0;
      }
    } else {
      switch (currentStep) {
        case TerrainStep.SOURCE_SELECTION:
          return 0;
        case TerrainStep.TERRAIN_PICKER:
          return 1;
        case TerrainStep.TERRAIN_SKETCH:
          return 2;
        case TerrainStep.ELEVATION:
          return 3;
        case TerrainStep.ANALYSIS:
          return 4;
        case TerrainStep.EXPORT:
          return 5;
        default:
          return 0;
      }
    }
  };

  return (
    <div className={`terrain-module ${className}`}>
      <div className="mb-8">
        <StepIndicator
          steps={getStepNames()}
          currentStep={getCurrentStepIndex()}
          onStepClick={(step) => {
            // Solo permitir navegar a pasos anteriores o al actual
            if (step <= getCurrentStepIndex()) {
              // Mapear el índice del paso al paso real
              if (terrainSource === 'import') {
                switch (step) {
                  case 0:
                    setCurrentStep(TerrainStep.SOURCE_SELECTION);
                    break;
                  case 1:
                    setCurrentStep(TerrainStep.TERRAIN_IMPORT);
                    break;
                  case 2:
                    setCurrentStep(TerrainStep.ANALYSIS);
                    break;
                  case 3:
                    setCurrentStep(TerrainStep.EXPORT);
                    break;
                }
              } else {
                switch (step) {
                  case 0:
                    setCurrentStep(TerrainStep.SOURCE_SELECTION);
                    break;
                  case 1:
                    setCurrentStep(TerrainStep.TERRAIN_PICKER);
                    break;
                  case 2:
                    setCurrentStep(TerrainStep.TERRAIN_SKETCH);
                    break;
                  case 3:
                    setCurrentStep(TerrainStep.ELEVATION);
                    break;
                  case 4:
                    setCurrentStep(TerrainStep.ANALYSIS);
                    break;
                  case 5:
                    setCurrentStep(TerrainStep.EXPORT);
                    break;
                }
              }
            }
          }}
        />
      </div>

      <StepContainer isActive={true} stepId={`step-${currentStep}`}>
        {renderCurrentStep()}
      </StepContainer>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {currentStep === TerrainStep.SOURCE_SELECTION ? 'Volver' : 'Anterior'}
        </button>

        <button
          type="button"
          onClick={goToNextStep}
          disabled={!canProceed()}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-800 ${
            canProceed()
              ? 'bg-primary-800 text-white hover:bg-primary-900'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentStep === TerrainStep.EXPORT ? 'Completar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};
