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
  DASHBOARD = 'dashboard',
}

// Datos del proyecto
type ProjectData = Partial<ProjectSummary> & {
  terrain?: unknown;
  costs?: unknown;
  visualization?: unknown;
};

function App() {
  // Estado de la aplicación - Start with dashboard to prevent UI flashing
  const [currentStage, setCurrentStage] = useState<AppStage>(AppStage.DASHBOARD);
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar proyectos guardados al iniciar
  useEffect(() => {
    const loadProjects = async () => {
      try {
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
            updatedAt: now,
          },
          {
            id: 2,
            name: 'Proyecto Comercial',
            profileType: 'company',
            projectType: 'commercial',
            createdAt: now,
            updatedAt: new Date(now.getTime() - 86400000),
          },
        ];

        setProjects(savedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Manejar completado del wizard
  const handleWizardComplete = (wizardData: { profile: string; projectType: string }) => {
    setProjectData({
      ...projectData,
      profileType: wizardData.profile,
      projectType: wizardData.projectType,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: `Nuevo Proyecto (${new Date().toLocaleDateString()})`,
    });

    setCurrentStage(AppStage.TERRAIN);
  };

  // Manejar completado del módulo de terreno
  const handleTerrainComplete = (terrainData: any) => {
    setProjectData({
      ...projectData,
      terrain: terrainData,
      updatedAt: new Date(),
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
      profileType: projectData.profileType || 'unknown',
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
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        </div>
      );
    }

    switch (currentStage) {
      case AppStage.WIZARD:
        return (
          <Wizard
            onComplete={handleWizardComplete}
            initialData={{
              profile: projectData.profileType,
              projectType: projectData.projectType,
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
              const proj = projects.find((p) => p.id === id);
              if (proj) handleProjectSelect(proj);
            }}
            onNewProject={handleNewProject}
            onDeleteProject={() => {}}
            onExportProject={() => {}}
            onImportProject={() => {}}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-primary-800 to-primary-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="hidden sm:inline">Beyond&nbsp;</span>
            <span>Calculator&nbsp;v2</span>
          </h1>

          <div className="flex items-center gap-4">
            {/* Placeholder for future language selector */}
            <button
              onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Cambiar tema claro/oscuro"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {renderCurrentStage()}
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-auto py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-300 text-sm">
          &copy; {new Date().getFullYear()} Beyond Solutions. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

export default App;
