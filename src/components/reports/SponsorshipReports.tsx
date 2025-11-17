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
  Download, Filter, Heart, TrendingUp, Users, DollarSign,
  Clock, MapPin, Calendar, Home
} from 'lucide-react';
import { useReports } from '../../contexts/ReportsContext';
import { useSponsorship } from '../../contexts/SponsorshipContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface SponsorshipReportsProps {
  onNavigate?: (page: string) => void;
}

export const SponsorshipReports: React.FC<SponsorshipReportsProps> = ({ onNavigate }) => {
  const { 
    getSponsorshipKPIs,
    getSponsorshipTimeSeries,
    getSponsorshipByLocation,
    getSponsorshipByAge
  } = useReports();
  
  const { sponsorships, children } = useSponsorship();

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    location: 'all',
    ageRange: 'all',
    status: 'all',
    sponsorType: 'all'
  });

  const kpis = getSponsorshipKPIs();
  const timeSeries = getSponsorshipTimeSeries('12months');
  const byLocation = getSponsorshipByLocation();
  const byAge = getSponsorshipByAge();

  // Gender distribution
  const byGender = [
    { name: 'Niños', value: children.filter(c => c.genero === 'masculino').length },
    { name: 'Niñas', value: children.filter(c => c.genero === 'femenino').length }
  ];

  // Sponsor type distribution
  const bySponsorType = [
    { name: 'Individual', value: 70, percentage: 70 },
    { name: 'Empresa', value: 20, percentage: 20 },
    { name: 'Familia', value: 10, percentage: 10 }
  ];

  // Duration distribution
  const byDuration = [
    { range: '0-6 meses', value: 45 },
    { range: '6-12 meses', value: 78 },
    { range: '1-2 años', value: 156 },
    { range: '2-5 años', value: 189 },
    { range: '5+ años', value: 74 }
  ];

  const COLORS = ['#4A9D5F', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

  const handleExportPDF = () => {
    alert('Exportando reporte a PDF... (función simulada)');
  };

  const handleExportExcel = () => {
    alert('Exportando reporte a Excel... (función simulada)');
  };

  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
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
              <BreadcrumbPage>Reportes de Apadrinamiento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Reportes de Apadrinamiento</h1>
            <p className="text-gray-600">Análisis completo del programa de apadrinamiento</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filter Panel (RF-041 - filtros personalizables) */}
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
                <Label htmlFor="location">Ubicación</Label>
                <select
                  id="location"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                >
                  <option value="all">Todos</option>
                  <option value="armenia">Armenia</option>
                  <option value="calarca">Calarcá</option>
                  <option value="montenegro">Montenegro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="ageRange">Edad</Label>
                <select
                  id="ageRange"
                  className="w-full px-3 py-2 border rounded-md"
                  value={filters.ageRange}
                  onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                >
                  <option value="all">Todas</option>
                  <option value="5-6">5-6 años</option>
                  <option value="7-11">7-11 años</option>
                  <option value="12-18">12-18 años</option>
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
                  <option value="activo">Activos</option>
                  <option value="suspendido">Suspendidos</option>
                  <option value="finalizado">Finalizados</option>
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

        {/* Summary Metrics (RF-041) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-8 h-8 text-pink-600" />
                <Badge className="bg-green-100 text-green-800">
                  +{kpis.newThisMonth.change}
                </Badge>
              </div>
              <p className="text-3xl mb-1">{kpis.totalSponsored.value}</p>
              <p className="text-sm text-gray-600">Total Apadrinados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.newThisMonth.value}</p>
              <p className="text-sm text-gray-600">Nuevos Este Mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.retentionRate.value}</p>
              <p className="text-sm text-gray-600">Tasa de Retención</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl mb-1">{formatCurrency(Number(kpis.monthlyRevenue.value))}</p>
              <p className="text-sm text-gray-600">Ingreso Mensual</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl mb-1">{kpis.averageDuration.value}</p>
              <p className="text-sm text-gray-600">Duración Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts (RF-041) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evolución Temporal (RF-041 - evolución temporal) */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Apadrinamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4A9D5F" 
                    strokeWidth={2}
                    name="Apadrinamientos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Municipio (RF-041 - por municipio) */}
          <Card>
            <CardHeader>
              <CardTitle>Apadrinamientos por Municipio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byLocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="label" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4A9D5F" name="Niños" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Edad (RF-041 - por rango edad) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byAge}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Niños" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por Género */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Género</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byGender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byGender.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tipo de Padrino */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo de Padrino</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bySponsorType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bySponsorType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Duración de Apadrinamientos */}
          <Card>
            <CardHeader>
              <CardTitle>Duración de Apadrinamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byDuration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" name="Apadrinamientos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Apadrinamientos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Niño</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Municipio</TableHead>
                    <TableHead>Padrino</TableHead>
                    <TableHead>Desde</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsorships.slice(0, 10).map((sponsorship) => {
                    const child = children.find(c => c.id === sponsorship.ninoId);
                    const startDate = new Date(sponsorship.fechaInicio);
                    const now = new Date();
                    const monthsDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

                    return (
                      <TableRow key={sponsorship.id}>
                        <TableCell>{child?.nombre || 'N/A'}</TableCell>
                        <TableCell>{child?.edad || 'N/A'}</TableCell>
                        <TableCell>{child?.municipio || 'N/A'}</TableCell>
                        <TableCell>{sponsorship.nombrePadrino}</TableCell>
                        <TableCell>
                          {new Date(sponsorship.fechaInicio).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>{monthsDiff} meses</TableCell>
                        <TableCell>
                          <Badge className={
                            sponsorship.estado === 'activo' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }>
                            {sponsorship.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Insights y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                🔍 <strong>Insight:</strong> Los apadrinamientos aumentan 30% en diciembre
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                📈 <strong>Tendencia:</strong> Mayor retención en empresas vs. individuales
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                ⚠️ <strong>Alerta:</strong> Baja captación en municipios del norte
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                💡 <strong>Recomendación:</strong> Enfocar marketing en edad 13-15 (menor cobertura)
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};
