import React, { useState, useEffect } from 'react';
import { LightingSystem, TimeOfDay } from '../models/LightingSystem';

interface DayNightControllerProps {
  lightingSystem: LightingSystem;
  className?: string;
  showTimeDisplay?: boolean;
  showSlider?: boolean;
  showPresets?: boolean;
  initialHour?: number;
  onChange?: (time: TimeOfDay) => void;
}

/**
 * Componente para controlar el ciclo día/noche
 */
const DayNightController: React.FC<DayNightControllerProps> = ({
  lightingSystem,
  className,
  showTimeDisplay = true,
  showSlider = true,
  showPresets = true,
  initialHour = 12,
  onChange
}) => {
  const [currentTime, setCurrentTime] = useState<TimeOfDay>({ 
    hour: initialHour, 
    minute: 0 
  });
  const [sliderValue, setSliderValue] = useState<number>(initialHour * 60);
  
  // Inicializar con la hora actual del sistema de iluminación
  useEffect(() => {
    if (lightingSystem) {
      const systemTime = lightingSystem.getTime();
      setCurrentTime(systemTime);
      setSliderValue(systemTime.hour * 60 + systemTime.minute);
    }
  }, [lightingSystem]);
  
  // Actualizar la hora cuando cambia el slider
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const totalMinutes = parseInt(event.target.value, 10);
    setSliderValue(totalMinutes);
    
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = totalMinutes % 60;
    
    const newTime = { hour, minute };
    setCurrentTime(newTime);
    
    if (lightingSystem) {
      lightingSystem.setTime(newTime);
    }
    
    if (onChange) {
      onChange(newTime);
    }
  };
  
  // Aplicar preset de hora
  const applyTimePreset = (hour: number) => {
    const newTime = { hour, minute: 0 };
    setCurrentTime(newTime);
    setSliderValue(hour * 60);
    
    if (lightingSystem) {
      lightingSystem.setTime(newTime);
    }
    
    if (onChange) {
      onChange(newTime);
    }
  };
  
  // Formatear hora para mostrar
  const formatTime = (time: TimeOfDay): string => {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };
  
  // Determinar si es de día o de noche
  const isDaytime = currentTime.hour >= 6 && currentTime.hour < 18;
  
  // Determinar momento del día para estilo
  const getTimeOfDayClass = (): string => {
    const hour = currentTime.hour;
    
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 16) return 'day';
    if (hour >= 16 && hour < 19) return 'dusk';
    return 'night';
  };
  
  return (
    <div className={`day-night-controller ${getTimeOfDayClass()} ${className || ''}`}>
      {showTimeDisplay && (
        <div className="time-display">
          <div className="time-text">{formatTime(currentTime)}</div>
          <div className="time-icon">
            {isDaytime ? (
              <span role="img" aria-label="sun">☀️</span>
            ) : (
              <span role="img" aria-label="moon">🌙</span>
            )}
          </div>
        </div>
      )}
      
      {showSlider && (
        <div className="time-slider-container">
          <input
            type="range"
            min="0"
            max="1439"
            value={sliderValue}
            onChange={handleSliderChange}
            className="time-slider"
            aria-label="Time of day"
          />
          <div className="slider-markers">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>
      )}
      
      {showPresets && (
        <div className="time-presets">
          <button 
            className={currentTime.hour === 0 ? 'active' : ''} 
            onClick={() => applyTimePreset(0)}
            aria-label="Midnight"
          >
            <span role="img" aria-hidden="true">🌑</span> 12 AM
          </button>
          <button 
            className={currentTime.hour === 6 ? 'active' : ''} 
            onClick={() => applyTimePreset(6)}
            aria-label="Dawn"
          >
            <span role="img" aria-hidden="true">🌅</span> 6 AM
          </button>
          <button 
            className={currentTime.hour === 12 ? 'active' : ''} 
            onClick={() => applyTimePreset(12)}
            aria-label="Noon"
          >
            <span role="img" aria-hidden="true">☀️</span> 12 PM
          </button>
          <button 
            className={currentTime.hour === 18 ? 'active' : ''} 
            onClick={() => applyTimePreset(18)}
            aria-label="Sunset"
          >
            <span role="img" aria-hidden="true">🌇</span> 6 PM
          </button>
        </div>
      )}
    </div>
  );
};

export default DayNightController; 