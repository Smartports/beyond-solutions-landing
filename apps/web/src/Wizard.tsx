import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer, StepIndicator, SelectCard } from '@beyond/ui';
import { Project } from '@beyond/core';

// Iconos para los perfiles de usuario
const ProfileIcons = {
  developer: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-3.76 0-7.17-.83-10-2.308z" />
    </svg>
  ),
  owner: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  investor: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  ),
  architect: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  )
};

// Iconos para los tipos de proyecto
const ProjectTypeIcons = {
  residential: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  commercial: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v8H5V6z" clipRule="evenodd" />
      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
    </svg>
  ),
  mixed: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
    </svg>
  ),
  industrial: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
    </svg>
  )
};

// Opciones para el selector de perfil de usuario
const profileOptions = [
  {
    id: 'developer',
    title: 'Desarrollador',
    description: 'Constructor o promotor de proyectos inmobiliarios',
    icon: ProfileIcons.developer
  },
  {
    id: 'owner',
    title: 'Propietario',
    description: 'Dueño del terreno o edificación',
    icon: ProfileIcons.owner
  },
  {
    id: 'investor',
    title: 'Inversionista',
    description: 'Financiamiento y apoyo económico',
    icon: ProfileIcons.investor
  },
  {
    id: 'architect',
    title: 'Arquitecto',
    description: 'Diseño y planeación de proyectos',
    icon: ProfileIcons.architect
  }
];

// Opciones para el selector de tipo de proyecto
const projectTypeOptions = [
  {
    id: 'residential',
    title: 'Residencial',
    description: 'Viviendas unifamiliares o multifamiliares',
    icon: ProjectTypeIcons.residential
  },
  {
    id: 'commercial',
    title: 'Comercial',
    description: 'Oficinas, locales y espacios para negocios',
    icon: ProjectTypeIcons.commercial
  },
  {
    id: 'mixed',
    title: 'Uso mixto',
    description: 'Combinación de residencial y comercial',
    icon: ProjectTypeIcons.mixed
  },
  {
    id: 'industrial',
    title: 'Industrial',
    description: 'Bodegas, fábricas y centros logísticos',
    icon: ProjectTypeIcons.industrial
  }
];

// Definición de pasos del wizard
const WIZARD_STEPS = [
  { id: 'profile', title: 'Perfil' },
  { id: 'projectType', title: 'Tipo de proyecto' }
];

interface WizardProps {
  onComplete?: (data: { profile: string; projectType: string }) => void;
  initialData?: { profile?: string; projectType?: string };
}

