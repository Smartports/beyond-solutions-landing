import React, { useState, useEffect } from 'react';
import Wizard from './Wizard';
import { TerrainModule } from './TerrainModule';
import { Dashboard, ProjectSummary } from '@beyond/ui';

// Enumeración de las etapas de la aplicación
enum AppStage {
  WIZARD = 'wizard',
  TERRAIN = 'terrain',
  COSTS = 'costs',
  VISUALIZATION = 'visualization',
  DASHBOARD = 'dashboard'
}

// Datos del proyecto
type ProjectData = Partial<ProjectSummary> & {
  terrain?: unknown;
  costs?: unknown;
  visualization?: unknown;
};

function App() {
  // Estado de la aplicación
  const [currentStage, setCurrentStage] = useState<AppStage>(AppStage.WIZARD);
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [projects, setProjects] = useState<ProjectData[]>([]);

  // Cargar proyectos guardados al iniciar
  useEffect(() => {
    // En una implementación real, aquí cargaríamos los proyectos desde IndexedDB
    // Por ahora, usamos datos de ejemplo
    const now = new Date();
    const savedProjects: ProjectData[] = [
      {
        id: 1,
        name: 'Proyecto Residencial',
        profileType: 'individual',
        projectType: 'residential',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Proyecto Comercial',
        profileType: 'company',
        projectType: 'commercial',
        createdAt: now,
        updatedAt: new Date(now.getTime() - 86400000)
      }
    ];
    
    setProjects(savedProjects);
  }, []);

  // Manejar completado del wizard
  const handleWizardComplete = (wizardData: { profile: string; projectType: string }) => {
    setProjectData({
      ...projectData,
      profileType: wizardData.profile,
      projectType: wizardData.projectType,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: `Nuevo Proyecto (${new Date().toLocaleDateString()})`
    });
    
    setCurrentStage(AppStage.TERRAIN);
  };

  // Manejar completado del módulo de terreno
  const handleTerrainComplete = (terrainData: any) => {
    setProjectData({
      ...projectData,
      terrain: terrainData,
      updatedAt: new Date()
    });
    
    // En una implementación completa, aquí guardaríamos los datos en IndexedDB
    // y avanzaríamos a la siguiente etapa (costos)
    
    // Por ahora, volvemos al dashboard
    setCurrentStage(AppStage.DASHBOARD);
    
    // Agregar el proyecto a la lista
    const newProject: ProjectData = {
      ...projectData,
      terrain: terrainData,
      id: Date.now(),
      updatedAt: new Date(),
      createdAt: projectData.createdAt || new Date(),
      profileType: projectData.profileType || 'unknown'
    };
    
    setProjects([...projects, newProject]);
  };

  // Manejar selección de proyecto en el dashboard
  const handleProjectSelect = (project: ProjectData) => {
    setProjectData(project);
    
    // Determinar a qué etapa ir según los datos del proyecto
    if (project.visualization) {
      setCurrentStage(AppStage.VISUALIZATION);
    } else if (project.costs) {
      setCurrentStage(AppStage.COSTS);
    } else if (project.terrain) {
      setCurrentStage(AppStage.TERRAIN);
    } else {
      setCurrentStage(AppStage.WIZARD);
    }
  };

  // Manejar creación de nuevo proyecto
  const handleNewProject = () => {
    setProjectData({});
    setCurrentStage(AppStage.WIZARD);
  };

  // Renderizar la etapa actual
  const renderCurrentStage = () => {
    switch (currentStage) {
      case AppStage.WIZARD:
        return (
          <Wizard 
            onComplete={handleWizardComplete}
            initialData={{
              profile: projectData.profileType,
              projectType: projectData.projectType
            }}
          />
        );
        
      case AppStage.TERRAIN:
        return (
          <TerrainModule
            onComplete={handleTerrainComplete}
            onBack={() => setCurrentStage(AppStage.WIZARD)}
          />
        );
        
      case AppStage.DASHBOARD:
      default:
        return (
          <Dashboard
            projects={projects as unknown as ProjectSummary[]}
            onSelectProject={(id) => {
              const proj = projects.find(p => p.id === id);
              if (proj) handleProjectSelect(proj);
            }}
            onNewProject={handleNewProject}
            onDeleteProject={() => {}}
            onExportProject={() => {}}
            onImportProject={() => {}}
          />
        );
    }
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary-900 dark:text-accent-50">
            Calculadora Inmobiliaria v2
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStage()}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Beyond Solutions. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default App; 