import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export type VolunteerStatus = 
  | 'pendiente_revision' 
  | 'en_revision' 
  | 'contactado' 
  | 'aprobado' 
  | 'rechazado' 
  | 'activo' 
  | 'inactivo';

export type VolunteerArea = 
  | 'Educación y Refuerzo Escolar'
  | 'Arte y Creatividad'
  | 'Deportes y Recreación'
  | 'Tecnología y Computación'
  | 'Salud y Bienestar'
  | 'Cocina y Alimentación'
  | 'Administración y Logística'
  | 'Comunicaciones y Marketing'
  | 'Mantenimiento y Oficios'
  | 'Otro';

export interface VolunteerReference {
  nombre: string;
  relacion: string;
  telefono: string;
  email?: string;
  verificado?: boolean;
  notas?: string;
}

export interface VolunteerApplication {
  id: string;
  // Personal Info
  foto?: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: number;
  genero?: string;
  email: string;
  telefono: string;
  whatsapp?: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  
  // Volunteering Info
  areasInteres: VolunteerArea[];
  habilidades: string;
  experienciaPrevia?: string;
  motivacion: string;
  queEsperaAportar?: string;
  
  // Availability
  diasDisponibles: string[];
  horariosDisponibles: string[];
  horasPorSemana: number;
  compromisoTiempo: string;
  fechaInicioPreferida?: string;
  restriccionesHorario?: string;
  
  // References
  referencias: VolunteerReference[];
  
  // Documents
  cvUrl: string;
  cartaMotivacionUrl?: string;
  certificadosUrls?: string[];
  comoSeEntero?: string;
  
  // Status & Metadata
  status: VolunteerStatus;
  fechaSolicitud: string;
  ultimaActualizacion: string;
  adminAsignado?: string;
  prioridad?: 'normal' | 'alta';
  tags?: string[];
  
  // Admin fields
  motivoRechazo?: string;
  notasInternas?: string;
  historial: VolunteerHistoryEntry[];
}

export interface VolunteerHistoryEntry {
  id: string;
  fecha: string;
  tipo: 'status_change' | 'email_sent' | 'note_added' | 'contact' | 'interview';
  descripcion: string;
  admin?: string;
  detalles?: string;
}

export interface VolunteeringPageContent {
  hero: {
    titulo: string;
    subtitulo: string;
    imagenFondo: string;
    stats: { label: string; value: string }[];
  };
  queEs: {
    contenido: string;
    imagen: string;
    testimonial?: {
      foto: string;
      nombre: string;
      rol: string;
      cita: string;
    };
  };
  beneficios: {
    icono: string;
    titulo: string;
    descripcion: string;
  }[];
  areas: {
    icono: string;
    nombre: string;
    descripcion: string;
    habilidades: string[];
  }[];
  requisitos: {
    basicos: string[];
    proceso: { paso: number; titulo: string; descripcion: string }[];
  };
  testimonios: {
    foto: string;
    nombre: string;
    rol: string;
    cita: string;
    tiempo: string;
    activo: boolean;
  }[];
  faq: {
    pregunta: string;
    respuesta: string;
    activo: boolean;
  }[];
}

interface VolunteeringContextType {
  applications: VolunteerApplication[];
  pageContent: VolunteeringPageContent;
  addApplication: (application: Omit<VolunteerApplication, 'id' | 'fechaSolicitud' | 'ultimaActualizacion' | 'historial'>) => string;
  updateApplication: (id: string, updates: Partial<VolunteerApplication>) => void;
  deleteApplication: (id: string) => void;
  changeStatus: (id: string, newStatus: VolunteerStatus, notas?: string, admin?: string) => void;
  addHistoryEntry: (id: string, entry: Omit<VolunteerHistoryEntry, 'id' | 'fecha'>) => void;
  getApplicationById: (id: string) => VolunteerApplication | undefined;
  getApplicationsByStatus: (status: VolunteerStatus) => VolunteerApplication[];
  updatePageContent: (content: Partial<VolunteeringPageContent>) => void;
  sendConfirmationEmail: (applicationId: string) => void;
  sendStatusChangeEmail: (applicationId: string, newStatus: VolunteerStatus) => void;
}

const VolunteeringContext = createContext<VolunteeringContextType | undefined>(undefined);

