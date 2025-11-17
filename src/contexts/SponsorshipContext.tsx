import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Child {
  id: string;
  nombre: string;
  nombreCompleto?: string;
  edad: number;
  fechaNacimiento: string;
  genero: 'masculino' | 'femenino';
  municipio: string;
  institucion: string;
  grado: string;
  foto: string;
  fotos?: string[];
  descripcionBreve: string;
  historia: string;
  necesidades: string[];
  suenos: string;
  frase?: string;
  disponible: boolean;
  fechaRegistro: string;
}

export interface Sponsorship {
  id: string;
  childId: string;
  sponsorId: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'activo' | 'completado' | 'cancelado' | 'en_pausa';
  razonFin?: string;
  duracionMeses?: number;
}

export interface ChatMessage {
  id: string;
  sponsorshipId: string;
  senderId: string;
  senderName: string;
  senderRole: 'padrino' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
}

interface SponsorshipContextType {
  children: Child[];
  sponsorships: Sponsorship[];
  chatMessages: ChatMessage[];
  mySponsoredChild: Child | null;
  mySponsorship: Sponsorship | null;
  unreadMessagesCount: number;
  sponsorChild: (childId: string) => Promise<void>;
  endSponsorship: (sponsorshipId: string, reason: string) => Promise<void>;
  sendMessage: (sponsorshipId: string, message: string) => Promise<void>;
  markMessagesAsRead: (sponsorshipId: string) => void;
  filterChildren: (filters: ChildFilters) => Child[];
  getChildById: (childId: string) => Child | undefined;
  getChatMessages: (sponsorshipId: string) => ChatMessage[];
}

export interface ChildFilters {
  ageRange?: [number, number];
  genero?: 'masculino' | 'femenino' | 'todos';
  municipios?: string[];
  searchTerm?: string;
}

const SponsorshipContext = createContext<SponsorshipContextType | undefined>(undefined);

