import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Search, Download, DollarSign, TrendingUp, CheckCircle2, Clock,
  FileText, AlertCircle, Eye
} from 'lucide-react';
import { useDonations, type DonationStatus } from '../../contexts/DonationsContext';

// Módulo interno para administrar todas las donaciones.
// Ofrece estadísticas mensuales, filtros por estado y búsqueda, pestañas por
// tipo de estado y exportación a CSV; se apoya completamente en DonationsContext
// para consultar y resumir el listado de donaciones en memoria.

interface AdminDonationsManagementProps {
  onNavigate?: (page: string) => void;
}

export const AdminDonationsManagement: React.FC<AdminDonationsManagementProps> = ({ onNavigate }) => {
  const { donations, getDonationCount, getTotalDonated, getDonationsByStatus } = useDonations();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'all' | DonationStatus>('all');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesTab = currentTab === 'all' || donation.status === currentTab;
    const matchesSearch = !searchQuery || 
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Calculate stats (RF-039)
  const stats = {
    totalMonth: donations
      .filter(d => 
        d.status === 'aprobada' && 
        new Date(d.createdAt).getMonth() === currentMonth &&
        new Date(d.createdAt).getFullYear() === currentYear
      )
      .reduce((sum, d) => sum + d.amount, 0),
    countMonth: donations.filter(d => 
      d.status === 'aprobada' && 
      new Date(d.createdAt).getMonth() === currentMonth &&
      new Date(d.createdAt).getFullYear() === currentYear
    ).length,
    approved: getDonationCount('aprobada'),
    pending: getDonationCount('pendiente'),
    rejected: getDonationCount('rechazada'),
    successRate: donations.length > 0 
      ? Math.round((getDonationCount('aprobada') / donations.length) * 100) 
      : 0
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: DonationStatus) => {
    const config = {
      aprobada: { label: 'Aprobada', className: 'bg-green-100 text-green-800' },
      pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      rechazada: { label: 'Rechazada', className: 'bg-red-100 text-red-800' },
      cancelada: { label: 'Cancelada', className: 'bg-gray-100 text-gray-800' },
      reembolsada: { label: 'Reembolsada', className: 'bg-purple-100 text-purple-800' }
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const handleExport = () => {
    const csvContent = [
      ['Transacción', 'Fecha', 'Donante', 'Email', 'Monto', 'Destino', 'Estado'].join(','),
      ...filteredDonations.map(d => [
        d.transactionId,
        formatDate(d.createdAt),
        `"${d.donorName}"`,
        d.donorEmail,
        d.amount,
        d.destination || 'General',
        d.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="mb-2 text-sm text-gray-600 hover:text-amber-600"
          >
            ← Volver al panel
          </button>
          <div>
            <h1 className="text-3xl mb-2">Gestión de Donaciones</h1>
            <p className="text-gray-600">Administra y monitorea todas las donaciones</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Stats Dashboard (RF-039) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Este Mes</span>
                <DollarSign className="w-8 h-8 text-[#4A9D5F]" />
              </div>
              <p className="text-3xl mb-1">{formatCurrency(stats.totalMonth)}</p>
              <p className="text-sm text-gray-500">{stats.countMonth} donaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Aprobadas</span>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl mb-1">{stats.approved}</p>
              <p className="text-sm text-gray-500">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Pendientes</span>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-3xl mb-1">{stats.pending}</p>
              <p className="text-sm text-gray-500">Requieren verificación</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tasa de Éxito</span>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl mb-1">{stats.successRate}%</p>
              <p className="text-sm text-gray-500">Aprobadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por donante, email o transacción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todas ({donations.length})</TabsTrigger>
            <TabsTrigger value="aprobada">Aprobadas ({stats.approved})</TabsTrigger>
            <TabsTrigger value="pendiente">
              Pendientes ({stats.pending})
              {stats.pending > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">{stats.pending}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rechazada">Rechazadas ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab}>
            {filteredDonations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl mb-2">No hay donaciones</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'No se encontraron resultados' : 'Las donaciones aparecerán aquí'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transacción</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Donante</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Certificado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.map(donation => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-mono text-sm">
                            {donation.transactionId}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(donation.createdAt)}
                          </TableCell>
                          <TableCell>{donation.donorName}</TableCell>
                          <TableCell className="text-sm">{donation.donorEmail}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(donation.amount)}
                          </TableCell>
                          <TableCell>{donation.destination || 'General'}</TableCell>
                          <TableCell className="text-sm uppercase">{donation.paymentMethod}</TableCell>
                          <TableCell>{getStatusBadge(donation.status)}</TableCell>
                          <TableCell>
                            {donation.status === 'aprobada' && donation.amount >= 50000 ? (
                              <Badge className="bg-green-100 text-green-800">Sí</Badge>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Pending Alert */}
        {stats.pending > 0 && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.pending} donación{stats.pending !== 1 ? 'es' : ''} pendiente{stats.pending !== 1 ? 's' : ''} de verificación
                  </p>
                  <p className="text-sm text-yellow-700">
                    Revisa las transacciones pendientes con PSE
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

