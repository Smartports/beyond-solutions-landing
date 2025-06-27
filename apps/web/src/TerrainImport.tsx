import React, { useState } from 'react';
import { DxfImporter, GeoJsonImporter, DxfImportResult } from '@beyond/geo';
import { GeoJsonImportResult } from '@beyond/geo';

/**
 * Tipos de archivos soportados
 */
enum FileType {
  DXF = 'dxf',
  GEOJSON = 'geojson',
  JSON = 'json'
}

/**
 * Resultado de la importación
 */
interface ImportResult {
  fileType: FileType;
  fileName: string;
  data: DxfImportResult | GeoJsonImportResult | null;
  success: boolean;
  error?: string;
}

/**
 * Props para el componente TerrainImport
 */
interface TerrainImportProps {
  /**
   * Callback cuando se completa la importación
   */
  onImportComplete: (data: any) => void;
  
  /**
   * Callback cuando se cancela la importación
   */
  onCancel: () => void;
}

/**
 * Componente para importar terrenos desde archivos CAD/GIS
 */
const TerrainImport: React.FC<TerrainImportProps> = ({ onImportComplete, onCancel }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  
  // Instancias de importadores
  const dxfImporter = new DxfImporter();
  const geoJsonImporter = new GeoJsonImporter();
  
  /**
   * Maneja la carga de archivos
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    // Resetear estado
    setError(null);
    setImportResult(null);
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase() as FileType;
    
    // Verificar extensión
    if (![FileType.DXF, FileType.GEOJSON, FileType.JSON].includes(extension)) {
      setError('Formato de archivo no soportado. Use archivos DXF o GeoJSON.');
      return;
    }
    
    // Iniciar carga
    setIsLoading(true);
    
    try {
      // Leer archivo como texto
      const fileContent = await readFileAsText(file);
      
      // Procesar según tipo
      let result: ImportResult;
      
      if (extension === FileType.DXF) {
        // Importar DXF
        const dxfResult = dxfImporter.importDxf(fileContent);
        result = {
          fileType: FileType.DXF,
          fileName,
          data: dxfResult,
          success: dxfResult.success,
          error: dxfResult.error
        };
        
        if (dxfResult.success && dxfResult.layers) {
          setSelectedLayers(dxfResult.layers);
        }
      } else {
        // Importar GeoJSON
        const geoJsonResult = geoJsonImporter.importGeoJson(fileContent);
        result = {
          fileType: extension,
          fileName,
          data: geoJsonResult,
          success: geoJsonResult.success,
          error: geoJsonResult.error
        };
        
        // Extraer capas de GeoJSON
        if (geoJsonResult.success && geoJsonResult.featureCollection) {
          const layerSet = new Set<string>();
          
          geoJsonResult.featureCollection.features.forEach(feature => {
            if (feature.properties && feature.properties.layer) {
              layerSet.add(feature.properties.layer as string);
            }
          });
          
          const layers = Array.from(layerSet);
          if (layers.length === 0) {
            layers.push('default');
          }
          
          setSelectedLayers(layers);
        }
      }
      
      setImportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Lee un archivo como texto
   */
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  };
  
  /**
   * Maneja la selección de capas
   */
  const handleLayerSelect = (layer: string, checked: boolean) => {
    if (checked) {
      setSelectedLayers([...selectedLayers, layer]);
    } else {
      setSelectedLayers(selectedLayers.filter(l => l !== layer));
    }
  };
  
  /**
   * Maneja la selección/deselección de todas las capas
   */
  const handleSelectAllLayers = (select: boolean) => {
    if (!importResult?.data) return;
    
    let layers: string[] = [];
    
    if (select) {
      if (importResult.fileType === FileType.DXF && (importResult.data as DxfImportResult).layers) {
        layers = (importResult.data as DxfImportResult).layers;
      } else if (importResult.fileType === FileType.GEOJSON || importResult.fileType === FileType.JSON) {
        // Extraer capas de GeoJSON
        const layerSet = new Set<string>();
        
        (importResult.data as GeoJsonImportResult).featureCollection.features.forEach(feature => {
          if (feature.properties && feature.properties.layer) {
            layerSet.add(feature.properties.layer as string);
          }
        });
        
        layers = Array.from(layerSet);
        if (layers.length === 0) {
          layers.push('default');
        }
      }
    }
    
    setSelectedLayers(layers);
  };
  
  /**
   * Maneja la confirmación de la importación
   */
  const handleConfirm = () => {
    if (!importResult?.success || !importResult?.data) {
      return;
    }
    
    // Filtrar datos según capas seleccionadas
    let processedData: any = null;
    
    if (importResult.fileType === FileType.DXF) {
      const dxfData = importResult.data as DxfImportResult;
      
      // Filtrar entidades por capa
      const filteredEntities = dxfData.entities.filter(
        entity => selectedLayers.includes(entity.layer)
      );
      
      // Convertir a GeoJSON para uso uniforme
      const geoJson = dxfImporter.toGeoJSON(filteredEntities);
      
      processedData = {
        type: 'dxf',
        fileName: importResult.fileName,
        geoJson,
        bounds: dxfData.bounds
      };
    } else {
      const geoJsonData = importResult.data as GeoJsonImportResult;
      
      // Filtrar features por capa
      const filteredFeatures = geoJsonData.featureCollection.features.filter(feature => {
        const layer = feature.properties?.layer || 'default';
        return selectedLayers.includes(layer as string);
      });
      
      const filteredCollection = {
        type: 'FeatureCollection',
        features: filteredFeatures
      };
      
      processedData = {
        type: 'geojson',
        fileName: importResult.fileName,
        geoJson: filteredCollection,
        bounds: geoJsonData.bounds
      };
    }
    
    // Llamar al callback
    onImportComplete(processedData);
  };
  
  return (
    <div className="terrain-import">
      <h2>Importar Terreno</h2>
      
      {!importResult && (
        <div className="terrain-import-upload">
          <p>Seleccione un archivo DXF o GeoJSON para importar:</p>
          
          <input
            type="file"
            accept=".dxf,.geojson,.json"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          
          {isLoading && <p>Cargando archivo...</p>}
          
          {error && (
            <div className="terrain-import-error">
              <p>{error}</p>
            </div>
          )}
          
          <div className="terrain-import-actions">
            <button onClick={onCancel} className="terrain-import-button-cancel">
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {importResult?.success && importResult?.data && (
        <div className="terrain-import-preview">
          <h3>Vista previa de importación</h3>
          
          <div className="terrain-import-info">
            <p>
              <strong>Archivo:</strong> {importResult.fileName}
            </p>
            <p>
              <strong>Tipo:</strong> {importResult.fileType.toUpperCase()}
            </p>
            
            {importResult.fileType === FileType.DXF && (
              <p>
                <strong>Entidades:</strong> {(importResult.data as DxfImportResult).entities.length}
              </p>
            )}
            
            {(importResult.fileType === FileType.GEOJSON || importResult.fileType === FileType.JSON) && (
              <p>
                <strong>Features:</strong> {(importResult.data as GeoJsonImportResult).featureCount}
              </p>
            )}
          </div>
          
          <div className="terrain-import-layers">
            <h4>Capas disponibles:</h4>
            
            <div className="terrain-import-layer-actions">
              <button 
                onClick={() => handleSelectAllLayers(true)}
                className="terrain-import-button-small"
              >
                Seleccionar todo
              </button>
              <button 
                onClick={() => handleSelectAllLayers(false)}
                className="terrain-import-button-small"
              >
                Deseleccionar todo
              </button>
            </div>
            
            <div className="terrain-import-layer-list">
              {importResult.fileType === FileType.DXF && (
                (importResult.data as DxfImportResult).layers.map(layer => (
                  <label key={layer} className="terrain-import-layer-item">
                    <input
                      type="checkbox"
                      checked={selectedLayers.includes(layer)}
                      onChange={(e) => handleLayerSelect(layer, e.target.checked)}
                    />
                    {layer}
                  </label>
                ))
              )}
              
              {(importResult.fileType === FileType.GEOJSON || importResult.fileType === FileType.JSON) && (
                Array.from(new Set(
                  (importResult.data as GeoJsonImportResult).featureCollection.features.map(
                    feature => feature.properties?.layer || 'default'
                  )
                )).map(layer => (
                  <label key={layer as string} className="terrain-import-layer-item">
                    <input
                      type="checkbox"
                      checked={selectedLayers.includes(layer as string)}
                      onChange={(e) => handleLayerSelect(layer as string, e.target.checked)}
                    />
                    {layer}
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="terrain-import-actions">
            <button onClick={onCancel} className="terrain-import-button-cancel">
              Cancelar
            </button>
            <button 
              onClick={handleConfirm} 
              className="terrain-import-button-confirm"
              disabled={selectedLayers.length === 0}
            >
              Importar seleccionados
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TerrainImport; 