// Default page content
const defaultPageContent: VolunteeringPageContent = {
  hero: {
    titulo: "Únete a Nuestro Equipo de Voluntarios",
    subtitulo: "Transforma vidas mientras transformas la tuya",
    imagenFondo: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=800&fit=crop",
    stats: [
      { label: "Voluntarios Activos", value: "150+" },
      { label: "Áreas de Voluntariado", value: "20" },
      { label: "Niños Beneficiados", value: "542" }
    ]
  },
  queEs: {
    contenido: `<h3>Ser Voluntario en Huahuacuna</h3>
    <p>En Fundación Huahuacuna, el voluntariado es mucho más que donar tiempo: es compartir amor, conocimientos y esperanza con niños y niñas que necesitan de tu apoyo para construir un futuro mejor.</p>
    <p>Nuestros voluntarios son parte fundamental de nuestra familia. Cada uno aporta sus talentos únicos para enriquecer la vida de los 542 niños que apadrinamos en Armenia, Quindío y sus alrededores.</p>
    <p>Durante más de 21 años, hemos visto cómo el compromiso de voluntarios dedicados transforma vidas, inspira sueños y construye comunidades más fuertes.</p>`,
    imagen: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop"
  },
  beneficios: [
    {
      icono: "💝",
      titulo: "Marca la Diferencia",
      descripcion: "Contribuye directamente al desarrollo de niños vulnerables y sé parte de su historia de éxito"
    },
    {
      icono: "🎓",
      titulo: "Desarrolla Habilidades",
      descripcion: "Aprende nuevas competencias y fortalece las existentes mientras ayudas"
    },
    {
      icono: "🤝",
      titulo: "Conecta con Personas",
      descripcion: "Únete a una comunidad de personas comprometidas con el cambio social"
    },
    {
      icono: "📜",
      titulo: "Certificación Oficial",
      descripcion: "Recibe certificado de horas de voluntariado para tu hoja de vida"
    },
    {
      icono: "❤️",
      titulo: "Satisfacción Personal",
      descripcion: "Experimenta la alegría de ayudar a otros y ver el impacto de tu trabajo"
    },
    {
      icono: "🌱",
      titulo: "Crece Personalmente",
      descripcion: "Desarrolla empatía, liderazgo y trabajo en equipo mientras sirves"
    }
  ],
  areas: [
    {
      icono: "📚",
      nombre: "Educación y Refuerzo Escolar",
      descripcion: "Apoya a los niños con tareas, lectura, matemáticas y hábitos de estudio",
      habilidades: ["Docencia", "Paciencia", "Pedagogía"]
    },
    {
      icono: "🎨",
      nombre: "Arte y Creatividad",
      descripcion: "Talleres de pintura, música, danza, teatro y manualidades",
      habilidades: ["Arte", "Música", "Creatividad"]
    },
    {
      icono: "⚽",
      nombre: "Deportes y Recreación",
      descripcion: "Organiza actividades deportivas, juegos y recreación",
      habilidades: ["Deportes", "Animación", "Energía"]
    },
    {
      icono: "💻",
      nombre: "Tecnología y Computación",
      descripcion: "Enseña habilidades digitales básicas y uso de tecnología",
      habilidades: ["Computación", "Ofimática", "Paciencia"]
    },
    {
      icono: "🏥",
      nombre: "Salud y Bienestar",
      descripcion: "Apoyo en control médico y promoción de hábitos saludables",
      habilidades: ["Medicina", "Enfermería", "Nutrición"]
    },
    {
      icono: "🍳",
      nombre: "Cocina y Alimentación",
      descripcion: "Preparación de alimentos y talleres de cocina nutritiva",
      habilidades: ["Cocina", "Nutrición"]
    },
    {
      icono: "📋",
      nombre: "Administración y Logística",
      descripcion: "Apoyo administrativo y organización de eventos",
      habilidades: ["Administración", "Organización"]
    },
    {
      icono: "📸",
      nombre: "Comunicaciones y Marketing",
      descripcion: "Fotografía, redes sociales, diseño gráfico y comunicación",
      habilidades: ["Diseño", "Fotografía", "Redacción"]
    }
  ],
  requisitos: {
    basicos: [
      "Ser mayor de 18 años (o 16+ con autorización parental)",
      "Disponibilidad mínima de 4 horas semanales",
      "Compromiso mínimo de 3 meses",
      "Actitud positiva y empática hacia los niños",
      "Responsabilidad y puntualidad",
      "Pasar entrevista personal",
      "Referencias verificables"
    ],
    proceso: [
      { paso: 1, titulo: "Completa el formulario", descripcion: "Llena el formulario de inscripción con tus datos" },
      { paso: 2, titulo: "Confirmación", descripcion: "Recibirás confirmación por email" },
      { paso: 3, titulo: "Entrevista", descripcion: "Te contactaremos para una entrevista" },
      { paso: 4, titulo: "Aprobación", descripcion: "Revisaremos tu solicitud y te notificaremos" },
      { paso: 5, titulo: "Inducción", descripcion: "Capacitación inicial sobre nuestros programas" },
      { paso: 6, titulo: "¡Comienza!", descripcion: "Inicia tu voluntariado y marca la diferencia" }
    ]
  },
  testimonios: [
    {
      foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      nombre: "María González",
      rol: "Voluntaria de Educación",
      cita: "Ser voluntaria en Huahuacuna ha sido la experiencia más gratificante de mi vida. Ver la sonrisa de los niños hace que cada momento valga la pena.",
      tiempo: "Voluntaria desde 2023",
      activo: true
    },
    {
      foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      nombre: "Carlos Ramírez",
      rol: "Voluntario de Deportes",
      cita: "Los niños me han enseñado más de lo que yo les he enseñado. Es increíble ver su alegría y entusiasmo cada semana.",
      tiempo: "Voluntario desde 2022",
      activo: true
    },
    {
      foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      nombre: "Laura Martínez",
      rol: "Voluntaria de Arte",
      cita: "Compartir mi pasión por el arte con estos niños me llena el corazón. Cada clase es una aventura nueva.",
      tiempo: "Voluntaria desde 2024",
      activo: true
    }
  ],
  faq: [
    {
      pregunta: "¿Necesito experiencia previa para ser voluntario?",
      respuesta: "No es necesario tener experiencia previa. Lo más importante es tu compromiso, actitud positiva y ganas de ayudar. Ofrecemos capacitación inicial para todos nuestros voluntarios.",
      activo: true
    },
    {
      pregunta: "¿Cuánto tiempo debo comprometerme?",
      respuesta: "El compromiso mínimo es de 3 meses con al menos 4 horas semanales. Esto permite crear vínculos significativos con los niños y tener un impacto real.",
      activo: true
    },
    {
      pregunta: "¿Hay un horario fijo o puedo elegir cuándo asistir?",
      respuesta: "Trabajamos contigo para encontrar horarios que se ajusten a tu disponibilidad. Una vez acordado un horario, es importante mantener la consistencia para no afectar a los niños.",
      activo: true
    },
    {
      pregunta: "¿Recibo alguna compensación económica?",
      respuesta: "El voluntariado es una actividad no remunerada. Sin embargo, ofrecemos certificación de horas, capacitaciones, y la satisfacción de hacer una diferencia real en la vida de los niños.",
      activo: true
    },
    {
      pregunta: "¿Qué pasa si no puedo asistir un día?",
      respuesta: "Entendemos que pueden surgir imprevistos. Solo te pedimos que nos avises con anticipación para poder reorganizar las actividades y no dejar a los niños esperando.",
      activo: true
    },
    {
      pregunta: "¿Puedo llevar a un amigo o familiar?",
      respuesta: "¡Por supuesto! Si tu amigo también está interesado en ser voluntario, puede aplicar siguiendo el mismo proceso. Trabajar en equipo puede hacer la experiencia aún más enriquecedora.",
      activo: true
    },
    {
      pregunta: "¿Ofrecen capacitación antes de empezar?",
      respuesta: "Sí, todos los voluntarios nuevos reciben una inducción que incluye información sobre la fundación, nuestros programas, manejo con niños, y protocolo de seguridad.",
      activo: true
    },
    {
      pregunta: "¿Cómo puedo cancelar mi voluntariado si ya no puedo continuar?",
      respuesta: "Si necesitas retirarte, te pedimos que nos avises con al menos 2 semanas de anticipación para poder hacer una transición adecuada y minimizar el impacto en los niños.",
      activo: true
    }
  ]
};

