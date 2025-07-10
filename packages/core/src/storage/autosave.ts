import { Project, saveProject, updateProject } from './db';

// Tipo para la función de callback
type SaveCallback = (success: boolean, error?: Error) => void;

// Estado para debounce
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 1000; // 1 segundo de espera entre guardados

/**
 * Guarda automáticamente un proyecto con debounce para no saturar IndexedDB
 * @param project Proyecto a guardar
 * @param callback Función de callback opcional para notificar resultado
 */
export function autoSave(project: Project, callback?: SaveCallback): void {
  // Si hay un timeout pendiente, cancelarlo
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Crear nuevo timeout
  saveTimeout = setTimeout(async () => {
    try {
      // Determinar si es un proyecto nuevo o existente
      if (project.id) {
        await updateProject(project);
      } else {
        // Para proyectos nuevos, asegurarse de tener un nombre por defecto si no lo tiene
        if (!project.name) {
          project.name = `Proyecto ${new Date().toLocaleDateString()}`;
        }
        await saveProject(project);
      }

      // Llamar al callback con éxito
      if (callback) {
        callback(true);
      }

      // Disparar evento para notificar guardado exitoso
      window.dispatchEvent(
        new CustomEvent('project:saved', {
          detail: { project },
        }),
      );
    } catch (error) {
      console.error('Error al guardar automáticamente:', error);

      // Llamar al callback con error
      if (callback) {
        callback(false, error as Error);
      }

      // Disparar evento para notificar error
      window.dispatchEvent(
        new CustomEvent('project:save:error', {
          detail: { project, error },
        }),
      );
    }
  }, DEBOUNCE_DELAY);
}

/**
 * Forzar guardado inmediato sin debounce
 * @param project Proyecto a guardar
 * @returns Promesa con el ID del proyecto guardado
 */
export async function forceSave(project: Project): Promise<number> {
  // Si hay un timeout pendiente, cancelarlo
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  try {
    // Actualizar fechas
    project.updatedAt = new Date();
    project.lastAccessed = new Date();

    // Guardar según si es nuevo o existente
    if (project.id) {
      return await updateProject(project);
    } else {
      // Para proyectos nuevos, asegurarse de tener un nombre por defecto si no lo tiene
      if (!project.name) {
        project.name = `Proyecto ${new Date().toLocaleDateString()}`;
      }

      // Asegurarse de tener fecha de creación
      project.createdAt = new Date();

      return await saveProject(project);
    }
  } catch (error) {
    console.error('Error al guardar forzadamente:', error);
    throw error;
  }
}
