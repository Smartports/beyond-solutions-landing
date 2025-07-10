import React, { useState } from 'react';
import TerrainImport from './TerrainImport';
import TerrainViewer3D from './TerrainViewer3D';
import { FeatureCollection } from 'geojson';

/**
 * Props para el componente TerrainAnalysis
 */
interface TerrainAnalysisProps {
  /**
   * Callback cuando se completa el análisis
   */
  onComplete?: (data: any) => void;

  /**
   * Callback cuando se cancela el análisis
   */
  onCancel?: () => void;
}

/**
 * Componente para análisis de terreno
 */
const TerrainAnalysis: React.FC<TerrainAnalysisProps> = ({ onComplete, onCancel }) => {
  // Estados
  const [step, setStep] = useState<'import' | 'view3d' | 'report'>('import');
  const [terrainData, setTerrainData] = useState<any>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [report, setReport] = useState<any>(null);

  /**
   * Maneja la importación completada
   */
  const handleImportComplete = (data: any) => {
    setTerrainData(data);
    setGeoJson(data.geoJson);
    setStep('view3d');
  };

  /**
   * Maneja la captura de la vista 3D
   */
  const handleSnapshot = (dataUrl: string) => {
    setSnapshots([...snapshots, dataUrl]);
  };

  /**
   * Genera un informe del análisis
   */
  const handleGenerateReport = () => {
    // Crear informe con datos del terreno y capturas
    const reportData = {
      terrainData,
      snapshots,
      date: new Date().toISOString(),
      metadata: {
        area: calculateArea(geoJson),
        perimeter: calculatePerimeter(geoJson),
      },
    };

    setReport(reportData);
    setStep('report');

    // Notificar al padre si es necesario
    if (onComplete) {
      onComplete(reportData);
    }
  };

  /**
   * Calcula el área del terreno
   */
  const calculateArea = (geoJson: FeatureCollection | null): number => {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
      return 0;
    }

    // Usar turf.js para calcular el área
    // Esto es solo un placeholder, en la implementación real
    // se usaría la biblioteca turf.js
    return 1000; // m²
  };

  /**
   * Calcula el perímetro del terreno
   */
  const calculatePerimeter = (geoJson: FeatureCollection | null): number => {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
      return 0;
    }

    // Usar turf.js para calcular el perímetro
    // Esto es solo un placeholder, en la implementación real
    // se usaría la biblioteca turf.js
    return 130; // m
  };

  /**
   * Maneja el botón de cancelar
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Renderiza el paso actual
   */
  const renderStep = () => {
    switch (step) {
      case 'import':
        return <TerrainImport onImportComplete={handleImportComplete} onCancel={handleCancel} />;

      case 'view3d':
        if (!geoJson) {
          return <div>Error: No hay datos de terreno</div>;
        }

        return (
          <div className="terrain-analysis-view3d">
            <TerrainViewer3D
              geoJson={geoJson}
              baseElevation={0}
              maxElevation={10}
              onSnapshot={handleSnapshot}
            />

            <div className="terrain-analysis-actions">
              <button onClick={() => setStep('import')} className="terrain-analysis-button-back">
                Volver a Importación
              </button>
              <button onClick={handleGenerateReport} className="terrain-analysis-button-next">
                Generar Informe
              </button>
            </div>

            {snapshots.length > 0 && (
              <div className="terrain-analysis-snapshots">
                <h3>Capturas ({snapshots.length})</h3>
                <div className="terrain-analysis-snapshots-grid">
                  {snapshots.map((snapshot, index) => (
                    <div key={index} className="terrain-analysis-snapshot">
                      <img src={snapshot} alt={`Captura ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'report':
        if (!report) {
          return <div>Generando informe...</div>;
        }

        return (
          <div className="terrain-analysis-report">
            <h2>Informe de Análisis de Terreno</h2>

            <div className="terrain-analysis-report-metadata">
              <p>
                <strong>Fecha:</strong> {new Date(report.date).toLocaleString()}
              </p>
              <p>
                <strong>Archivo:</strong> {report.terrainData?.fileName || 'N/A'}
              </p>
              <p>
                <strong>Tipo:</strong> {report.terrainData?.type || 'N/A'}
              </p>
              <p>
                <strong>Área:</strong> {report.metadata.area.toLocaleString()} m²
              </p>
              <p>
                <strong>Perímetro:</strong> {report.metadata.perimeter.toLocaleString()} m
              </p>
            </div>

            {report.snapshots.length > 0 && (
              <div className="terrain-analysis-report-snapshots">
                <h3>Análisis Visuales</h3>
                <div className="terrain-analysis-report-snapshots-grid">
                  {report.snapshots.map((snapshot: string, index: number) => (
                    <div key={index} className="terrain-analysis-report-snapshot">
                      <img src={snapshot} alt={`Análisis ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="terrain-analysis-report-actions">
              <button onClick={() => setStep('view3d')} className="terrain-analysis-button-back">
                Volver al Análisis
              </button>
              <button onClick={handleCancel} className="terrain-analysis-button-done">
                Finalizar
              </button>
            </div>
          </div>
        );

      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <div className="terrain-analysis">
      <div className="terrain-analysis-header">
        <h2>Análisis de Terreno</h2>
        <div className="terrain-analysis-steps">
          <div className={`terrain-analysis-step ${step === 'import' ? 'active' : ''}`}>
            1. Importación
          </div>
          <div className={`terrain-analysis-step ${step === 'view3d' ? 'active' : ''}`}>
            2. Análisis 3D
          </div>
          <div className={`terrain-analysis-step ${step === 'report' ? 'active' : ''}`}>
            3. Informe
          </div>
        </div>
      </div>

      <div className="terrain-analysis-content">{renderStep()}</div>
    </div>
  );
};

export default TerrainAnalysis;