export const VolunteeringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [pageContent, setPageContent] = useState<VolunteeringPageContent>(defaultPageContent);

  const addApplication = (applicationData: Omit<VolunteerApplication, 'id' | 'fechaSolicitud' | 'ultimaActualizacion' | 'historial'>) => {
    const id = `VOL-${new Date().getFullYear()}-${String(applications.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    
    const newApplication: VolunteerApplication = {
      ...applicationData,
      id,
      fechaSolicitud: now,
      ultimaActualizacion: now,
      historial: [{
        id: '1',
        fecha: now,
        tipo: 'status_change',
        descripcion: 'Solicitud creada',
        detalles: 'Estado inicial: Pendiente de Revisión'
      }]
    };

    setApplications(prev => [...prev, newApplication]);
    return id;
  };

  const updateApplication = (id: string, updates: Partial<VolunteerApplication>) => {
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, ...updates, ultimaActualizacion: new Date().toISOString() }
        : app
    ));
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const changeStatus = (id: string, newStatus: VolunteerStatus, notas?: string, admin?: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    const historyEntry: VolunteerHistoryEntry = {
      id: String(Date.now()),
      fecha: new Date().toISOString(),
      tipo: 'status_change',
      descripcion: `Estado cambiado de "${app.status}" a "${newStatus}"`,
      admin,
      detalles: notas
    };

    updateApplication(id, {
      status: newStatus,
      historial: [...app.historial, historyEntry]
    });

    // Send notification email
    sendStatusChangeEmail(id, newStatus);
  };

  const addHistoryEntry = (id: string, entry: Omit<VolunteerHistoryEntry, 'id' | 'fecha'>) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;

    const historyEntry: VolunteerHistoryEntry = {
      ...entry,
      id: String(Date.now()),
      fecha: new Date().toISOString()
    };

    updateApplication(id, {
      historial: [...app.historial, historyEntry]
    });
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByStatus = (status: VolunteerStatus) => {
    return applications.filter(app => app.status === status);
  };

  const updatePageContent = (content: Partial<VolunteeringPageContent>) => {
    setPageContent(prev => ({
      ...prev,
      ...content
    }));
  };

  const sendConfirmationEmail = (applicationId: string) => {
    const app = getApplicationById(applicationId);
    if (!app) return;

    // Simulate email sending
    console.log(`Sending confirmation email to ${app.email}`, {
      subject: 'Solicitud de Voluntariado Recibida - Fundación Huahuacuna',
      applicationId: app.id,
      name: app.nombreCompleto
    });

    addHistoryEntry(applicationId, {
      tipo: 'email_sent',
      descripcion: 'Email de confirmación enviado',
      detalles: 'Confirmación de recepción de solicitud'
    });
  };

  const sendStatusChangeEmail = (applicationId: string, newStatus: VolunteerStatus) => {
    const app = getApplicationById(applicationId);
    if (!app) return;

    const emailTemplates = {
      aprobado: {
        subject: '¡Bienvenido al Equipo de Voluntarios! - Fundación Huahuacuna',
        message: 'Felicitaciones, tu solicitud ha sido aprobada'
      },
      rechazado: {
        subject: 'Actualización sobre tu Solicitud de Voluntariado',
        message: 'Gracias por tu interés en ser voluntario'
      },
      contactado: {
        subject: 'Seguimiento a tu Solicitud de Voluntariado',
        message: 'Queremos ponernos en contacto contigo'
      }
    };

    const template = emailTemplates[newStatus as keyof typeof emailTemplates];
    
    if (template) {
      console.log(`Sending status change email to ${app.email}`, {
        subject: template.subject,
        status: newStatus,
        applicationId: app.id
      });

      addHistoryEntry(applicationId, {
        tipo: 'email_sent',
        descripcion: `Email de cambio de estado enviado: ${newStatus}`,
        detalles: template.subject
      });
    }
  };

  const value: VolunteeringContextType = {
    applications,
    pageContent,
    addApplication,
    updateApplication,
    deleteApplication,
    changeStatus,
    addHistoryEntry,
    getApplicationById,
    getApplicationsByStatus,
    updatePageContent,
    sendConfirmationEmail,
    sendStatusChangeEmail
  };

  return (
    <VolunteeringContext.Provider value={value}>
      {children}
    </VolunteeringContext.Provider>
  );
};

export const useVolunteering = () => {
  const context = useContext(VolunteeringContext);
  if (context === undefined) {
    throw new Error('useVolunteering must be used within a VolunteeringProvider');
  }
  return context;
};
