import React, { useState } from 'react';
import { ExportSystem, PDFExportOptions, PDFSection } from '../models/ExportSystem';

interface PDFExporterProps {
  exportSystem: ExportSystem;
  className?: string;
  defaultOptions?: Partial<PDFExportOptions>;
  onExportStart?: () => void;
  onExportComplete?: (url: string) => void;
  onExportError?: (error: Error) => void;
}

/**
 * Componente para exportar informes en PDF
 */
const PDFExporter: React.FC<PDFExporterProps> = ({
  exportSystem,
  className,
  defaultOptions,
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const [options, setOptions] = useState<PDFExportOptions>({
    filename: `proyecto_inmobiliario_${Date.now()}.pdf`,
    title: 'Informe de Proyecto Inmobiliario',
    author: 'Beyond Solutions',
    subject: 'Análisis Inmobiliario',
    includeImages: true,
    includeFinancialData: true,
    includeTables: true,
    includeCharts: true,
    orientation: 'portrait',
    pageSize: 'a4',
    ...defaultOptions
  });
  
  // Manejar cambios en las opciones
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Manejar checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setOptions(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setOptions(prev => ({
        ...prev,
        [name]: value
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
        setExportProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Realizar exportación
      const pdfUrl = await exportSystem.exportPDF(options);
      
      // Limpiar intervalo y completar
      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (onExportComplete) {
        onExportComplete(pdfUrl);
      }
      
      // Ofrecer descarga
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = options.filename || 'informe.pdf';
      link.click();
      
      // Resetear estado después de un momento
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2000);
      
    } catch (error) {
      setExportError(`Error al exportar PDF: ${error instanceof Error ? error.message : String(error)}`);
      setIsExporting(false);
      
      if (onExportError && error instanceof Error) {
        onExportError(error);
      }
    }
  };
  
  return (
    <div className={`pdf-exporter ${className || ''}`}>
      <div className="export-options">
        <h3>Opciones de Exportación PDF</h3>
        
        <div className="option-group">
          <label htmlFor="filename">Nombre del archivo:</label>
          <input
            type="text"
            id="filename"
            name="filename"
            value={options.filename || ''}
            onChange={handleOptionChange}
            disabled={isExporting}
          />
        </div>
        
        <div className="option-group">
          <label htmlFor="title">Título:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={options.title || ''}
            onChange={handleOptionChange}
            disabled={isExporting}
          />
        </div>
        
        <div className="option-group">
          <label htmlFor="pageSize">Tamaño de página:</label>
          <select
            id="pageSize"
            name="pageSize"
            value={options.pageSize || 'a4'}
            onChange={handleOptionChange}
            disabled={isExporting}
          >
            <option value="a4">A4</option>
            <option value="letter">Carta</option>
            <option value="legal">Legal</option>
          </select>
        </div>
        
        <div className="option-group">
          <label htmlFor="orientation">Orientación:</label>
          <select
            id="orientation"
            name="orientation"
            value={options.orientation || 'portrait'}
            onChange={handleOptionChange}
            disabled={isExporting}
          >
            <option value="portrait">Vertical</option>
            <option value="landscape">Horizontal</option>
          </select>
        </div>
        
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeImages"
              checked={options.includeImages !== false}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            Incluir imágenes
          </label>
        </div>
        
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeFinancialData"
              checked={options.includeFinancialData !== false}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            Incluir datos financieros
          </label>
        </div>
        
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeTables"
              checked={options.includeTables !== false}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            Incluir tablas
          </label>
        </div>
        
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="includeCharts"
              checked={options.includeCharts !== false}
              onChange={handleOptionChange}
              disabled={isExporting}
            />
            Incluir gráficos
          </label>
        </div>
      </div>
      
      {exportError && (
        <div className="export-error">
          {exportError}
        </div>
      )}
      
      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="progress-text">
            {exportProgress}% completado
          </div>
        </div>
      )}
      
      <div className="export-actions">
        <button
          className="export-button"
          onClick={startExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>
    </div>
  );
};

export default PDFExporter; 