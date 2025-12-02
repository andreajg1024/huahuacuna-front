import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectsService } from '@/services/projects.service';
import { CreateProjectDTO, UpdateProjectDTO, ProjectType, ProjectStatus as BackendProjectStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const projectsService = new ProjectsService();

export type ProjectStatus = 'borrador' | 'activo' | 'finalizado' | 'archivado';

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  mainGoal: string;
  specificObjectives: string[];
  beneficiaries: {
    count: number;
    description: string;
  };
  expectedImpact?: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  isPublished: boolean;
  mainImage: string;
  gallery: { url: string; caption?: string }[];
  videoUrl?: string;
  needsVolunteers: boolean;
  volunteersNeeded?: number;
  volunteersRegistered: number;
  requiredSkills: string[];
  volunteerProfile?: string;
  requiredAvailability: string[];
  timeCommitment?: string;
  estimatedHours?: string;
  location: string[];
  partners?: string;
  budget?: number;
  showBudget?: boolean;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Volunteer {
  id: string;
  projectId: string;
  projectTitle: string;
  fullName: string;
  email: string;
  phone: string;
  documentId?: string;
  birthDate?: string;
  age?: number;
  city?: string;
  skills: string[];
  previousExperience?: string;
  motivation: string;
  availability: string[];
  timeCommitment: string;
  hoursPerWeek?: number;
  preferredStartDate?: string;
  howDidYouHear?: string;
  additionalComments?: string;
  acceptedTerms: boolean;
  newsletterOptIn: boolean;
  status: 'pendiente' | 'contactado' | 'activo' | 'inactivo';
  registrationDate: string;
  notes?: string;
}

interface ProjectsContextType {
  projects: Project[];
  volunteers: Volunteer[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'volunteersRegistered' | 'slug'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectBySlug: (slug: string) => Project | undefined;
  getPublishedProjects: () => Project[];
  getProjectsByStatus: (status: ProjectStatus) => Project[];
  registerVolunteer: (volunteer: Omit<Volunteer, 'id' | 'registrationDate' | 'status'>) => void;
  updateVolunteer: (id: string, volunteer: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;
  getVolunteersByProject: (projectId: string) => Volunteer[];
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// ============================================================================
// MAPPERS: Frontend Project <-> Backend CreateProjectDTO
// ============================================================================

/**
 * Convierte Project (frontend) a CreateProjectDTO (backend)
 */
const mapProjectToCreateDTO = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'volunteersRegistered' | 'slug'>): CreateProjectDTO => {
  // Determinar el tipo de proyecto basado en tags o categoría
  let projectType: ProjectType = ProjectType.OTHER;
  if (project.tags.includes('educación') || project.tags.includes('educacion')) {
    projectType = ProjectType.EDUCATION;
  } else if (project.tags.includes('salud')) {
    projectType = ProjectType.HEALTH;
  } else if (project.tags.includes('nutrición') || project.tags.includes('nutricion')) {
    projectType = ProjectType.NUTRITION;
  } else if (project.tags.includes('recreación') || project.tags.includes('recreacion')) {
    projectType = ProjectType.RECREATION;
  } else if (project.tags.includes('infraestructura')) {
    projectType = ProjectType.INFRASTRUCTURE;
  }

  // Mapear status de español a inglés
  const statusMap: Record<ProjectStatus, BackendProjectStatus> = {
    'borrador': 'DRAFT',
    'activo': 'ACTIVE',
    'finalizado': 'COMPLETED',
    'archivado': 'ARCHIVED'
  };

  return {
    name: project.title,
    description: `${project.shortDescription}\n\n${project.fullDescription}`,
    type: projectType,
    status: statusMap[project.status],
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget,
    location: project.location.join(', '),
    objectives: [project.mainGoal, ...project.specificObjectives],
    childrenIds: [],
    metadata: {
      // Guardar campos adicionales del frontend en metadata
      isPublished: project.isPublished,
      mainImage: project.mainImage,
      gallery: project.gallery,
      videoUrl: project.videoUrl,
      needsVolunteers: project.needsVolunteers,
      volunteersNeeded: project.volunteersNeeded,
      requiredSkills: project.requiredSkills,
      volunteerProfile: project.volunteerProfile,
      requiredAvailability: project.requiredAvailability,
      timeCommitment: project.timeCommitment,
      estimatedHours: project.estimatedHours,
      partners: project.partners,
      showBudget: project.showBudget,
      contactPerson: project.contactPerson,
      tags: project.tags,
      beneficiaries: project.beneficiaries,
      expectedImpact: project.expectedImpact,
    }
  };
};

/**
 * Convierte ProjectResponse (backend) a Project (frontend)
 */
const mapProjectResponseToProject = (response: any): Project => {
  const metadata = response.metadata || {};
  
  // Mapear status de inglés a español
  const statusMap: Record<string, ProjectStatus> = {
    'DRAFT': 'borrador',
    'ACTIVE': 'activo',
    'COMPLETED': 'finalizado',
    'ARCHIVED': 'archivado'
  };

  return {
    id: response.id.toString(),
    title: response.name,
    slug: createSlug(response.name),
    shortDescription: response.description.split('\n\n')[0] || response.description.substring(0, 200),
    fullDescription: response.description.split('\n\n')[1] || response.description,
    mainGoal: response.objectives?.[0] || '',
    specificObjectives: response.objectives?.slice(1) || [],
    beneficiaries: metadata.beneficiaries || { count: 0, description: '' },
    expectedImpact: metadata.expectedImpact,
    startDate: response.startDate || '',
    endDate: response.endDate || '',
    status: statusMap[response.status] || 'borrador',
    isPublished: metadata.isPublished || false,
    mainImage: metadata.mainImage || '',
    gallery: metadata.gallery || [],
    videoUrl: metadata.videoUrl,
    needsVolunteers: metadata.needsVolunteers || false,
    volunteersNeeded: metadata.volunteersNeeded,
    volunteersRegistered: response.childrenCount || 0,
    requiredSkills: metadata.requiredSkills || [],
    volunteerProfile: metadata.volunteerProfile,
    requiredAvailability: metadata.requiredAvailability || [],
    timeCommitment: metadata.timeCommitment,
    estimatedHours: metadata.estimatedHours,
    location: response.location ? response.location.split(', ') : [],
    partners: metadata.partners,
    budget: response.budget,
    showBudget: metadata.showBudget,
    contactPerson: metadata.contactPerson || { name: '', email: '', phone: '' },
    tags: metadata.tags || [],
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    createdBy: response.createdByName || response.createdBy?.toString() || ''
  };
};

// Mock initial projects
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Escuela de Música para Niños',
    slug: 'escuela-de-musica-para-ninos',
    shortDescription: 'Programa de educación musical para niños de 8 a 14 años, desarrollando habilidades artísticas y valores.',
    fullDescription: '<p>Nuestro programa de educación musical ofrece a los niños la oportunidad de aprender instrumentos, teoría musical y participar en presentaciones. El proyecto busca desarrollar no solo habilidades artísticas, sino también valores como la disciplina, el trabajo en equipo y la autoestima.</p><p>Los niños recibirán clases grupales e individuales, con instrumentos proporcionados por la fundación. Al finalizar el programa, realizaremos un concierto público donde los niños mostrarán lo aprendido.</p>',
    mainGoal: 'Proporcionar educación musical de calidad a niños en situación de vulnerabilidad, fomentando su desarrollo integral.',
    specificObjectives: [
      'Enseñar fundamentos de música a 50 niños',
      'Formar una orquesta infantil',
      'Realizar 2 presentaciones públicas al año',
      'Desarrollar habilidades sociales a través de la música'
    ],
    beneficiaries: {
      count: 50,
      description: 'Niños entre 8 y 14 años de familias de bajos recursos en Armenia, Quindío'
    },
    expectedImpact: 'Mejorar la autoestima y habilidades sociales de los niños, ofreciendo una alternativa constructiva de uso del tiempo libre.',
    startDate: '2025-02-01',
    endDate: '2025-12-15',
    status: 'activo',
    isPublished: true,
    mainImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=800&fit=crop',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', caption: 'Clase de guitarra' },
      { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop', caption: 'Práctica de conjunto' }
    ],
    videoUrl: '',
    needsVolunteers: true,
    volunteersNeeded: 5,
    volunteersRegistered: 2,
    requiredSkills: ['Música/Arte', 'Enseñanza/Educación'],
    volunteerProfile: 'Músicos profesionales o estudiantes avanzados con experiencia en enseñanza a niños',
    requiredAvailability: ['Entre semana', 'Tardes'],
    timeCommitment: 'Semanal',
    estimatedHours: '4-6 horas por semana',
    location: ['Armenia'],
    partners: 'Escuela de Música del Quindío, Casa de la Cultura',
    tags: ['educación', 'música', 'arte', 'niños'],
    contactPerson: {
      name: 'María González',
      email: 'maria@huahuacuna.org',
      phone: '+57 300 123 4567'
    },
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: '2',
    title: 'Huerta Comunitaria Sostenible',
    slug: 'huerta-comunitaria-sostenible',
    shortDescription: 'Creación de una huerta urbana donde niños y familias aprenden sobre agricultura sostenible y alimentación saludable.',
    fullDescription: '<p>Este proyecto busca establecer una huerta comunitaria en el sector de la fundación, donde niños y sus familias puedan aprender sobre agricultura urbana, sostenibilidad y nutrición.</p><p>Los participantes trabajarán en la siembra, cuidado y cosecha de vegetales y hierbas aromáticas. Además, recibirán talleres sobre alimentación saludable y aprovechamiento de recursos.</p>',
    mainGoal: 'Promover la seguridad alimentaria y educación ambiental a través de la agricultura urbana sostenible.',
    specificObjectives: [
      'Establecer una huerta de 200m² con cultivos diversos',
      'Capacitar a 30 familias en agricultura urbana',
      'Producir alimentos frescos para las familias beneficiarias',
      'Crear conciencia ambiental sobre sostenibilidad'
    ],
    beneficiaries: {
      count: 30,
      description: 'Familias de los niños apadrinados por la fundación'
    },
    expectedImpact: 'Mejorar la alimentación de las familias y generar conocimientos en agricultura sostenible que pueden replicar en sus hogares.',
    startDate: '2025-03-01',
    endDate: '2025-11-30',
    status: 'activo',
    isPublished: true,
    mainImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&h=800&fit=crop',
    gallery: [],
    needsVolunteers: true,
    volunteersNeeded: 8,
    volunteersRegistered: 3,
    requiredSkills: ['Otro'],
    volunteerProfile: 'Personas con conocimientos en agricultura, jardinería o interés en aprender. No se requiere experiencia previa.',
    requiredAvailability: ['Fines de semana', 'Mañanas'],
    timeCommitment: 'Quincenal',
    estimatedHours: '3-4 horas quincenales',
    location: ['Armenia'],
    tags: ['medio ambiente', 'sostenibilidad', 'alimentación', 'educación'],
    contactPerson: {
      name: 'Carlos Ramírez',
      email: 'carlos@huahuacuna.org',
      phone: '+57 310 234 5678'
    },
    createdAt: '2025-01-20T14:00:00Z',
    updatedAt: '2025-01-20T14:00:00Z',
    createdBy: 'admin'
  }
];

