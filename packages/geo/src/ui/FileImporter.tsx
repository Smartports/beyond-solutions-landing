import React, { useState, useRef, ChangeEvent } from 'react';
import { DxfImporter } from '../cad/DxfImporter';
import { GeoJsonImporter } from '../gis/GeoJsonImporter';

/**
 * Tipos de archivos soportados
 */
export enum FileType {
  DXF = 'dxf',
  GEOJSON = 'geojson',
  JSON = 'json',
}

/**
 * Resultado de la importación de un archivo
 */
export interface ImportResult {
  fileType: FileType;
  fileName: string;
  data: any;
  success: boolean;
  error?: string;
}

/**
 * Props para el componente FileImporter
 */
export interface FileImporterProps {
  /**
   * Tipos de archivos permitidos
   */
  allowedTypes?: FileType[];

  /**
   * Tamaño máximo del archivo en bytes
   */
  maxSize?: number;

  /**
   * Callback cuando se completa la importación
   */
  onImport: (result: ImportResult) => void;

  /**
   * Texto del botón
   */
  buttonText?: string;

  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente para importar archivos CAD/GIS
 */
export const FileImporter: React.FC<FileImporterProps> = ({
  allowedTypes = [FileType.DXF, FileType.GEOJSON, FileType.JSON],
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  onImport,
  buttonText = 'Importar archivo',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crear instancias de los importadores
  const dxfImporter = new DxfImporter();
  const geoJsonImporter = new GeoJsonImporter();

  /**
   * Maneja el cambio en el input de archivo
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    // Resetear estado
    setError(null);

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Verificar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Obtener extensión
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase() as FileType;

    // Verificar tipo
    if (!allowedTypes.includes(extension)) {
      setError(`Tipo de archivo no soportado. Tipos permitidos: ${allowedTypes.join(', ')}`);
      return;
    }

    // Iniciar carga
    setIsLoading(true);

    try {
      // Leer archivo
      const fileContent = await readFileAsText(file);

      // Procesar según tipo
      let result: ImportResult;

      switch (extension) {
        case FileType.DXF:
          const dxfResult = dxfImporter.importDxf(fileContent);
          result = {
            fileType: FileType.DXF,
            fileName,
            data: dxfResult,
            success: dxfResult.success,
            error: dxfResult.error,
          };
          break;

        case FileType.GEOJSON:
        case FileType.JSON:
          const geoJsonResult = geoJsonImporter.importGeoJson(fileContent);
          result = {
            fileType: extension === FileType.GEOJSON ? FileType.GEOJSON : FileType.JSON,
            fileName,
            data: geoJsonResult,
            success: geoJsonResult.success,
            error: geoJsonResult.error,
          };
          break;

        default:
          throw new Error(`Tipo de archivo no soportado: ${extension}`);
      }

      // Llamar al callback
      onImport(result);

      // Resetear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al importar archivo');

      // Llamar al callback con error
      onImport({
        fileType: extension,
        fileName,
        data: null,
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido al importar archivo',
      });
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
   * Maneja el clic en el botón
   */
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Generar string de tipos de archivos aceptados
  const acceptString = allowedTypes.map((type) => `.${type}`).join(',');

  return (
    <div className={`file-importer ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptString}
        style={{ display: 'none' }}
      />

      <button onClick={handleButtonClick} disabled={isLoading} className="file-importer-button">
        {isLoading ? 'Importando...' : buttonText}
      </button>

      {error && <div className="file-importer-error">{error}</div>}
    </div>
  );
};
