import i18n from 'i18next';
import { InitOptions } from 'i18next';

// Interfaz para traducciones
export interface TranslationResources {
  [key: string]: {
    translation: Record<string, unknown>;
  };
}

// Traducciones por defecto
const resources: TranslationResources = {
  en: {
    translation: {
      nav: {
        items: {
          about: 'About Us',
          modelo: 'Model',
          por_que: 'Why Beyond?',
          sectores: 'Sectors',
          capacidades: 'Capabilities',
          calculadora: 'Calculator',
          contacto: 'Contact'
        },
        brand: 'Beyond Solutions',
        menu: {
          open: 'Open menu',
          close: 'Close menu'
        },
        theme: {
          dark: 'Switch to dark mode',
          light: 'Switch to light mode'
        }
      },
      calculator: {
        title: 'Real Estate Budget Calculator',
        intro: 'Follow the steps to estimate the budget, margins and profit of your real estate project.',
        next: 'Next',
        prev: 'Previous',
        reset: 'New simulation',
        save: 'Save simulation',
        restore: 'Restore simulation',
        step1: {
          title: '1. Project Type and Entity',
          scopeLabel: 'Project Type',
          entityLabel: 'Entity',
          scopeSelect: {
            select: 'Select an option'
          },
          entitySelect: {
            select: 'Select an option'
          },
          nav_description: 'to step 2: Budget and Land Data'
        },
        step2: {
          title: '2. Budget and Land Data',
          budgetLabel: 'Total Budget',
          addressLabel: 'Land Address',
          typeLabel: 'Land Type',
          statusLabel: 'Status',
          surfaceLabel: 'Surface Area (m²)',
          usableSurfaceLabel: 'Usable Surface Area (m²)',
          useLabel: 'Land Use',
          characteristicsLabel: 'Characteristics',
          budgetPlaceholder: '$10,000,000',
          addressPlaceholder: 'Ex: J Rousseu 3, Anzures, CDMX',
          surfacePlaceholder: '800',
          usableSurfacePlaceholder: '480',
          usePlaceholder: 'H30/20/Z',
          characteristicsPlaceholder: 'Protected, Not Applicable...',
          typeSelect: 'Select an option',
          statusSelect: 'Select an option',
          prev_description: 'to step 1: Project Type and Entity',
          next_description: 'to step 3: Cost Breakdown'
        },
        values: {
          scope: {
            patrimonial: 'Patrimonial',
            inversion: 'Investment'
          },
          entity: {
            b2b: 'B2B',
            b2c: 'B2C'
          },
          type: {
            own: 'Own',
            notown: 'Not Own',
            remate: 'Foreclosure'
          },
          status: {
            construccion: 'Construction',
            demolicion: 'Demolition',
            reconversion: 'Reconversion'
          },
          materialesLevel: {
            low: 'Low Cost',
            medium: 'Medium Cost',
            high: 'High Cost',
            custom: 'Custom'
          }
        },
        form: {
          required_field: 'This field is required to continue',
          budget_description: 'Total project budget including land',
          address_description: 'Complete location of the land',
          type_description: 'Select the category of the land',
          status_description: 'Current state of the land',
          surface_description: 'Total area of the land in square meters',
          usableSurface_description: 'Surface that can be built'
        },
        tooltips: {
          budgetTotal: 'Includes land and construction, without regulatory.'
        },
        step3: {
          title: '3. Cost Breakdown',
          materialesLevel: 'Materials Level',
          materials: 'Materials',
          design: 'Design',
          permits: 'Permits',
          construction: 'Construction',
          management: 'Management',
          marketing: 'Marketing',
          prev_description: 'to step 2: Budget and Land Data',
          next_description: 'to step 4: Results and Summary'
        },
        step4: {
          title: '4. Results and Summary',
          prev_description: 'to step 3: Cost Breakdown',
          reset_description: 'reset form'
        },
        result: {
          totalCost: 'Total cost:',
          totalSell: 'Estimated selling price:',
          profit: 'Gross profit:',
          m2Cost: 'Cost per m²:',
          m2Sell: 'Selling price per m²:'
        },
        export: {
          pdf: 'Export PDF',
          csv: 'Export CSV',
          wa: 'Share WhatsApp',
          email: 'Share Email'
        },
        summary: {
          title: 'Summary',
          scope: 'Project type',
          entity: 'Entity',
          budget: 'Budget',
          address: 'Address',
          surface: 'Surface area',
          usableSurface: 'Usable surface area',
          use: 'Land use',
          type: 'Land type',
          status: 'Status'
        }
      },
      accessibility: {
        navigation: 'Main navigation'
      },
      footer: {
        brand: {
          name: 'Beyond Solutions',
          tagline: 'Smart real estate development'
        },
        copyright: '© 2025 Beyond Solutions. All rights reserved.',
        links: {
          contact: 'Contact'
        }
      }
    }
  },
  es: {
    translation: {
      nav: {
        items: {
          about: 'Sobre Nosotros',
          modelo: 'Modelo',
          por_que: '¿Por qué Beyond?',
          sectores: 'Sectores',
          capacidades: 'Capacidades',
          calculadora: 'Calculadora',
          contacto: 'Contacto'
        },
        brand: 'Beyond Solutions',
        menu: {
          open: 'Abrir menú',
          close: 'Cerrar menú'
        },
        theme: {
          dark: 'Cambiar a modo oscuro',
          light: 'Cambiar a modo claro'
        }
      },
      calculator: {
        title: 'Calculadora de Presupuesto Inmobiliario',
        intro: 'Sigue los pasos para estimar el presupuesto, márgenes y utilidad de tu proyecto inmobiliario.',
        next: 'Siguiente',
        prev: 'Anterior',
        reset: 'Nueva simulación',
        save: 'Guardar simulación',
        restore: 'Restaurar simulación',
        step1: {
          title: '1. Tipo de Proyecto y Entidad',
          scopeLabel: 'Tipo de proyecto',
          entityLabel: 'Entidad',
          scopeSelect: {
            select: 'Selecciona una opción'
          },
          entitySelect: {
            select: 'Selecciona una opción'
          },
          nav_description: 'al paso 2: Presupuesto y Datos del Terreno'
        },
        step2: {
          title: '2. Presupuesto y Datos del Terreno',
          budgetLabel: 'Presupuesto total',
          addressLabel: 'Dirección del terreno',
          typeLabel: 'Tipo de terreno',
          statusLabel: 'Estatus',
          surfaceLabel: 'Superficie (m²)',
          usableSurfaceLabel: 'Superficie útil de construcción (m²)',
          useLabel: 'Uso de suelo',
          characteristicsLabel: 'Características',
          budgetPlaceholder: '$10,000,000',
          addressPlaceholder: 'Ej: J Rousseu 3, Anzures, CDMX',
          surfacePlaceholder: '800',
          usableSurfacePlaceholder: '480',
          usePlaceholder: 'H30/20/Z',
          characteristicsPlaceholder: 'Protegido, No Aplica...',
          typeSelect: 'Selecciona una opción',
          statusSelect: 'Selecciona una opción',
          prev_description: 'al paso 1: Tipo de Proyecto y Entidad',
          next_description: 'al paso 3: Desglose de Costos'
        },
        values: {
          scope: {
            patrimonial: 'Patrimonial',
            inversion: 'Inversión'
          },
          entity: {
            b2b: 'B2B',
            b2c: 'B2C'
          },
          type: {
            own: 'Propio',
            notown: 'No Propio',
            remate: 'Remate'
          },
          status: {
            construccion: 'Construcción',
            demolicion: 'Demolición',
            reconversion: 'Reconversión'
          },
          materialesLevel: {
            low: 'Bajo Costo',
            medium: 'Costo Medio',
            high: 'Alto Costo',
            custom: 'Personalizado'
          }
        },
        form: {
          required_field: 'Este campo es obligatorio para continuar',
          budget_description: 'Presupuesto total del proyecto incluyendo terreno',
          address_description: 'Ubicación completa del terreno',
          type_description: 'Seleccione la categoría del terreno',
          status_description: 'Estado actual del terreno',
          surface_description: 'Área total del terreno en metros cuadrados',
          usableSurface_description: 'Superficie que puede ser construida'
        },
        tooltips: {
          budgetTotal: 'Incluye terreno y construcción, sin regulatorio.'
        },
        step3: {
          title: '3. Desglose de Costos',
          materialesLevel: 'Nivel de materiales',
          materials: 'Materiales',
          design: 'Diseño',
          permits: 'Permisos',
          construction: 'Construcción',
          management: 'Gestión',
          marketing: 'Marketing',
          prev_description: 'al paso 2: Presupuesto y Datos del Terreno',
          next_description: 'al paso 3: Resultados y Resumen'
        },
        step4: {
          title: '4. Resultados y Resumen',
          prev_description: 'al paso 3: Desglose de Costos',
          reset_description: 'reiniciar formulario'
        },
        result: {
          totalCost: 'Costo total:',
          totalSell: 'Precio de venta estimado:',
          profit: 'Utilidad bruta:',
          m2Cost: 'Costo por m²:',
          m2Sell: 'Precio de venta por m²:'
        },
        export: {
          pdf: 'Exportar PDF',
          csv: 'Exportar CSV',
          wa: 'Compartir WhatsApp',
          email: 'Compartir Email'
        },
        summary: {
          title: 'Resumen',
          scope: 'Tipo de proyecto',
          entity: 'Entidad',
          budget: 'Presupuesto',
          address: 'Dirección',
          surface: 'Superficie',
          usableSurface: 'Superficie útil',
          use: 'Uso de suelo',
          type: 'Tipo de terreno',
          status: 'Estatus'
        }
      },
      accessibility: {
        navigation: 'Navegación principal'
      },
      footer: {
        brand: {
          name: 'Beyond Solutions',
          tagline: 'Desarrollo inmobiliario inteligente'
        },
        copyright: '© 2025 Beyond Solutions. Todos los derechos reservados.',
        links: {
          contact: 'Contacto'
        }
      }
    }
  }
};

// Opciones de inicialización
const i18nOptions: InitOptions = {
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  },
  saveMissing: true,
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation key: ${key} for language: ${lng}`);
  }
};

// Inicializar i18n
i18n.init(i18nOptions);

// Funciones auxiliares para i18n
export function getCurrentLanguage(): string {
  return i18n.language;
}

export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
}

export function t(key: string, params?: Record<string, unknown>, defaultValue?: string): string {
  return i18n.t(key, { ...params, defaultValue });
}

export async function loadLanguage(lang: string): Promise<void> {
  // Si ya está cargado este idioma, no hacer nada
  if (i18n.hasResourceBundle(lang, 'translation')) {
    return;
  }
  
  try {
    // Aquí podríamos cargar dinámicamente el archivo de idioma desde el servidor
    // Por ahora solo simulamos la carga
    console.log(`Loading language: ${lang}`);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error(`Error loading language ${lang}:`, error);
    throw error;
  }
}

export default i18n; 