import React, { createContext, useContext, useState, ReactNode } from 'react';
import { donationsService } from '@/services/donations.service';
import { 
  CreateDonationDTO, 
  DonationResponse,
  CreateInKindDonationDTO,
  InKindDonationResponse
} from '@/types/api.types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Contexto central para toda la lógica de donaciones.
// Administra donaciones monetarias y en especie en memoria, incluyendo
// generación de IDs/transacciones, cálculo de totales y estadísticas por
// destino/mes, y reglas como la emisión de certificados tributarios.

// Types
export type DonationStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'reembolsada';
export type DonationType = 'monetaria' | 'especie';
export type PaymentMethod = 'pse' | 'transferencia' | 'efectivo' | 'cheque' | 'otro';
export type InKindStatus = 'solicitada' | 'coordinada' | 'recibida' | 'procesada';

export interface Donation {
  id: string;
  transactionId: string; // RF-035
  
  // Amount (RF-034, RF-035)
  amount: number;
  currency: string;
  
  // Donor (RF-035)
  donorId?: string; // If registered user
  donorName: string;
  donorIdType: string;
  donorIdNumber: string;
  donorEmail: string;
  donorPhone?: string;
  donorAddress?: string;
  donorCity?: string;
  donorCountry: string;
  isAnonymous: boolean;
  
  // Donation details (RF-035)
  destination?: string; // Program/project (RF-034)
  donationType: DonationType;
  isRecurring: boolean;
  
  // Payment (RF-034, RF-035)
  paymentMethod: PaymentMethod;
  pseReference?: string;
  pseBank?: string;
  pseResponse?: any;
  
  // Status (RF-035)
  status: DonationStatus;
  statusReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  
  // Documents (RF-034, RF-036)
  receiptUrl?: string; // RF-034
  certificateUrl?: string; // RF-036
  certificateNumber?: string;
  certificateGeneratedAt?: string;
  
  // Communication
  confirmationEmailSent: boolean;
  confirmationEmailSentAt?: string;
  
  // Admin
  registeredBy?: string; // If manual entry
  adminNotes?: string;
  
  // Meta
  createdAt: string; // RF-035
  updatedAt: string;
  ipAddress?: string;
}

export interface InKindDonation {
  id: string;
  
  // Donor info
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  
  // Donation details (RF-037)
  donationType: string;
  description: string;
  estimatedValue?: number;
  
  // Logistics
  requiresPickup: boolean;
  pickupAddress?: string;
  preferredDate?: string;
  
  // Status
  status: InKindStatus;
  
  // Communication
  comments?: string;
  internalNotes?: string;
  contactedAt?: string;
  receivedAt?: string;
  
  // Meta
  createdAt: string;
  processedBy?: string;
}

