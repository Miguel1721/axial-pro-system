/**
 * DashboardAdmin - Versión Optimizada
 *
 * Mejoras implementadas:
 * - React.memo para evitar re-renders innecesarios
 * - Nuevos componentes UI reutilizables
 * - useMemo para cálculos costosos
 * - useCallback para funciones memoizadas
 * - Mejor separación de componentes
 * - Skeletons para loading states mejorados
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Calendar, TrendingUp, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks';

// Importar nuevos componentes UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Skeleton,
  SkeletonDashboard
} from './ui';

import UserAvatar from './UserAvatar';
import AnimatedCharts from './AnimatedCharts';

const DashboardAdmin = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // Usar hook personalizado useApi en lugar de fetch directo
  const { data: stats, loading: statsLoading, error: statsError } = useApi('/api/dashboard/stats');
  const { data: citas, loading: citasLoading } = useApi('/api/citas');
  const { data: sesiones, loading: sesionesLoading } = useApi('/api/sesiones');

  const [activeTab, setActiveTab] = useState('resumen');

  // Memoizar cálculos de estadísticas
  const processedStats = useMemo(() => {
    if (!stats) return null;

    return {
      totalPacientes: stats.totalPacientes || 0,
      citasHoy: stats.citasHoy || 0,
      sesionesHoy: stats.sesionesHoy || 0,
      ingresosHoy: stats.ingresosHoy || 0
    };
  }, [stats]);

  // Memoizar tarjetas de estadísticas
  const statsCards = useMemo(() => {
    if (!processedStats) return [];

    return [
      {
        title: 'Total Pacientes',
        value: processedStats.totalPacientes,
        icon: Users,
        color: 'bg-blue-500',
        change: '+5%',
        changeType: 'positive'
      },
      {
        title: 'Citas Hoy',
        value: processedStats.citasHoy,
        icon: Calendar,
        color: 'bg-green-500',
        change: '+2',
        changeType: 'positive'
      },
      {
        title: 'Sesiones Hoy',
        value: processedStats.sesionesHoy,
        icon: TrendingUp,
        color: 'bg-purple-500',
        change: '+3',
        changeType: 'positive'
      },
      {
        title: 'Ingresos Hoy',
        value: `$${processedStats.ingresosHoy.toLocaleString()}`,
        icon: CreditCard,
        color: 'bg-yellow-500',
        change: '+15%',
        changeType: 'positive'
      }
    ];
  }, [processedStats]);

  // Memoizar próximas citas
  const proximasCitas = useMemo(() => {
    if (!citas) return [];

    const today = new Date().toISOString().split('T')[0];
    return citas
      .filter(cita =>
        cita.fecha_hora >= today &&
        cita.estado !== 'cancelada' &&
        cita.estado !== 'atendido'
      )
      .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
      .slice(0, 4);
  }, [citas]);

  // Memoizar sesiones en progreso
  const sesionesEnProgreso = useMemo(() => {
    if (!sesiones) return [];

    return sesiones
      .filter(sesion => sesion.estado === 'en_proceso')
      .slice(0, 2);
  }, [sesiones]);

  // Usar useCallback para funciones memoizadas
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const loading = statsLoading || citasLoading || sesionesLoading;

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (statsError) {
    return (
      <Card variant="danger">
        <CardContent>
          <p className="text-red-600">Error al cargar datos: {statsError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con avatar y tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar size="lg" showName={true} showRole={true} />

          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Dashboard
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Resumen del día de hoy
            </p>
          </div>
        </div>

        {/* Tabs de navegación mejorados */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'resumen' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('resumen')}
          >
            📊 Resumen
          </Button>
          <Button
            variant={activeTab === 'graficos' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleTabChange('graficos')}
          >
            📈 Gráficos
          </Button>
        </div>
      </div>

      {activeTab === 'resumen' ? (
        <>
          {/* Estadísticas usando nuevos componentes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                  <StatCard key={index} card={card} isDark={isDark} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Próximas Citas */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximasCitas.length > 0 ? proximasCitas.map((cita) => (
                  <CitaItem key={cita.id} cita={cita} isDark={isDark} />
                )) : (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay próximas citas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sesiones en Progreso */}
          <Card>
            <CardHeader>
              <CardTitle>Sesiones en Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sesionesEnProgreso.length > 0 ? sesionesEnProgreso.map((sesion) => (
                  <SesionItem key={sesion.id} sesion={sesion} isDark={isDark} />
                )) : (
                  <p className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay sesiones en progreso
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <AnimatedCharts />
      )}
    </div>
  );
};

// Componentes separados para mejor optimización con React.memo
const StatCard = React.memo(({ card, isDark }) => {
  const Icon = card.icon;

  return (
    <div className={`rounded-lg shadow-lg p-6 transition-all duration-300 ${
      isDark ? 'bg-gray-700' : 'bg-white'
    }`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${card.color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {card.title}
          </p>
          <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {card.value}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Badge
          variant={card.changeType === 'positive' ? 'success' : 'danger'}
          size="sm"
          dot
        >
          {card.change}
        </Badge>
        <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          vs. ayer
        </span>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

const CitaItem = React.memo(({ cita, isDark }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmada': return 'success';
      case 'esperando_abono': return 'warning';
      case 'en_sala': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmada': return 'Confirmada';
      case 'esperando_abono': return 'Abono Pendiente';
      case 'en_sala': return 'En Sala';
      default: return status;
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
      isDark ? 'bg-gray-700' : 'bg-gray-50'
    }`}>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {cita.paciente_nombre}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })} - {cita.servicio_nombre}
        </p>
      </div>
      <Badge variant={getStatusVariant(cita.estado)}>
        {getStatusLabel(cita.estado)}
      </Badge>
    </div>
  );
});

CitaItem.displayName = 'CitaItem';

const SesionItem = React.memo(({ sesion, isDark }) => (
  <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
    isDark ? 'bg-gray-700' : 'bg-gray-50'
  }`}>
    <div>
      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {sesion.paciente_nombre}
      </p>
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {sesion.cabina_nombre} - {sesion.medico_nombre}
      </p>
    </div>
    <Badge variant="primary">En Proceso</Badge>
  </div>
));

SesionItem.displayName = 'SesionItem';

export default React.memo(DashboardAdmin);