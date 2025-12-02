import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../ui/table';
import { 
  Download, Calendar, DollarSign, TrendingUp, Heart,
  FileText, Award
} from 'lucide-react';
import { useDonations } from '../../contexts/DonationsContext';
import { useAuth } from '../../contexts/AuthContext';

// Panel privado del donante con su historial de aportes.
// Muestra métricas personales (total donado, número de donaciones, nivel),
// filtros por fecha y buscador por transacción, además de la tabla con cada
// donación y accesos simulados a recibos y certificados tributarios.

interface DonorDashboardProps {
  onNavigate?: (page: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { getDonationsByDonor, getTotalDonated, needsCertificate } = useDonations();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const userDonations = user ? getDonationsByDonor(user.email) : [];
  const currentYear = new Date().getFullYear();
  const totalDonatedThisYear = getTotalDonated(currentYear);

  // Filter donations
  const filteredDonations = userDonations.filter(donation => {
    const matchesSearch = !searchQuery || 
      donation.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (dateRange === 'all') return matchesSearch;
    
    const donationDate = new Date(donation.createdAt);
    const now = new Date();
    
    if (dateRange === 'thisYear') {
      return matchesSearch && donationDate.getFullYear() === now.getFullYear();
    }
    
    if (dateRange === 'lastYear') {
      return matchesSearch && donationDate.getFullYear() === now.getFullYear() - 1;
    }
    
    return matchesSearch;
  });

  const stats = {
    total: userDonations.filter(d => d.status === 'aprobada').reduce((sum, d) => sum + d.amount, 0),
    count: userDonations.filter(d => d.status === 'aprobada').length,
    lastDonation: userDonations[0]?.createdAt,
    level: userDonations.reduce((sum, d) => sum + (d.status === 'aprobada' ? d.amount : 0), 0)
  };

  const getDonorLevel = (total: number) => {
    if (total >= 5000000) return { name: 'Oro', color: 'bg-yellow-100 text-yellow-800' };
    if (total >= 2000000) return { name: 'Plata', color: 'bg-gray-100 text-gray-800' };
    if (total >= 500000) return { name: 'Bronce', color: 'bg-orange-100 text-orange-800' };
    return { name: 'Donante', color: 'bg-blue-100 text-blue-800' };
  };

  const level = getDonorLevel(stats.level);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      aprobada: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
      pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[status] || config.pendiente;
    return <Badge className={className}>{label}</Badge>;
  };

  const handleDownloadReceipt = (donationId: string) => {
    alert(`Descargando recibo para donación ${donationId}... (función simulada)`);
  };

  const handleDownloadCertificate = (donationId: string) => {
    alert(`Descargando certificado para donación ${donationId}... (función simulada)`);
  };

  return (
    <div className="p-6">
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="mb-4 text-sm text-gray-600 hover:text-amber-600"
      >
        ← Volver al panel
      </button>
      <div className="mb-6">
          <h1 className="text-3xl mb-2">Mis Donaciones</h1>
          <p className="text-gray-600">Gracias por tu generosidad</p>
        </div>

        {/* Summary Cards (RF-038) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Donado</span>
                <DollarSign className="w-5 h-5 text-[#4A9D5F]" />
              </div>
              <p className="text-3xl mb-1">{formatCurrency(stats.total)}</p>
              <p className="text-xs text-gray-500">Histórico</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Donaciones</span>
                <Heart className="w-5 h-5 text-[#4A9D5F]" />
              </div>
              <p className="text-3xl mb-1">{stats.count}</p>
              <p className="text-xs text-gray-500">Total realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Última Donación</span>
                <Calendar className="w-5 h-5 text-[#4A9D5F]" />
              </div>
              <p className="text-lg mb-1">
                {stats.lastDonation ? formatDate(stats.lastDonation) : '-'}
              </p>
              <p className="text-xs text-gray-500">Fecha</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Nivel</span>
                <Award className="w-5 h-5 text-[#4A9D5F]" />
              </div>
              <Badge className={level.color + ' text-lg px-3 py-1'}>
                {level.name}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Por tu contribución</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters (RF-038) */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por transacción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">Todas las fechas</option>
                  <option value="thisYear">Este año</option>
                  <option value="lastYear">Año anterior</option>
                </select>
              </div>
              <div>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Historial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table (RF-038) */}
        {filteredDonations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl mb-2">Aún no has realizado donaciones</h3>
              <p className="text-gray-600 mb-4">
                Tu primera donación puede cambiar vidas
              </p>
              <Button className="bg-[#4A9D5F] hover:bg-[#3B7D4D]">
                Haz tu Primera Donación
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Transacción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Certificado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map(donation => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.createdAt)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {donation.transactionId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell>{donation.destination || 'General'}</TableCell>
                      <TableCell>{getStatusBadge(donation.status)}</TableCell>
                      <TableCell>
                        {donation.status === 'aprobada' && needsCertificate(donation.amount) ? (
                          <Badge className="bg-green-100 text-green-800">
                            Disponible
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(donation.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {donation.status === 'aprobada' && needsCertificate(donation.amount) && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleDownloadCertificate(donation.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Impact Statement (RF-038) */}
        {stats.total > 0 && (
          <Card className="mt-6 bg-gradient-to-br from-[#4A9D5F] to-[#3B7D4D] text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl mb-4">Tu Impacto</h2>
              <p className="text-lg mb-4">
                Con tus {formatCurrency(stats.total)} en donaciones, has ayudado a transformar vidas
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl mb-1">🍎</p>
                  <p className="text-sm">Alimentación</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl mb-1">📚</p>
                  <p className="text-sm">Educación</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl mb-1">❤️</p>
                  <p className="text-sm">Esperanza</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