// Datos mock iniciales para pruebas rápidas (donaciones monetarias y en especie)
const MOCK_DONATIONS: Donation[] = [
  {
    id: 'donation-mock-1',
    transactionId: 'DON-202501-0001',
    amount: 150000,
    currency: 'COP',
    donorId: undefined,
    donorName: 'María Gómez',
    donorIdType: 'Cédula de Ciudadanía',
    donorIdNumber: '123456789',
    donorEmail: 'maria.gomez@example.com',
    donorPhone: '+57 300 123 4567',
    donorAddress: 'Calle 10 #5-20',
    donorCity: 'Armenia',
    donorCountry: 'Colombia',
    isAnonymous: false,
    destination: 'Educación',
    donationType: 'monetaria',
    isRecurring: false,
    paymentMethod: 'pse',
    pseReference: 'PSE-REF-001',
    pseBank: 'Bancolombia',
    pseResponse: undefined,
    status: 'aprobada',
    statusReason: undefined,
    approvedAt: '2025-01-10T10:00:00.000Z',
    rejectedAt: undefined,
    receiptUrl: undefined,
    certificateUrl: undefined,
    certificateNumber: 'CERT-2025-0001',
    certificateGeneratedAt: '2025-01-10T10:01:00.000Z',
    confirmationEmailSent: true,
    confirmationEmailSentAt: '2025-01-10T10:02:00.000Z',
    registeredBy: 'system',
    adminNotes: 'Donación de prueba',
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:02:00.000Z',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'donation-mock-2',
    transactionId: 'DON-202501-0002',
    amount: 80000,
    currency: 'COP',
    donorId: undefined,
    donorName: 'Juan Pérez',
    donorIdType: 'Cédula de Ciudadanía',
    donorIdNumber: '987654321',
    donorEmail: 'juan.perez@example.com',
    donorPhone: '+57 310 555 8899',
    donorAddress: 'Carrera 15 #8-30',
    donorCity: 'Armenia',
    donorCountry: 'Colombia',
    isAnonymous: false,
    destination: 'General',
    donationType: 'monetaria',
    isRecurring: false,
    paymentMethod: 'transferencia',
    pseReference: undefined,
    pseBank: undefined,
    pseResponse: undefined,
    status: 'aprobada',
    statusReason: undefined,
    approvedAt: '2025-01-08T14:30:00.000Z',
    rejectedAt: undefined,
    receiptUrl: undefined,
    certificateUrl: undefined,
    certificateNumber: 'CERT-2025-0002',
    certificateGeneratedAt: '2025-01-08T14:31:00.000Z',
    confirmationEmailSent: true,
    confirmationEmailSentAt: '2025-01-08T14:32:00.000Z',
    registeredBy: 'system',
    adminNotes: 'Donación recurrente simulada',
    createdAt: '2025-01-08T14:30:00.000Z',
    updatedAt: '2025-01-08T14:32:00.000Z',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'donation-mock-3',
    transactionId: 'DON-202412-0003',
    amount: 40000,
    currency: 'COP',
    donorId: undefined,
    donorName: 'Donante Anónimo',
    donorIdType: 'Cédula de Ciudadanía',
    donorIdNumber: '000000000',
    donorEmail: 'anonimo@example.com',
    donorPhone: undefined,
    donorAddress: undefined,
    donorCity: 'Armenia',
    donorCountry: 'Colombia',
    isAnonymous: true,
    destination: 'Salud y Nutrición',
    donationType: 'monetaria',
    isRecurring: false,
    paymentMethod: 'efectivo',
    pseReference: undefined,
    pseBank: undefined,
    pseResponse: undefined,
    status: 'aprobada',
    statusReason: undefined,
    approvedAt: '2024-12-20T09:15:00.000Z',
    rejectedAt: undefined,
    receiptUrl: undefined,
    certificateUrl: undefined,
    certificateNumber: undefined,
    certificateGeneratedAt: undefined,
    confirmationEmailSent: false,
    confirmationEmailSentAt: undefined,
    registeredBy: 'system',
    adminNotes: 'Donación en efectivo simulada',
    createdAt: '2024-12-20T09:15:00.000Z',
    updatedAt: '2024-12-20T09:15:00.000Z',
    ipAddress: '127.0.0.1',
  },
];

const MOCK_IN_KIND_DONATIONS: InKindDonation[] = [
  {
    id: 'inkind-mock-1',
    donorName: 'Lucía Ramírez',
    donorEmail: 'lucia.ramirez@example.com',
    donorPhone: '+57 311 222 3344',
    donationType: 'Útiles Escolares',
    description: '20 kits escolares completos para primaria',
    estimatedValue: 600000,
    requiresPickup: true,
    pickupAddress: 'Barrio Centro, Armenia',
    preferredDate: '2025-01-25',
    status: 'coordinada',
    comments: 'Disponibles en horario de oficina',
    internalNotes: 'Mock inicial para reportes',
    contactedAt: '2025-01-15T09:00:00.000Z',
    receivedAt: undefined,
    createdAt: '2025-01-10T08:00:00.000Z',
    processedBy: 'admin-mock',
  },
];

interface DonationsContextType {
  donations: Donation[];
  inKindDonations: InKindDonation[];
  
  // Monetary donations
  createDonation: (donation: CreateDonationDTO) => Promise<Donation>;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  getDonationById: (id: string) => Donation | undefined;
  getDonationByTransactionId: (transactionId: string) => Donation | undefined;
  getDonationsByDonor: (donorEmail: string) => Donation[];
  getDonationsByStatus: (status: DonationStatus) => Donation[];
  
  // In-kind donations (RF-037)
  createInKindDonation: (donation: Omit<InKindDonation, 'id' | 'createdAt' | 'status'>) => string;
  updateInKindDonation: (id: string, updates: Partial<InKindDonation>) => void;
  getInKindDonationById: (id: string) => InKindDonation | undefined;
  
