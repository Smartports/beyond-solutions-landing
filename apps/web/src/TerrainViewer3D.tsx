import React, { useEffect, useRef, useState } from 'react';
import { FeatureCollection } from 'geojson';

/**
 * Props para el componente TerrainViewer3D
 */
interface TerrainViewer3DProps {
  /**
   * Datos GeoJSON del terreno
   */
  geoJson: FeatureCollection;
  
  /**
   * Elevación base del terreno (metros)
   */
  baseElevation?: number;
  
  /**
   * Elevación máxima del terreno (metros)
   */
  maxElevation?: number;
  
  /**
   * Callback cuando se completa la carga
   */
  onLoaded?: () => void;
  
  /**
   * Callback cuando se toma una captura
   */
  onSnapshot?: (dataUrl: string) => void;
}

/**
 * Componente para visualizar terrenos en 3D
 */
const TerrainViewer3D: React.FC<TerrainViewer3DProps> = ({
  geoJson,
  baseElevation = 0,
  maxElevation = 10,
  onLoaded,
  onSnapshot
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<any>(null);
  const [sunDate, setSunDate] = useState<Date>(new Date());
  const [sunLatitude, setSunLatitude] = useState<number>(0);
  const [sunLongitude, setSunLongitude] = useState<number>(0);
  const [windDirection, setWindDirection] = useState<number>(0);
  const [windIntensity, setWindIntensity] = useState<number>(0.5);
  
  // Inicializar el renderizador 3D cuando el componente se monta
  useEffect(() => {
    if (!canvasRef.current || !geoJson) return;
    
    // Importar dinámicamente Babylon.js y el renderizador de terreno
    const initRenderer = async () => {
      try {
        // Importar Babylon.js y el renderizador de terreno
        const BABYLON = await import('babylonjs');
        await import('babylonjs-loaders');
        const { Terrain3DRenderer } = (await import('@beyond/geo')) as any;
        
        // Crear renderizador
        const terrainRenderer = new Terrain3DRenderer({
          canvas: canvasRef.current!,
          geoJson,
          baseElevation,
          maxElevation,
          terrainColor: new BABYLON.Color3(0.4, 0.6, 0.3),
          skyColor: new BABYLON.Color3(0.8, 0.8, 1.0),
          detailLevel: 5
        });
        
        setRenderer(terrainRenderer);
        
        // Notificar que se completó la carga
        if (onLoaded) {
          onLoaded();
        }
      } catch (error) {
        console.error('Error al inicializar el renderizador 3D:', error);
      }
    };
    
    initRenderer();
    
    // Limpiar al desmontar
    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [geoJson, baseElevation, maxElevation, onLoaded]);
  
  // Actualizar posición del sol cuando cambian los parámetros
  useEffect(() => {
    if (!renderer) return;
    
    try {
      renderer.setSunPosition(sunDate, sunLatitude, sunLongitude);
    } catch (error) {
      console.error('Error al actualizar posición del sol:', error);
    }
  }, [renderer, sunDate, sunLatitude, sunLongitude]);
  
  // Actualizar simulación de viento cuando cambian los parámetros
  useEffect(() => {
    if (!renderer) return;
    
    try {
      renderer.setWind(windDirection, windIntensity);
    } catch (error) {
      console.error('Error al actualizar simulación de viento:', error);
    }
  }, [renderer, windDirection, windIntensity]);
  
  /**
   * Maneja el cambio en la fecha/hora para análisis solar
   */
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateTime = new Date(event.target.value);
    setSunDate(dateTime);
  };
  
  /**
   * Maneja el cambio en la latitud para análisis solar
   */
  const handleLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSunLatitude(parseFloat(event.target.value));
  };
  
  /**
   * Maneja el cambio en la longitud para análisis solar
   */
  const handleLongitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSunLongitude(parseFloat(event.target.value));
  };
  
  /**
   * Maneja el cambio en la dirección del viento
   */
  const handleWindDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWindDirection(parseFloat(event.target.value));
  };
  
  /**
   * Maneja el cambio en la intensidad del viento
   */
  const handleWindIntensityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWindIntensity(parseFloat(event.target.value));
  };
  
  /**
   * Toma una captura de la escena
   */
  const handleTakeSnapshot = async () => {
    if (!renderer) return;
    
    try {
      const dataUrl = await renderer.takeSnapshot();
      
      if (onSnapshot) {
        onSnapshot(dataUrl);
      } else {
        // Si no hay callback, abrir en nueva pestaña
        const win = window.open();
        if (win) {
          win.document.write(`<img src="${dataUrl}" alt="Terrain Snapshot" />`);
        }
      }
    } catch (error) {
      console.error('Error al tomar captura:', error);
    }
  };
  
  /**
   * Exporta el modelo 3D en formato glTF
   */
  const handleExportGLTF = async () => {
    if (!renderer) return;
    
    try {
      const blob = await renderer.exportToGLTF();
      
      // Crear URL para descarga
      const url = URL.createObjectURL(blob);
      
      // Crear enlace de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = 'terrain.glb';
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('Error al exportar modelo 3D:', error);
    }
  };
  
  // Formatear fecha para el input
  const formattedDate = sunDate.toISOString().slice(0, 16);
  
  return (
    <div className="terrain-viewer-3d">
      <div className="terrain-viewer-3d-canvas-container">
        <canvas ref={canvasRef} className="terrain-viewer-3d-canvas" />
      </div>
      
      <div className="terrain-viewer-3d-controls">
        <div className="terrain-viewer-3d-control-group">
          <h4>Análisis Solar</h4>
          
          <div className="terrain-viewer-3d-control">
            <label>Fecha y hora:</label>
            <input
              type="datetime-local"
              value={formattedDate}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="terrain-viewer-3d-control">
            <label>Latitud:</label>
            <input
              type="number"
              min="-90"
              max="90"
              step="0.1"
              value={sunLatitude}
              onChange={handleLatitudeChange}
            />
          </div>
          
          <div className="terrain-viewer-3d-control">
            <label>Longitud:</label>
            <input
              type="number"
              min="-180"
              max="180"
              step="0.1"
              value={sunLongitude}
              onChange={handleLongitudeChange}
            />
          </div>
        </div>
        
        <div className="terrain-viewer-3d-control-group">
          <h4>Análisis de Viento</h4>
          
          <div className="terrain-viewer-3d-control">
            <label>Dirección (grados):</label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={windDirection}
              onChange={handleWindDirectionChange}
            />
            <span>{windDirection}°</span>
          </div>
          
          <div className="terrain-viewer-3d-control">
            <label>Intensidad:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={windIntensity}
              onChange={handleWindIntensityChange}
            />
            <span>{(windIntensity * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="terrain-viewer-3d-control-group">
          <h4>Exportar</h4>
          
          <div className="terrain-viewer-3d-control-buttons">
            <button onClick={handleTakeSnapshot}>
              Tomar Captura
            </button>
            
            <button onClick={handleExportGLTF}>
              Exportar Modelo 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainViewer3D; 