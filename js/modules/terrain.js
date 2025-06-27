/**
 * Terrain Module - Gestión avanzada de terrenos con Google Maps
 * Incluye geofencing, análisis de elevación, importación CAD/GeoJSON
 * Compatible with modern Google Maps API loading
 * @module TerrainModule
 */

window.TerrainModule = function(opts = {}) {
  return {
    /* Runtime options provided by caller */
    options: {
      center: opts.center || { lat: 19.4326, lng: -99.1332 },
      zoom: opts.zoom || 18, // closer default for per-building drawing
      locationPoint: opts.locationPoint || null
    },
    map: null,
    drawingManager: null,
    selectedPolygon: null,
    geofence: null,
    elevationService: null,
    placesService: null,
    terrainData: {
      coordinates: [],
      area: 0,
      perimeter: 0,
      elevation: 0,
      elevationProfile: [],
      slope: 0,
      landUse: null,
      restrictions: []
    },
    geofenceConfig: {
      enabled: false,
      allowedZones: [],
      restrictedZones: [],
      zoneTypes: {
        residential: { color: '#4CAF50', fillOpacity: 0.3 },
        commercial: { color: '#2196F3', fillOpacity: 0.3 },
        industrial: { color: '#FF9800', fillOpacity: 0.3 },
        protected: { color: '#F44336', fillOpacity: 0.5 }
      }
    },
    
    async init() {
      console.log('🗺️ Initializing Terrain Module...');
      
      // Wait for Google Maps API to be fully loaded (including drawing library)
      await this.waitForGoogleMapsLibraries();
      
      this.initializeMap();
    },
    
    async waitForGoogleMapsLibraries() {
      // If Maps API is not loaded at all, wait for the main app to load it
      if (!window.google || !window.google.maps) {
        console.log('⏳ Waiting for Google Maps API to be loaded by main app...');
        await this.waitForBasicMaps();
      }
      
      // Ensure drawing and geometry libraries are available
      if (!window.google.maps.drawing || !window.google.maps.geometry) {
        console.log('📦 Loading additional Maps libraries...');
        await this.loadAdditionalLibraries();
      }
      
      console.log('✅ All Google Maps libraries ready');
    },
    
    async waitForBasicMaps() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('⚠️ Timeout waiting for basic Maps API');
          resolve();
        }, 10000);
      });
    },
    
    async loadAdditionalLibraries() {
      return new Promise((resolve, reject) => {
        // Get API key from configuration
        const apiKey = window.BEYOND_CONFIG?.GOOGLE_MAPS_API_KEY || 'AIzaSyCHZEIwEo3h7Ah3skmMbyMOEcj6H85eG_c';
        
        // Use modern importLibrary if available (newer API)
        if (window.google.maps.importLibrary) {
          Promise.all([
            window.google.maps.importLibrary('drawing'),
            window.google.maps.importLibrary('geometry'),
            window.google.maps.importLibrary('elevation'),
            window.google.maps.importLibrary('places')
          ]).then(() => {
            console.log('✅ Libraries loaded via importLibrary');
            resolve();
          }).catch((error) => {
            console.warn('⚠️ importLibrary failed, using fallback');
            this.loadLibrariesFallback(apiKey, resolve, reject);
          });
        } else {
          // Fallback for older API versions
          this.loadLibrariesFallback(apiKey, resolve, reject);
        }
      });
    },
    
    loadLibrariesFallback(apiKey, resolve, reject) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry,elevation,places&loading=async&callback=terrainLibrariesLoaded`;
      script.async = true;
      script.defer = true;
      
      // Global callback for library loading
      window.terrainLibrariesLoaded = () => {
        delete window.terrainLibrariesLoaded;
        console.log('✅ Libraries loaded via script injection');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load additional libraries');
        reject(new Error('Failed to load Maps libraries'));
      };
      
      // Don't add script if it might conflict with existing API loading
      if (!document.querySelector(`script[src*="drawing,geometry,elevation,places"]`)) {
        document.head.appendChild(script);
      } else {
        // Wait for existing script to finish
        setTimeout(() => {
          if (window.google.maps.drawing && window.google.maps.geometry) {
            resolve();
          } else {
            reject(new Error('Libraries not available after timeout'));
          }
        }, 3000);
      }
    },
    
    initializeMap() {
      const mapElement = document.getElementById('terrain-map');
      if (!mapElement) {
        console.error('❌ Terrain map element not found');
        return;
      }
      
      try {
        // Initialize map with enhanced settings
        this.map = new google.maps.Map(mapElement, {
          center: this.options.center,
          zoom: this.options.zoom,
          mapTypeId: 'hybrid', // Satellite + labels
          tilt: 0,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy', // Better for drawing
          rotateControl: true
        });
        
        // Add search box for quick navigation
        this.addSearchBox();
        
        // Initialize services
        this.elevationService = new google.maps.ElevationService();
        this.placesService = new google.maps.places.PlacesService(this.map);
        
        // Setup drawing tools
        this.setupDrawingManager();
        
        // Add custom controls
        this.addCustomControls();
        
        // Initialize geofencing if enabled
        if (this.geofenceConfig.enabled) {
          this.initializeGeofencing();
        }
        
        // If we have a previous location point, drop a marker and enforce initial viewport
        if (this.options.locationPoint) {
          new google.maps.Marker({
            position: this.options.locationPoint,
            map: this.map,
            title: 'Ubicación seleccionada'
          });

          this.map.setCenter(this.options.locationPoint);
          this.map.setZoom(this.options.zoom);
        } else {
          // Explicitly apply configured center/zoom once tiles are loaded (guards against default overrides)
          google.maps.event.addListenerOnce(this.map, 'tilesloaded', () => {
            this.map.setCenter(this.options.center);
            this.map.setZoom(this.options.zoom);
          });
        }
        
        console.log('✅ Terrain map initialized successfully');
        
        // Notificar al resto de la aplicación que el módulo está listo
        window.dispatchEvent(new CustomEvent('terrainReady'));
        
      } catch (error) {
        console.error('❌ Error initializing terrain map:', error);
        this.showMapError('Error al inicializar el mapa de terreno');
      }
    },
    
    setupDrawingManager() {
      if (!window.google.maps.drawing) {
        console.error('❌ Drawing library not available');
        return;
      }
      
      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null, // Start without drawing mode active
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.RECTANGLE
          ]
        },
        polygonOptions: {
          fillColor: '#334b4e',
          fillOpacity: 0.4,
          strokeColor: '#243b44',
          strokeWeight: 3,
          editable: true,
          draggable: false
        },
        rectangleOptions: {
          fillColor: '#334b4e',
          fillOpacity: 0.4,
          strokeColor: '#243b44',
          strokeWeight: 3,
          editable: true,
          draggable: false
        }
      });
      
      this.drawingManager.setMap(this.map);
      
      // Event when polygon is completed
      google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (polygon) => {
        this.handlePolygonComplete(polygon);
      });
      
      // Event when rectangle is completed
      google.maps.event.addListener(this.drawingManager, 'rectanglecomplete', (rectangle) => {
        this.handleRectangleComplete(rectangle);
      });
    },
    
    addCustomControls() {
      // Clear terrain button
      const clearButton = this.createControl('🗑️ Limpiar', () => this.clearTerrain());
      
      // Import file button
      const importButton = this.createControl('📁 Importar', () => this.showImportDialog());
      
      // Measure tool button
      const measureButton = this.createControl('📏 Medir', () => this.toggleMeasureTool());
      
      // Geofence toggle button
      const geofenceButton = this.createControl('🚧 Geofence', () => this.toggleGeofencing());
      
      // Elevation analysis button
      const elevationButton = this.createControl('📊 Elevación', () => this.analyzeElevation());
      
      // Add controls to map
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clearButton);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(importButton);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(measureButton);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(geofenceButton);
      this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(elevationButton);
    },
    
    createControl(text, onClick) {
      const button = document.createElement('div');
      button.className = 'custom-map-control';
      button.innerHTML = text;
      button.style.cssText = `
        background: white;
        border: 2px solid #333;
        border-radius: 5px;
        cursor: pointer;
        margin: 10px;
        padding: 8px 12px;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: all 0.2s;
      `;
      
      button.addEventListener('click', onClick);
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#f0f0f0';
        button.style.transform = 'translateY(-1px)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'white';
        button.style.transform = 'translateY(0)';
      });
      
      return button;
    },
    
    handlePolygonComplete(polygon) {
      // Clear previous polygon if exists
      if (this.selectedPolygon) {
        this.selectedPolygon.setMap(null);
      }
      
      this.selectedPolygon = polygon;
      this.drawingManager.setDrawingMode(null);
      
      // Calculate area and perimeter
      const path = polygon.getPath();
      
      if (window.google.maps.geometry && window.google.maps.geometry.spherical) {
        this.terrainData.area = google.maps.geometry.spherical.computeArea(path);
        this.terrainData.perimeter = google.maps.geometry.spherical.computeLength(path);
      } else {
        console.warn('⚠️ Geometry library not available, using approximation');
        this.terrainData.area = this.approximateArea(path);
        this.terrainData.perimeter = this.approximatePerimeter(path);
      }
      
      // Save coordinates
      this.terrainData.coordinates = [];
      path.forEach((latLng) => {
        this.terrainData.coordinates.push({
          lat: latLng.lat(),
          lng: latLng.lng()
        });
      });
      
      // Check geofencing
      if (this.geofenceConfig.enabled) {
        this.checkGeofenceCompliance(polygon);
      }
      
      // Get elevation data
      this.getElevationData();
      
      // Analyze land use
      this.analyzeLandUse();
      
      // Update UI
      this.updateTerrainInfo();
      
      // Fit map to polygon bounds
      const bounds = new google.maps.LatLngBounds();
      path.forEach((latLng) => bounds.extend(latLng));
      this.map.fitBounds(bounds);
      
      console.log('✅ Terrain polygon completed', this.terrainData);
    },
    
    handleRectangleComplete(rectangle) {
      // Convert rectangle to polygon
      const bounds = rectangle.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const polygonCoords = [
        { lat: ne.lat(), lng: sw.lng() },
        { lat: ne.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: ne.lng() },
        { lat: sw.lat(), lng: sw.lng() }
      ];
      
      // Create polygon from rectangle
      const polygon = new google.maps.Polygon({
        paths: polygonCoords,
        fillColor: '#334b4e',
        fillOpacity: 0.4,
        strokeColor: '#243b44',
        strokeWeight: 3,
        editable: true,
        draggable: false
      });
      
      // Remove rectangle
      rectangle.setMap(null);
      
      // Set polygon on map
      polygon.setMap(this.map);
      
      // Handle as polygon
      this.handlePolygonComplete(polygon);
    },
    
    toggleGeofencing() {
      this.geofenceConfig.enabled = !this.geofenceConfig.enabled;
      
      if (this.geofenceConfig.enabled) {
        this.initializeGeofencing();
      } else {
        this.clearGeofencing();
      }
    },
    
    initializeGeofencing() {
      console.log('🚧 Initializing geofencing...');
      
      // Load predefined zones (in production, this would come from a database)
      this.loadGeofenceZones();
      
      // Display zones on map
      this.displayGeofenceZones();
    },
    
    loadGeofenceZones() {
      // Example zones for Mexico City
      this.geofenceConfig.allowedZones = [
        {
          type: 'residential',
          name: 'Zona Residencial Polanco',
          coordinates: [
            { lat: 19.4400, lng: -99.2050 },
            { lat: 19.4450, lng: -99.2000 },
            { lat: 19.4400, lng: -99.1950 },
            { lat: 19.4350, lng: -99.2000 }
          ]
        },
        {
          type: 'commercial',
          name: 'Zona Comercial Santa Fe',
          coordinates: [
            { lat: 19.3650, lng: -99.2600 },
            { lat: 19.3700, lng: -99.2550 },
            { lat: 19.3650, lng: -99.2500 },
            { lat: 19.3600, lng: -99.2550 }
          ]
        }
      ];
      
      this.geofenceConfig.restrictedZones = [
        {
          type: 'protected',
          name: 'Zona Protegida Xochimilco',
          coordinates: [
            { lat: 19.2600, lng: -99.1050 },
            { lat: 19.2650, lng: -99.1000 },
            { lat: 19.2600, lng: -99.0950 },
            { lat: 19.2550, lng: -99.1000 }
          ]
        }
      ];
    },
    
    displayGeofenceZones() {
      // Clear existing zones
      this.clearGeofencing();
      
      // Display allowed zones
      this.geofenceConfig.allowedZones.forEach(zone => {
        const zonePolygon = new google.maps.Polygon({
          paths: zone.coordinates,
          strokeColor: this.geofenceConfig.zoneTypes[zone.type].color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: this.geofenceConfig.zoneTypes[zone.type].color,
          fillOpacity: this.geofenceConfig.zoneTypes[zone.type].fillOpacity,
          clickable: false
        });
        
        zonePolygon.setMap(this.map);
        zone.polygon = zonePolygon;
      });
      
      // Display restricted zones
      this.geofenceConfig.restrictedZones.forEach(zone => {
        const zonePolygon = new google.maps.Polygon({
          paths: zone.coordinates,
          strokeColor: this.geofenceConfig.zoneTypes[zone.type].color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: this.geofenceConfig.zoneTypes[zone.type].color,
          fillOpacity: this.geofenceConfig.zoneTypes[zone.type].fillOpacity,
          clickable: false
        });
        
        zonePolygon.setMap(this.map);
        zone.polygon = zonePolygon;
      });
    },
    
    clearGeofencing() {
      // Remove all zone polygons from map
      [...this.geofenceConfig.allowedZones, ...this.geofenceConfig.restrictedZones].forEach(zone => {
        if (zone.polygon) {
          zone.polygon.setMap(null);
          delete zone.polygon;
        }
      });
    },
    
    checkGeofenceCompliance(polygon) {
      const path = polygon.getPath();
      const bounds = new google.maps.LatLngBounds();
      path.forEach(latLng => bounds.extend(latLng));
      
      this.terrainData.restrictions = [];
      
      // Check if polygon is within allowed zones
      let isInAllowedZone = false;
      this.geofenceConfig.allowedZones.forEach(zone => {
        if (this.isPolygonInsideZone(polygon, zone.coordinates)) {
          isInAllowedZone = true;
          this.terrainData.landUse = zone.type;
        }
      });
      
      // Check if polygon intersects restricted zones
      this.geofenceConfig.restrictedZones.forEach(zone => {
        if (this.isPolygonIntersectsZone(polygon, zone.coordinates)) {
          this.terrainData.restrictions.push({
            type: 'restricted_zone',
            severity: 'high',
            message: `El terreno intersecta con ${zone.name}`,
            zone: zone.name
          });
        }
      });
      
      if (!isInAllowedZone && this.geofenceConfig.allowedZones.length > 0) {
        this.terrainData.restrictions.push({
          type: 'outside_allowed_zone',
          severity: 'medium',
          message: 'El terreno está fuera de las zonas permitidas'
        });
      }
      
      // Visual feedback
      if (this.terrainData.restrictions.length > 0) {
        polygon.setOptions({
          fillColor: '#FF5722',
          strokeColor: '#D32F2F'
        });
        
        // Show restriction alert
        this.showRestrictionAlert();
      }
    },
    
    isPolygonInsideZone(polygon, zoneCoords) {
      // Simple check: all vertices of polygon must be inside zone
      const path = polygon.getPath();
      let allInside = true;
      
      path.forEach(vertex => {
        if (!google.maps.geometry.poly.containsLocation(vertex, new google.maps.Polygon({ paths: zoneCoords }))) {
          allInside = false;
        }
      });
      
      return allInside;
    },
    
    isPolygonIntersectsZone(polygon, zoneCoords) {
      // Check if any edge of the polygon intersects with the zone
      const path = polygon.getPath();
      
      for (let i = 0; i < path.getLength(); i++) {
        const vertex = path.getAt(i);
        if (google.maps.geometry.poly.containsLocation(vertex, new google.maps.Polygon({ paths: zoneCoords }))) {
          return true;
        }
      }
      
      return false;
    },
    
    showRestrictionAlert() {
      const alert = document.createElement('div');
      alert.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: bold;
      `;
      
      const messages = this.terrainData.restrictions.map(r => r.message).join('. ');
      alert.textContent = `⚠️ ${messages}`;
      
      document.getElementById('terrain-map').appendChild(alert);
      
      setTimeout(() => {
        alert.remove();
      }, 5000);
    },
    
    async getElevationData() {
      if (!this.elevationService || !this.terrainData.coordinates.length) return;
      
      try {
        // Get elevation for center point
        const center = this.calculateCenter(this.terrainData.coordinates);
        
        const request = {
          locations: [new google.maps.LatLng(center.lat, center.lng)],
        };
        
        const response = await new Promise((resolve, reject) => {
          this.elevationService.getElevationForLocations(request, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Elevation service failed: ${status}`));
            }
          });
        });
        
        this.terrainData.elevation = Math.round(response.elevation);
        
        // Get elevation profile along the perimeter
        await this.getElevationProfile();
        
        // Calculate slope
        this.calculateSlope();
        
        this.updateTerrainInfo();
        
      } catch (error) {
        console.error('Error getting elevation:', error);
      }
    },
    
    async getElevationProfile() {
      if (!this.terrainData.coordinates.length) return;
      
      const path = this.terrainData.coordinates.map(coord => 
        new google.maps.LatLng(coord.lat, coord.lng)
      );
      
      // Add first point to close the path
      path.push(path[0]);
      
      const request = {
        path: path,
        samples: Math.min(path.length * 2, 100) // Limit samples
      };
      
      try {
        const response = await new Promise((resolve, reject) => {
          this.elevationService.getElevationAlongPath(request, (results, status) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              reject(new Error(`Elevation path service failed: ${status}`));
            }
          });
        });
        
        this.terrainData.elevationProfile = response.map(point => ({
          elevation: point.elevation,
          location: {
            lat: point.location.lat(),
            lng: point.location.lng()
          }
        }));
        
      } catch (error) {
        console.error('Error getting elevation profile:', error);
      }
    },
    
    calculateSlope() {
      if (!this.terrainData.elevationProfile || this.terrainData.elevationProfile.length < 2) return;
      
      let maxSlope = 0;
      let totalDistance = 0;
      let totalElevationChange = 0;
      
      for (let i = 1; i < this.terrainData.elevationProfile.length; i++) {
        const p1 = this.terrainData.elevationProfile[i - 1];
        const p2 = this.terrainData.elevationProfile[i];
        
        // Calculate distance between points
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(p1.location.lat, p1.location.lng),
          new google.maps.LatLng(p2.location.lat, p2.location.lng)
        );
        
        // Calculate elevation change
        const elevationChange = Math.abs(p2.elevation - p1.elevation);
        
        // Calculate slope percentage
        if (distance > 0) {
          const slope = (elevationChange / distance) * 100;
          maxSlope = Math.max(maxSlope, slope);
        }
        
        totalDistance += distance;
        totalElevationChange += elevationChange;
      }
      
      // Average slope
      this.terrainData.slope = totalDistance > 0 ? 
        ((totalElevationChange / totalDistance) * 100).toFixed(2) : 0;
      
      // Add slope restriction if too steep
      if (maxSlope > 15) {
        this.terrainData.restrictions.push({
          type: 'steep_slope',
          severity: 'medium',
          message: `Pendiente máxima de ${maxSlope.toFixed(1)}% detectada`,
          value: maxSlope
        });
      }
    },
    
    async analyzeLandUse() {
      if (!this.placesService || !this.terrainData.coordinates.length) return;
      
      const center = this.calculateCenter(this.terrainData.coordinates);
      
      // Search for nearby places to determine land use context
      const request = {
        location: new google.maps.LatLng(center.lat, center.lng),
        radius: 500,
        types: ['establishment']
      };
      
      try {
        const response = await new Promise((resolve, reject) => {
          this.placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              reject(new Error(`Places service failed: ${status}`));
            }
          });
        });
        
        // Analyze place types to infer land use
        const placeTypes = response.flatMap(place => place.types);
        const typeCount = {};
        
        placeTypes.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        // Determine predominant land use
        if (typeCount['school'] > 2 || typeCount['university'] > 0) {
          this.terrainData.landUse = 'educational';
        } else if (typeCount['shopping_mall'] > 0 || typeCount['store'] > 5) {
          this.terrainData.landUse = 'commercial';
        } else if (typeCount['park'] > 2 || typeCount['natural_feature'] > 1) {
          this.terrainData.landUse = 'recreational';
        } else if (typeCount['hospital'] > 0 || typeCount['health'] > 3) {
          this.terrainData.landUse = 'healthcare';
        } else {
          this.terrainData.landUse = 'mixed';
        }
        
      } catch (error) {
        console.error('Error analyzing land use:', error);
        this.terrainData.landUse = 'unknown';
      }
    },
    
    showImportDialog() {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.geojson,.json,.dxf,.kml';
      
      input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
          this.importFile(file);
        }
      });
      
      input.click();
    },
    
    async importFile(file) {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const extension = file.name.split('.').pop().toLowerCase();
          
          let terrainData;
          
          switch (extension) {
            case 'geojson':
            case 'json':
              terrainData = await this.parseGeoJSON(content);
              break;
            case 'dxf':
              terrainData = await this.parseDXF(content);
              break;
            case 'kml':
              terrainData = await this.parseKML(content);
              break;
            default:
              throw new Error('Formato de archivo no soportado');
          }
          
          if (terrainData && terrainData.length > 0) {
            this.createPolygonFromImport(terrainData);
          }
          
        } catch (error) {
          console.error('Error importing file:', error);
          alert(`Error al importar archivo: ${error.message}`);
        }
      };
      
      reader.readAsText(file);
    },
    
    async parseGeoJSON(content) {
      const geojson = JSON.parse(content);
      const coordinates = [];
      
      if (geojson.type === 'Feature' && geojson.geometry) {
        if (geojson.geometry.type === 'Polygon') {
          geojson.geometry.coordinates[0].forEach(coord => {
            coordinates.push({ lat: coord[1], lng: coord[0] });
          });
        } else if (geojson.geometry.type === 'MultiPolygon') {
          // Use first polygon
          geojson.geometry.coordinates[0][0].forEach(coord => {
            coordinates.push({ lat: coord[1], lng: coord[0] });
          });
        }
      } else if (geojson.type === 'FeatureCollection' && geojson.features.length > 0) {
        // Use first feature
        const feature = geojson.features[0];
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach(coord => {
            coordinates.push({ lat: coord[1], lng: coord[0] });
          });
        }
      }
      
      return coordinates;
    },
    
    async parseDXF(content) {
      // Simple DXF parser for POLYLINE entities
      const coordinates = [];
      const lines = content.split('\n');
      
      let inPolyline = false;
      let currentVertex = {};
      
      for (let i = 0; i < lines.length; i++) {
        const code = lines[i].trim();
        const value = lines[i + 1] ? lines[i + 1].trim() : '';
        
        if (code === '0' && value === 'POLYLINE') {
          inPolyline = true;
        } else if (code === '0' && value === 'SEQEND') {
          inPolyline = false;
        } else if (inPolyline) {
          if (code === '10') {
            currentVertex.x = parseFloat(value);
          } else if (code === '20') {
            currentVertex.y = parseFloat(value);
            
            // Convert from CAD coordinates to lat/lng (simplified)
            // This would need proper projection transformation in production
            const lat = 19.4326 + (currentVertex.y / 111000);
            const lng = -99.1332 + (currentVertex.x / 111000);
            
            coordinates.push({ lat, lng });
            currentVertex = {};
          }
        }
        
        i++; // Skip value line
      }
      
      return coordinates;
    },
    
    async parseKML(content) {
      // Simple KML parser
      const parser = new DOMParser();
      const kml = parser.parseFromString(content, 'text/xml');
      const coordinates = [];
      
      // Find coordinates
      const coordElements = kml.getElementsByTagName('coordinates');
      
      if (coordElements.length > 0) {
        const coordText = coordElements[0].textContent.trim();
        const coordPairs = coordText.split(/\s+/);
        
        coordPairs.forEach(pair => {
          const [lng, lat] = pair.split(',').map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates.push({ lat, lng });
          }
        });
      }
      
      return coordinates;
    },
    
    createPolygonFromImport(coordinates) {
      if (coordinates.length < 3) {
        alert('El archivo debe contener al menos 3 coordenadas');
        return;
      }
      
      // Clear existing polygon
      if (this.selectedPolygon) {
        this.selectedPolygon.setMap(null);
      }
      
      // Create new polygon
      const polygon = new google.maps.Polygon({
        paths: coordinates,
        fillColor: '#334b4e',
        fillOpacity: 0.4,
        strokeColor: '#243b44',
        strokeWeight: 3,
        editable: true,
        draggable: false
      });
      
      polygon.setMap(this.map);
      
      // Handle as completed polygon
      this.handlePolygonComplete(polygon);
      
      console.log('✅ Terrain imported from file');
    },
    
    toggleMeasureTool() {
      if (!window.google.maps.drawing) {
        alert('La librería de dibujo de Google Maps no está disponible.');
        return;
      }

      // Estado de medición
      if (!this.measureMode) {
        this.measureMode = true;
        this.previousDrawingMode = this.drawingManager.getDrawingMode();
        this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);

        const measurePolylineListener = google.maps.event.addListener(this.drawingManager, 'polylinecomplete', (polyline) => {
          // Calcular longitud
          const path = polyline.getPath();
          let length = 0;
          for (let i = 0; i < path.getLength() - 1; i++) {
            length += google.maps.geometry.spherical.computeDistanceBetween(path.getAt(i), path.getAt(i + 1));
          }

          alert(`Distancia medida: ${length.toFixed(2)} metros`);

          // Salir del modo de medición
          this.drawingManager.setDrawingMode(null);
          this.measureMode = false;
          google.maps.event.removeListener(measurePolylineListener);
          polyline.setOptions({ strokeColor: '#ff0000' });
        });
      } else {
        // Cancelar medición
        this.measureMode = false;
        this.drawingManager.setDrawingMode(this.previousDrawingMode || null);
      }
    },
    
    analyzeElevation() {
      if (!this.terrainData.elevationProfile || this.terrainData.elevationProfile.length === 0) {
        alert('No hay datos de elevación disponibles. Dibuja un terreno primero.');
        return;
      }
      
      // Create elevation chart
      this.showElevationChart();
    },
    
    showElevationChart() {
      // Create modal for elevation chart
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 2000;
        max-width: 600px;
        width: 90%;
      `;
      
      modal.innerHTML = `
        <h3>Análisis de Elevación</h3>
        <canvas id="elevation-chart" width="500" height="300"></canvas>
        <div style="margin-top: 15px;">
          <p><strong>Elevación promedio:</strong> ${this.terrainData.elevation} msnm</p>
          <p><strong>Pendiente promedio:</strong> ${this.terrainData.slope}%</p>
          <p><strong>Puntos analizados:</strong> ${this.terrainData.elevationProfile.length}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 15px;
          padding: 8px 16px;
          background: #334b4e;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Cerrar</button>
      `;
      
      document.body.appendChild(modal);
      
      // Draw elevation chart
      if (window.Chart) {
        const ctx = document.getElementById('elevation-chart').getContext('2d');
        
        const labels = this.terrainData.elevationProfile.map((_, i) => `${i}`);
        const data = this.terrainData.elevationProfile.map(p => p.elevation);
        
        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Elevación (m)',
              data,
              borderColor: '#334b4e',
              backgroundColor: 'rgba(51, 75, 78, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Perfil de Elevación del Terreno'
              }
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Elevación (msnm)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Puntos del perímetro'
                }
              }
            }
          }
        });
      }
    },
    
    clearTerrain() {
      if (this.selectedPolygon) {
        this.selectedPolygon.setMap(null);
        this.selectedPolygon = null;
        
        // Reset data
        this.terrainData = {
          coordinates: [],
          area: 0,
          perimeter: 0,
          elevation: 0,
          elevationProfile: [],
          slope: 0,
          landUse: null,
          restrictions: []
        };
        
        this.updateTerrainInfo();
        console.log('🗑️ Terrain cleared');
      }
    },
    
    updateTerrainInfo() {
      // Update UI elements with terrain information
      const areaElement = document.getElementById('terrain-area');
      const perimeterElement = document.getElementById('terrain-perimeter');
      const elevationElement = document.querySelector('[data-terrain="elevation"]');
      const landUseElement = document.querySelector('[data-terrain="landuse"]');
      
      if (areaElement) {
        const areaInM2 = Math.round(this.terrainData.area);
        areaElement.textContent = `${areaInM2.toLocaleString()} m²`;
      }
      
      if (perimeterElement) {
        const perimeterInM = Math.round(this.terrainData.perimeter);
        perimeterElement.textContent = `${perimeterInM.toLocaleString()} m`;
      }
      
      if (elevationElement) {
        elevationElement.textContent = `${this.terrainData.elevation} msnm`;
      }
      
      if (landUseElement) {
        const landUseLabels = {
          residential: 'Residencial',
          commercial: 'Comercial',
          industrial: 'Industrial',
          educational: 'Educativo',
          healthcare: 'Salud',
          recreational: 'Recreativo',
          mixed: 'Mixto',
          unknown: 'Por determinar'
        };
        landUseElement.textContent = landUseLabels[this.terrainData.landUse] || 'Por determinar';
      }
      
      // Update restrictions indicator
      if (this.terrainData.restrictions.length > 0) {
        const restrictionsBadge = document.querySelector('[data-terrain="restrictions"]');
        if (restrictionsBadge) {
          restrictionsBadge.textContent = `${this.terrainData.restrictions.length} restricciones`;
          restrictionsBadge.style.color = '#f44336';
        }
      }
      
      // Emit custom event for main app
      window.dispatchEvent(new CustomEvent('terrainUpdated', {
        detail: this.terrainData
      }));
    },
    
    calculateCenter(coordinates) {
      let sumLat = 0, sumLng = 0;
      coordinates.forEach(coord => {
        sumLat += coord.lat;
        sumLng += coord.lng;
      });
      return {
        lat: sumLat / coordinates.length,
        lng: sumLng / coordinates.length
      };
    },
    
    approximateArea(path) {
      // Simple approximation when geometry library is not available
      let area = 0;
      const points = [];
      path.forEach(latLng => points.push([latLng.lat(), latLng.lng()]));
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i][0] * points[j][1];
        area -= points[j][0] * points[i][1];
      }
      return Math.abs(area * 111319.5 * 111319.5 / 2); // Approximation in m²
    },
    
    approximatePerimeter(path) {
      // Simple perimeter approximation
      let perimeter = 0;
      const points = [];
      path.forEach(latLng => points.push([latLng.lat(), latLng.lng()]));
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const dx = (points[j][1] - points[i][1]) * 111319.5;
        const dy = (points[j][0] - points[i][0]) * 111319.5;
        perimeter += Math.sqrt(dx * dx + dy * dy);
      }
      return perimeter;
    },
    
    showMapError(message) {
      const mapElement = document.getElementById('terrain-map');
      if (mapElement) {
        mapElement.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #f8f9fa;
            color: #dc3545;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
          ">
            ❌ ${message}
            <br><small style="color: #6c757d; font-weight: normal; margin-top: 10px;">
              Verifica tu conexión y configuración de Google Maps
            </small>
          </div>
        `;
      }
    },
    
    exportGeoJSON() {
      if (!this.terrainData.coordinates.length) {
        alert('No hay terreno dibujado para exportar');
        return;
      }
      
      const geoJSON = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [this.terrainData.coordinates.map(coord => [coord.lng, coord.lat])]
        },
        properties: {
          area: this.terrainData.area,
          perimeter: this.terrainData.perimeter,
          elevation: this.terrainData.elevation,
          slope: this.terrainData.slope,
          landUse: this.terrainData.landUse,
          restrictions: this.terrainData.restrictions,
          created: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `terrain-${Date.now()}.geojson`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('📁 Terrain exported as GeoJSON');
    },
    
    getTerrainData() {
      return this.terrainData;
    },
    
    addSearchBox() {
      // Create container div for control (keeps padding)
      const card = document.createElement('div');
      card.style.margin = '10px';
      card.style.padding = '4px';
      card.style.background = 'white';
      card.style.borderRadius = '4px';
      card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

      const apiSupportsElement = (google.maps.places && google.maps.places.PlaceAutocompleteElement);

      if (apiSupportsElement) {
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        placeAutocomplete.setAttribute('placeholder', 'Buscar dirección…');
        placeAutocomplete.style.width = '300px';

        const handleSelect = async (event) => {
          let place = null;
          if (event.placePrediction) {
            try {
              place = event.placePrediction.toPlace();
              await place.fetchFields({ fields: ['location', 'viewport'] });
            } catch (e) { console.warn(e); }
          } else if (event.place) {
            place = event.place;
          }
          if (place && place.location) {
            const loc = place.location;
            this.map.panTo(loc);
            this.map.setZoom(18);
          } else if (place && place.geometry && place.geometry.location) {
            this.map.panTo(place.geometry.location);
            this.map.setZoom(18);
          }
        };

        placeAutocomplete.addEventListener('gmp-select', handleSelect);
        placeAutocomplete.addEventListener('gmp-placeselect', handleSelect);

        card.appendChild(placeAutocomplete);
      } else {
        // Legacy fallback input
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Buscar dirección…';
        input.style.width = '260px';
        input.style.padding = '6px 8px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';

        card.appendChild(input);

        const autocomplete = new google.maps.places.Autocomplete(input, {
          fields: ['geometry', 'name'],
          types: ['geocode']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            this.map.panTo(place.geometry.location);
            this.map.setZoom(18);
          }
        });
      }

      // Attach to map controls
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
    }
  };
};
