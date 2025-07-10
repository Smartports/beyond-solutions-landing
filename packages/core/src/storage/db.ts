import Dexie, { Table } from 'dexie';

// Define tipos de datos
export interface UserProfile {
  id?: number;
  type: string; // 'developer' | 'owner' | 'investor' | 'architect'
  entity?: string; // 'b2b' | 'b2c'
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id?: number;
  name: string;
  profileId: number;
  projectType: string; // 'residential' | 'commercial' | 'mixed' | 'industrial'
  budgetTotal?: number;
  land?: {
    address?: string;
    type?: string;
    status?: string;
    surface?: number;
    usableSurface?: number;
    use?: string;
    characteristics?: string;
  };
  costs?: {
    materialesLevel?: string;
    materials?: { percent: number };
    design?: { percent: number };
    permits?: { percent: number };
    construction?: { percent: number };
    management?: { percent: number };
    marketing?: { percent: number };
  };
  results?: {
    totalCost: number;
    totalSell: number;
    profit: number;
    m2Cost: number;
    m2Sell: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
}

// Configuración de base de datos con Dexie
class BeyondCalculatorDB extends Dexie {
  profiles!: Table<UserProfile>;
  projects!: Table<Project>;

  constructor() {
    super('BeyondCalculatorDB');

    // Definir esquema y versión
    this.version(1).stores({
      profiles: '++id, type, createdAt, updatedAt',
      projects: '++id, name, profileId, projectType, createdAt, updatedAt, lastAccessed',
    });
  }
}

// Crear instancia singleton de la base de datos
export const db = new BeyondCalculatorDB();

// Funciones auxiliares para operaciones comunes
export async function saveProfile(profile: UserProfile): Promise<number> {
  const id = (await db.profiles.add(profile)) as number;
  return Number(id);
}

export async function getProfile(id: number): Promise<UserProfile | undefined> {
  return await db.profiles.get(id);
}

export async function getProfiles(): Promise<UserProfile[]> {
  return await db.profiles.toArray();
}

export async function saveProject(project: Project): Promise<number> {
  project.updatedAt = new Date();
  project.lastAccessed = new Date();
  const id = (await db.projects.add(project)) as number;
  return Number(id);
}

export async function updateProject(project: Project): Promise<number> {
  if (!project.id) throw new Error('Project ID is required for updates');
  project.updatedAt = new Date();
  project.lastAccessed = new Date();
  return await db.projects.update(project.id, project);
}

export async function getProject(id: number): Promise<Project | undefined> {
  const project = await db.projects.get(id);
  if (project) {
    // Actualizar fecha de último acceso
    await db.projects.update(id, { lastAccessed: new Date() });
  }
  return project;
}

export async function getProjects(): Promise<Project[]> {
  return await db.projects.toArray();
}

export async function deleteProject(id: number): Promise<void> {
  await db.projects.delete(id);
}

export async function exportProject(id: number): Promise<string> {
  const project = await getProject(id);
  if (!project) throw new Error('Project not found');
  return JSON.stringify(project);
}

export async function importProject(jsonString: string): Promise<number> {
  try {
    const projectData = JSON.parse(jsonString);
    // Eliminar ID si existe para crear nuevo proyecto
    delete projectData.id;
    // Actualizar fechas
    projectData.createdAt = new Date();
    projectData.updatedAt = new Date();
    projectData.lastAccessed = new Date();

    const id = (await db.projects.add(projectData)) as number;
    return Number(id);
  } catch (error) {
    throw new Error('Invalid project data format');
  }
}
