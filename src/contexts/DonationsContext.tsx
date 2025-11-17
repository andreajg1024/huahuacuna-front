import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface DonationsContextType {
  donations: Donation[];
  inKindDonations: InKindDonation[];
  
  // Monetary donations
  createDonation: (donation: Omit<Donation, 'id' | 'transactionId' | 'createdAt' | 'updatedAt' | 'confirmationEmailSent'>) => string;
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
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inKindDonations, setInKindDonations] = useState<InKindDonation[]>([]);

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

  const createDonation = (donationData: Omit<Donation, 'id' | 'transactionId' | 'createdAt' | 'updatedAt' | 'confirmationEmailSent'>) => {
    const id = `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transactionId = generateTransactionId();
    const now = new Date().toISOString();
    
    const newDonation: Donation = {
      ...donationData,
      id,
      transactionId,
      createdAt: now,
      updatedAt: now,
      confirmationEmailSent: false
    };

    setDonations(prev => [...prev, newDonation]);
    return id;
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