// Mock children data
const mockChildren: Child[] = [
  {
    id: '1',
    nombre: 'María C.',
    nombreCompleto: 'María Camila Rodríguez',
    edad: 12,
    fechaNacimiento: '2012-03-15',
    genero: 'femenino',
    municipio: 'Armenia',
    institucion: 'Institución Educativa San José',
    grado: '7° grado',
    foto: 'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?w=400',
    fotos: [
      'https://images.unsplash.com/photo-1565373086464-c8af0d586c0c?w=600',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600',
      'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=600',
    ],
    descripcionBreve: 'Niña alegre que ama las matemáticas y sueña con ser ingeniera. Le encanta ayudar a sus compañeros.',
    historia: 'María vive con su abuela y dos hermanos menores en Armenia. A pesar de las dificultades económicas, siempre mantiene una actitud positiva y es la mejor estudiante de su clase. Le apasionan las matemáticas y la ciencia, y dedica sus tardes a ayudar a otros niños del barrio con sus tareas. Su mayor sueño es convertirse en ingeniera para construir casas para familias necesitadas.',
    necesidades: ['Útiles escolares', 'Uniforme', 'Atención médica', 'Alimentación'],
    suenos: 'Quiero ser ingeniera civil y construir casas bonitas para familias que lo necesiten',
    frase: '"Me gusta ayudar a mis compañeros cuando no entienden las matemáticas"',
    disponible: true,
    fechaRegistro: '2024-01-10',
  },
  {
    id: '2',
    nombre: 'Carlos A.',
    nombreCompleto: 'Carlos Andrés Gómez',
    edad: 9,
    fechaNacimiento: '2015-07-22',
    genero: 'masculino',
    municipio: 'Calarcá',
    institucion: 'Colegio Departamental',
    grado: '4° grado',
    foto: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?w=400',
    fotos: [
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?w=600',
      'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600',
    ],
    descripcionBreve: 'Niño creativo que ama el arte y el fútbol. Siempre tiene una sonrisa para compartir.',
    historia: 'Carlos vive con su madre soltera y una hermana mayor en Calarcá. Es un niño muy creativo que disfruta dibujando y jugando fútbol. A pesar de las limitaciones económicas, Carlos siempre encuentra maneras de ser feliz y hacer sonreír a los demás.',
    necesidades: ['Material escolar', 'Ropa deportiva', 'Materiales de arte'],
    suenos: 'Quiero ser futbolista profesional o artista',
    frase: '"El fútbol y el arte me hacen muy feliz"',
    disponible: true,
    fechaRegistro: '2024-01-15',
  },
  {
    id: '3',
    nombre: 'Ana S.',
    nombreCompleto: 'Ana Sofía Martínez',
    edad: 14,
    fechaNacimiento: '2010-11-08',
    genero: 'femenino',
    municipio: 'Montenegro',
    institucion: 'Institución Educativa Técnica',
    grado: '9° grado',
    foto: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=400',
    fotos: [
      'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?w=600',
    ],
    descripcionBreve: 'Estudiante dedicada que ama la lectura y la música. Toca guitarra en su tiempo libre.',
    historia: 'Ana vive con sus padres y tres hermanos en Montenegro. Es una estudiante ejemplar que combina su amor por la lectura con su talento musical. Ha aprendido a tocar la guitarra de manera autodidacta y participa en el coro de su escuela.',
    necesidades: ['Libros', 'Instrumento musical', 'Uniforme escolar'],
    suenos: 'Quiero estudiar literatura y ser profesora de música',
    disponible: true,
    fechaRegistro: '2024-01-20',
  },
  {
    id: '4',
    nombre: 'Juan D.',
    nombreCompleto: 'Juan David López',
    edad: 11,
    fechaNacimiento: '2013-05-30',
    genero: 'masculino',
    municipio: 'Armenia',
    institucion: 'Colegio La Esperanza',
    grado: '6° grado',
    foto: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=400',
    descripcionBreve: 'Niño curioso que ama la naturaleza y los animales. Quiere ser veterinario.',
    historia: 'Juan vive con su familia en las afueras de Armenia. Desde pequeño ha mostrado un amor especial por los animales y la naturaleza. Dedica su tiempo libre a cuidar de los animales callejeros del barrio.',
    necesidades: ['Útiles escolares', 'Zapatos', 'Libros sobre animales'],
    suenos: 'Quiero ser veterinario y ayudar a todos los animales',
    disponible: true,
    fechaRegistro: '2024-01-25',
  },
  {
    id: '5',
    nombre: 'Laura M.',
    nombreCompleto: 'Laura Melissa Vargas',
    edad: 8,
    fechaNacimiento: '2016-02-14',
    genero: 'femenino',
    municipio: 'Circasia',
    institucion: 'Escuela Rural San Pedro',
    grado: '3° grado',
    foto: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
    descripcionBreve: 'Niña tímida pero muy inteligente. Le encanta la naturaleza y cuidar el medio ambiente.',
    historia: 'Laura vive en una zona rural de Circasia con su familia. Es una niña observadora y curiosa que disfruta aprendiendo sobre las plantas y el cuidado del medio ambiente.',
    necesidades: ['Transporte escolar', 'Material educativo', 'Ropa adecuada'],
    suenos: 'Quiero cuidar el planeta y enseñar a otros niños sobre la naturaleza',
    disponible: true,
    fechaRegistro: '2024-02-01',
  },
  {
    id: '6',
    nombre: 'Santiago R.',
    nombreCompleto: 'Santiago Ramírez',
    edad: 13,
    fechaNacimiento: '2011-09-12',
    genero: 'masculino',
    municipio: 'Salento',
    institucion: 'Colegio Salento',
    grado: '8° grado',
    foto: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400',
    descripcionBreve: 'Joven apasionado por la tecnología y la programación. Autodidacta y creativo.',
    historia: 'Santiago vive en Salento y ha desarrollado un gran interés por la tecnología. A pesar de no tener computadora en casa, utiliza los recursos de la biblioteca para aprender programación.',
    necesidades: ['Computadora', 'Acceso a internet', 'Cursos de tecnología'],
    suenos: 'Quiero ser programador y crear aplicaciones que ayuden a mi comunidad',
    disponible: true,
    fechaRegistro: '2024-02-05',
  },
];

