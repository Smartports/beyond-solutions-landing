import React, { useState } from 'react';
import { ExportSystem, ModelExportOptions } from '../models/ExportSystem';

interface ModelExporterProps {
  exportSystem: ExportSystem;
  className?: string;
  defaultOptions?: Partial<ModelExportOptions>;
  onExportStart?: () => void;
  onExportComplete?: (url: string) => void;
  onExportError?: (error: Error) => void;
}

/**
 * Componente para exportar modelos 3D
 */
const ModelExporter: React.FC<ModelExporterProps> = ({
  exportSystem,
  className,
  defaultOptions,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [options, setOptions] = useState<ModelExportOptions>({
    format: 'glb',
    filename: `modelo_3d_${Date.now()}`,
    includeTextures: true,
    quality: 'medium',
    scale: 1.0,
    ...defaultOptions,
  });

  // Manejar cambios en las opciones
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setOptions((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }
    // Manejar números
    else if (type === 'number' || type === 'range') {
      setOptions((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    }
    // Otros campos
    else {
      setOptions((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Iniciar exportación
  const startExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportError(null);

    if (onExportStart) {
      onExportStart();
    }

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Realizar exportación
      const modelUrl = await exportSystem.exportModel(options);

      // Limpiar intervalo y completar
      clearInterval(progressInterval);
      setExportProgress(100);

      if (onExportComplete) {
        onExportComplete(modelUrl);
      }

      // Ofrecer descarga
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `${options.filename || 'modelo'}.${options.format}`;
      link.click();

      // Resetear estado después de un momento
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2000);
    } catch (error) {
      setExportError(
        `Error al exportar modelo: ${error instanceof Error ? error.message : String(error)}`,
      );
      setIsExporting(false);

      if (onExportError && error instanceof Error) {
        onExportError(error);
      }
    }
  };

  // Obtener extensión según formato
  const getExtensionForFormat = (format: string): string => {
    switch (format) {
      case 'glb':
        return '.glb';
      case 'gltf':
        return '.gltf';
      case 'obj':
        return '.obj';
      default:
        return '.glb';
    }
  };

  return (
    <div className={`model-exporter ${className || ''}`}>
      <div className="export-options">
        <h3>Opciones de Exportación 3D</h3>

        <div className="option-group">
          <label htmlFor="format">Formato:</label>
          <select
            id="format"
            name="format"
            value={options.format}
            onChange={handleOptionChange}
            disabled={isExporting}
          >
            <option value="glb">GLB (Binary)</option>
            <option value="gltf">GLTF (Text)</option>
            <option value="obj">OBJ</option>
          </select>
        </div>

        <div className="option-group">
          <label htmlFor="filename">Nombre del archivo:</label>
          <div className="filename-with-extension">
            <input
              type="text"
              id="filename"
              name="filename"
              value={options.filename || ''}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            <span className="file-extension">{getExtensionForFormat(options.format)}</span>
          </div>
        </div>

        <div className="option-group">
          <label htmlFor="quality">Calidad:</label>
          <select
            id="quality"
            name="quality"
            value={options.quality || 'medium'}
            onChange={handleOptionChange}
            disabled={isExporting}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="option-group">
          <label htmlFor="scale">Escala:</label>
          <div className="range-with-value">
            <input
              type="range"
              id="scale"
              name="scale"
              min="0.1"
              max="2"
              step="0.1"
              value={options.scale || 1}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            <span className="range-value">{options.scale || 1}</span>
          </div>
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeTextures"
              checked={options.includeTextures !== false}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            Incluir texturas
          </label>
        </div>
      </div>

      {exportError && <div className="export-error">{exportError}</div>}

      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${exportProgress}%` }} />
          </div>
          <div className="progress-text">{exportProgress}% completado</div>
        </div>
      )}

      <div className="export-actions">
        <button className="export-button" onClick={startExport} disabled={isExporting}>
          {isExporting ? 'Exportando...' : `Exportar modelo ${options.format.toUpperCase()}`}
        </button>
      </div>

      <div className="export-info">
        <h4>Información sobre formatos:</h4>
        <ul>
          <li>
            <strong>GLB</strong>: Formato binario compacto, ideal para web.
          </li>
          <li>
            <strong>GLTF</strong>: Formato basado en JSON, más editable.
          </li>
          <li>
            <strong>OBJ</strong>: Formato compatible con software de modelado 3D.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ModelExporter;
