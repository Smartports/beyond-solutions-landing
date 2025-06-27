/**
 * Wizard Module - Gestión del proceso de onboarding
 * Implementa navegación paso a paso con validación y accesibilidad WCAG 2.1 AA
 * @module WizardModule
 */

(function() {
  'use strict';

  /**
   * Factory function para crear instancias del Wizard
   * @returns {Object} Instancia del módulo Wizard
   */
  window.WizardModule = function() {
    // Estado privado del wizard
    const state = {
      currentStep: 0,
      totalSteps: 3,
      formData: {},
      validationRules: {},
      stepHistory: [],
      callbacks: {
        onStepChange: null,
        onComplete: null,
        onValidationError: null
      }
    };

    // Configuración de accesibilidad
    const a11yConfig = {
      announceDelay: 100,
      focusDelay: 200,
      ariaLiveRegion: null
    };

    /**
     * Inicializa el módulo wizard
     * @param {Object} config - Configuración inicial
     * @returns {Promise<void>}
     */
    async function init(config = {}) {
      console.log('🎯 Initializing Wizard Module...');
      
      // Configurar callbacks si se proporcionan
      if (config.callbacks) {
        Object.assign(state.callbacks, config.callbacks);
      }

      // Configurar reglas de validación
      setupValidationRules();
      
      // Crear región ARIA live para anuncios
      createAriaLiveRegion();
      
      // Configurar navegación por teclado
      setupKeyboardNavigation();
      
      // Restaurar estado si existe
      await restoreState();
      
      console.log('✅ Wizard Module initialized');
    }

    /**
     * Configura las reglas de validación para cada paso
     */
    function setupValidationRules() {
      state.validationRules = {
        0: { // Perfil
          validator: () => state.formData.profile && state.formData.profile.length > 0,
          message: 'Por favor selecciona tu perfil'
        },
        1: { // Tipo de proyecto
          validator: () => state.formData.projectType && state.formData.projectType.length > 0,
          message: 'Por favor selecciona el tipo de proyecto'
        },
        2: { // Detalles del proyecto
          validator: () => {
            return state.formData.projectName && 
                   state.formData.projectName.trim().length >= 3 &&
                   state.formData.location && 
                   state.formData.location.trim().length >= 5;
          },
          message: 'Por favor completa el nombre del proyecto (mínimo 3 caracteres) y la ubicación'
        }
      };
    }

    /**
     * Crea región ARIA live para anuncios de accesibilidad
     */
    function createAriaLiveRegion() {
      if (!a11yConfig.ariaLiveRegion) {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only'; // Visualmente oculto pero accesible para screen readers
        liveRegion.style.cssText = `
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        a11yConfig.ariaLiveRegion = liveRegion;
      }
    }

    /**
     * Anuncia mensajes para screen readers
     * @param {string} message - Mensaje a anunciar
     */
    function announceToScreenReader(message) {
      if (a11yConfig.ariaLiveRegion) {
        // Limpiar y establecer nuevo mensaje con delay para asegurar anuncio
        a11yConfig.ariaLiveRegion.textContent = '';
        setTimeout(() => {
          a11yConfig.ariaLiveRegion.textContent = message;
        }, a11yConfig.announceDelay);
      }
    }

    /**
     * Configura navegación por teclado
     */
    function setupKeyboardNavigation() {
      document.addEventListener('keydown', (e) => {
        // Solo actuar si el foco está en el wizard
        const wizardContainer = document.querySelector('[data-wizard-container]');
        if (!wizardContainer || !wizardContainer.contains(document.activeElement)) {
          return;
        }

        switch(e.key) {
          case 'ArrowRight':
          case 'Enter':
            if (e.key === 'Enter' && e.target.type !== 'submit') break;
            e.preventDefault();
            nextStep();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            previousStep();
            break;
          case 'Escape':
            e.preventDefault();
            announceToScreenReader('Saliendo del wizard. Presiona Tab para continuar navegando.');
            break;
        }
      });
    }

    /**
     * Avanza al siguiente paso
     * @returns {boolean} True si se pudo avanzar
     */
    async function nextStep() {
      // Validar paso actual
      if (!validateCurrentStep()) {
        return false;
      }

      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep++;
        state.stepHistory.push(state.currentStep);
        
        // Guardar estado
        await saveState();
        
        // Anunciar cambio para screen readers
        announceToScreenReader(`Paso ${state.currentStep + 1} de ${state.totalSteps}`);
        
        // Callback
        if (state.callbacks.onStepChange) {
          state.callbacks.onStepChange(state.currentStep, 'forward');
        }
        
        // Manejar foco para accesibilidad
        manageFocus();
        
        return true;
      }
      
      return false;
    }

    /**
     * Retrocede al paso anterior
     * @returns {boolean} True si se pudo retroceder
     */
    async function previousStep() {
      if (state.currentStep > 0) {
        state.currentStep--;
        
        // Guardar estado
        await saveState();
        
        // Anunciar cambio
        announceToScreenReader(`Volviendo al paso ${state.currentStep + 1} de ${state.totalSteps}`);
        
        // Callback
        if (state.callbacks.onStepChange) {
          state.callbacks.onStepChange(state.currentStep, 'backward');
        }
        
        // Manejar foco
        manageFocus();
        
        return true;
      }
      
      return false;
    }

    /**
     * Salta a un paso específico
     * @param {number} step - Número de paso (0-indexed)
     * @returns {boolean} True si se pudo saltar al paso
     */
    async function goToStep(step) {
      if (step >= 0 && step < state.totalSteps && step !== state.currentStep) {
        // Solo permitir saltar a pasos anteriores o al siguiente si el actual es válido
        if (step < state.currentStep || (step === state.currentStep + 1 && validateCurrentStep())) {
          state.currentStep = step;
          state.stepHistory.push(step);
          
          await saveState();
          
          announceToScreenReader(`Navegando al paso ${step + 1} de ${state.totalSteps}`);
          
          if (state.callbacks.onStepChange) {
            state.callbacks.onStepChange(step, 'jump');
          }
          
          manageFocus();
          
          return true;
        }
      }
      
      return false;
    }

    /**
     * Valida el paso actual
     * @returns {boolean} True si el paso es válido
     */
    function validateCurrentStep() {
      const rule = state.validationRules[state.currentStep];
      
      if (rule && !rule.validator()) {
        // Mostrar error
        const errorMessage = rule.message;
        announceToScreenReader(`Error de validación: ${errorMessage}`);
        
        if (state.callbacks.onValidationError) {
          state.callbacks.onValidationError(state.currentStep, errorMessage);
        }
        
        // Enfocar primer campo con error
        focusFirstInvalidField();
        
        return false;
      }
      
      return true;
    }

    /**
     * Enfoca el primer campo inválido
     */
    function focusFirstInvalidField() {
      setTimeout(() => {
        const invalidField = document.querySelector('[data-wizard-step="' + state.currentStep + '"] [aria-invalid="true"], [data-wizard-step="' + state.currentStep + '"] .error');
        if (invalidField) {
          invalidField.focus();
        }
      }, a11yConfig.focusDelay);
    }

    /**
     * Gestiona el foco al cambiar de paso
     */
    function manageFocus() {
      setTimeout(() => {
        // Buscar el contenedor del paso actual
        const currentStepContainer = document.querySelector(`[data-wizard-step="${state.currentStep}"]`);
        if (currentStepContainer) {
          // Buscar primer elemento enfocable
          const focusable = currentStepContainer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusable) {
            focusable.focus();
          } else {
            // Si no hay elementos enfocables, enfocar el contenedor
            currentStepContainer.setAttribute('tabindex', '-1');
            currentStepContainer.focus();
          }
        }
      }, a11yConfig.focusDelay);
    }

    /**
     * Actualiza los datos del formulario
     * @param {string} field - Campo a actualizar
     * @param {*} value - Valor del campo
     */
    function updateFormData(field, value) {
      state.formData[field] = value;
      
      // Auto-guardar
      debounce(saveState, 500)();
    }

    /**
     * Obtiene los datos del formulario
     * @returns {Object} Datos del formulario
     */
    function getFormData() {
      return { ...state.formData };
    }

    /**
     * Reinicia el wizard
     */
    async function reset() {
      state.currentStep = 0;
      state.formData = {};
      state.stepHistory = [0];
      
      await clearState();
      
      announceToScreenReader('Wizard reiniciado. Comenzando desde el paso 1.');
      
      if (state.callbacks.onStepChange) {
        state.callbacks.onStepChange(0, 'reset');
      }
      
      manageFocus();
    }

    /**
     * Completa el wizard
     */
    async function complete() {
      // Validar último paso
      if (!validateCurrentStep()) {
        return false;
      }

      // Marcar como completado
      state.formData.completed = true;
      state.formData.completedAt = new Date().toISOString();
      
      await saveState();
      
      announceToScreenReader('¡Wizard completado exitosamente!');
      
      if (state.callbacks.onComplete) {
        state.callbacks.onComplete(state.formData);
      }
      
      return true;
    }

    /**
     * Guarda el estado en almacenamiento local
     */
    async function saveState() {
      try {
        const stateToSave = {
          currentStep: state.currentStep,
          formData: state.formData,
          stepHistory: state.stepHistory,
          lastUpdated: new Date().toISOString()
        };
        
        if (window.StorageModule && window.StorageModule.AutoSave) {
          await window.StorageModule.AutoSave.save('wizard_state', stateToSave);
        } else {
          // Fallback a localStorage
          localStorage.setItem('wizard_state', JSON.stringify(stateToSave));
        }
      } catch (error) {
        console.error('Error saving wizard state:', error);
      }
    }

    /**
     * Restaura el estado desde almacenamiento
     */
    async function restoreState() {
      try {
        let savedState;
        
        if (window.StorageModule && window.StorageModule.AutoSave) {
          savedState = await window.StorageModule.AutoSave.load('wizard_state');
        } else {
          // Fallback a localStorage
          const stored = localStorage.getItem('wizard_state');
          savedState = stored ? JSON.parse(stored) : null;
        }
        
        if (savedState) {
          state.currentStep = savedState.currentStep || 0;
          state.formData = savedState.formData || {};
          state.stepHistory = savedState.stepHistory || [0];
          
          console.log('✅ Wizard state restored');
        }
      } catch (error) {
        console.error('Error restoring wizard state:', error);
      }
    }

    /**
     * Limpia el estado guardado
     */
    async function clearState() {
      try {
        if (window.StorageModule && window.StorageModule.AutoSave) {
          await window.StorageModule.AutoSave.clear('wizard_state');
        } else {
          localStorage.removeItem('wizard_state');
        }
      } catch (error) {
        console.error('Error clearing wizard state:', error);
      }
    }

    /**
     * Obtiene información del paso actual
     * @returns {Object} Información del paso
     */
    function getCurrentStepInfo() {
      const stepNames = ['Perfil', 'Tipo de Proyecto', 'Detalles del Proyecto'];
      const stepDescriptions = [
        'Selecciona tu perfil para personalizar la experiencia',
        'Elige el tipo de proyecto que deseas desarrollar',
        'Proporciona los detalles básicos de tu proyecto'
      ];
      
      return {
        step: state.currentStep,
        totalSteps: state.totalSteps,
        name: stepNames[state.currentStep],
        description: stepDescriptions[state.currentStep],
        progress: ((state.currentStep + 1) / state.totalSteps) * 100,
        canGoBack: state.currentStep > 0,
        canGoForward: state.currentStep < state.totalSteps - 1,
        isLastStep: state.currentStep === state.totalSteps - 1
      };
    }

    /**
     * Debounce utility
     */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * Destruye el módulo y limpia recursos
     */
    function destroy() {
      // Remover event listeners
      document.removeEventListener('keydown', setupKeyboardNavigation);
      
      // Remover región ARIA
      if (a11yConfig.ariaLiveRegion && a11yConfig.ariaLiveRegion.parentNode) {
        a11yConfig.ariaLiveRegion.parentNode.removeChild(a11yConfig.ariaLiveRegion);
        a11yConfig.ariaLiveRegion = null;
      }
      
      console.log('🧹 Wizard Module destroyed');
    }

    // API pública del módulo
    return {
      init,
      nextStep,
      previousStep,
      goToStep,
      updateFormData,
      getFormData,
      getCurrentStepInfo,
      validateCurrentStep,
      reset,
      complete,
      destroy,
      // Exponer estado para debugging (solo en desarrollo)
      _state: process.env.NODE_ENV === 'development' ? state : undefined
    };
  };

  console.log('✅ Wizard Module loaded');
})(); 