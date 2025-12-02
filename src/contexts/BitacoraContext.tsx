import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apadrinamientoService } from '@/services/apadrinamiento.service';
import { bitacoraService } from '@/services/bitacora.service';
import { toast } from 'sonner';

// Types
export interface Child {
  id: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  edad: number;
  genero: 'masculino' | 'femenino';
  foto: string;
  municipio: string;
  direccion: string;
  institucion: string;
  grado: string;
  jornada?: 'mañana' | 'tarde' | 'completa';
  historia?: string;
  suenos?: string;
  situacionFamiliar?: string;
  necesidades: string[];
  estadoApadrinamiento: 'disponible' | 'apadrinado';
  padrinoId?: string;
  fechaCreacion: string;
}

export interface BitacoraEntry {
  id: string;
  childId: string;
  tipo: 'foto' | 'video';
  url: string;
  thumbnailUrl?: string;
  descripcion: string;
  fechaActividad: string;
  fechaPublicacion: string;
  categoria: string;
  etiquetas: string[];
  visibilidad: 'publico' | 'interno';
  uploadedBy: string;
  uploadedByName: string;
  duracion?: number; // for videos in seconds
  tamano: number; // file size in bytes
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

export interface BitacoraStats {
  totalFotos: number;
  totalVideos: number;
  ultimaActualizacion: string;
  mesesDocumentados: number;
  entradaPorMes: { [key: string]: number };
  categorias: { [key: string]: number };
}

interface BitacoraContextType {
  children: Child[];
  bitacoraEntries: { [childId: string]: BitacoraEntry[] };
  getChildById: (id: string) => Child | undefined;
  getChildEntries: (childId: string) => BitacoraEntry[];
  getChildStats: (childId: string) => BitacoraStats;
  addChild: (child: Omit<Child, 'id' | 'fechaCreacion'>) => Promise<Child>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  addEntry: (entry: Omit<BitacoraEntry, 'id' | 'fechaPublicacion' | 'uploadedBy' | 'uploadedByName'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<BitacoraEntry>) => Promise<void>;
  deleteEntry: (id: string, reason: string) => Promise<void>;
  uploadFiles: (files: File[], metadata: any) => Promise<string[]>;
  generatePDF: (childId: string, options: any) => Promise<Blob>;
}

const BitacoraContext = createContext<BitacoraContextType | undefined>(undefined);

// Mock data
const mockChildren: Child[] = [
  {
    id: 'child-1',
    nombre: 'María',
    apellidos: 'González Pérez',
    fechaNacimiento: '2015-03-15',
    edad: 9,
    genero: 'femenino',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    municipio: 'Armenia',
    direccion: 'Barrio La Fachada, Calle 10 #5-23',
    institucion: 'Colegio José Holguín Garcés',
    grado: '4° Primaria',
    jornada: 'mañana',
    historia: 'María es una niña alegre y curiosa que ama leer y dibujar. Vive con su abuela y su hermano menor.',
    suenos: 'Sueña con ser maestra y ayudar a otros niños a aprender',
    situacionFamiliar: 'Vive con abuela. Madre trabaja en otra ciudad.',
    necesidades: ['Material escolar', 'Apoyo educativo', 'Alimentación'],
    estadoApadrinamiento: 'apadrinado',
    padrinoId: 'user-padrino',
    fechaCreacion: '2023-01-15',
  },
  {
    id: 'child-2',
    nombre: 'Carlos',
    apellidos: 'Rodríguez López',
    fechaNacimiento: '2013-08-22',
    edad: 11,
    genero: 'masculino',
    foto: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400',
    municipio: 'Calarcá',
    direccion: 'Barrio El Bosque, Carrera 5 #12-45',
    institucion: 'Institución Educativa Simón Bolívar',
    grado: '6° Bachillerato',
    jornada: 'mañana',
    historia: 'Carlos es apasionado por el fútbol y las matemáticas. Es el mayor de tres hermanos.',
    suenos: 'Quiere ser ingeniero y construir casas para su familia',
    necesidades: ['Material deportivo', 'Apoyo educativo'],
    estadoApadrinamiento: 'disponible',
    fechaCreacion: '2023-02-20',
  },
  {
    id: 'child-3',
    nombre: 'Sofía',
    apellidos: 'Martínez Castro',
    fechaNacimiento: '2014-11-10',
    edad: 10,
    genero: 'femenino',
    foto: 'https://images.unsplash.com/photo-1554780336-ad2f030d8e84?w=400',
    municipio: 'Montenegro',
    direccion: 'Barrio La Campiña, Calle 8 #3-12',
    institucion: 'Escuela Rural Pueblo Rico',
    grado: '5° Primaria',
    jornada: 'completa',
    historia: 'Sofía ama la naturaleza y los animales. Participa activamente en el grupo de teatro escolar.',
    suenos: 'Sueña con ser veterinaria y cuidar a todos los animales',
    necesidades: ['Atención médica', 'Material escolar'],
    estadoApadrinamiento: 'disponible',
    fechaCreacion: '2023-03-10',
  },
];

const mockEntries: { [childId: string]: BitacoraEntry[] } = {
  'child-1': [
    {
      id: 'entry-1',
      childId: 'child-1',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      descripcion: 'María presentando su proyecto de ciencias sobre el ciclo del agua. Obtuvo el primer lugar en la feria científica de su escuela.',
      fechaActividad: '2025-10-15T10:30:00',
      fechaPublicacion: '2025-10-16T14:20:00',
      categoria: 'Actividad Educativa',
      etiquetas: ['ciencias', 'proyecto', 'logro'],
      visibilidad: 'publico',
      uploadedBy: 'admin-1',
      uploadedByName: 'Ana Coordinadora',
      tamano: 2500000,
      metadata: { width: 1920, height: 1280, format: 'jpg' },
    },
    {
      id: 'entry-2',
      childId: 'child-1',
      tipo: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400',
      descripcion: 'María cantando en el festival cultural de la fundación. ¡Qué talento tiene!',
      fechaActividad: '2025-09-20T16:00:00',
      fechaPublicacion: '2025-09-21T09:00:00',
      categoria: 'Arte y Creatividad',
      etiquetas: ['música', 'evento', 'talento'],
      visibilidad: 'publico',
      uploadedBy: 'admin-1',
      uploadedByName: 'Ana Coordinadora',
      duracion: 45,
      tamano: 15000000,
      metadata: { width: 1280, height: 720, format: 'mp4' },
    },
    {
      id: 'entry-3',
      childId: 'child-1',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=400',
      descripcion: '¡Feliz cumpleaños María! Celebrando sus 9 años con todos sus compañeros de la fundación.',
      fechaActividad: '2025-03-15T15:00:00',
      fechaPublicacion: '2025-03-15T18:30:00',
      categoria: 'Evento Especial',
      etiquetas: ['cumpleaños', 'celebración'],
      visibilidad: 'publico',
      uploadedBy: 'admin-1',
      uploadedByName: 'Ana Coordinadora',
      tamano: 3200000,
    },
    {
      id: 'entry-4',
      childId: 'child-1',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400',
      descripcion: 'María leyendo en la biblioteca comunitaria. Ha leído más de 20 libros este año.',
      fechaActividad: '2025-08-10T11:00:00',
      fechaPublicacion: '2025-08-11T10:00:00',
      categoria: 'Actividad Educativa',
      etiquetas: ['lectura', 'biblioteca', 'educación'],
      visibilidad: 'publico',
      uploadedBy: 'admin-1',
      uploadedByName: 'Ana Coordinadora',
      tamano: 2800000,
    },
    {
      id: 'entry-5',
      childId: 'child-1',
      tipo: 'foto',
      url: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=800',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400',
      descripcion: 'Taller de pintura. María descubriendo su talento artístico.',
      fechaActividad: '2025-07-05T14:00:00',
      fechaPublicacion: '2025-07-06T09:00:00',
      categoria: 'Arte y Creatividad',
      etiquetas: ['arte', 'pintura', 'taller'],
      visibilidad: 'publico',
      uploadedBy: 'admin-1',
      uploadedByName: 'Ana Coordinadora',
      tamano: 3500000,
    },
  ],
};

// BitacoraProvider centraliza toda la lógica de Bitácoras:
// - childrenList: listado de niños gestionados en la sección de Bitácoras.
// - entries: mapa childId -> entradas (fotos/videos) con metadata rica.
// - Funciones CRUD simuladas (add/update/delete child/entry) y utilidades como getChildStats o generatePDF.
// Todo está mockeado en memoria pero pensado para reemplazar por API real sin cambiar componentes.
export function BitacoraProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [childrenList, setChildrenList] = useState<Child[]>(mockChildren);
  const [entries, setEntries] = useState<{ [childId: string]: BitacoraEntry[] }>(mockEntries);