export function SponsorshipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allChildren, setAllChildren] = useState<Child[]>(mockChildren);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Get sponsored child for current user
  const mySponsorship = user?.role === 'padrino' 
    ? sponsorships.find(s => s.sponsorId === user.id && s.estado === 'activo')
    : null;

  const mySponsoredChild = mySponsorship 
    ? allChildren.find(c => c.id === mySponsorship.childId) || null
    : null;

  // Count unread messages for current user
  const unreadMessagesCount = chatMessages.filter(
    msg => msg.sponsorshipId === mySponsorship?.id && 
           msg.senderRole !== (user?.role === 'padrino' ? 'padrino' : 'admin') && 
           !msg.read
  ).length;

  // Sponsor a child
  const sponsorChild = async (childId: string) => {
    if (!user) throw new Error('No user logged in');

    // Check if child is still available
    const child = allChildren.find(c => c.id === childId);
    if (!child || !child.disponible) {
      throw new Error('Este niño ya ha sido apadrinado por otra persona');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newSponsorship: Sponsorship = {
      id: `sp-${Date.now()}`,
      childId,
      sponsorId: user.id,
      fechaInicio: new Date().toISOString(),
      estado: 'activo',
    };

    setSponsorships([...sponsorships, newSponsorship]);
    
    // Mark child as unavailable
    setAllChildren(allChildren.map(c => 
      c.id === childId ? { ...c, disponible: false } : c
    ));
  };

  // End sponsorship
  const endSponsorship = async (sponsorshipId: string, reason: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSponsorships(sponsorships.map(s => 
      s.id === sponsorshipId 
        ? { 
            ...s, 
            estado: 'completado', 
            fechaFin: new Date().toISOString(),
            razonFin: reason,
            duracionMeses: Math.floor(
              (new Date().getTime() - new Date(s.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 30)
            ),
          }
        : s
    ));
  };

  // Send chat message
  const sendMessage = async (sponsorshipId: string, message: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sponsorshipId,
      senderId: user.id,
      senderName: user.nombre,
      senderRole: user.role === 'padrino' ? 'padrino' : 'admin',
      message,
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true,
    };

    setChatMessages([...chatMessages, newMessage]);

    // Simulate admin auto-response after 2 seconds (for demo)
    if (user.role === 'padrino') {
      setTimeout(() => {
        const autoResponse: ChatMessage = {
          id: `msg-${Date.now()}`,
          sponsorshipId,
          senderId: 'admin-1',
          senderName: 'Coordinadora María',
          senderRole: 'admin',
          message: 'Gracias por tu mensaje. Te responderemos pronto con información sobre el niño.',
          timestamp: new Date().toISOString(),
          read: false,
          delivered: true,
        };
        setChatMessages(prev => [...prev, autoResponse]);
      }, 2000);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = (sponsorshipId: string) => {
    setChatMessages(chatMessages.map(msg => 
      msg.sponsorshipId === sponsorshipId && msg.senderRole !== (user?.role === 'padrino' ? 'padrino' : 'admin')
        ? { ...msg, read: true }
        : msg
    ));
  };

  // Filter children
  const filterChildren = (filters: ChildFilters): Child[] => {
    return allChildren.filter(child => {
      // Only show available children
      if (!child.disponible) return false;

      // Age range filter
      if (filters.ageRange) {
        const [min, max] = filters.ageRange;
        if (child.edad < min || child.edad > max) return false;
      }

      // Gender filter
      if (filters.genero && filters.genero !== 'todos') {
        if (child.genero !== filters.genero) return false;
      }

      // Municipality filter
      if (filters.municipios && filters.municipios.length > 0) {
        if (!filters.municipios.includes(child.municipio)) return false;
      }

      // Search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (!child.nombre.toLowerCase().includes(term) &&
            !child.descripcionBreve.toLowerCase().includes(term)) {
          return false;
        }
      }

      return true;
    });
  };

  // Get child by ID
  const getChildById = (childId: string) => {
    return allChildren.find(c => c.id === childId);
  };

  // Get chat messages for sponsorship
  const getChatMessages = (sponsorshipId: string) => {
    return chatMessages
      .filter(msg => msg.sponsorshipId === sponsorshipId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const value = {
    children: allChildren.filter(c => c.disponible),
    sponsorships,
    chatMessages,
    mySponsoredChild,
    mySponsorship,
    unreadMessagesCount,
    sponsorChild,
    endSponsorship,
    sendMessage,
    markMessagesAsRead,
    filterChildren,
    getChildById,
    getChatMessages,
  };

  return (
    <SponsorshipContext.Provider value={value}>
      {children}
    </SponsorshipContext.Provider>
  );
}

export function useSponsorship() {
  const context = useContext(SponsorshipContext);
  if (context === undefined) {
    throw new Error('useSponsorship must be used within a SponsorshipProvider');
  }
  return context;
}
