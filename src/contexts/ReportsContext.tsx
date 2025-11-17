import React, { createContext, useContext, ReactNode } from 'react';
import { useSponsorship } from './SponsorshipContext';
import { useDonations } from './DonationsContext';
import { useVolunteering } from './VolunteeringContext';
import { useProjects } from './ProjectsContext';
import { useNews } from './NewsContext';

interface KPIData {
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: number[];
}

interface TimeSeriesData {
  date: string;
  value: number;
  count?: number;
}

interface DistributionData {
  label: string;
  value: number;
  count?: number;
  percentage?: number;
}

interface ReportsContextType {
  // KPIs
  getSponsorshipKPIs: (period?: string) => {
    totalSponsored: KPIData;
    newThisMonth: KPIData;
    retentionRate: KPIData;
    monthlyRevenue: KPIData;
    averageDuration: KPIData;
  };
  
  getDonationKPIs: (period?: string) => {
    totalAmount: KPIData;
    donationCount: KPIData;
    averageDonation: KPIData;
    uniqueDonors: KPIData;
    approvalRate: KPIData;
    certificatesGenerated: KPIData;
  };
  
  getVolunteerKPIs: (period?: string) => {
    activeVolunteers: KPIData;
    totalHours: KPIData;
    newApplications: KPIData;
    approvalRate: KPIData;
  };
  
  getProjectKPIs: (period?: string) => {
    activeProjects: KPIData;
    completedProjects: KPIData;
    totalBeneficiaries: KPIData;
    completionRate: KPIData;
  };
  
  // Time series
  getSponsorshipTimeSeries: (range: string) => TimeSeriesData[];
  getDonationTimeSeries: (range: string) => TimeSeriesData[];
  
  // Distributions
  getSponsorshipByLocation: () => DistributionData[];
  getSponsorshipByAge: () => DistributionData[];
  getDonationByMethod: () => DistributionData[];
  getDonationByProgram: () => DistributionData[];
  getVolunteerByArea: () => DistributionData[];
  
  // Comparisons
  comparePerformance: (metric: string, period1: string, period2: string) => {
    period1Value: number;
    period2Value: number;
    change: number;
    changePercentage: number;
  };
  
  // Export
  exportReport: (reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: any) => Promise<Blob>;
  
  // Activity feed
  getRecentActivity: (limit?: number) => Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: string;
  }>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// ReportsProvider agrega una capa de KPIs y reportes agregados sobre los demás contextos:
