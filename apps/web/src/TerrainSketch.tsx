import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as turf from '@turf/turf';

// Tipos
export interface TerrainSketchProps {
  initialCenter?: { lat: number; lng: number };
  onPolygonComplete?: (polygon: {
    coordinates: Array<[number, number]>;
    area: number;
    perimeter: number;
  }) => void;
  className?: string;
}

/**
 * Componente para dibujar un sketch 2D del terreno
 */
export const TerrainSketch: React.FC<TerrainSketchProps> = ({
  initialCenter: _initialCenter,
  onPolygonComplete,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Inicializar el canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Ajustar dimensiones del canvas
    canvas.width = rect.width;
    canvas.height = rect.height;

    setDimensions({
      width: rect.width,
      height: rect.height,
    });

    // Centrar el offset inicial
    setOffset({
      x: rect.width / 2,
      y: rect.height / 2,
    });

    // Dibujar el canvas inicial
    drawCanvas();
  }, []);

  // Redibujar el canvas cuando cambian los puntos o el offset
  useEffect(() => {
    drawCanvas();
    calculateAreaAndPerimeter();
  }, [points, offset, scale]);

  // Función para dibujar el canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    const gridSize = 20 * scale;
    const offsetX = offset.x % gridSize;
    const offsetY = offset.y % gridSize;

    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Dibujar punto central
    ctx.fillStyle = '#334b4e';
    ctx.beginPath();
    ctx.arc(offset.x, offset.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dibujar polígono
    if (points.length > 0) {
      ctx.strokeStyle = '#334b4e';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const firstPoint = points[0];
      ctx.moveTo(firstPoint.x + offset.x, firstPoint.y + offset.y);

      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point.x + offset.x, point.y + offset.y);
      }

      if (isDrawing && points.length > 2) {
        ctx.lineTo(firstPoint.x + offset.x, firstPoint.y + offset.y);
      }

      ctx.stroke();

      // Dibujar puntos
      ctx.fillStyle = '#b9c6cd';
      for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x + offset.x, point.y + offset.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [points, offset, scale, isDrawing]);

  // Calcular área y perímetro del polígono
  const calculateAreaAndPerimeter = useCallback(() => {
    if (points.length < 3) return;

    // Convertir puntos a coordenadas geográficas
    const coordinates = points.map((point) => {
      // Aquí deberíamos convertir los puntos del canvas a coordenadas reales
      // Para este ejemplo, usamos una conversión simple
      const metersPerPixel = 0.1 / scale; // 10cm por píxel a escala 1
      const x = (point.x * metersPerPixel) / 111320; // Aproximación de metros a grados
      const y = (point.y * metersPerPixel) / 111320;

      return [x, y];
    });

    // Cerrar el polígono
    coordinates.push(coordinates[0]);

    try {
      // Calcular área y perímetro con turf.js
      const polygon = turf.polygon([coordinates]);
      const area = turf.area(polygon);
      const perimeter = turf.length(turf.lineString(coordinates)) * 1000;

      // Notificar al componente padre
      if (onPolygonComplete) {
        onPolygonComplete({
          coordinates: coordinates.slice(0, -1) as Array<[number, number]>, // Eliminar el punto duplicado
          area,
          perimeter,
        });
      }
    } catch (error) {
      console.error('Error al calcular área y perímetro:', error);
    }
  }, [points, scale, onPolygonComplete]);

  // Manejar clic en el canvas
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isDragging) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;

      // Verificar si se hizo clic cerca de un punto existente
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);

        if (distance < 10) {
          // Si es el primer punto y hay al menos 3 puntos, cerrar el polígono
          if (i === 0 && points.length > 2) {
            setIsDrawing(false);
            calculateAreaAndPerimeter();
            return;
          }

          // Iniciar arrastre del punto
          setIsDragging(true);
          setDragIndex(i);
          return;
        }
      }

      // Si no estamos en modo dibujo, iniciar uno nuevo
      if (!isDrawing) {
        setPoints([{ x, y }]);
        setIsDrawing(true);
        return;
      }

      // Añadir nuevo punto al polígono
      setPoints([...points, { x, y }]);
    },
    [points, offset, isDrawing, isDragging, calculateAreaAndPerimeter],
  );

  // Manejar movimiento del mouse
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;

      // Si estamos arrastrando un punto, actualizarlo
      if (isDragging && dragIndex !== null) {
        const newPoints = [...points];
        newPoints[dragIndex] = { x, y };
        setPoints(newPoints);
      }
    },
    [points, offset, isDragging, dragIndex],
  );

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragIndex(null);
      calculateAreaAndPerimeter();
    }
  }, [isDragging, calculateAreaAndPerimeter]);

  // Manejar zoom con la rueda del mouse
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      // Ajustar escala con límites
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * delta, 0.1), 10);
      setScale(newScale);
    },
    [scale],
  );

  // Manejar reinicio del dibujo
  const handleReset = useCallback(() => {
    setPoints([]);
    setIsDrawing(false);
    setIsDragging(false);
    setDragIndex(null);
    setScale(1);
    setOffset({
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    });
  }, [dimensions]);

  return (
    <div className={`terrain-sketch ${className}`}>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary-800 dark:text-accent-50">
          Dibuja tu terreno
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Reiniciar
          </button>
        </div>
      </div>

      <div className="relative border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-white dark:bg-gray-900"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-md shadow text-sm">
          <p>Escala: {scale.toFixed(1)}x</p>
          <p>Puntos: {points.length}</p>
          {points.length > 2 && (
            <p>{isDrawing ? 'Haz clic en el primer punto para cerrar' : 'Polígono cerrado'}</p>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Instrucciones:</strong> Haz clic para añadir puntos. Cierra el polígono haciendo
          clic en el primer punto. Arrastra los puntos para ajustar la forma. Usa la rueda del ratón
          para hacer zoom.
        </p>
      </div>
    </div>
  );
};
