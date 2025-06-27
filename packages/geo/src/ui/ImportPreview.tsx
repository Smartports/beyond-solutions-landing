import React, { useState, useEffect } from 'react';
import { FileType, ImportResult } from './FileImporter';
import { DxfEntity } from '../cad/DxfImporter';
import { FeatureCollection } from 'geojson';

/**
 * Props para el componente ImportPreview
 */
export interface ImportPreviewProps {
  /**
   * Resultado de la importación
   */
  importResult: ImportResult | null;
  
  /**
   * Callback cuando se seleccionan capas
   */
  onLayerSelect?: (selectedLayers: string[]) => void;
  
  /**
   * Callback cuando se confirma la importación
   */
  onConfirm?: (processedData: any) => void;
  
  /**
   * Callback cuando se cancela la importación
   */
  onCancel?: () => void;
  
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente para mostrar una vista previa de archivos importados
 */
export const ImportPreview: React.FC<ImportPreviewProps> = ({
  importResult,
  onLayerSelect,
  onConfirm,
  onCancel,
  className = ''
}) => {
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Actualizar capas seleccionadas cuando cambia el resultado de importación
  useEffect(() => {
    if (importResult?.success && importResult?.data) {
      let layers: string[] = [];
      
      // Extraer capas según tipo de archivo
      if (importResult.fileType === FileType.DXF && importResult.data.layers) {
        layers = importResult.data.layers;
      } else if (
        (importResult.fileType === FileType.GEOJSON || importResult.fileType === FileType.JSON) &&
        importResult.data.featureCollection
      ) {
        // Extraer capas únicas de las propiedades de las features
        const layerSet = new Set<string>();
        
        importResult.data.featureCollection.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.layer) {
            layerSet.add(feature.properties.layer);
          }
        });
        
        layers = Array.from(layerSet);
        
        // Si no hay capas, crear una por defecto
        if (layers.length === 0) {
          layers = ['default'];
        }
      }
      
      // Seleccionar todas las capas por defecto
      setSelectedLayers(layers);
      
      // Notificar al padre
      if (onLayerSelect) {
        onLayerSelect(layers);
      }
      
      // Preparar datos para la vista previa
      preparePreviewData(importResult);
    }
  }, [importResult, onLayerSelect]);
  
  /**
   * Prepara los datos para la vista previa
   */
  const preparePreviewData = (result: ImportResult) => {
    if (!result.success || !result.data) {
      setPreviewData(null);
      return;
    }
    
    let preview: any = null;
    
    // Preparar datos según tipo de archivo
    if (result.fileType === FileType.DXF) {
      preview = {
        type: 'dxf',
        entityCount: result.data.entities?.length || 0,
        layers: result.data.layers || [],
        bounds: result.data.bounds
      };
    } else if (result.fileType === FileType.GEOJSON || result.fileType === FileType.JSON) {
      preview = {
        type: 'geojson',
        featureCount: result.data.featureCount || 0,
        bounds: result.data.bounds
      };
    }
    
    setPreviewData(preview);
  };
  
  /**
   * Maneja el cambio en la selección de capas
   */
  const handleLayerChange = (layer: string, checked: boolean) => {
    let newSelectedLayers: string[];
    
    if (checked) {
      newSelectedLayers = [...selectedLayers, layer];
    } else {
      newSelectedLayers = selectedLayers.filter(l => l !== layer);
    }
    
    setSelectedLayers(newSelectedLayers);
    
    // Notificar al padre
    if (onLayerSelect) {
      onLayerSelect(newSelectedLayers);
    }
  };
  
  /**
   * Maneja la confirmación de la importación
   */
  const handleConfirm = () => {
    if (!importResult || !importResult.success || !importResult.data) {
      return;
    }
    
    // Filtrar datos según capas seleccionadas
    let processedData: any = null;
    
    if (importResult.fileType === FileType.DXF) {
      // Filtrar entidades por capa
      const filteredEntities = importResult.data.entities.filter(
        (entity: DxfEntity) => selectedLayers.includes(entity.layer)
      );
      
      processedData = {
        ...importResult.data,
        entities: filteredEntities
      };
    } else if (importResult.fileType === FileType.GEOJSON || importResult.fileType === FileType.JSON) {
      // Filtrar features por capa
      const filteredFeatures = importResult.data.featureCollection.features.filter(
        (feature: any) => {
          const layer = feature.properties?.layer || 'default';
          return selectedLayers.includes(layer);
        }
      );
      
      const filteredCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: filteredFeatures
      };
      
      processedData = {
        ...importResult.data,
        featureCollection: filteredCollection
      };
    }
    
    // Notificar al padre
    if (onConfirm && processedData) {
      onConfirm(processedData);
    }
  };
  
  // Si no hay resultado o hubo un error, mostrar mensaje
  if (!importResult || !importResult.success || !previewData) {
    return (
      <div className={`import-preview import-preview-error ${className}`}>
        <h3>Error de importación</h3>
        <p>{importResult?.error || 'No se pudo importar el archivo'}</p>
        {onCancel && (
          <button onClick={onCancel} className="import-preview-button">
            Cancelar
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className={`import-preview ${className}`}>
      <h3>Vista previa de importación</h3>
      
      <div className="import-preview-info">
        <p>
          <strong>Archivo:</strong> {importResult.fileName}
        </p>
        <p>
          <strong>Tipo:</strong> {importResult.fileType.toUpperCase()}
        </p>
        
        {previewData.type === 'dxf' && (
          <p>
            <strong>Entidades:</strong> {previewData.entityCount}
          </p>
        )}
        
        {previewData.type === 'geojson' && (
          <p>
            <strong>Features:</strong> {previewData.featureCount}
          </p>
        )}
        
        <p>
          <strong>Dimensiones:</strong>{' '}
          {previewData.bounds && (
            <>
              {Math.round(previewData.bounds.max.x - previewData.bounds.min.x)} x{' '}
              {Math.round(previewData.bounds.max.y - previewData.bounds.min.y)} unidades
            </>
          )}
        </p>
      </div>
      
      {previewData.layers && previewData.layers.length > 0 && (
        <div className="import-preview-layers">
          <h4>Capas disponibles:</h4>
          
          <div className="import-preview-layer-list">
            {previewData.layers.map((layer: string) => (
              <label key={layer} className="import-preview-layer-item">
                <input
                  type="checkbox"
                  checked={selectedLayers.includes(layer)}
                  onChange={(e) => handleLayerChange(layer, e.target.checked)}
                />
                {layer}
              </label>
            ))}
          </div>
        </div>
      )}
      
      <div className="import-preview-actions">
        {onCancel && (
          <button onClick={onCancel} className="import-preview-button import-preview-button-cancel">
            Cancelar
          </button>
        )}
        
        {onConfirm && (
          <button 
            onClick={handleConfirm} 
            className="import-preview-button import-preview-button-confirm"
            disabled={selectedLayers.length === 0}
          >
            Importar seleccionados
          </button>
        )}
      </div>
    </div>
  );
}; 