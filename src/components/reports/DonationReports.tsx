import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import {
  Download, Filter, DollarSign, TrendingUp, Users, Award,
  CheckCircle2, PieChart as PieChartIcon, Home
} from 'lucide-react';
import { useReports } from '../../contexts/ReportsContext';
import { useDonations } from '../../contexts/DonationsContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';

// Reportes financieros de donaciones monetarias.
// Muestra indicadores clave, evolución mensual, desglose por método de pago
// y programa, ranking de donantes y panel de filtros para explorar el
// comportamiento de las donaciones usando datos de ReportsContext y DonationsContext.

interface DonationReportsProps {
  onNavigate?: (page: string) => void;
}

export const DonationReports: React.FC<DonationReportsProps> = ({ onNavigate }) => {
  const {
    getDonationKPIs,
    getDonationTimeSeries,
    getDonationByMethod,
    getDonationByProgram
  } = useReports();

  const { user } = useAuth();
  const { donations, inKindDonations } = useDonations();

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    method: 'all',
    minAmount: '',
    maxAmount: '',
    program: 'all',
    status: 'all'
  });

  const kpis = getDonationKPIs();
  const timeSeries = getDonationTimeSeries('12months');
  const byMethod = getDonationByMethod();
  const byProgram = getDonationByProgram();

  const role = user?.role;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin';

  // Aplicar filtros a donaciones monetarias
  const filteredMonetaryDonations = donations.filter((d) => {
    // Fechas
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      const donationDate = new Date(d.createdAt);
      if (donationDate < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      const donationDate = new Date(d.createdAt);
      // incluir el día completo
      to.setHours(23, 59, 59, 999);
      if (donationDate > to) return false;
    }

    // Método de pago
    if (filters.method !== 'all' && d.paymentMethod !== filters.method) {
      return false;
    }

    // Programa / destino
    if (filters.program !== 'all') {
      const dest = d.destination || 'General';
      if (dest !== filters.program) return false;
    }

    // Estado
    if (filters.status !== 'all' && d.status !== filters.status) {
      return false;
    }

    return true;
  });

  // Donaciones en especie filtradas por rango de fechas
  const filteredInKindDonations = inKindDonations.filter((d) => {
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      const donationDate = new Date(d.createdAt);
      if (donationDate < from) return false;
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      const donationDate = new Date(d.createdAt);
      to.setHours(23, 59, 59, 999);
      if (donationDate > to) return false;
    }

    return true;
  });

  const totalMonetaryAmount = filteredMonetaryDonations
    .filter((d) => d.donationType === 'monetaria' && d.status === 'aprobada')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalInKindCount = filteredInKindDonations.length;

  // Agrupar donaciones por donante para tabla y CSV
  type DonorAggregate = {
    name: string;
    email: string;
    phone?: string;
    total: number;
    monetaryCount: number;
    inKindCount: number;
    lastDonation: string;
  };

  const inKindByEmail: Record<string, number> = filteredInKindDonations.reduce((acc, d) => {
    const email = d.donorEmail.toLowerCase();
    acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donorAggregates: DonorAggregate[] = filteredMonetaryDonations
    .filter((d) => d.status === 'aprobada')
    .reduce((acc: DonorAggregate[], d) => {
      const emailKey = d.donorEmail.toLowerCase();
      const existing = acc.find((item) => item.email.toLowerCase() === emailKey);

      if (existing) {
        existing.total += d.amount;
        existing.monetaryCount += 1;
        if (new Date(d.createdAt) > new Date(existing.lastDonation)) {
          existing.lastDonation = d.createdAt;
        }
      } else {
        acc.push({
          name: d.donorName,
          email: d.donorEmail,
          phone: d.donorPhone,
          total: d.amount,
          monetaryCount: 1,
          inKindCount: inKindByEmail[emailKey] || 0,
          lastDonation: d.createdAt,
        });
      }

      return acc;
    }, [])
    .sort((a, b) => b.total - a.total);

  const topDonors = donorAggregates.slice(0, 10);

  // Amount distribution
  const amountDistribution = [
    { range: '$10K-50K', value: 125, count: 15 },
    { range: '$50K-100K', value: 230, count: 28 },
    { range: '$100K-250K', value: 450, count: 42 },
    { range: '$250K-500K', value: 280, count: 18 },
    { range: '$500K+', value: 180, count: 12 }
  ];


  const COLORS = ['#4A9D5F', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleExportPDF = () => {
    alert('Exportando reporte a PDF... (función simulada)');
  };

  const handleExportCSV = () => {
    if (donorAggregates.length === 0) {
      alert('No hay datos para exportar con los filtros actuales.');
      return;
    }

    const isPrivileged = isSuperAdmin;

    const headers = isPrivileged
      ? ['Nombre', 'Email', 'Teléfono', 'TotalDonadoCOP', 'DonacionesMonetarias', 'DonacionesEspecie', 'UltimaDonacion']
      : ['Nombre', 'TotalDonadoCOP', 'DonacionesMonetarias', 'DonacionesEspecie', 'UltimaDonacion'];

    const escapeCsv = (value: string | number | undefined) => {
      const str = value == null ? '' : String(value);
      const needsQuotes = /[",\n;]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const rows = donorAggregates.map((donor) => {
      const baseValues = [
        donor.name,
        formatCurrency(donor.total),
        donor.monetaryCount,
        donor.inKindCount,
        new Date(donor.lastDonation).toLocaleDateString('es-CO'),
      ];

      if (isPrivileged) {
        return [
          donor.name,
          donor.email,
          donor.phone || '',
          formatCurrency(donor.total),
          donor.monetaryCount,
          donor.inKindCount,
          new Date(donor.lastDonation).toLocaleDateString('es-CO'),
        ].map(escapeCsv);
      }

      return baseValues.map(escapeCsv);
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_donantes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button 
                  onClick={() => onNavigate?.('dashboard')}
                  className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reportes de Donaciones</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Reportes de Donaciones</h1>
            <p className="text-gray-600">Análisis financiero de donaciones recibidas</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filter Panel (RF-042) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="dateFrom">Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dateTo">Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="method">Método (RF-042)</Label>
                <select
                  id="method"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.method}
                  onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                >
                  <option value="all">Todos</option>
                  <option value="pse">PSE</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>

              <div>
                <Label htmlFor="program">Programa (RF-042)</Label>
                <select
                  id="program"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.program}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                >
                  <option value="all">Todos</option>
                  <option value="General">General</option>
                  <option value="Educación">Educación</option>
                  <option value="Salud">Salud</option>
                  <option value="Alimentación">Alimentación</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">Todos</option>
                  <option value="aprobada">Aprobadas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="rechazada">Rechazadas</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-[#4A9D5F] hover:bg-[#3B7D4D]">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Metrics (RF-042 - Totales por período) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">
                  +{kpis.totalAmount.change?.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-3xl mb-1">{formatCurrency(Number(kpis.totalAmount.value))}</p>
              <p className="text-sm text-gray-600">Total Recaudado Este Mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.donationCount.value}</p>
              <p className="text-sm text-gray-600">Donaciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <PieChartIcon className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl mb-1">{formatCurrency(Number(kpis.averageDonation.value))}</p>
              <p className="text-sm text-gray-600">Promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.uniqueDonors.value}</p>
              <p className="text-sm text-gray-600">Donantes Únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.approvalRate.value}</p>
              <p className="text-sm text-gray-600">Tasa Aprobación</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts (RF-042) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donaciones en el Tiempo (RF-042) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Evolución de Donaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: any, name: string) => {
                    if (name === 'Monto') return formatCurrency(value);
                    return value;
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" fill="#4A9D5F" name="Monto" />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="#F59E0B" name="# Donaciones" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Desglose por Método (RF-042 - desglose por método pago) */}
          <Card>
            <CardHeader>
              <CardTitle>Donaciones por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byMethod}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.label}: ${entry.percentage?.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donaciones por Programa (RF-042 - proyectos financiados) */}
          <Card>
            <CardHeader>
              <CardTitle>Donaciones por Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byProgram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#4A9D5F" name="Monto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución de Montos */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribución de Montos de Donación</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={amountDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" name="# Donaciones" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de donaciones monetarias y en especie */}
        <div className="mb-4 flex flex-wrap gap-4">
          <Badge variant="secondary">
            Total donaciones monetarias (filtrado): {formatCurrency(totalMonetaryAmount)}
          </Badge>
          <Badge variant="secondary">
            Donaciones en especie (filtrado): {totalInKindCount}
          </Badge>
        </div>

        {/* Top Donors Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top 10 Donantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Donante</TableHead>
                    {isSuperAdmin && <TableHead>Contacto</TableHead>}
                    <TableHead>Total Donado</TableHead>
                    <TableHead># Donaciones</TableHead>
                    <TableHead># Especie</TableHead>
                    <TableHead>Promedio</TableHead>
                    <TableHead>Última Donación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topDonors.map((donor, index) => (
                    <TableRow key={donor.email}>
                      <TableCell className="font-medium">
                        <Badge className={
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>{donor.name}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="flex flex-col text-sm text-gray-600">
                            <span>{donor.email}</span>
                            {donor.phone && <span>{donor.phone}</span>}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{formatCurrency(donor.total)}</TableCell>
                      <TableCell>{donor.monetaryCount}</TableCell>
                      <TableCell>{donor.inKindCount}</TableCell>
                      <TableCell>{formatCurrency(donor.total / Math.max(donor.monetaryCount, 1))}</TableCell>
                      <TableCell>
                        {new Date(donor.lastDonation).toLocaleDateString('es-CO')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights y Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                🔍 <strong>Insight:</strong> El 68% de las donaciones ocurren en los primeros 5 días del mes
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                📈 <strong>Tendencia:</strong> Las donaciones de empresas son en promedio 3.2x más altas
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                ⚠️ <strong>Alerta:</strong> Baja en donaciones de $50-100K (-25%), revisar campaña
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                💡 <strong>Sugerencia:</strong> Aumentar comunicación con donantes recurrentes
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

