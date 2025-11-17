import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'volunteersRegistered' | 'slug'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
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

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialVolunteers);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'volunteersRegistered' | 'slug'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      slug: createSlug(projectData.title),
      volunteersRegistered: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...projectData, updatedAt: new Date().toISOString() };
        if (projectData.title && projectData.title !== p.title) {
          updated.slug = createSlug(projectData.title);
        }
        return updated;
      }
      return p;
    }));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    // Also delete associated volunteers
    setVolunteers(volunteers.filter(v => v.projectId !== id));
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