  const getChildById = (id: string) => {
    return childrenList.find((child) => child.id === id);
  };

  const getChildEntries = (childId: string) => {
    return (entries[childId] || []).sort(
      (a, b) => new Date(b.fechaActividad).getTime() - new Date(a.fechaActividad).getTime()
    );
  };

  const getChildStats = (childId: string): BitacoraStats => {
    const childEntries = entries[childId] || [];
    const fotos = childEntries.filter((e) => e.tipo === 'foto').length;
    const videos = childEntries.filter((e) => e.tipo === 'video').length;
    
    const lastEntry = childEntries.sort(
      (a, b) => new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
    )[0];

    // Calculate months documented
    const uniqueMonths = new Set(
      childEntries.map((e) => {
        const date = new Date(e.fechaActividad);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    );

    // Entries per month
    const entradaPorMes: { [key: string]: number } = {};
    childEntries.forEach((entry) => {
      const date = new Date(entry.fechaActividad);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      entradaPorMes[key] = (entradaPorMes[key] || 0) + 1;
    });

    // Categories count
    const categorias: { [key: string]: number } = {};
    childEntries.forEach((entry) => {
      categorias[entry.categoria] = (categorias[entry.categoria] || 0) + 1;
    });

    return {
      totalFotos: fotos,
      totalVideos: videos,
      ultimaActualizacion: lastEntry?.fechaPublicacion || '',
      mesesDocumentados: uniqueMonths.size,
      entradaPorMes,
      categorias,
    };
  };

  const addChild = async (childData: Omit<Child, 'id' | 'fechaCreacion'>): Promise<Child> => {
    try {
      console.log('[BitacoraContext] addChild - Datos recibidos:', childData);
      
      // Convertir datos del formulario al formato de la API si es necesario
      // El formulario ya debería enviar en el formato correcto (CreateChildDTO)
      const dto = childData as any; // Ya viene en formato correcto desde ChildFormPage
      
      console.log('[BitacoraContext] addChild - Enviando a API:', dto);

      // Llamar al servicio de la API (sin userId, ya se maneja en el servicio con el token)
      const response = await apadrinamientoService.createChild(dto, 0);
      
      if (!response.success || !response.data) {
        console.error('[BitacoraContext] addChild - Error de API:', response.error);
        throw new Error(response.error?.message || 'Error al crear el niño');
      }

      console.log('[BitacoraContext] addChild - Respuesta de API:', response.data);

      // Convertir respuesta de la API al formato local para el estado
      const newChild: Child = {
        id: response.data.id.toString(),
        nombre: response.data.firstName,
        apellidos: response.data.lastName,
        edad: new Date().getFullYear() - new Date(response.data.dateOfBirth).getFullYear(),
        fechaNacimiento: response.data.dateOfBirth,
        genero: response.data.gender === 'MALE' ? 'masculino' : 'femenino',
        municipio: response.data.municipality,
        direccion: response.data.address || '',
        institucion: '',
        grado: '',
        jornada: 'mañana',
        foto: response.data.photo || '',
        historia: response.data.fullStory,
        suenos: '',
        situacionFamiliar: '',
        necesidades: response.data.needs || [],
        estadoApadrinamiento: 'disponible',
        fechaCreacion: new Date().toISOString(),
      };
      
      // Actualizar estado local
      setChildrenList((prev) => [...prev, newChild]);
      
      console.log('[BitacoraContext] addChild - Niño agregado al estado local:', newChild);
      toast.success('Niño registrado exitosamente');
      return newChild;
    } catch (error) {
      console.error('[BitacoraContext] addChild - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el niño');
      
      // Fallback a mock para desarrollo
      const newChild: Child = {
        ...childData,
        id: `child-${Date.now()}`,
        fechaCreacion: new Date().toISOString(),
      };
      setChildrenList((prev) => [...prev, newChild]);
      return newChild;
    }
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) throw new Error('Usuario no autenticado');

      const dto: any = { id: parseInt(id, 10), ...apadrinamientoService.convertToApiFormat(updates as any) };
      const response = await apadrinamientoService.updateChild(dto, userId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al actualizar el niño');
      }

      setChildrenList((prev) =>
        prev.map((child) => (child.id === id ? { ...child, ...updates } : child))
      );
      
      toast.success('Niño actualizado exitosamente');
    } catch (error) {
      console.error('Error updating child:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el niño');
      
      // Fallback
      setChildrenList((prev) =>
        prev.map((child) => (child.id === id ? { ...child, ...updates } : child))
      );
    }
  };

