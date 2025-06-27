import React, { useState } from 'react';

export interface ProjectSummary {
  id: number;
  name: string;
  profileType: string;
  projectType: string;
  budgetTotal?: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}

export interface DashboardProps {
  projects: ProjectSummary[];
  onNewProject: () => void;
  onSelectProject: (id: number) => void;
  onDeleteProject: (id: number) => void;
  onExportProject: (id: number) => void;
  onImportProject: () => void;
  isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onNewProject,
  onSelectProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  // Filtrar proyectos por término de búsqueda
  const filteredProjects = searchTerm
    ? projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.projectType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;
  
  // Ordenar por fecha de actualización (más reciente primero)
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Formatear presupuesto
  const formatBudget = (budget?: number) => {
    if (!budget) return '—';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(budget);
  };
  
  // Manejar confirmación de eliminación
  const handleConfirmDelete = (id: number) => {
    if (confirmDelete === id) {
      onDeleteProject(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Resetear el estado de confirmación después de 5 segundos
      setTimeout(() => setConfirmDelete(null), 5000);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-accent-50">
          Mis proyectos
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proyectos..."
              className="form-input pl-9 pr-3 py-2 rounded-md w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-md bg-primary-800 text-white font-medium hover:bg-primary-900 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800"
            aria-label="Crear nuevo proyecto"
          >
            <span className="flex items-center gap-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              Nuevo proyecto
            </span>
          </button>
          
          <button
            onClick={onImportProject}
            className="px-4 py-2 rounded-md bg-accent-50 dark:bg-primary-700 text-primary-900 dark:text-accent-50 font-medium hover:bg-accent-100 dark:hover:bg-primary-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800"
            aria-label="Importar proyecto"
          >
            <span className="flex items-center gap-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-5 h-5"
              >
                <path 
                  fillRule="evenodd" 
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
              Importar
            </span>
          </button>
        </div>
      </div>
      
      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        </div>
      )}
      
      {/* Lista vacía */}
      {!isLoading && projects.length === 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No hay proyectos guardados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crea un nuevo proyecto para comenzar a trabajar
          </p>
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-md bg-primary-800 text-white font-medium hover:bg-primary-900 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800"
          >
            Crear nuevo proyecto
          </button>
        </div>
      )}
      
      {/* Lista de proyectos */}
      {!isLoading && filteredProjects.length > 0 && (
        <div className="overflow-hidden bg-white dark:bg-zinc-800 shadow-lg rounded-lg">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProjects.map((project) => (
              <li 
                key={project.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div 
                    className="flex-grow flex flex-col sm:flex-row gap-4 cursor-pointer" 
                    onClick={() => onSelectProject(project.id)}
                  >
                    {/* Miniatura o icono */}
                    <div className="w-full sm:w-16 h-16 bg-accent-50 dark:bg-primary-800 rounded flex items-center justify-center text-primary-800 dark:text-accent-50">
                      {project.thumbnail ? (
                        <img 
                          src={project.thumbnail} 
                          alt={project.name} 
                          className="w-full h-full object-cover rounded" 
                        />
                      ) : (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-8 h-8"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                    </div>
                    
                    {/* Información del proyecto */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Tipo:</span>{' '}
                          {project.projectType}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Presupuesto:</span>{' '}
                          {formatBudget(project.budgetTotal)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Actualizado:</span>{' '}
                          {formatDate(project.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex flex-row sm:flex-col gap-2 justify-end">
                    <button
                      onClick={() => onExportProject(project.id)}
                      className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800"
                      aria-label="Exportar proyecto"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-5 h-5"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(project.id)}
                      className={`p-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        confirmDelete === project.id
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 focus:ring-red-500'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 focus:ring-primary-800'
                      }`}
                      aria-label={
                        confirmDelete === project.id
                          ? "Confirmar eliminación de proyecto"
                          : "Eliminar proyecto"
                      }
                    >
                      {confirmDelete === project.id ? (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-5 h-5"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      ) : (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-5 h-5"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No se encontraron resultados de búsqueda */}
      {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <svg 
            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Prueba con otro término de búsqueda
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 rounded-md bg-accent-50 dark:bg-primary-700 text-primary-900 dark:text-accent-50 font-medium hover:bg-accent-100 dark:hover:bg-primary-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800"
          >
            Mostrar todos los proyectos
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 