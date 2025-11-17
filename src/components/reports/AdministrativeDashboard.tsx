import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { 
  TrendingUp, TrendingDown, Heart, DollarSign, Users, Calendar,
  MessageSquare, Award, RefreshCw, Download, Settings, ArrowUpRight,
  ArrowDownRight, Activity, FileText, Clock, AlertTriangle, Home
} from 'lucide-react';
import { useReports } from '../../contexts/ReportsContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';

// Panel de reportes globales para administradores y super admins.
// Consolida KPIs de apadrinamientos, donaciones, voluntariado y proyectos,
// mostrando series de tiempo, distribuciones y actividad reciente. Todo se
// alimenta con datos agregados desde ReportsContext en memoria.

interface AdministrativeDashboardProps {
  onNavigate?: (page: string) => void;
}

export const AdministrativeDashboard: React.FC<AdministrativeDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { 
    getSponsorshipKPIs,
    getDonationKPIs,
    getVolunteerKPIs,
    getProjectKPIs,
    getSponsorshipTimeSeries,
    getDonationTimeSeries,
    getDonationByMethod,
    getDonationByProgram,
    getSponsorshipByLocation,
    getRecentActivity
  } = useReports();

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [period, setPeriod] = useState('month');

  // KPIs (RF-040)
  const sponsorshipKPIs = getSponsorshipKPIs(period);
  const donationKPIs = getDonationKPIs(period);
  const volunteerKPIs = getVolunteerKPIs(period);
  const projectKPIs = getProjectKPIs(period);

  // Time series data
  const donationTimeSeries = getDonationTimeSeries('12months');
  const sponsorshipTimeSeries = getSponsorshipTimeSeries('12months');

  // Distribution data
  const donationByMethod = getDonationByMethod();
  const donationByProgram = getDonationByProgram();
  const sponsorshipByLocation = getSponsorshipByLocation();

  // Recent activity
  const recentActivity = getRecentActivity(15);

  // Auto refresh (RF-040 - tiempo real)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  const formatCurrency = (value: number | string) => {
    if (typeof value === 'string') return value;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  const COLORS = ['#4A9D5F', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

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
              <BreadcrumbPage>Panel de Control</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2">Panel de Control</h1>
              <p className="text-gray-600">Fundación Huahuacuna</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="year">Este Año</option>
              </select>
              
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Actualizado {formatTimeAgo(lastUpdated.toISOString())}
          </p>
        </div>

        {/* Welcome & Alerts */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl mb-2">Bienvenido, {user?.nombre}</h2>
              <p className="text-gray-600 mb-4">
                Esta semana: +12 donaciones, +3 apadrinamientos, +5 voluntarios
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  3 donaciones pendientes
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  2 eventos esta semana
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  15 mensajes sin leer
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Primary KPIs (RF-040) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Niños Apadrinados */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                {sponsorshipKPIs.totalSponsored.changeType === 'increase' ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-3xl mb-1">{sponsorshipKPIs.totalSponsored.value}</p>
              <p className="text-sm text-gray-600 mb-3">Niños Apadrinados</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge className={`${
                  sponsorshipKPIs.totalSponsored.changeType === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sponsorshipKPIs.totalSponsored.changeType === 'increase' ? '+' : ''}
                  {sponsorshipKPIs.totalSponsored.change}
                </Badge>
                <span className="text-gray-500">vs. mes anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Donaciones del Mes */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                {donationKPIs.totalAmount.changeType === 'increase' ? (
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="text-2xl mb-1">{formatCurrency(Number(donationKPIs.totalAmount.value))}</p>
              <p className="text-sm text-gray-600 mb-3">Donaciones Este Mes</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge className={`${
                  donationKPIs.totalAmount.changeType === 'increase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {donationKPIs.totalAmount.change?.toFixed(1)}%
                </Badge>
                <span className="text-gray-500">{donationKPIs.donationCount.value} donaciones</span>
              </div>
            </CardContent>
          </Card>

          {/* Voluntarios Activos */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl mb-1">{volunteerKPIs.activeVolunteers.value}</p>
              <p className="text-sm text-gray-600 mb-3">Voluntarios Activos</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-green-100 text-green-800">
                  +{volunteerKPIs.activeVolunteers.change}
                </Badge>
                <span className="text-gray-500">vs. mes anterior</span>
              </div>
            </CardContent>
          </Card>

          {/* Tasa de Retención */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl mb-1">{sponsorshipKPIs.retentionRate.value}</p>
              <p className="text-sm text-gray-600 mb-3">Retención de Padrinos</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-green-100 text-green-800">
                  +{sponsorshipKPIs.retentionRate.change}%
                </Badge>
                <span className="text-gray-500">vs. trimestre</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donaciones en el Tiempo (RF-040) */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Donaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={donationTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4A9D5F" 
                    fill="#4A9D5F" 
                    fillOpacity={0.3}
                    name="Monto"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Apadrinamientos en el Tiempo */}
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Apadrinamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sponsorshipTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EC4899" 
                    strokeWidth={2}
                    name="Apadrinamientos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donaciones por Método */}
          <Card>
            <CardHeader>
              <CardTitle>Donaciones por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donationByMethod}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.label}: ${entry.percentage?.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {donationByMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donaciones por Programa */}
          <Card>
            <CardHeader>
              <CardTitle>Donaciones por Programa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationByProgram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#4A9D5F" name="Monto" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed (RF-040) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Actividad Reciente</CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" />
                    En vivo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="font-medium text-yellow-900">3 Donaciones Pendientes</p>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Requieren verificación
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Verificar Ahora
                  </Button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-red-600" />
                    <p className="font-medium text-red-900">12 Mensajes Urgentes</p>
                  </div>
                  <p className="text-sm text-red-700 mb-3">
                    Sin responder
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Mensajes
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <p className="font-medium text-blue-900">Evento HOY</p>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Jornada de Salud - 2:00 PM
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Registrar Donación
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Crear Evento
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Aprobar Voluntarios
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};

