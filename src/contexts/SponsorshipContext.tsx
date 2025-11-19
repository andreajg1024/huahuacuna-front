import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { toast } from 'sonner';

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

// SponsorshipProvider maneja el estado de apadrinamientos en memoria:
// - mockChildren: catálogo de niños que se muestran en el frontend.
// - sponsorships: relaciones padrino-niño (simuladas, sin backend real).
// - chatMessages: mensajes entre padrino y coordinadora para el módulo de "Mensajes".
// También expone helpers para filtrar niños, obtener el niño apadrinado actual y contar mensajes no leídos.
export function SponsorshipProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar apadrinamientos si el usuario está autenticado como padrino
  useEffect(() => {
    const loadMySponsorships = async () => {
      if (!user || user.role !== 'padrino') return;

      try {
        setIsLoading(true);
        console.log('📋 Cargando apadrinamientos del padrino...');

        const response = await apadrinamientoService.getMySponsorships({
          padrinoId: parseInt(user.id, 10),
          page: 1,
          limit: 10,
          activeOnly: true
        });
        
        if (response.success && response.data && response.data.sponsorships) {
          console.log('✅ Apadrinamientos cargados:', response.data.sponsorships.length);

          const mappedSponsorships = response.data.sponsorships.map(s => ({
            id: String(s.id),
            childId: String(s.childId),
            sponsorId: String(s.sponsorId),
            fechaInicio: s.startDate,
            fechaFin: s.endDate,
            estado: s.status === 'ACTIVE' ? 'activo' as const :
                    s.status === 'COMPLETED' ? 'completado' as const :
                    s.status === 'CANCELLED' ? 'cancelado' as const :
                    'en_pausa' as const,
            razonFin: s.cancellationReason,
          }));

          setSponsorships(mappedSponsorships);

          // Si hay apadrinamientos, cargar la info del niño
          if (response.data.sponsorships.length > 0) {
            const firstSponsorship = response.data.sponsorships[0];
            if (firstSponsorship.child) {
              const childData = apadrinamientoService.convertFromApiFormat(firstSponsorship.child);
              setAllChildren([childData]);
            }
          }
        } else {
          console.log('ℹ️ No hay apadrinamientos activos');
          setSponsorships([]);
          setAllChildren([]);
        }
      } catch (error) {
        console.error('❌ Error cargando apadrinamientos:', error);
        setSponsorships([]);
        setAllChildren([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMySponsorships();
  }, [user]);

  // Get sponsored child for current user
  const mySponsorship: Sponsorship | null = useMemo(() => {
    if (user?.role !== 'padrino') return null;
    return sponsorships.find(s => s.sponsorId === user.id && s.estado === 'activo') || null;
  }, [user, sponsorships]);

  const mySponsoredChild: Child | null = useMemo(() => {
    if (!mySponsorship) return null;
    return allChildren.find(c => c.id === mySponsorship.childId) || null;
  }, [mySponsorship, allChildren]);

  // Cargar mensajes si hay un apadrinamiento activo
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !mySponsorship) return;
      
      try {
        console.log('💬 Cargando mensajes...');
        const response = await apadrinamientoService.listMessages(
          parseInt(mySponsorship.id, 10)
        );
        
        if (response.success && response.data) {
          const mappedMessages = response.data.map(m => ({
            id: String(m.id),
            sponsorshipId: String(m.sponsorshipId),
            senderId: String(m.senderId),
            senderName: m.senderName || 'Usuario',
            senderRole: m.senderRole === 'sponsor' ? 'padrino' as const : 'admin' as const,
            message: m.message,
            timestamp: m.timestamp,
            read: m.read,
            delivered: m.delivered || false,
          }));
          setChatMessages(mappedMessages);
        }
      } catch (error) {
        console.error('❌ Error cargando mensajes:', error);
      }
    };

    loadMessages();
  }, [user, mySponsorship]);

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

    try {
      const userId = parseInt(user.id, 10);
      
      const response = await apadrinamientoService.createSponsorship({
        childId: parseInt(childId, 10),
        sponsorId: userId,
        startDate: new Date().toISOString(),
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear apadrinamiento');
      }

      const newSponsorship: Sponsorship = {
        id: String(response.data.id),
        childId,
        sponsorId: user.id,
        fechaInicio: response.data.startDate,
        estado: 'activo',
      };

      setSponsorships([...sponsorships, newSponsorship]);
      
      // Mark child as unavailable
      setAllChildren(allChildren.map(c => 
        c.id === childId ? { ...c, disponible: false } : c
      ));

      toast.success('¡Apadrinamiento creado exitosamente!');
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear apadrinamiento');
      
      // Fallback
      const newSponsorship: Sponsorship = {
        id: `sp-${Date.now()}`,
        childId,
        sponsorId: user.id,
        fechaInicio: new Date().toISOString(),
        estado: 'activo',
      };

      setSponsorships([...sponsorships, newSponsorship]);
      setAllChildren(allChildren.map(c => 
        c.id === childId ? { ...c, disponible: false } : c
      ));
    }
  };

  // End sponsorship
  const endSponsorship = async (sponsorshipId: string, reason: string) => {
    try {
      const response = await apadrinamientoService.endSponsorship({
        sponsorshipId: parseInt(sponsorshipId, 10),
        endDate: new Date().toISOString(),
        reason,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al finalizar apadrinamiento');
      }

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

      toast.success('Apadrinamiento finalizado');
    } catch (error) {
      console.error('Error ending sponsorship:', error);
      toast.error('Error al finalizar apadrinamiento');
      
      // Fallback
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
    }
  };

  // Send chat message
  const sendMessage = async (sponsorshipId: string, message: string) => {
    if (!user) return;

    try {
      const userId = parseInt(user.id, 10);

      const response = await apadrinamientoService.sendMessage({
        sponsorshipId: parseInt(sponsorshipId, 10),
        senderId: userId,
        message,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al enviar mensaje');
      }

      const newMessage: ChatMessage = {
        id: String(response.data.id),
        sponsorshipId,
        senderId: String(response.data.senderId),
        senderName: response.data.senderName,
        senderRole: response.data.senderRole === 'sponsor' ? 'padrino' : 'admin',
        message: response.data.message,
        timestamp: response.data.timestamp,
        read: response.data.read,
        delivered: response.data.delivered,
      };

      setChatMessages([...chatMessages, newMessage]);
      toast.success('Mensaje enviado');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      
      // Fallback
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
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (sponsorshipId: string) => {
    try {
      if (!user) return;

      const userId = parseInt(user.id, 10);
      
      await apadrinamientoService.markMessagesAsRead(
        parseInt(sponsorshipId, 10),
        userId
      );

      setChatMessages(chatMessages.map(msg => 
        msg.sponsorshipId === sponsorshipId && msg.senderRole !== (user?.role === 'padrino' ? 'padrino' : 'admin')
          ? { ...msg, read: true }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
      
      // Fallback
      setChatMessages(chatMessages.map(msg => 
        msg.sponsorshipId === sponsorshipId && msg.senderRole !== (user?.role === 'padrino' ? 'padrino' : 'admin')
          ? { ...msg, read: true }
          : msg
      ));
    }
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