const initialVolunteers: Volunteer[] = [
  {
    id: '1',
    projectId: '1',
    projectTitle: 'Escuela de Música para Niños',
    fullName: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    phone: '+57 301 111 2222',
    city: 'Armenia',
    skills: ['Música/Arte', 'Enseñanza/Educación'],
    previousExperience: 'He sido profesora de piano durante 5 años en una academia local.',
    motivation: 'Quiero compartir mi pasión por la música con niños que no tienen acceso a educación musical.',
    availability: ['Entre semana', 'Tardes'],
    timeCommitment: 'Semanal',
    hoursPerWeek: 6,
    acceptedTerms: true,
    newsletterOptIn: true,
    status: 'activo',
    registrationDate: '2025-01-25T09:00:00Z'
  },
  {
    id: '2',
    projectId: '1',
    projectTitle: 'Escuela de Música para Niños',
    fullName: 'Jorge Pérez',
    email: 'jorge.perez@email.com',
    phone: '+57 302 222 3333',
    city: 'Armenia',
    skills: ['Música/Arte'],
    motivation: 'La música cambió mi vida y quiero que otros niños tengan las mismas oportunidades.',
    availability: ['Fines de semana'],
    timeCommitment: 'Semanal',
    hoursPerWeek: 4,
    acceptedTerms: true,
    newsletterOptIn: false,
    status: 'pendiente',
    registrationDate: '2025-01-26T15:30:00Z'
  }
];