// - Calcula métricas de apadrinamientos, donaciones, voluntarios y proyectos (get*KPIs).
// - Expone series de tiempo y distribuciones para alimentar gráficos.
// - Genera un feed de actividad reciente para dashboards administrativos.
// Todo está basado en datos mock de otros providers, listo para conectar a backend real.
export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { sponsorships, children: sponsoredChildren } = useSponsorship();
  const { donations, inKindDonations } = useDonations();
  const { applications: volunteerApplications } = useVolunteering();
  const { projects } = useProjects();
  const { articles } = useNews();

  const getSponsorshipKPIs = (period = 'month') => {
    const now = new Date();
    const sponsorshipsData = sponsorships || [];
    const activeSponsors = sponsorshipsData.filter(s => s.estado === 'activo');
    
    // Calculate new sponsorships this month
    const thisMonthSponsors = sponsorshipsData.filter(s => {
      const createdDate = new Date(s.fechaInicio);
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    });
    
    // Calculate previous month for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSponsors = sponsorshipsData.filter(s => {
      const createdDate = new Date(s.fechaInicio);
      return createdDate.getMonth() === lastMonth.getMonth() && 
             createdDate.getFullYear() === lastMonth.getFullYear();
    });
    
    const newChange = thisMonthSponsors.length - lastMonthSponsors.length;
    
    // Retention rate
    const totalSponsors = sponsorshipsData.length;
    const inactiveSponsors = sponsorshipsData.filter(s => s.estado !== 'activo').length;
    const retentionRate = totalSponsors > 0 ? ((totalSponsors - inactiveSponsors) / totalSponsors * 100) : 0;
    
    // Monthly revenue (assuming $125,000 per sponsorship)
    const monthlyRevenue = activeSponsors.length * 125000;
    
    // Average duration
    const avgDuration = activeSponsors.reduce((sum, s) => {
      const start = new Date(s.fechaInicio);
      const months = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return sum + months;
    }, 0) / (activeSponsors.length || 1);

    return {
      totalSponsored: {
        value: activeSponsors.length,
        change: newChange,
        changeType: newChange >= 0 ? 'increase' : 'decrease'
      },
      newThisMonth: {
        value: thisMonthSponsors.length,
        change: newChange,
        changeType: newChange >= 0 ? 'increase' : 'decrease'
      },
      retentionRate: {
        value: `${retentionRate.toFixed(1)}%`,
        change: 2,
        changeType: 'increase'
      },
      monthlyRevenue: {
        value: monthlyRevenue,
        change: newChange * 125000,
        changeType: newChange >= 0 ? 'increase' : 'decrease'
      },
      averageDuration: {
        value: `${avgDuration.toFixed(1)} meses`,
        change: 0.2,
        changeType: 'increase'
      }
    };
  };

  const getDonationKPIs = (period = 'month') => {
    const now = new Date();
    const donationsData = donations || [];
    const thisMonthDonations = donationsData.filter(d => {
      const createdDate = new Date(d.createdAt);
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear() &&
             d.status === 'aprobada';
    });
    
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthDonations = donationsData.filter(d => {
      const createdDate = new Date(d.createdAt);
      return createdDate.getMonth() === lastMonth.getMonth() && 
             createdDate.getFullYear() === lastMonth.getFullYear() &&
             d.status === 'aprobada';
    });
    
    const thisMonthTotal = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);
    const lastMonthTotal = lastMonthDonations.reduce((sum, d) => sum + d.amount, 0);
    const totalChange = thisMonthTotal - lastMonthTotal;
    const percentageChange = lastMonthTotal > 0 ? (totalChange / lastMonthTotal * 100) : 0;
    
    const avgDonation = thisMonthDonations.length > 0 ? thisMonthTotal / thisMonthDonations.length : 0;
    const uniqueDonors = new Set(thisMonthDonations.map(d => d.donorEmail)).size;
    
    const approved = donationsData.filter(d => d.status === 'aprobada').length;
    const approvalRate = donationsData.length > 0 ? (approved / donationsData.length * 100) : 0;
    
    const certificates = donationsData.filter(d => d.status === 'aprobada' && d.amount >= 50000).length;

    return {
      totalAmount: {
        value: thisMonthTotal,
        change: percentageChange,
        changeType: totalChange >= 0 ? 'increase' : 'decrease'
      },
      donationCount: {
        value: thisMonthDonations.length,
        change: thisMonthDonations.length - lastMonthDonations.length,
        changeType: thisMonthDonations.length >= lastMonthDonations.length ? 'increase' : 'decrease'
      },
      averageDonation: {
        value: avgDonation,
        change: 0,
        changeType: 'increase'
      },
      uniqueDonors: {
        value: uniqueDonors,
        change: 0,
        changeType: 'increase'
      },
      approvalRate: {
        value: `${approvalRate.toFixed(1)}%`,
        change: 0,
        changeType: 'increase'
      },
      certificatesGenerated: {
        value: certificates,
        change: 0,
        changeType: 'increase'
      }
    };
  };

  const getVolunteerKPIs = (period = 'month') => {
    const volunteers = volunteerApplications || [];
    const activeVols = volunteers.filter(v => v.status === 'aprobado' || v.status === 'activo');
    const pending = volunteers.filter(v => v.status === 'pendiente_revision' || v.status === 'en_revision');
    const approved = volunteers.filter(v => v.status === 'aprobado' || v.status === 'activo').length;
    const approvalRate = volunteers.length > 0 ? (approved / volunteers.length * 100) : 0;
    
    // Simulate total hours (would come from actual tracking)
    const totalHours = activeVols.length * 15; // Avg 15 hours per volunteer

    return {
      activeVolunteers: {
        value: activeVols.length,
        change: 5,
        changeType: 'increase'
      },
      totalHours: {
        value: totalHours,
        change: 50,
        changeType: 'increase'
      },
      newApplications: {
        value: pending.length,
        change: 2,
        changeType: 'increase'
      },
      approvalRate: {
        value: `${approvalRate.toFixed(1)}%`,
        change: 0,
        changeType: 'increase'
      }
    };
  };

  const getProjectKPIs = (period = 'month') => {
    const projectsData = projects || [];
    const active = projectsData.filter(p => p.status === 'activo');
    const completed = projectsData.filter(p => p.status === 'finalizado');
    const total = projectsData.length;
    const completionRate = total > 0 ? (completed.length / total * 100) : 0;
    
    const totalBeneficiaries = projectsData.reduce((sum, p) => sum + (p.volunteersRegistered || 0), 0);

    return {
      activeProjects: {
        value: active.length,
        change: 1,
        changeType: 'increase'
      },
      completedProjects: {
        value: completed.length,
        change: 2,
        changeType: 'increase'
      },
      totalBeneficiaries: {
        value: totalBeneficiaries,
        change: 15,
        changeType: 'increase'
      },
      completionRate: {
        value: `${completionRate.toFixed(1)}%`,
        change: 5,
        changeType: 'increase'
      }
    };
  };

  const getSponsorshipTimeSeries = (range: string): TimeSeriesData[] => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data: TimeSeriesData[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthSponsors = sponsorships.filter(s => {
        const date = new Date(s.fechaInicio);
        return date.getMonth() === i;
      });
      
      data.push({
        date: months[i],
        value: monthSponsors.length,
        count: monthSponsors.length
      });
    }
    
    return data;
  };

  const getDonationTimeSeries = (range: string): TimeSeriesData[] => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data: TimeSeriesData[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDonations = donations.filter(d => {
        const date = new Date(d.createdAt);
        return date.getMonth() === i && d.status === 'aprobada';
      });
      
      const total = monthDonations.reduce((sum, d) => sum + d.amount, 0);
      
      data.push({
        date: months[i],
        value: total,
        count: monthDonations.length
      });
    }
    
    return data;
  };

  const getSponsorshipByLocation = (): DistributionData[] => {
    const locationMap: { [key: string]: number } = {};
    const childrenData = sponsoredChildren || [];
    
    childrenData.forEach(child => {
      const loc = child.municipio || 'Desconocido';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });
    
    const total = childrenData.length;
    
    return Object.entries(locationMap)
      .map(([label, value]) => ({
        label,
        value,
        count: value,
        percentage: total > 0 ? (value / total * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getSponsorshipByAge = (): DistributionData[] => {
    const ageRanges = [
      { label: '5-6 años', min: 5, max: 6 },
      { label: '7-9 años', min: 7, max: 9 },
      { label: '10-12 años', min: 10, max: 12 },
      { label: '13-15 años', min: 13, max: 15 },
      { label: '16-18 años', min: 16, max: 18 }
    ];
    
    return ageRanges.map(range => {
      const count = sponsoredChildren.filter(child => {
        const age = child.edad;
        return age >= range.min && age <= range.max;
      }).length;
      
      return {
        label: range.label,
        value: count,
        count,
        percentage: sponsoredChildren.length > 0 ? (count / sponsoredChildren.length * 100) : 0
      };
    });
  };

  const getDonationByMethod = (): DistributionData[] => {
    const methodMap: { [key: string]: { count: number; amount: number } } = {};
    
    donations.filter(d => d.status === 'aprobada').forEach(donation => {
      const method = donation.paymentMethod.toUpperCase();
      if (!methodMap[method]) {
        methodMap[method] = { count: 0, amount: 0 };
      }
      methodMap[method].count++;
      methodMap[method].amount += donation.amount;
    });
    
    const totalAmount = Object.values(methodMap).reduce((sum, m) => sum + m.amount, 0);
    
    return Object.entries(methodMap)
      .map(([label, data]) => ({
        label,
        value: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getDonationByProgram = (): DistributionData[] => {
    const programMap: { [key: string]: { count: number; amount: number } } = {};
    
    donations.filter(d => d.status === 'aprobada').forEach(donation => {
      const program = donation.destination || 'General';
      if (!programMap[program]) {
        programMap[program] = { count: 0, amount: 0 };
      }
      programMap[program].count++;
      programMap[program].amount += donation.amount;
    });
    
    const totalAmount = Object.values(programMap).reduce((sum, m) => sum + m.amount, 0);
    
    return Object.entries(programMap)
      .map(([label, data]) => ({
        label,
        value: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getVolunteerByArea = (): DistributionData[] => {
    const volunteers = volunteerApplications || [];
    const areaMap: { [key: string]: number } = {};
    
    volunteers.filter(v => v.status === 'aprobado' || v.status === 'activo').forEach(volunteer => {
      // Volunteers can have multiple areas of interest
      if (volunteer.areasInteres && volunteer.areasInteres.length > 0) {
        volunteer.areasInteres.forEach(area => {
          areaMap[area] = (areaMap[area] || 0) + 1;
        });
      } else {
        areaMap['General'] = (areaMap['General'] || 0) + 1;
      }
    });
    
    const total = volunteers.filter(v => v.status === 'aprobado' || v.status === 'activo').length;
    
    return Object.entries(areaMap)
      .map(([label, value]) => ({
        label,
        value,
        count: value,
        percentage: total > 0 ? (value / total * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  };

  const comparePerformance = (metric: string, period1: string, period2: string) => {
    // Simplified comparison - would be more sophisticated in real implementation
    return {
      period1Value: 100,
      period2Value: 120,
      change: 20,
      changePercentage: 20
    };
  };

  const exportReport = async (reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: any): Promise<Blob> => {
    // Simulated export - would generate actual files in real implementation
    const data = `Report: ${reportType}\nFormat: ${format}\nGenerated: ${new Date().toISOString()}`;
    return new Blob([data], { type: 'text/plain' });
  };

  const getRecentActivity = (limit = 20) => {
    const activities: Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
      icon: string;
    }> = [];
    
    // Recent donations
    donations
      .slice(0, 5)
      .forEach(d => {
        activities.push({
          id: `donation-${d.id}`,
          type: 'donation',
          message: `Nueva donación de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(d.amount)} por ${d.isAnonymous ? 'Anónimo' : d.donorName}`,
          timestamp: d.createdAt,
          icon: '🎉'
        });
      });
    
    // Recent sponsorships
    sponsorships
      .slice(0, 3)
      .forEach(s => {
        const sponsorName = (s as any).nombrePadrino || 'Nuevo padrino';
        activities.push({
          id: `sponsorship-${s.id}`,
          type: 'sponsorship',
          message: `Nuevo apadrinamiento: ${sponsorName}`,
          timestamp: s.fechaInicio,
          icon: '💝'
        });
      });
    
    // Recent volunteers
    const volunteers = volunteerApplications || [];
    volunteers
      .filter(v => v.status === 'pendiente_revision' || v.status === 'en_revision')
      .slice(0, 3)
      .forEach(v => {
        activities.push({
          id: `volunteer-${v.id}`,
          type: 'volunteer',
          message: `Nueva solicitud de voluntario: ${v.nombreCompleto}`,
          timestamp: v.fechaSolicitud,
          icon: '🙋'
        });
      });
    
    // Recent news
    articles
      .slice(0, 2)
      .forEach(a => {
        const title = (a as any).titulo || (a as any).title || 'Nueva noticia';
        const publishedAt = (a as any).fechaPublicacion || (a as any).publishedAt || new Date().toISOString();
        activities.push({
          id: `news-${a.id}`,
          type: 'news',
          message: `Nueva noticia publicada: "${title}"`,
          timestamp: publishedAt,
          icon: '📰'
        });
      });
    
    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  const value: ReportsContextType = {
    getSponsorshipKPIs: getSponsorshipKPIs as ReportsContextType['getSponsorshipKPIs'],
    getDonationKPIs: getDonationKPIs as ReportsContextType['getDonationKPIs'],
    getVolunteerKPIs: getVolunteerKPIs as ReportsContextType['getVolunteerKPIs'],
    getProjectKPIs: getProjectKPIs as ReportsContextType['getProjectKPIs'],
    getSponsorshipTimeSeries,
    getDonationTimeSeries,
    getSponsorshipByLocation,
    getSponsorshipByAge,
    getDonationByMethod,
    getDonationByProgram,
    getVolunteerByArea,
    comparePerformance,
    exportReport,
    getRecentActivity
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

