// Alpine.js CSP Build Initialization for GitHub Pages
// This file contains all Alpine components for the calculator-gamified.html

// Ensure Alpine is loaded before defining components
document.addEventListener('alpine:init', () => {
  console.log('🚀 Initializing Alpine.js CSP components for GitHub Pages');

  // Navigation component
  Alpine.data('nav', () => ({
    theme: localStorage.getItem('theme') || 'light',

    init() {
      this.applyTheme();
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      this.applyTheme();
    },

    applyTheme() {
      document.documentElement.classList.toggle('dark', this.theme === 'dark');
    },
  }));

  // Main calculator gamified component
  Alpine.data('calculatorGamified', () => ({
    // Estado del proyecto
    projectId: null,
    currentProject: null,

    // Estado de gamificación
    playerLevel: 1,
    currentXP: 0,
    nextLevelXP: 100,
    xpProgress: 0,
    recentBadges: [],
    showLeaderboard: false,

    // Fases del proceso
    currentPhase: 0,
    phases: [
      { id: 'wizard', name: 'Onboarding', icon: '🎯', xp: 100 },
      { id: 'terrain', name: 'Terreno', icon: '🗺️', xp: 150 },
      { id: 'costs', name: 'Costos', icon: '💰', xp: 200 },
      { id: 'experience', name: '3D Experience', icon: '🎮', xp: 250 },
    ],

    // Estado del wizard
    wizardStep: 0,
    autocompleteInstance: null,

    // Estado del terreno
    terrainStep: 0,
    terrainReady: false,
    terrainModule: null,

    // Estado de costos
    scenario: 'realistic',
    chartInstance: null,
    financeModule: null,

    // Estado 3D
    viewer3D: null,
    timeOfDay: 12,

    // Datos del formulario
    formData: {
      // Wizard
      profile: '',
      projectType: '',
      projectName: '',
      location: '',

      // Terreno
      terrainSource: '',
      terrainData: null,

      // Costos
      constructionSystem: 'traditional',
      materialLevel: 'standard',
      budget: 0,

      // Financiamiento
      financing: {
        loanAmount: 0,
        interestRate: 12,
        termMonths: 24,
      },
    },

    async init() {
      console.log('🚀 Inicializando calculadora gamificada en GitHub Pages...');

      // Verificar si estamos en GitHub Pages
      const isGitHubPages = window.location.hostname.includes('github.io') || 
                           window.location.hostname.includes('githubpages.com');
      
      if (isGitHubPages) {
        console.log('📍 Detectado hosting en GitHub Pages');
      }

      // Inicializar StorageModule
      if (window.StorageModule) {
        await window.StorageModule.init();
      }

      // Cargar proyecto si viene de un parámetro
      const urlParams = new URLSearchParams(window.location.search);
      const projectParam = urlParams.get('project');

      if (projectParam && window.StorageModule) {
        await this.loadProject(projectParam);
      }

      // Cargar estado de gamificación
      await this.loadGamificationState();

      // Auto-guardar cambios
      this.$watch('formData', () => {
        this.autoSave();
      });

      // Escuchar evento global
      window.addEventListener('terrainReady', () => {
        this.terrainReady = true;
      });

      this.updatePhaseCaches();

      // Actualizar visibilidad en cambios clave
      this.wizardStepVisible = [0,1,2].map(i => this.wizardStep === i);
      this.terrainStepVisible = [0,1,2].map(i => this.terrainStep === i);

      this.$watch('currentPhase', () => {
        this.updatePhaseCaches();
      });

      this.$watch('wizardStep', () => {
        this.wizardStepVisible = [0,1,2].map(i => this.wizardStep === i);
      });

      this.$watch('terrainStep', () => {
        this.terrainStepVisible = [0,1,2].map(i => this.terrainStep === i);
      });
    },

    async loadProject(projectId) {
      try {
        if (window.StorageModule?.Projects) {
          const project = await window.StorageModule.Projects.get(projectId);
          if (project) {
            this.projectId = projectId;
            this.currentProject = project;

            // Restaurar datos del formulario
            Object.assign(this.formData, project);

            // Restaurar progreso
            if (project.progress) {
              // Ir a la última fase no completada
              const phases = ['wizard', 'terrain', 'costs', 'viewer3d'];
              for (let i = 0; i < phases.length; i++) {
                if (!project.progress[phases[i]]) {
                  this.currentPhase = i;
                  break;
                }
              }
            }

            console.log('✅ Proyecto cargado:', project);
          }
        }
      } catch (error) {
        console.error('Error al cargar proyecto:', error);
      }
    },

    async loadGamificationState() {
      if (window.StorageModule?.Gamification) {
        const state = await window.StorageModule.Gamification.getOrCreate();
        this.playerLevel = state.level;
        this.currentXP = state.totalXP % 100;
        this.nextLevelXP = 100;
        this.xpProgress = (this.currentXP / this.nextLevelXP) * 100;

        // Cargar badges recientes
        if (state.badges.length > 0) {
          this.recentBadges = state.badges.slice(-3).map((badgeId) => ({
            id: badgeId,
            icon: this.getBadgeIcon(badgeId),
            name: this.getBadgeName(badgeId),
          }));
        }
      }
    },

    getBadgeIcon(badgeId) {
      const badges = {
        'first-project': '🎯',
        'terrain-master': '🗺️',
        'cost-analyst': '💰',
        '3d-visionary': '🎮',
        'speed-demon': '⚡',
        perfectionist: '💎',
      };
      return badges[badgeId] || '🏆';
    },

    getBadgeName(badgeId) {
      const names = {
        'first-project': 'Primer Proyecto',
        'terrain-master': 'Maestro del Terreno',
        'cost-analyst': 'Analista de Costos',
        '3d-visionary': 'Visionario 3D',
        'speed-demon': 'Velocidad Extrema',
        perfectionist: 'Perfeccionista',
      };
      return names[badgeId] || 'Logro';
    },

    async autoSave() {
      if (window.StorageModule?.AutoSave) {
        const key = this.projectId
          ? `project_${this.projectId}_data`
          : 'calculator_temp_data';
        await window.StorageModule.AutoSave.save(key, this.formData);
      }
    },

    async initLocationAutocomplete() {
      // Solo inicializar una vez
      if (this.autocompleteInstance) return;

      try {
        // Verificar API key
        const apiKey = window.BEYOND_CONFIG?.GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === '') {
          console.warn('Google Maps API Key no configurada para GitHub Pages');
          this.showGoogleMapsError('API Key no configurada para GitHub Pages');
          return;
        }

        // Verificar que Google Maps esté cargado
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          await this.loadGoogleMapsAPI(apiKey);
        }

        this.setupModernAutocomplete();
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        this.showGoogleMapsError('Error cargando Google Maps en GitHub Pages');
      }
    },

    async loadGoogleMapsAPI(apiKey) {
      return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }

        // Limpiar callbacks previos
        if (window.initGoogleMapsCallback) {
          delete window.initGoogleMapsCallback;
        }

        // Usar la nueva API de importación con loading=async
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry&loading=async&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        // No nonce needed for GitHub Pages since we use script-src 'self' for dynamic scripts

        // Callback global para cuando se cargue
        window.initGoogleMapsCallback = () => {
          console.log('✅ Google Maps API loaded successfully on GitHub Pages');
          resolve();
        };

        script.onerror = () => {
          console.error('❌ Failed to load Google Maps API on GitHub Pages');
          reject(new Error('Google Maps API failed to load'));
        };

        // Timeout de 15 segundos
        setTimeout(() => {
          if (!window.google || !window.google.maps) {
            reject(new Error('Google Maps API loading timeout'));
          }
        }, 15000);

        document.head.appendChild(script);
      });
    },

    setupModernAutocomplete() {
      const input = document.getElementById('location-autocomplete');
      if (!input) return;

      try {
        // Check if the new PlaceAutocompleteElement is available
        if (google.maps.places.PlaceAutocompleteElement) {
          // Create the new autocomplete element
          const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

          // Set properties correctly for the new API
          autocompleteElement.setAttribute('placeholder', input.placeholder);

          // Copy classes and styling
          autocompleteElement.className = input.className;
          autocompleteElement.id = input.id;

          // Add country restriction, result fields and types via options (geometry optional)
          autocompleteElement.options = {
            componentRestrictions: { country: 'mx' },
            types: ['geocode', 'establishment'],
            fields: [
              'formatted_address',
              'name',
              'geometry',
              'place_id',
              'address_components',
            ],
          };

          // Replace the input with the new element
          input.parentNode.replaceChild(autocompleteElement, input);

          // Handle both legacy and new events so the widget works across API versions
          const handleSelectEvent = async (event) => {
            let place = null;

            // Newer event (beta/stable) – gmp-select exposes `placePrediction`
            if (event.placePrediction) {
              try {
                // Convert the prediction into a full Place object
                if (typeof event.placePrediction.toPlace === 'function') {
                  place = event.placePrediction.toPlace();
                  // Fetch only minimal fields we need
                  if (typeof place.fetchFields === 'function') {
                    await place.fetchFields({
                      fields: [
                        'displayName',
                        'formattedAddress',
                        'location',
                        'addressComponents',
                        'id',
                      ],
                    });
                  }
                }
              } catch (err) {
                console.warn('Error resolving placePrediction:', err);
              }
            }

            // Older event – gmp-placeselect exposes `place`
            if (!place && event.place) {
              place = event.place;
            }

            if (place) {
              this.handlePlaceSelection(place);
            }
          };

          // Register both possible event names (the newer one first so it has priority)
          autocompleteElement.addEventListener('gmp-select', handleSelectEvent);
          autocompleteElement.addEventListener('gmp-placeselect', handleSelectEvent);

          // Listen for manual typing to keep model in sync
          autocompleteElement.addEventListener('input', (event) => {
            this.formData.location = event.target.value;
          });

          this.autocompleteInstance = autocompleteElement;
          console.log('✅ Using new PlaceAutocompleteElement API on GitHub Pages');
        } else {
          // Fallback to legacy API
          this.setupLegacyAutocomplete(input);
        }
      } catch (error) {
        console.error('Error with new autocomplete API, falling back to legacy:', error);
        this.setupLegacyAutocomplete(input);
      }
    },

    setupLegacyAutocomplete(input) {
      // Configurar opciones para México principalmente
      const options = {
        componentRestrictions: { country: 'mx' },
        fields: ['address_components', 'geometry', 'formatted_address', 'name'],
        types: ['geocode', 'establishment'],
      };

      this.autocompleteInstance = new google.maps.places.Autocomplete(input, options);

      // Listener para cuando se seleccione una dirección
      this.autocompleteInstance.addListener('place_changed', () => {
        const place = this.autocompleteInstance.getPlace();
        this.handlePlaceSelection(place);
      });

      // Keep model in sync with manual input (legacy)
      input.addEventListener('input', (event) => {
        this.formData.location = event.target.value;
      });

      console.log('Using legacy Autocomplete API (deprecated) on GitHub Pages');
    },

    handlePlaceSelection(place) {
      if (!place) {
        console.warn('No se encontraron detalles para esta ubicación');
        return;
      }

      // Compatibilidad con versiones modernas y heredadas del objeto Place
      const formatted =
        place.formatted_address ||
        place.formattedAddress ||
        place.displayName ||
        place.name ||
        '';
      // Siempre actualizar el modelo con la dirección formateada o nombre
      this.formData.location = formatted;

      // Guardar información adicional cuando haya geometría disponible
      let lat = null;
      let lng = null;
      if (place.geometry && place.geometry.location) {
        lat =
          typeof place.geometry.location.lat === 'function'
            ? place.geometry.location.lat()
            : place.geometry.location.lat;
        lng =
          typeof place.geometry.location.lng === 'function'
            ? place.geometry.location.lng()
            : place.geometry.location.lng;
      } else if (place.location) {
        // New Places API
        lat = place.location.lat;
        lng = place.location.lng;
      }

      if (lat !== null && lng !== null) {
        this.formData.locationDetails = {
          lat,
          lng,
          placeId: place.place_id || place.id || null,
          addressComponents: place.address_components || place.addressComponents || null,
        };
      }

      // Forzar actualización de Alpine
      this.$nextTick(() => {
        const input = document.getElementById('location-autocomplete');
        if (input && input.value !== undefined) {
          input.value = this.formData.location;
        }
      });

      console.log('Ubicación seleccionada en GitHub Pages:', this.formData.location);
    },

    showGoogleMapsError(message) {
      // Mostrar mensaje de error y deshabilitar funcionalidad
      const input = document.getElementById('location-autocomplete');
      if (input) {
        input.placeholder = `Error: ${message}`;
        input.disabled = true;
        input.className += ' bg-red-100 border-red-300 text-red-700';
      }

      // Mostrar notificación al usuario
      const errorDiv = document.createElement('div');
      errorDiv.className =
        'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2';
      errorDiv.innerHTML = `
      <strong>Error con Google Maps:</strong> ${message}
      <br><small>Puedes continuar ingresando la dirección manualmente.</small>
      <br><small>Para GitHub Pages, configura GOOGLE_MAPS_API_KEY en GitHub Secrets.</small>
    `;

      if (input && input.parentNode) {
        input.parentNode.appendChild(errorDiv);
      }
    },

    goToPhase(phase) {
      if (phase <= this.currentPhase) {
        this.currentPhase = phase;
      }
    },

    // Funciones del Wizard
    selectProfile(profile) {
      this.formData.profile = profile;
      this.addXP(10);
    },

    selectProjectType(type) {
      this.formData.projectType = type;
      this.addXP(10);
    },

    canProceedWizard() {
      switch (this.wizardStep) {
        case 0:
          return this.formData.profile !== '';
        case 1:
          return this.formData.projectType !== '';
        case 2:
          return this.formData.projectName && this.formData.location;
        default:
          return false;
      }
    },

    nextWizardStep() {
      if (this.canProceedWizard()) {
        this.wizardStep++;
      }
    },

    async completePhase1() {
      // Crear o actualizar proyecto
      if (!this.projectId && window.StorageModule?.Projects) {
        const project = await window.StorageModule.Projects.create(this.formData);
        this.projectId = project.id;
        this.currentProject = project;

        // Otorgar badge de primer proyecto
        await this.unlockBadge('first-project');
      }

      // Actualizar progreso
      await this.updateProgress('wizard', true);

      // Agregar XP y avanzar
      await this.addXP(100);
      this.currentPhase = 1;

      // Inicializar módulo de terreno
      this.initTerrainModule();
    },

    // Funciones del Terreno
    selectTerrainSource(source) {
      this.formData.terrainSource = source;
      this.terrainStep = 1;
      this.addXP(15);

      // Inicializar mapa cuando se selecciona origen
      this.$nextTick(() => {
        this.initTerrainModule();
      });
    },

    async initTerrainModule() {
      if (window.TerrainModule && !this.terrainModule) {
        // Determine center based on previously selected location (if available)
        let centerOpt = null;
        if (
          this.formData.locationDetails &&
          this.formData.locationDetails.lat &&
          this.formData.locationDetails.lng
        ) {
          centerOpt = {
            lat: this.formData.locationDetails.lat,
            lng: this.formData.locationDetails.lng,
          };
        }

        this.terrainModule = window.TerrainModule({
          center: centerOpt || { lat: 19.4326, lng: -99.1332 },
          zoom: 18,
          locationPoint: centerOpt,
        });
        await this.terrainModule.init();
        this.terrainReady = true;
      }
    },

    async nextTerrainStep() {
      if (this.terrainStep < 2) {
        this.terrainStep++;

        if (this.terrainStep === 2) {
          // Inicializar vista 3D del terreno
          if (window.Viewer3DModule) {
            this.viewer3D = window.Viewer3DModule();
            await this.viewer3D.init('viewer3d-canvas');

            // Cargar datos del terreno si existen
            if (
              this.formData.terrainData &&
              this.formData.terrainData.coordinates.length > 0
            ) {
              await this.viewer3D.loadTerrainData(this.formData.terrainData, {
                projectType: this.formData.projectType,
              });
              this.addXP(25);
            }
          }
        }
      } else {
        await this.completePhase2();
      }
    },

    async completePhase2() {
      // Guardar datos del terreno
      if (this.terrainModule) {
        this.formData.terrainData = this.terrainModule.terrainData;
      }

      // Actualizar progreso
      await this.updateProgress('terrain', true);

      // Agregar XP y badges
      await this.addXP(150);
      await this.unlockBadge('terrain-master');

      this.currentPhase = 2;

      // Inicializar gráfica de proyección
      this.$nextTick(() => {
        this.initProjectionChart();
      });
    },

    // Funciones de Costos
    async initProjectionChart() {
      // Inicializar módulo financiero si no existe
      if (!this.financeModule && window.FinanceModule) {
        this.financeModule = window.FinanceModule();
        await this.financeModule.init({
          callbacks: {
            onCalculationComplete: (calculations) => {
              this.updateFinancialUI(calculations);
            },
            onScenarioChange: (scenario) => {
              console.log('Scenario changed to:', scenario);
            },
          },
        });
      }

      // Establecer datos del proyecto
      if (this.financeModule && this.formData.terrainData) {
        this.financeModule.setProjectData(this.formData);
      }
    },

    updateFinancialUI(calculations) {
      if (!calculations || !calculations.indicators) return;

      // Actualizar KPIs
      const roiElement = document.querySelector('[data-indicator="roi"]');
      if (roiElement) {
        roiElement.textContent = `${calculations.indicators.roi}%`;
      }

      const irrElement = document.querySelector('[data-indicator="irr"]');
      if (irrElement) {
        irrElement.textContent = `${calculations.indicators.irr}%`;
      }

      const npvElement = document.querySelector('[data-indicator="npv"]');
      if (npvElement) {
        const npvInMillions = (calculations.indicators.npv / 1000000).toFixed(1);
        npvElement.textContent = `$${npvInMillions}M`;
      }

      const paybackElement = document.querySelector('[data-indicator="payback"]');
      if (paybackElement) {
        paybackElement.textContent = `${calculations.indicators.paybackPeriod} años`;
      }
    },

    changeScenario(newScenario) {
      this.scenario = newScenario;
      if (this.financeModule) {
        this.financeModule.setScenario(newScenario);
      }
    },

    updateConstructionSystem() {
      if (this.financeModule && this.formData.terrainData) {
        this.financeModule.setProjectData(this.formData);
      }
    },

    updateMaterialLevel() {
      if (this.financeModule && this.formData.terrainData) {
        this.financeModule.setProjectData(this.formData);
      }
    },

    getProjectionData() {
      // Si tenemos módulo financiero, usar datos reales
      if (this.financeModule) {
        const cashFlows = this.financeModule.getCashFlows();
        if (cashFlows && cashFlows.length > 0) {
          return cashFlows.map((cf) => cf.netCashFlow / 1000000); // En millones
        }
      }

      // Fallback a datos estáticos
      const scenarios = {
        optimistic: [-1000, -500, 200, 800, 1500],
        realistic: [-1000, -700, -200, 400, 900],
        pessimistic: [-1000, -900, -600, -100, 300],
      };
      return scenarios[this.scenario] || scenarios.realistic;
    },

    async completePhase3() {
      // Guardar datos de costos
      await this.updateProgress('costs', true);

      // Agregar XP y badges
      await this.addXP(200);
      await this.unlockBadge('cost-analyst');

      this.currentPhase = 3;
    },

    // Funciones 3D
    toggleDayNight() {
      if (this.viewer3D) {
        this.viewer3D.toggleDayNight();
        this.addXP(5);
      }
    },

    toggleSolarAnalysis() {
      if (this.viewer3D) {
        if (this.viewer3D.getAnalysisMode() === 'solar') {
          this.viewer3D.disableAnalysis();
        } else {
          this.viewer3D.enableSolarAnalysis();
          this.addXP(10);
        }
      }
    },

    toggleWindAnalysis() {
      if (this.viewer3D) {
        if (this.viewer3D.getAnalysisMode() === 'wind') {
          this.viewer3D.disableAnalysis();
        } else {
          this.viewer3D.enableWindAnalysis();
          this.addXP(10);
        }
      }
    },

    // Sistema de gamificación
    async addXP(amount) {
      this.currentXP += amount;

      // Verificar nivel
      while (this.currentXP >= this.nextLevelXP) {
        this.currentXP -= this.nextLevelXP;
        this.playerLevel++;

        // Animación de nivel
        this.showLevelUpAnimation();
      }

      this.xpProgress = (this.currentXP / this.nextLevelXP) * 100;

      // Actualizar en IndexedDB
      if (window.StorageModule?.Gamification) {
        await window.StorageModule.Gamification.addXP(amount);
      }
    },

    async unlockBadge(badgeId) {
      if (window.StorageModule?.Gamification) {
        await window.StorageModule.Gamification.unlockBadge(badgeId);

        // Agregar a badges recientes
        this.recentBadges.push({
          id: badgeId,
          icon: this.getBadgeIcon(badgeId),
          name: this.getBadgeName(badgeId),
        });

        // Mantener solo los últimos 3
        if (this.recentBadges.length > 3) {
          this.recentBadges.shift();
        }
      }
    },

    showLevelUpAnimation() {
      // Aquí podrías agregar una animación de nivel
      console.log('🎉 ¡Subiste de nivel en GitHub Pages!', this.playerLevel);
    },

    async updateProgress(phase, completed) {
      if (this.projectId && window.StorageModule?.Projects) {
        await window.StorageModule.Projects.updateProgress(this.projectId, phase, completed);
      }
    },

    // Guardar proyecto final
    async saveProject() {
      try {
        let project;

        if (this.projectId && window.StorageModule?.Projects) {
          // Actualizar proyecto existente
          project = await window.StorageModule.Projects.update(this.projectId, {
            ...this.formData,
            progress: {
              wizard: this.currentPhase >= 1,
              terrain: this.currentPhase >= 2,
              costs: this.currentPhase >= 3,
              viewer3d: this.currentPhase >= 4,
            },
          });
        } else if (window.StorageModule?.Projects) {
          // Crear nuevo proyecto
          project = await window.StorageModule.Projects.create({
            ...this.formData,
            status: 'completed',
            progress: {
              wizard: true,
              terrain: true,
              costs: true,
              viewer3d: true,
            },
          });
          this.projectId = project.id;
        }

        // Agregar badge final
        await this.unlockBadge('project-completed');
        await this.addXP(500); // Bonus por completar

        // Mostrar mensaje de éxito
        alert(
          `¡Proyecto guardado exitosamente!\n\nID: ${project?.id || 'temp'}\nNombre: ${this.formData.projectName}`,
        );

        console.log('Proyecto guardado:', project);
      } catch (error) {
        console.error('Error al guardar proyecto:', error);
        alert('Error al guardar el proyecto. Inténtalo de nuevo.');
      }
    },

    // Helper functions for Alpine CSP compatibility
    getXpBarStyle() {
      return `width: ${this.xpProgress}%`;
    },

    getPhaseIndicatorClass(index) {
      if (this.currentPhase >= index) {
        return this.currentPhase === index 
          ? 'bg-primary-800 active'
          : 'bg-primary-800';
      }
      return 'bg-gray-300 dark:bg-gray-600';
    },

    getPhaseConnectorClass(index) {
      return this.currentPhase > index 
        ? 'bg-primary-800' 
        : 'bg-gray-300 dark:bg-gray-600';
    },

    showPhaseConnector(index) {
      return index < (this.phases?.length - 1 || 0);
    },

    getPhaseXpText(phase) {
      return `${phase.xp || 0} XP`;
    },

    getProfileClass(profile) {
      return this.formData.profile === profile 
        ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-gray-300';
    },

    getProjectTypeClass(type) {
      return this.formData.projectType === type 
        ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-gray-300';
    },

    getTerrainSourceClass(source) {
      return this.formData.terrainSource === source 
        ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-gray-300';
    },

    getConstructionSystemClass(system) {
      return this.formData.constructionSystem === system 
        ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-gray-300';
    },

    getMaterialLevelClass(level) {
      return this.formData.materialLevel === level 
        ? 'border-primary-700 bg-primary-50 dark:bg-primary-900/20' 
        : 'border-gray-300';
    },

    getScenarioClass(scenario) {
      const baseClass = 'px-4 py-2 rounded-lg transition';
      if (this.scenario === scenario) {
        switch (scenario) {
          case 'optimistic': return `${baseClass} bg-green-600 text-white`;
          case 'realistic': return `${baseClass} bg-blue-600 text-white`;
          case 'pessimistic': return `${baseClass} bg-red-600 text-white`;
          default: return `${baseClass} bg-gray-200 dark:bg-gray-700`;
        }
      }
      return `${baseClass} bg-gray-200 dark:bg-gray-700`;
    },

    getTerrainButtonClass(type) {
      const baseClass = 'px-4 py-2 rounded-lg';
      if (!this.terrainReady) {
        return `${baseClass} bg-gray-100 dark:bg-gray-600 opacity-50 cursor-not-allowed`;
      }
      
      if (type === 'danger') {
        return `${baseClass} bg-red-200 dark:bg-red-700 text-red-900 dark:text-white hover:bg-red-300 dark:hover:bg-red-600 transition`;
      }
      
      return `${baseClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`;
    },

    getDayNightText() {
      if (this.viewer3D && typeof this.viewer3D.isNightMode === 'function' && this.viewer3D.isNightMode()) {
        return '🌞 Día';
      }
      return '🌙 Noche';
    },

    getSolarAnalysisClass() {
      const baseClass = 'px-4 py-2 rounded-lg transition';
      if (this.viewer3D && typeof this.viewer3D.getAnalysisMode === 'function' && this.viewer3D.getAnalysisMode() === 'solar') {
        return `${baseClass} bg-yellow-500 text-white`;
      }
      return `${baseClass} bg-gray-200 dark:bg-gray-700`;
    },

    getWindAnalysisClass() {
      const baseClass = 'px-4 py-2 rounded-lg transition';
      if (this.viewer3D && typeof this.viewer3D.getAnalysisMode === 'function' && this.viewer3D.getAnalysisMode() === 'wind') {
        return `${baseClass} bg-blue-500 text-white`;
      }
      return `${baseClass} bg-gray-200 dark:bg-gray-700`;
    },

    getTerrainStepText() {
      return this.terrainStep < 2 ? 'Siguiente' : 'Continuar a Costos';
    },

    showCurrentPhase(phase) {
      return this.currentPhase === phase;
    },

    showWizardStep(step) {
      return this.wizardStep === step;
    },

    showTerrainStep(step) {
      return this.terrainStep === step;
    },

    showWizardNavButton(step) {
      return this.wizardStep > 0;
    },

    showWizardNextButton() {
      return this.wizardStep < 2;
    },

    showWizardFinishButton() {
      return this.wizardStep === 2;
    },

    canCompleteWizard() {
      return this.formData.projectName && this.formData.location;
    },

    // Terrain helper functions
    resetTerrain() {
      if (this.terrainModule) {
        this.terrainModule.clearTerrain();
      }
      // Resetar datos relacionados en el formulario
      this.formData.terrainData = null;
    },
    importTerrain() {
      if (this.terrainModule && typeof this.terrainModule.showImportDialog === 'function') {
        this.terrainModule.showImportDialog();
      } else {
        alert('El módulo de terreno aún no está listo en GitHub Pages.');
      }
    },
    toggleMeasure() {
      if (this.terrainModule && typeof this.terrainModule.toggleMeasureTool === 'function') {
        this.terrainModule.toggleMeasureTool();
      } else {
        alert('El módulo de terreno aún no está listo en GitHub Pages.');
      }
    },

    updatePhaseCaches() {
      this.phaseIndicatorClass = this.phases.map((_, i) =>
        i >  this.currentPhase ? 'bg-gray-300 dark:bg-gray-600'
      : i === this.currentPhase ? 'bg-primary-800 active'
      : 'bg-primary-800')

      this.phaseConnectorVisible = this.phases.map((_, i)=> i < this.phases.length-1)
      this.phaseConnectorClass   = this.phases.map((_, i)=>
        this.currentPhase > i ? 'bg-primary-800' : 'bg-gray-300 dark:bg-gray-600')
      this.phaseXpText           = this.phases.map(p => `${p.xp} XP`)

      // Visibilidad de cada fase (para x-show)
      this.phaseVisible         = this.phases.map((_, i) => this.currentPhase === i)
    },

    sanitizeTemplate() {
      this.$nextTick(() => {
        this.updatePhaseCaches();
        // idem para los demás cálculos…
      });
    },

    /* -------------------------------------------------
     * Getter proxies (propiedad simple) para el template
     * ------------------------------------------------- */
    get xpBarStyle() {
      return this.getXpBarStyle();
    },

    /* Fase / XP helpers ya se actualizan en updatePhaseCaches */

    // Etiquetas y clases dependientes del viewer3D
    get dayNightLabel() {
      return this.getDayNightText();
    },
    get solarBtnClass() {
      return this.getSolarAnalysisClass();
    },
    get windBtnClass() {
      return this.getWindAnalysisClass();
    },

    // Botones terreno normal/danger
    get terrainBtnClass() {
      return {
        normal: this.getTerrainButtonClass('normal'),
        danger: this.getTerrainButtonClass('danger'),
      };
    },

    // Clases dinámicas agrupadas por tipo
    get profileClass() {
      return {
        developer: this.getProfileClass('developer'),
        owner: this.getProfileClass('owner'),
        investor: this.getProfileClass('investor'),
        architect: this.getProfileClass('architect'),
      };
    },

    get projectTypeClass() {
      return {
        residential: this.getProjectTypeClass('residential'),
        commercial: this.getProjectTypeClass('commercial'),
        mixed: this.getProjectTypeClass('mixed'),
        industrial: this.getProjectTypeClass('industrial'),
      };
    },

    get terrainSourceClass() {
      return {
        own: this.getTerrainSourceClass('own'),
        catalog: this.getTerrainSourceClass('catalog'),
        search: this.getTerrainSourceClass('search'),
      };
    },

    get constructionSystemClass() {
      return {
        traditional: this.getConstructionSystemClass('traditional'),
        prefab: this.getConstructionSystemClass('prefab'),
        steel: this.getConstructionSystemClass('steel'),
        eco: this.getConstructionSystemClass('eco'),
      };
    },

    get materialLevelClass() {
      return {
        basic: this.getMaterialLevelClass('basic'),
        standard: this.getMaterialLevelClass('standard'),
        premium: this.getMaterialLevelClass('premium'),
        luxury: this.getMaterialLevelClass('luxury'),
        custom: this.getMaterialLevelClass('custom'),
      };
    },

    get scenarioClass() {
      return {
        optimistic: this.getScenarioClass('optimistic'),
        realistic: this.getScenarioClass('realistic'),
        pessimistic: this.getScenarioClass('pessimistic'),
      };
    },

    get terrainStepText() {
      return this.getTerrainStepText();
    },

    // Visibilidad / habilitación de botones del wizard
    get wizardNavButtonVisible() {
      return this.showWizardNavButton();
    },
    get wizardNextButtonVisible() {
      return this.showWizardNextButton();
    },
    get wizardFinishButtonVisible() {
      return this.showWizardFinishButton();
    },
    get canProceedWizardFlag() {
      return this.canProceedWizard();
    },
    get canCompleteWizardFlag() {
      return this.canCompleteWizard();
    },

    // New methods for CSP compatibility
    handlePhaseClick(index) {
      if (this.currentPhase >= index) {
        this.goToPhase(index);
      }
    },

    openLeaderboard() {
      this.showLeaderboard = true;
    },

    closeLeaderboard() {
      this.showLeaderboard = false;
    },
  }));

  console.log('✅ Alpine.js CSP components initialized for GitHub Pages');
}); 