  // Statistics
  getTotalDonated: (year?: number) => number;
  getDonationCount: (status?: DonationStatus) => number;
  getAverageDonation: () => number;
  getDonationsByMonth: (year: number) => { month: string; amount: number; count: number }[];
  getDonationsByDestination: () => { destination: string; amount: number; count: number }[];
  
  // Helpers
  generateTransactionId: () => string;
  needsCertificate: (amount: number) => boolean; // RF-036
}

const DonationsContext = createContext<DonationsContextType | undefined>(undefined);

export const DonationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [inKindDonations, setInKindDonations] = useState<InKindDonation[]>(MOCK_IN_KIND_DONATIONS);
  const { user } = useAuth();

  // ========== MAPPERS ==========
  
  /**
   * Mapear DonationResponse del backend a Donation del frontend
   */
  const mapDonationResponseToDonation = (response: DonationResponse): Donation => {
    return {
      id: response.id.toString(),
      transactionId: response.transactionId,
      amount: response.amount,
      currency: response.currency,
      donorId: response.donorId?.toString(),
      donorName: response.donorName,
      donorIdType: response.donorIdType,
      donorIdNumber: response.donorIdNumber,
      donorEmail: response.donorEmail,
      donorPhone: response.donorPhone,
      donorAddress: undefined,
      donorCity: undefined,
      donorCountry: response.donorCountry,
      isAnonymous: response.isAnonymous,
      destination: response.destination,
      donationType: 'monetaria',
      isRecurring: response.isRecurring,
      paymentMethod: response.paymentMethod as PaymentMethod,
      pseReference: response.pseReference,
      pseBank: response.pseBank,
      pseResponse: undefined,
      status: response.status as DonationStatus,
      statusReason: undefined,
      approvedAt: response.status === 'approved' ? response.updatedAt : undefined,
      rejectedAt: response.status === 'rejected' ? response.updatedAt : undefined,
      receiptUrl: response.receiptUrl,
      certificateUrl: response.certificateUrl,
      certificateNumber: undefined,
      certificateGeneratedAt: undefined,
      confirmationEmailSent: false,
      confirmationEmailSentAt: undefined,
      registeredBy: undefined,
      adminNotes: undefined,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      ipAddress: undefined,
    };
  };

  const generateTransactionId = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DON-${year}${month}-${random}`;
  };

  const needsCertificate = (amount: number): boolean => {
    return amount >= 50000; // RF-036: Certificate for donations >$50,000
  };

  const createDonation = async (dto: CreateDonationDTO): Promise<Donation> => {
    try {
      console.log('[DonationsContext] createDonation - DTO recibido:', dto);
      console.log('[DonationsContext] Tamaño del payload:', JSON.stringify(dto).length, 'bytes');

      // Llamar al servicio de la API
      const response = await donationsService.createMonetaryDonation(dto);
      
      if (!response.success || !response.data) {
        console.error('[DonationsContext] createDonation - Error de API:', response.error);
        throw new Error(response.error?.message || 'Error al crear la donación');
      }

      console.log('[DonationsContext] createDonation - Respuesta de API:', response.data);

      // Convertir respuesta de la API al formato local
      const newDonation = mapDonationResponseToDonation(response.data);
      
      // Actualizar estado local
      setDonations((prev) => [...prev, newDonation]);
      
      toast.success('Donación registrada exitosamente');
      return newDonation;
    } catch (error) {
      console.error('[DonationsContext] createDonation - Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la donación');
      
      // Fallback a mock para desarrollo
      const id = `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const newDonation: Donation = {
        id,
        transactionId: generateTransactionId(),
        amount: dto.amount,
        currency: dto.currency,
        donorName: dto.donorName,
        donorIdType: dto.donorIdType,
        donorIdNumber: dto.donorIdNumber,
        donorEmail: dto.donorEmail,
        donorPhone: dto.donorPhone,
        donorCountry: dto.donorCountry,
        isAnonymous: dto.isAnonymous,
        destination: dto.destination,
        donationType: 'monetaria',
        isRecurring: dto.isRecurring,
        paymentMethod: dto.paymentMethod,
        pseReference: dto.pseReference,
        pseBank: dto.pseBank,
        status: 'pendiente',
        confirmationEmailSent: false,
        createdAt: now,
        updatedAt: now,
      };
      
      setDonations((prev) => [...prev, newDonation]);
      return newDonation;
    }
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations(prev => prev.map(donation =>
      donation.id === id
        ? { ...donation, ...updates, updatedAt: new Date().toISOString() }
        : donation
    ));
  };

  const getDonationById = (id: string) => {
    return donations.find(d => d.id === id);
  };

  const getDonationByTransactionId = (transactionId: string) => {
    return donations.find(d => d.transactionId === transactionId);
  };

  const getDonationsByDonor = (donorEmail: string) => {
    return donations
      .filter(d => d.donorEmail.toLowerCase() === donorEmail.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getDonationsByStatus = (status: DonationStatus) => {
    return donations.filter(d => d.status === status);
  };

  const createInKindDonation = (donationData: Omit<InKindDonation, 'id' | 'createdAt' | 'status'>) => {
    const id = `inkind-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newDonation: InKindDonation = {
      ...donationData,
      id,
      status: 'solicitada',
      createdAt: now
    };

    setInKindDonations(prev => [...prev, newDonation]);
    return id;
  };

  const updateInKindDonation = (id: string, updates: Partial<InKindDonation>) => {
    setInKindDonations(prev => prev.map(donation =>
      donation.id === id
        ? { ...donation, ...updates }
        : donation
    ));
  };

  const getInKindDonationById = (id: string) => {
    return inKindDonations.find(d => d.id === id);
  };

  const getTotalDonated = (year?: number) => {
    let filtered = donations.filter(d => d.status === 'aprobada' && d.donationType === 'monetaria');
    
    if (year) {
      filtered = filtered.filter(d => new Date(d.createdAt).getFullYear() === year);
    }
    
    return filtered.reduce((sum, d) => sum + d.amount, 0);
  };

  const getDonationCount = (status?: DonationStatus) => {
    if (status) {
      return donations.filter(d => d.status === status).length;
    }
    return donations.length;
  };

  const getAverageDonation = () => {
    const approved = donations.filter(d => d.status === 'aprobada' && d.donationType === 'monetaria');
    if (approved.length === 0) return 0;
    return getTotalDonated() / approved.length;
  };

  const getDonationsByMonth = (year: number) => {
    const monthlyData: { [key: string]: { amount: number; count: number } } = {};
    
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    donations
      .filter(d => 
        d.status === 'aprobada' && 
        d.donationType === 'monetaria' && 
        new Date(d.createdAt).getFullYear() === year
      )
      .forEach(d => {
        const month = new Date(d.createdAt).getMonth();
        const monthKey = monthNames[month];
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        
        monthlyData[monthKey].amount += d.amount;
        monthlyData[monthKey].count += 1;
      });

    return monthNames.map(month => ({
      month,
      amount: monthlyData[month]?.amount || 0,
      count: monthlyData[month]?.count || 0
    }));
  };

  const getDonationsByDestination = () => {
    const destinationData: { [key: string]: { amount: number; count: number } } = {};
    
    donations
      .filter(d => d.status === 'aprobada' && d.donationType === 'monetaria')
      .forEach(d => {
        const dest = d.destination || 'General';
        
        if (!destinationData[dest]) {
          destinationData[dest] = { amount: 0, count: 0 };
        }
        
        destinationData[dest].amount += d.amount;
        destinationData[dest].count += 1;
      });

    return Object.entries(destinationData).map(([destination, data]) => ({
      destination,
      ...data
    }));
  };

  const value: DonationsContextType = {
    donations,
    inKindDonations,
    createDonation,
    updateDonation,
    getDonationById,
    getDonationByTransactionId,
    getDonationsByDonor,
    getDonationsByStatus,
    createInKindDonation,
    updateInKindDonation,
    getInKindDonationById,
    getTotalDonated,
    getDonationCount,
    getAverageDonation,
    getDonationsByMonth,
    getDonationsByDestination,
    generateTransactionId,
    needsCertificate
  };

  return (
    <DonationsContext.Provider value={value}>
      {children}
    </DonationsContext.Provider>
  );
};

export const useDonations = () => {
  const context = useContext(DonationsContext);
  if (context === undefined) {
    throw new Error('useDonations must be used within a DonationsProvider');
  }
  return context;
};