// ProjectsProvider gestiona el módulo de proyectos y voluntarios:
// - projects: lista de proyectos con información de impacto, fechas, estado y voluntarios.
// - volunteers: postulaciones de voluntarios asociadas a proyectos.
// - Provee helpers para CRUD, duplicar proyectos, filtrar por estado y registrar/eliminar voluntarios.
// Es la fuente de datos para las vistas de proyectos públicos y la gestión interna (ProjectManagementPage).
export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Cargar datos desde localStorage o usar iniciales
  const loadProjects = (): Project[] => {
    try {
      const stored = localStorage.getItem('huahuacuna_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[ProjectsContext] Proyectos cargados desde localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('[ProjectsContext] Error al cargar proyectos desde localStorage:', error);
    }
    console.log('[ProjectsContext] Usando proyectos iniciales:', initialProjects.length);
    return initialProjects;
  };

  const loadVolunteers = (): Volunteer[] => {
    try {
      const stored = localStorage.getItem('huahuacuna_volunteers');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[ProjectsContext] Voluntarios cargados desde localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('[ProjectsContext] Error al cargar voluntarios desde localStorage:', error);
    }
    console.log('[ProjectsContext] Usando voluntarios iniciales:', initialVolunteers.length);
    return initialVolunteers;
  };

  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(loadVolunteers);

  // Sincronizar con localStorage cuando cambien los proyectos
  React.useEffect(() => {
    try {
      localStorage.setItem('huahuacuna_projects', JSON.stringify(projects));
      console.log('[ProjectsContext] Proyectos guardados en localStorage:', projects.length);
    } catch (error) {
      console.error('[ProjectsContext] Error al guardar proyectos en localStorage:', error);
    }
  }, [projects]);

  // Sincronizar con localStorage cuando cambien los voluntarios
  React.useEffect(() => {
    try {
      localStorage.setItem('huahuacuna_volunteers', JSON.stringify(volunteers));
      console.log('[ProjectsContext] Voluntarios guardados en localStorage:', volunteers.length);
    } catch (error) {
      console.error('[ProjectsContext] Error al guardar voluntarios en localStorage:', error);
    }
  }, [volunteers]);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'volunteersRegistered' | 'slug'>) => {
    try {
      console.log('[ProjectsContext] addProject - Datos recibidos:', projectData);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Convertir Project a CreateProjectDTO
      const dto = mapProjectToCreateDTO(projectData);
      console.log('[ProjectsContext] addProject - DTO mapeado:', dto);

      // Llamar al servicio
      const response = await projectsService.createProject(dto, parseInt(user.id, 10));

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear proyecto');
      }

      console.log('[ProjectsContext] addProject - Respuesta del backend:', response.data);

      // Convertir ProjectResponse a Project y agregar al estado
      const newProject = mapProjectResponseToProject(response.data);
      setProjects(prev => [...prev, newProject]);

      toast.success('Proyecto creado exitosamente');
    } catch (error) {
      console.error('[ProjectsContext] addProject - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear proyecto');
      
      // Fallback: guardar solo localmente
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        slug: createSlug(projectData.title),
        volunteersRegistered: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log('[ProjectsContext] addProject - Fallback local:', newProject.title);
      setProjects(prev => [...prev, newProject]);
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      console.log('[ProjectsContext] updateProject - ID:', id, 'Datos:', projectData);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Convertir actualizaciones a UpdateProjectDTO
      const dto: UpdateProjectDTO = {
        id: parseInt(id, 10),
      };

      if (projectData.title !== undefined) dto.name = projectData.title;
      if (projectData.shortDescription || projectData.fullDescription) {
        dto.description = `${projectData.shortDescription || ''}\n\n${projectData.fullDescription || ''}`.trim();
      }
      if (projectData.startDate !== undefined) dto.startDate = projectData.startDate;
      if (projectData.endDate !== undefined) dto.endDate = projectData.endDate;
      if (projectData.budget !== undefined) dto.budget = projectData.budget;
      if (projectData.location !== undefined) dto.location = projectData.location.join(', ');
      if (projectData.mainGoal || projectData.specificObjectives) {
        dto.objectives = [
          projectData.mainGoal || '',
          ...(projectData.specificObjectives || [])
        ].filter(Boolean);
      }

      // Actualizar metadata si hay cambios
      const metadataUpdates: any = {};
      const metadataFields = ['isPublished', 'mainImage', 'gallery', 'videoUrl', 'needsVolunteers', 
                               'volunteersNeeded', 'requiredSkills', 'volunteerProfile', 'requiredAvailability',
                               'timeCommitment', 'estimatedHours', 'partners', 'showBudget', 'contactPerson', 
                               'tags', 'beneficiaries', 'expectedImpact'];
      
      for (const field of metadataFields) {
        if (projectData[field as keyof Project] !== undefined) {
          metadataUpdates[field] = projectData[field as keyof Project];
        }
      }

      if (Object.keys(metadataUpdates).length > 0) {
        dto.metadata = metadataUpdates;
      }

      console.log('[ProjectsContext] updateProject - DTO mapeado:', dto);

      const response = await projectsService.updateProject(dto, parseInt(user.id, 10));

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al actualizar proyecto');
      }

      console.log('[ProjectsContext] updateProject - Respuesta del backend:', response.data);

      // Actualizar estado local
      setProjects(projects.map(p => {
        if (p.id === id) {
          return mapProjectResponseToProject(response.data!);
        }
        return p;
      }));

      toast.success('Proyecto actualizado exitosamente');
    } catch (error) {
      console.error('[ProjectsContext] updateProject - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar proyecto');
      
      // Fallback: actualizar solo localmente
      setProjects(projects.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...projectData, updatedAt: new Date().toISOString() };
          if (projectData.title && projectData.title !== p.title) {
            updated.slug = createSlug(projectData.title);
          }
          console.log('[ProjectsContext] updateProject - Fallback local:', updated.title);
          return updated;
        }
        return p;
      }));
    }
  };

  const deleteProject = async (id: string) => {
    try {
      console.log('[ProjectsContext] deleteProject - Eliminando proyecto ID:', id);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const response = await projectsService.deleteProject(parseInt(id, 10), parseInt(user.id, 10));

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar proyecto');
      }

      console.log('[ProjectsContext] deleteProject - Proyecto eliminado del backend');

      setProjects(projects.filter(p => p.id !== id));
      setVolunteers(volunteers.filter(v => v.projectId !== id));

      toast.success('Proyecto eliminado exitosamente');
    } catch (error) {
      console.error('[ProjectsContext] deleteProject - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar proyecto');
      
      // Fallback: eliminar solo localmente
      setProjects(projects.filter(p => p.id !== id));
      setVolunteers(volunteers.filter(v => v.projectId !== id));
    }
  };

  const duplicateProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const duplicated: Project = {
        ...project,
        id: Date.now().toString(),
        title: `${project.title} (Copia)`,
        slug: createSlug(`${project.title} (Copia)`),
        status: 'borrador',
        isPublished: false,
        volunteersRegistered: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects([...projects, duplicated]);
    }
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getProjectBySlug = (slug: string) => {
    return projects.find(p => p.slug === slug);
  };

  const getPublishedProjects = () => {
    return projects.filter(p => p.isPublished && p.status !== 'archivado');
  };

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  const registerVolunteer = (volunteerData: Omit<Volunteer, 'id' | 'registrationDate' | 'status'>) => {
    const newVolunteer: Volunteer = {
      ...volunteerData,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString(),
      status: 'pendiente',
    };
    setVolunteers([...volunteers, newVolunteer]);
    
    // Update project volunteer count
    const project = projects.find(p => p.id === volunteerData.projectId);
    if (project) {
      updateProject(project.id, {
        volunteersRegistered: project.volunteersRegistered + 1
      });
    }
  };

  const updateVolunteer = (id: string, volunteerData: Partial<Volunteer>) => {
    setVolunteers(volunteers.map(v => 
      v.id === id ? { ...v, ...volunteerData } : v
    ));
  };

  const deleteVolunteer = (id: string) => {
    const volunteer = volunteers.find(v => v.id === id);
    if (volunteer) {
      setVolunteers(volunteers.filter(v => v.id !== id));
      
      // Update project volunteer count
      const project = projects.find(p => p.id === volunteer.projectId);
      if (project) {
        updateProject(project.id, {
          volunteersRegistered: Math.max(0, project.volunteersRegistered - 1)
        });
      }
    }
  };

  const getVolunteersByProject = (projectId: string) => {
    return volunteers.filter(v => v.projectId === projectId);
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        volunteers,
        addProject,
        updateProject,
        deleteProject,
        duplicateProject,
        getProjectById,
        getProjectBySlug,
        getPublishedProjects,
        getProjectsByStatus,
        registerVolunteer,
        updateVolunteer,
        deleteVolunteer,
        getVolunteersByProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