  const deleteChild = async (id: string) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) throw new Error('Usuario no autenticado');

      const response = await apadrinamientoService.deleteChild(parseInt(id, 10), userId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar el niño');
      }

      setChildrenList((prev) => prev.filter((child) => child.id !== id));
      setEntries((prev) => {
        const newEntries = { ...prev };
        delete newEntries[id];
        return newEntries;
      });
      
      toast.success('Niño eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el niño');
      
      // Fallback
      setChildrenList((prev) => prev.filter((child) => child.id !== id));
      setEntries((prev) => {
        const newEntries = { ...prev };
        delete newEntries[id];
        return newEntries;
      });
    }
  };

  const addEntry = async (entryData: Omit<BitacoraEntry, 'id' | 'fechaPublicacion' | 'uploadedBy' | 'uploadedByName'>) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) throw new Error('Usuario no autenticado');

      const dto = bitacoraService.convertEntryToApiFormat(entryData as any);
      const response = await bitacoraService.createEntry(dto, userId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear la entrada');
      }

      const newEntry = bitacoraService.convertEntryFromApiFormat(response.data);
      
      setEntries((prev) => ({
        ...prev,
        [entryData.childId]: [...(prev[entryData.childId] || []), newEntry],
      }));
      
      toast.success('Entrada creada exitosamente');
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la entrada');
      
      // Fallback
      const newEntry: BitacoraEntry = {
        ...entryData,
        id: `entry-${Date.now()}`,
        fechaPublicacion: new Date().toISOString(),
        uploadedBy: user?.id || 'admin-1',
        uploadedByName: user?.nombre || 'Admin',
      };

      setEntries((prev) => ({
        ...prev,
        [entryData.childId]: [...(prev[entryData.childId] || []), newEntry],
      }));
    }
  };

  const updateEntry = async (id: string, updates: Partial<BitacoraEntry>) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) throw new Error('Usuario no autenticado');

      const dto: any = { id: parseInt(id, 10), ...bitacoraService.convertEntryToApiFormat(updates as any) };
      const response = await bitacoraService.updateEntry(dto, userId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al actualizar la entrada');
      }

      setEntries((prev) => {
        const newEntries = { ...prev };
        Object.keys(newEntries).forEach((childId) => {
          newEntries[childId] = newEntries[childId].map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          );
        });
        return newEntries;
      });
      
      toast.success('Entrada actualizada exitosamente');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la entrada');
      
      // Fallback
      setEntries((prev) => {
        const newEntries = { ...prev };
        Object.keys(newEntries).forEach((childId) => {
          newEntries[childId] = newEntries[childId].map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          );
        });
        return newEntries;
      });
    }
  };

  const deleteEntry = async (id: string, reason: string) => {
    try {
      const userId = user?.id ? parseInt(user.id, 10) : 0;
      if (!userId) throw new Error('Usuario no autenticado');

      const response = await bitacoraService.deleteEntry(parseInt(id, 10), userId, reason);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Error al eliminar la entrada');
      }

      setEntries((prev) => {
        const newEntries = { ...prev };
        Object.keys(newEntries).forEach((childId) => {
          newEntries[childId] = newEntries[childId].filter((entry) => entry.id !== id);
        });
        return newEntries;
      });
      
      toast.success('Entrada eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la entrada');
      
      // Fallback
      setEntries((prev) => {
        const newEntries = { ...prev };
        Object.keys(newEntries).forEach((childId) => {
          newEntries[childId] = newEntries[childId].filter((entry) => entry.id !== id);
        });
        return newEntries;
      });
    }
  };

  const uploadFiles = async (files: File[], metadata: any): Promise<string[]> => {
    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // In real app, would upload to cloud storage and return URLs
    const urls = files.map((file) => {
      if (file.type.startsWith('image/')) {
        return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800';
      } else {
        return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      }
    });
    
    return urls;
  };

  const generatePDF = async (childId: string, options: any): Promise<Blob> => {
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // In real app, would call backend to generate PDF
    const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
    return blob;
  };

  const value: BitacoraContextType = {
    children: childrenList,
    bitacoraEntries: entries,
    getChildById,
    getChildEntries,
    getChildStats,
    addChild,
    updateChild,
    deleteChild,
    addEntry,
    updateEntry,
    deleteEntry,
    uploadFiles,
    generatePDF,
  };

  return <BitacoraContext.Provider value={value}>{children}</BitacoraContext.Provider>;
}

export function useBitacora() {
  const context = useContext(BitacoraContext);
  if (!context) {
    throw new Error('useBitacora must be used within BitacoraProvider');
  }
  return context;
}

