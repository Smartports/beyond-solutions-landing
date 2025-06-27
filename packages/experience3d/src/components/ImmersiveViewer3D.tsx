import React, { useEffect, useRef, useState } from 'react';
import { 
  ImmersiveViewer, 
  ImmersiveViewerOptions, 
  CameraType 
} from '../models/ImmersiveViewer';
import { LightingSystem } from '../models/LightingSystem';
import { SeasonSystem, Season } from '../models/SeasonSystem';
import { ViewManager, ViewPoint } from '../models/ViewManager';

interface ImmersiveViewer3DProps {
  canvasId: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  options?: Partial<ImmersiveViewerOptions>;
  onReady?: (viewer: ImmersiveViewer) => void;
  onError?: (error: Error) => void;
  initialCameraType?: CameraType;
  initialSeason?: Season;
  viewPoints?: ViewPoint[];
  enableLighting?: boolean;
  enableSeasons?: boolean;
  enableViewManager?: boolean;
}

/**
 * Componente React para el visor 3D inmersivo
 */
const ImmersiveViewer3D: React.FC<ImmersiveViewer3DProps> = ({
  canvasId,
  width = '100%',
  height = '500px',
  className,
  options,
  onReady,
  onError,
  initialCameraType = CameraType.ARC_ROTATE,
  initialSeason = Season.SUMMER,
  viewPoints = [],
  enableLighting = true,
  enableSeasons = true,
  enableViewManager = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ImmersiveViewer | null>(null);
  const lightingSystemRef = useRef<LightingSystem | null>(null);
  const seasonSystemRef = useRef<SeasonSystem | null>(null);
  const viewManagerRef = useRef<ViewManager | null>(null);
  
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Inicializar el visor cuando el componente se monta
  useEffect(() => {
    if (!canvasRef.current) return;
    
    try {
      // Configurar opciones
      const viewerOptions: ImmersiveViewerOptions = {
        canvasId,
        defaultCameraType: initialCameraType,
        antialias: true,
        enableCollisions: true,
        enableOcclusionCulling: true,
        ...options
      };
      
      // Crear visor
      const viewer = new ImmersiveViewer(viewerOptions);
      viewerRef.current = viewer;
      
      // Inicializar
      const success = viewer.initialize();
      if (!success) {
        throw new Error('Failed to initialize 3D viewer');
      }
      
      // Crear sistemas adicionales si están habilitados
      if (enableLighting) {
        lightingSystemRef.current = new LightingSystem(viewer, {
          enableShadows: true,
          shadowQuality: 'medium',
          enableHDR: true
        });
      }
      
      if (enableSeasons) {
        seasonSystemRef.current = new SeasonSystem(viewer, {
          initialSeason,
          enableParticleEffects: true,
          affectMaterials: true
        });
        
        // Conectar con sistema de iluminación si ambos existen
        if (lightingSystemRef.current && seasonSystemRef.current) {
          seasonSystemRef.current.setLightingSystem(lightingSystemRef.current);
          seasonSystemRef.current.setSeason(initialSeason);
        }
      }
      
      if (enableViewManager) {
        viewManagerRef.current = new ViewManager(viewer, {
          enableTransitions: true,
          transitionDuration: 1000,
          createMinimap: true,
          showLabels: true
        });
        
        // Añadir puntos de vista si se proporcionan
        if (viewPoints && viewPoints.length > 0) {
          viewManagerRef.current.addViewPoints(viewPoints);
        }
      }
      
      // Notificar que está listo
      setIsInitialized(true);
      if (onReady) {
        onReady(viewer);
      }
    } catch (err) {
      console.error('Error initializing 3D viewer:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
    
    // Limpieza al desmontar
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
      
      if (seasonSystemRef.current) {
        seasonSystemRef.current.dispose();
      }
      
      if (viewManagerRef.current) {
        viewManagerRef.current.dispose();
      }
    };
  }, [canvasId]); // Solo se ejecuta al montar/desmontar
  
  // Exponer las referencias a los sistemas a través de un API pública
  React.useImperativeHandle(
    React.createRef(),
    () => ({
      viewer: viewerRef.current,
      lightingSystem: lightingSystemRef.current,
      seasonSystem: seasonSystemRef.current,
      viewManager: viewManagerRef.current,
      
      setCameraType: (cameraType: CameraType) => {
        if (viewerRef.current) {
          viewerRef.current.setCameraType(cameraType);
        }
      },
      
      setSeason: (season: Season) => {
        if (seasonSystemRef.current) {
          seasonSystemRef.current.setSeason(season);
        }
      },
      
      goToView: (viewId: string) => {
        if (viewManagerRef.current) {
          return viewManagerRef.current.goToView(viewId);
        }
        return false;
      }
    }),
    [viewerRef.current, lightingSystemRef.current, seasonSystemRef.current, viewManagerRef.current]
  );
  
  return (
    <div className={`immersive-viewer-container ${className || ''}`} style={{ width, height }}>
      {error && (
        <div className="error-message">
          Error: {error.message}
        </div>
      )}
      <canvas
        id={canvasId}
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ImmersiveViewer3D; 