const Wizard: React.FC<WizardProps> = ({ onComplete, initialData }) => {
  const navigate = useNavigate();
  
  // Estado del formulario
  const [state, setState] = useState({
    profile: initialData?.profile || '',
    projectType: initialData?.projectType || '',
    projectId: null as number | null,
    isSaving: false,
    lastSaved: null as Date | null,
    currentStep: 0,
    errors: {
      profile: '',
      projectType: ''
    }
  });
  
  // Efecto para cargar datos guardados al iniciar
  useEffect(() => {
    // Aquí se cargarían datos del almacenamiento local si existieran
    const savedData = localStorage.getItem('beyondWizardState');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setState(prev => ({
          ...prev,
          profile: parsed.profile || '',
          projectType: parsed.projectType || '',
          projectId: parsed.projectId || null
        }));
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);
  
  // Efecto para autosave cuando cambian los datos importantes
  useEffect(() => {
    if (state.profile || state.projectType) {
      const saveTimeout = setTimeout(() => {
        saveCurrentState();
      }, 1000);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [state.profile, state.projectType]);
  
  // Función para guardar el estado actual
  const saveCurrentState = async () => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      // Crear objeto de proyecto para guardar
      const projectData: Partial<Project> = {
        name: `Proyecto ${new Date().toLocaleDateString()}`,
        profileId: 1, // Esto se relacionaría con el perfil del usuario
        projectType: state.projectType || 'undefined',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessed: new Date()
      };
      
      if (state.projectId) {
        projectData.id = state.projectId;
      }
      
      // Guardar en almacenamiento local para rápida recuperación
      localStorage.setItem('beyondWizardState', JSON.stringify({
        profile: state.profile,
        projectType: state.projectType,
        projectId: state.projectId
      }));
      
      // Simulación de guardado (aquí usaríamos autoSave de core)
      // await autoSave(projectData as Project);
      
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        lastSaved: new Date()
      }));
      
      if (onComplete) {
        onComplete({ profile: state.profile, projectType: state.projectType });
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Error saving state:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };
  
  // Validar campos del paso actual
  const validateCurrentStep = (): boolean => {
    const errors = { profile: '', projectType: '' };
    let isValid = true;
    
    if (state.currentStep === 0 && !state.profile) {
      errors.profile = 'Por favor selecciona un perfil';
      isValid = false;
    }
    
    if (state.currentStep === 1 && !state.projectType) {
      errors.projectType = 'Por favor selecciona un tipo de proyecto';
      isValid = false;
    }
    
    setState(prev => ({ ...prev, errors }));
    return isValid;
  };
  
  // Manejar avance al siguiente paso
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    if (state.currentStep < WIZARD_STEPS.length - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      // Si es el último paso, guardamos y redirigimos al dashboard
      saveCurrentState();
    }
  };
  
  // Manejar retroceso al paso anterior
  const handlePrevious = () => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };
  
  // Manejar clic directo en un paso
  const handleStepClick = (stepIndex: number) => {
    // Solo permitir ir a pasos anteriores o al actual
    if (stepIndex <= state.currentStep) {
      setState(prev => ({ ...prev, currentStep: stepIndex }));
    } else if (validateCurrentStep()) {
      // Si quiere ir a un paso futuro, validar el actual primero
      setState(prev => ({ ...prev, currentStep: stepIndex }));
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 pt-8">
      <h1 className="text-3xl font-bold mb-6 text-primary-800 dark:text-accent-50">
        Calculadora Inmobiliaria - Configuración Inicial
      </h1>
      
      {/* Indicador de pasos */}
      <StepIndicator 
        steps={WIZARD_STEPS} 
        currentStep={state.currentStep}
        onStepClick={handleStepClick}
      />
      
      {/* Contenido del paso actual */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        {/* Paso 1: Selección de perfil */}
        <StepContainer
          title="1. Selecciona tu perfil"
          isActive={state.currentStep === 0}
          stepId="profile"
          onNext={handleNext}
        >
          <SelectCard
            name="profile"
            options={profileOptions}
            value={state.profile}
            onChange={(value) => setState(prev => ({ ...prev, profile: value }))}
            error={state.errors.profile}
            required
            label="¿Cuál es tu rol en el proyecto?"
          />
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Esta información nos ayuda a personalizar las recomendaciones y cálculos para tu proyecto.
          </p>
        </StepContainer>
        
        {/* Paso 2: Selección de tipo de proyecto */}
        <StepContainer
          title="2. Selecciona el tipo de proyecto"
          isActive={state.currentStep === 1}
          stepId="projectType"
          onNext={handleNext}
          onPrevious={handlePrevious}
        >
          <SelectCard
            name="projectType"
            options={projectTypeOptions}
            value={state.projectType}
            onChange={(value) => setState(prev => ({ ...prev, projectType: value }))}
            error={state.errors.projectType}
            required
            label="¿Qué tipo de proyecto quieres desarrollar?"
          />
          
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            El tipo de proyecto afecta los cálculos de costos, regulaciones aplicables y recomendaciones de materiales.
          </p>
        </StepContainer>
      </div>
      
      {/* Indicador de guardado automático */}
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end gap-2">
        {state.isSaving ? (
          <>
            <svg className="animate-spin h-4 w-4 text-primary-800 dark:text-accent-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Guardando...</span>
          </>
        ) : state.lastSaved ? (
          <>
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              Guardado automáticamente {state.lastSaved.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </>
        ) : (
          <span>Los cambios se guardarán automáticamente</span>
        )}
      </div>
    </div>
  );
};

export default Wizard; 