/**
 * Viewer3D Module - Visualización 3D avanzada de terrenos
 * Implementa renderizado 3D con Babylon.js, análisis solar y controles ambientales
 * @module Viewer3DModule
 */

(function () {
  'use strict';

  /**
   * Factory function para crear instancias del Viewer3D
   * @returns {Object} Instancia del módulo Viewer3D
   */
  window.Viewer3DModule = function () {
    // Estado privado
    const state = {
      engine: null,
      scene: null,
      camera: null,
      light: null,
      terrainMesh: null,
      sunLight: null,
      shadowGenerator: null,
      terrainData: null,
      timeOfDay: 12, // 0-24 hours
      season: 'summer', // spring, summer, autumn, winter
      isNightMode: false,
      analysisMode: null, // null, 'solar', 'wind', 'elevation'
      windParticles: null,
      skybox: null,
      ground: null,
      projectType: 'residential', // default, can be overridden
      config: {
        shadowQuality: 1024,
        enablePostProcessing: true,
        enableReflections: true,
        terrainQuality: 'high', // low, medium, high
      },
    };

    // Configuración de análisis solar
    const solarConfig = {
      latitude: 19.4326, // Ciudad de México por defecto
      longitude: -99.1332,
      timezone: -6, // CST
      sunPositions: [], // Calculado dinámicamente
    };

    // Configuración de viento
    const windConfig = {
      direction: 45, // grados desde el norte
      speed: 10, // km/h
      particleCount: 200,
    };

    /**
     * Inicializa el módulo de visualización 3D
     * @param {string} canvasId - ID del canvas HTML
     * @param {Object} options - Opciones de configuración
     * @returns {Promise<void>}
     */
    async function init(canvasId = 'viewer3d-canvas', options = {}) {
      console.log('🎮 Initializing Viewer3D Module...');

      // Merge configuración
      Object.assign(state.config, options);

      // Verificar que Babylon.js está cargado
      if (!window.BABYLON) {
        console.error('❌ Babylon.js not loaded');
        await loadBabylonJS();
      }

      // Obtener canvas
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error('❌ Canvas element not found:', canvasId);
        return;
      }

      // Inicializar motor y escena
      initializeEngine(canvas);
      await initializeScene();

      // Configurar controles
      setupControls();

      // Iniciar render loop
      startRenderLoop();

      console.log('✅ Viewer3D Module initialized');
    }

    /**
     * Carga Babylon.js dinámicamente si no está presente
     */
    async function loadBabylonJS() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/babylonjs@6.0.0/babylon.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    /**
     * Inicializa el motor de Babylon.js
     * @param {HTMLCanvasElement} canvas - Canvas para renderizado
     */
    function initializeEngine(canvas) {
      state.engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
      });

      // Ajustar tamaño al cambiar ventana
      window.addEventListener('resize', () => {
        state.engine.resize();
      });

      // Optimizaciones para móviles
      if (isMobile()) {
        state.engine.setHardwareScalingLevel(2);
        state.config.shadowQuality = 512;
        state.config.enableReflections = false;
      }
    }

    /**
     * Inicializa la escena 3D
     */
    async function initializeScene() {
      // Crear escena
      state.scene = new BABYLON.Scene(state.engine);
      state.scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1, 1);

      // Habilitar física
      state.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0));

      // Crear cámara
      createCamera();

      // Crear iluminación
      createLighting();

      // Crear skybox
      createSkybox();

      // Crear suelo base
      createGround();

      // Configurar niebla para profundidad
      state.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      state.scene.fogDensity = 0.01;
      state.scene.fogColor = new BABYLON.Color3(0.8, 0.9, 1);

      // Post-processing si está habilitado
      if (state.config.enablePostProcessing) {
        setupPostProcessing();
      }
    }

    /**
     * Crea la cámara principal
     */
    function createCamera() {
      state.camera = new BABYLON.ArcRotateCamera(
        'mainCamera',
        Math.PI / 4,
        Math.PI / 3,
        50,
        BABYLON.Vector3.Zero(),
        state.scene,
      );

      state.camera.attachControl(state.engine.getRenderingCanvas(), true);

      // Límites de cámara
      state.camera.lowerRadiusLimit = 10;
      state.camera.upperRadiusLimit = 200;
      state.camera.lowerBetaLimit = 0.1;
      state.camera.upperBetaLimit = Math.PI / 2 - 0.1;

      // Suavizado de movimiento
      state.camera.inertia = 0.7;
      state.camera.angularSensibilityX = 1000;
      state.camera.angularSensibilityY = 1000;
      state.camera.panningSensibility = 100;
      state.camera.wheelPrecision = 10;
    }

    /**
     * Crea el sistema de iluminación
     */
    function createLighting() {
      // Luz ambiental
      const ambientLight = new BABYLON.HemisphericLight(
        'ambientLight',
        new BABYLON.Vector3(0, 1, 0),
        state.scene,
      );
      ambientLight.intensity = 0.4;
      ambientLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.6);

      // Luz direccional (sol)
      state.sunLight = new BABYLON.DirectionalLight(
        'sunLight',
        new BABYLON.Vector3(-1, -2, -1),
        state.scene,
      );
      state.sunLight.intensity = 1.2;
      state.sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
      state.sunLight.specular = new BABYLON.Color3(1, 0.95, 0.8);

      // Configurar sombras
      if (state.config.shadowQuality > 0) {
        state.shadowGenerator = new BABYLON.ShadowGenerator(
          state.config.shadowQuality,
          state.sunLight,
        );
        state.shadowGenerator.useBlurExponentialShadowMap = true;
        state.shadowGenerator.blurScale = 2;
        state.shadowGenerator.setDarkness(0.4);
      }
    }

    /**
     * Crea el skybox
     */
    function createSkybox() {
      const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', state.scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
        'https://playground.babylonjs.com/textures/skybox',
        state.scene,
      );
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

      state.skybox = BABYLON.MeshBuilder.CreateBox('skybox', { size: 1000 }, state.scene);
      state.skybox.material = skyboxMaterial;
      state.skybox.infiniteDistance = true;
    }

    /**
     * Crea el suelo base
     */
    function createGround() {
      state.ground = BABYLON.MeshBuilder.CreateGround(
        'ground',
        { width: 200, height: 200, subdivisions: 32 },
        state.scene,
      );

      const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', state.scene);
      groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.3);
      groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      state.ground.material = groundMaterial;

      // Recibir sombras
      if (state.shadowGenerator) {
        state.ground.receiveShadows = true;
      }
    }

    /**
     * Configura post-processing
     */
    function setupPostProcessing() {
      // SSAO para oclusión ambiental
      const ssao = new BABYLON.SSAORenderingPipeline('ssao', state.scene, {
        ssaoRatio: 0.5,
        combineRatio: 1.0,
      });
      ssao.fallOff = 0.000001;
      ssao.area = 0.0075;
      ssao.radius = 0.0001;
      ssao.totalStrength = 1.0;
      ssao.base = 0.5;

      state.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
        'ssao',
        state.camera,
      );

      // Bloom para brillos
      const bloom = new BABYLON.BloomEffect(state.scene, 1.0, 0.5, 0.3);
      state.camera.addEffect(bloom);
    }

    /**
     * Carga datos del terreno y crea el mesh 3D
     * @param {Object} terrainData - Datos del terreno (coordenadas, área, etc.)
     */
    async function loadTerrainData(terrainData, meta = {}) {
      if (meta.projectType) {
        state.projectType = meta.projectType;
      }
      if (!terrainData || !terrainData.coordinates || terrainData.coordinates.length < 3) {
        console.error('❌ Invalid terrain data');
        return;
      }

      state.terrainData = terrainData;

      // Limpiar terreno anterior si existe
      if (state.terrainMesh) {
        state.terrainMesh.dispose();
      }

      // Crear mesh del terreno
      createTerrainMesh();

      // Ajustar cámara al terreno
      focusOnTerrain();

      // Actualizar análisis si está activo
      if (state.analysisMode) {
        updateAnalysis();
      }

      console.log('✅ Terrain loaded:', terrainData);
    }

    /**
     * Crea el mesh 3D del terreno a partir de las coordenadas
     */
    function createTerrainMesh() {
      // Convertir coordenadas lat/lng a posiciones 3D locales
      const positions = [];
      const indices = [];
      const normals = [];
      const uvs = [];

      // Calcular centro del terreno
      const center = calculateCenter(state.terrainData.coordinates);

      // Convertir coordenadas a metros relativos al centro
      const vertices = state.terrainData.coordinates.map((coord) => {
        const relativePos = latLngToMeters(coord.lat, coord.lng, center.lat, center.lng);
        return new BABYLON.Vector3(relativePos.x, 0, relativePos.z);
      });

      // Crear polígono usando triangulación de Earcut
      const flatVertices = [];
      vertices.forEach((v) => {
        flatVertices.push(v.x, v.z);
      });

      // Triangular el polígono
      const triangles = BABYLON.PolygonMeshBuilder.Earcut(flatVertices, [], 2);

      // Construir arrays para el mesh
      vertices.forEach((vertex, i) => {
        positions.push(vertex.x, vertex.y + 0.1, vertex.z); // Elevar ligeramente
        normals.push(0, 1, 0); // Normal hacia arriba
        uvs.push(vertex.x / 10, vertex.z / 10); // UVs simples
      });

      // Crear mesh custom
      const terrainMesh = new BABYLON.Mesh('terrain', state.scene);
      const vertexData = new BABYLON.VertexData();

      vertexData.positions = positions;
      vertexData.indices = triangles;
      vertexData.normals = normals;
      vertexData.uvs = uvs;

      vertexData.applyToMesh(terrainMesh);

      // Material del terreno
      const terrainMaterial = new BABYLON.StandardMaterial('terrainMaterial', state.scene);
      terrainMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.4);
      terrainMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
      terrainMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.1, 0.05);

      // Textura procedural si es terreno grande
      if (state.terrainData.area > 10000) {
        const grassTexture = new BABYLON.GrassProceduralTexture('grassTexture', 256, state.scene);
        terrainMaterial.ambientTexture = grassTexture;
      }

      terrainMesh.material = terrainMaterial;

      // Ensure visibility from both sides to avoid disappearing when camera moves underneath/inside
      terrainMesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;

      // Sombras
      if (state.shadowGenerator) {
        state.shadowGenerator.addShadowCaster(terrainMesh);
        terrainMesh.receiveShadows = true;
      }

      // Añadir borde al terreno
      createTerrainBorder(vertices);

      state.terrainMesh = terrainMesh;

      // --- NEW: Add a demo building extruded from terrain footprint ---
      try {
        if (vertices.length >= 3) {
          // Build 2D shape from terrain footprint (x,z -> x,y)
          const shape2d = vertices.map((v) => new BABYLON.Vector3(v.x, v.z, 0));

          // Determine base radius to scale heights
          const radius = terrainMesh.getBoundingInfo().boundingSphere.radiusWorld;

          // Height & material presets per project type
          let bHeight = 10;
          const buildingMat = new BABYLON.PBRMaterial('buildingMat', state.scene);
          switch (state.projectType) {
            case 'commercial':
              bHeight = Math.max(20, radius * 1.0);
              buildingMat.albedoColor = new BABYLON.Color3(0.7, 0.8, 0.9); // glassy bluish
              buildingMat.metallic = 0.6;
              buildingMat.roughness = 0.15;
              break;
            case 'mixed':
              bHeight = Math.max(15, radius * 0.75);
              buildingMat.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.92);
              buildingMat.metallic = 0.3;
              buildingMat.roughness = 0.4;
              break;
            case 'industrial':
              bHeight = Math.max(12, radius * 0.5);
              buildingMat.albedoColor = new BABYLON.Color3(0.6, 0.6, 0.6);
              buildingMat.metallic = 0.2;
              buildingMat.roughness = 0.8;
              break;
            case 'residential':
            default:
              bHeight = Math.max(8, radius * 0.4);
              buildingMat.albedoColor = new BABYLON.Color3(0.87, 0.82, 0.78);
              buildingMat.metallic = 0.05;
              buildingMat.roughness = 0.75;
              break;
          }

          const building = BABYLON.MeshBuilder.ExtrudePolygon(
            'demoBuilding',
            {
              shape: shape2d,
              depth: bHeight,
              sideOrientation: BABYLON.Mesh.DOUBLESIDE,
              cap: BABYLON.Mesh.CAP_ALL,
            },
            state.scene,
          );

          // Position building so it stands on ground
          building.rotation.x = Math.PI / 2; // align depth along Y
          building.position.y = 0.1; // slightly above terrain

          building.material = buildingMat;

          // Shadows
          if (state.shadowGenerator) {
            state.shadowGenerator.addShadowCaster(building);
            building.receiveShadows = true;
          }
        }
      } catch (err) {
        console.warn('Could not create demo building:', err);
      }

      // Añadir elevación si está disponible
      if (state.terrainData.elevation) {
        applyElevation();
      }
    }

    /**
     * Crea un borde visual para el terreno
     */
    function createTerrainBorder(vertices) {
      const borderPoints = vertices.map((v) => new BABYLON.Vector3(v.x, 0.2, v.z));
      borderPoints.push(borderPoints[0]); // Cerrar el loop

      const border = BABYLON.MeshBuilder.CreateLines(
        'terrainBorder',
        {
          points: borderPoints,
          updatable: false,
        },
        state.scene,
      );

      border.color = new BABYLON.Color3(0.2, 0.3, 0.8);
      border.alpha = 0.8;
    }

    /**
     * Aplica datos de elevación al terreno
     */
    async function applyElevation() {
      // Por ahora, aplicar una elevación simulada basada en Perlin noise
      if (state.terrainMesh) {
        const positions = state.terrainMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const normals = [];

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const z = positions[i + 2];

          // Simular elevación con ruido
          const elevation = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2;
          positions[i + 1] = elevation;
        }

        // Actualizar posiciones
        state.terrainMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

        // Recalcular normales
        BABYLON.VertexData.ComputeNormals(positions, state.terrainMesh.getIndices(), normals);
        state.terrainMesh.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
      }
    }

    /**
     * Enfoca la cámara en el terreno
     */
    function focusOnTerrain() {
      if (state.terrainMesh) {
        const boundingInfo = state.terrainMesh.getBoundingInfo();
        const center = boundingInfo.boundingBox.centerWorld;
        const radius = boundingInfo.boundingSphere.radiusWorld;

        state.camera.setTarget(center);
        state.camera.radius = radius * 2.5;
        state.camera.alpha = Math.PI / 4;
        state.camera.beta = Math.PI / 3;
      }
    }

    /**
     * Actualiza la hora del día (sistema día/noche)
     * @param {number} hour - Hora del día (0-24)
     */
    function setTimeOfDay(hour) {
      state.timeOfDay = Math.max(0, Math.min(24, hour));

      // Calcular posición del sol
      const sunAngle = (state.timeOfDay - 6) * 15; // 15 grados por hora
      const sunHeight = Math.sin((sunAngle * Math.PI) / 180);
      const sunDirection = new BABYLON.Vector3(
        Math.cos((sunAngle * Math.PI) / 180),
        -Math.abs(sunHeight),
        0,
      );

      // Actualizar dirección de la luz
      if (state.sunLight) {
        state.sunLight.direction = sunDirection;

        // Ajustar intensidad según hora
        const intensity = Math.max(0, sunHeight);
        state.sunLight.intensity = intensity * 1.2;

        // Cambiar color de la luz
        if (state.timeOfDay < 6 || state.timeOfDay > 18) {
          // Noche
          state.sunLight.diffuse = new BABYLON.Color3(0.2, 0.2, 0.4);
          state.scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);
          state.isNightMode = true;
        } else if (state.timeOfDay < 8 || state.timeOfDay > 16) {
          // Amanecer/atardecer
          state.sunLight.diffuse = new BABYLON.Color3(1, 0.6, 0.3);
          state.scene.clearColor = new BABYLON.Color4(0.8, 0.6, 0.4, 1);
          state.isNightMode = false;
        } else {
          // Día
          state.sunLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
          state.scene.clearColor = new BABYLON.Color4(0.8, 0.9, 1, 1);
          state.isNightMode = false;
        }

        // Actualizar niebla
        if (state.scene.fogMode) {
          state.scene.fogColor = state.scene.clearColor.toColor3();
        }
      }

      // Activar/desactivar estrellas
      updateStars();
    }

    /**
     * Toggles between day and night mode
     */
    function toggleDayNight() {
      if (state.isNightMode) {
        setTimeOfDay(12); // Set to noon
      } else {
        setTimeOfDay(20); // Set to night
      }
    }

    /**
     * Check if currently in night mode
     * @returns {boolean}
     */
    function isNightMode() {
      return state.isNightMode;
    }

    /**
     * Get current analysis mode
     * @returns {string|null}
     */
    function getAnalysisMode() {
      return state.analysisMode;
    }

    /**
     * Reset camera to default position
     */
    function resetCamera() {
      if (state.camera) {
        state.camera.alpha = Math.PI / 4;
        state.camera.beta = Math.PI / 3;
        state.camera.radius = 50;

        if (state.terrainMesh) {
          focusOnTerrain();
        } else {
          state.camera.setTarget(BABYLON.Vector3.Zero());
        }
      }
    }

    /**
     * Updates star visibility based on time
     */
    function updateStars() {
      // Por implementar: sistema de partículas para estrellas
      if (state.isNightMode && !state.stars) {
        // Crear estrellas
      } else if (!state.isNightMode && state.stars) {
        // Ocultar estrellas
      }
    }

    /**
     * Activa el análisis solar
     */
    function enableSolarAnalysis() {
      state.analysisMode = 'solar';

      // Calcular trayectoria solar para el día
      calculateSolarPath();

      // Mostrar visualización
      showSolarVisualization();
    }

    /**
     * Calcula la trayectoria solar
     */
    function calculateSolarPath() {
      solarConfig.sunPositions = [];

      for (let hour = 0; hour < 24; hour++) {
        const angle = (hour - 6) * 15;
        const height = Math.sin((angle * Math.PI) / 180);

        if (height > 0) {
          solarConfig.sunPositions.push({
            hour,
            angle,
            height,
            azimuth: angle + 180,
          });
        }
      }
    }

    /**
     * Muestra la visualización del análisis solar
     */
    function showSolarVisualization() {
      // Crear línea de trayectoria solar
      const solarPoints = solarConfig.sunPositions.map((pos) => {
        const radius = 30;
        return new BABYLON.Vector3(
          Math.cos((pos.angle * Math.PI) / 180) * radius,
          pos.height * radius,
          Math.sin((pos.angle * Math.PI) / 180) * radius,
        );
      });

      if (solarPoints.length > 1) {
        const solarPath = BABYLON.MeshBuilder.CreateLines(
          'solarPath',
          {
            points: solarPoints,
            updatable: false,
          },
          state.scene,
        );

        solarPath.color = new BABYLON.Color3(1, 0.8, 0);
        solarPath.alpha = 0.8;

        // Crear indicadores de hora
        solarConfig.sunPositions.forEach((pos) => {
          if (pos.hour % 2 === 0) {
            const sphere = BABYLON.MeshBuilder.CreateSphere(
              `sun_${pos.hour}`,
              {
                diameter: 2,
              },
              state.scene,
            );

            const radius = 30;
            sphere.position = new BABYLON.Vector3(
              Math.cos((pos.angle * Math.PI) / 180) * radius,
              pos.height * radius,
              Math.sin((pos.angle * Math.PI) / 180) * radius,
            );

            const material = new BABYLON.StandardMaterial(`sunMat_${pos.hour}`, state.scene);
            material.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
            sphere.material = material;
          }
        });
      }

      // Mostrar información de sombras
      animateShadows();
    }

    /**
     * Anima las sombras a lo largo del día
     */
    function animateShadows() {
      let currentHour = 6;

      const shadowAnimation = setInterval(() => {
        setTimeOfDay(currentHour);
        currentHour += 0.5;

        if (currentHour > 18) {
          clearInterval(shadowAnimation);
          setTimeOfDay(state.timeOfDay); // Restaurar hora original
        }
      }, 500);
    }

    /**
     * Activa el análisis de viento
     */
    function enableWindAnalysis() {
      state.analysisMode = 'wind';

      // Crear sistema de partículas para viento
      createWindParticles();

      // Mostrar rosa de vientos
      showWindRose();
    }

    /**
     * Crea partículas para visualizar el viento
     */
    function createWindParticles() {
      const particleSystem = new BABYLON.ParticleSystem(
        'windParticles',
        windConfig.particleCount,
        state.scene,
      );

      // Textura de partícula
      particleSystem.particleTexture = new BABYLON.Texture(
        'https://playground.babylonjs.com/textures/flare.png',
        state.scene,
      );

      // Emisor
      particleSystem.emitter = new BABYLON.Vector3(0, 10, 0);
      particleSystem.minEmitBox = new BABYLON.Vector3(-50, 0, -50);
      particleSystem.maxEmitBox = new BABYLON.Vector3(50, 20, 50);

      // Dirección basada en configuración de viento
      const windRad = (windConfig.direction * Math.PI) / 180;
      particleSystem.direction1 = new BABYLON.Vector3(
        (Math.sin(windRad) * windConfig.speed) / 10,
        -0.1,
        (Math.cos(windRad) * windConfig.speed) / 10,
      );
      particleSystem.direction2 = particleSystem.direction1.clone();

      // Propiedades de las partículas
      particleSystem.minLifeTime = 2;
      particleSystem.maxLifeTime = 4;
      particleSystem.emitRate = 20;
      particleSystem.minSize = 0.1;
      particleSystem.maxSize = 0.5;
      particleSystem.updateSpeed = 0.02;

      // Color
      particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 1, 0.5);
      particleSystem.color2 = new BABYLON.Color4(0.6, 0.6, 0.8, 0.3);

      particleSystem.start();
      state.windParticles = particleSystem;
    }

    /**
     * Muestra la rosa de vientos
     */
    function showWindRose() {
      // Por implementar: UI overlay con rosa de vientos
      console.log(`Wind: ${windConfig.direction}° at ${windConfig.speed} km/h`);
    }

    /**
     * Desactiva el análisis actual
     */
    function disableAnalysis() {
      // Limpiar visualizaciones según el modo
      if (state.analysisMode === 'solar') {
        // Remover trayectoria solar
        const solarPath = state.scene.getMeshByName('solarPath');
        if (solarPath) solarPath.dispose();

        // Remover indicadores
        for (let hour = 0; hour < 24; hour += 2) {
          const sun = state.scene.getMeshByName(`sun_${hour}`);
          if (sun) sun.dispose();
        }
      } else if (state.analysisMode === 'wind') {
        // Detener partículas
        if (state.windParticles) {
          state.windParticles.stop();
          state.windParticles.dispose();
          state.windParticles = null;
        }
      }

      state.analysisMode = null;
    }

    /**
     * Actualiza el análisis actual
     */
    function updateAnalysis() {
      if (state.analysisMode === 'solar') {
        disableAnalysis();
        enableSolarAnalysis();
      } else if (state.analysisMode === 'wind') {
        disableAnalysis();
        enableWindAnalysis();
      }
    }

    /**
     * Configura controles adicionales
     */
    function setupControls() {
      // Controles de teclado
      state.scene.actionManager = new BABYLON.ActionManager(state.scene);

      // Tecla D: Toggle día/noche
      state.scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
          if (evt.sourceEvent.key === 'd' || evt.sourceEvent.key === 'D') {
            toggleDayNight();
          }
        }),
      );

      // Tecla S: Toggle análisis solar
      state.scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
          if (evt.sourceEvent.key === 's' || evt.sourceEvent.key === 'S') {
            if (state.analysisMode === 'solar') {
              disableAnalysis();
            } else {
              enableSolarAnalysis();
            }
          }
        }),
      );

      // Tecla W: Toggle análisis de viento
      state.scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
          if (evt.sourceEvent.key === 'w' || evt.sourceEvent.key === 'W') {
            if (state.analysisMode === 'wind') {
              disableAnalysis();
            } else {
              enableWindAnalysis();
            }
          }
        }),
      );
    }

    /**
     * Inicia el render loop
     */
    function startRenderLoop() {
      state.engine.runRenderLoop(() => {
        if (state.scene) {
          state.scene.render();
        }
      });
    }

    /**
     * Exporta la escena a glTF
     */
    async function exportScene() {
      if (!state.scene) return;

      // Cargar exportador si no está presente
      if (!BABYLON.GLTF2Export) {
        await loadScript('https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js');
      }

      BABYLON.GLTF2Export.GLTFAsync(state.scene, 'terrain_3d').then((gltf) => {
        gltf.downloadFiles();
      });
    }

    /**
     * Toma una captura de pantalla
     */
    function takeScreenshot() {
      if (state.engine) {
        BABYLON.Tools.CreateScreenshot(state.engine, state.camera, { width: 1920, height: 1080 });
      }
    }

    /**
     * Cambia la calidad del renderizado
     * @param {string} quality - 'low', 'medium', 'high'
     */
    function setQuality(quality) {
      state.config.terrainQuality = quality;

      switch (quality) {
        case 'low':
          state.engine.setHardwareScalingLevel(2);
          state.config.shadowQuality = 512;
          state.config.enablePostProcessing = false;
          state.config.enableReflections = false;
          break;
        case 'medium':
          state.engine.setHardwareScalingLevel(1.5);
          state.config.shadowQuality = 1024;
          state.config.enablePostProcessing = false;
          state.config.enableReflections = true;
          break;
        case 'high':
          state.engine.setHardwareScalingLevel(1);
          state.config.shadowQuality = 2048;
          state.config.enablePostProcessing = true;
          state.config.enableReflections = true;
          break;
      }

      // Recrear sombras con nueva calidad
      if (state.shadowGenerator) {
        state.shadowGenerator.dispose();
        createLighting();
      }
    }

    /**
     * Detecta si es dispositivo móvil
     */
    function isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    }

    /**
     * Calcula el centro de las coordenadas
     */
    function calculateCenter(coordinates) {
      let sumLat = 0,
        sumLng = 0;
      coordinates.forEach((coord) => {
        sumLat += coord.lat;
        sumLng += coord.lng;
      });
      return {
        lat: sumLat / coordinates.length,
        lng: sumLng / coordinates.length,
      };
    }

    /**
     * Convierte lat/lng a metros relativos
     */
    function latLngToMeters(lat, lng, centerLat, centerLng) {
      const R = 6378137; // Radio de la Tierra en metros
      const dLat = ((lat - centerLat) * Math.PI) / 180;
      const dLng = ((lng - centerLng) * Math.PI) / 180;

      const x = dLng * R * Math.cos((centerLat * Math.PI) / 180);
      const z = dLat * R;

      return { x, z };
    }

    /**
     * Carga un script dinámicamente
     */
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    /**
     * Destruye el módulo y limpia recursos
     */
    function destroy() {
      // Detener render loop
      if (state.engine) {
        state.engine.stopRenderLoop();
      }

      // Limpiar análisis
      disableAnalysis();

      // Dispose escena
      if (state.scene) {
        state.scene.dispose();
      }

      // Dispose motor
      if (state.engine) {
        state.engine.dispose();
      }

      // Remover event listeners
      window.removeEventListener('resize', () => state.engine.resize());

      console.log('🧹 Viewer3D Module destroyed');
    }

    // API pública del módulo
    return {
      init,
      loadTerrainData,
      setTimeOfDay,
      toggleDayNight,
      enableSolarAnalysis,
      enableWindAnalysis,
      disableAnalysis,
      setQuality,
      exportScene,
      takeScreenshot,
      destroy,
      // Getters
      getTimeOfDay: () => state.timeOfDay,
      getAnalysisMode: () => state.analysisMode,
      isNightMode: () => state.isNightMode,
      // Setters para configuración
      setWindDirection: (dir) => {
        windConfig.direction = dir;
        updateAnalysis();
      },
      setWindSpeed: (speed) => {
        windConfig.speed = speed;
        updateAnalysis();
      },
      setSolarLocation: (lat, lng) => {
        solarConfig.latitude = lat;
        solarConfig.longitude = lng;
        updateAnalysis();
      },
      resetCamera,
    };
  };

  console.log('✅ Viewer3D Module loaded');
})();
