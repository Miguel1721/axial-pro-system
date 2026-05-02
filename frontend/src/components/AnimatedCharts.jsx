import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnimatedCharts = () => {
  const { isDark, theme } = useTheme();

  // Colores según tema médico
  const themeColors = {
    azul: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(96, 165, 250)',
      accent: 'rgb(37, 99, 235)',
      background: isDark ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)',
      text: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
    },
    verde: {
      primary: 'rgb(34, 197, 94)',
      secondary: 'rgb(74, 222, 128)',
      accent: 'rgb(22, 163, 74)',
      background: isDark ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)',
      text: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
    },
    rojo: {
      primary: 'rgb(239, 68, 68)',
      secondary: 'rgb(248, 113, 113)',
      accent: 'rgb(220, 38, 38)',
      background: isDark ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)',
      text: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
    },
    morado: {
      primary: 'rgb(168, 85, 247)',
      secondary: 'rgb(192, 132, 252)',
      accent: 'rgb(147, 51, 234)',
      background: isDark ? 'rgb(55, 65, 81)' : 'rgb(255, 255, 255)',
      text: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
    }
  };

  const colors = themeColors[theme] || themeColors.azul;

  // Configuración común para todos los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        labels: {
          color: colors.text,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.primary,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: colors.text
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: colors.text
        }
      }
    }
  };

  // Gráfico 1: Citas por día (Línea con área)
  const citasData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Citas Confirmadas',
        data: [12, 19, 15, 17, 22, 18, 8],
        borderColor: colors.primary,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, colors.primary.replace('rgb', 'rgba').replace(')', ', 0.5)'));
          gradient.addColorStop(1, colors.primary.replace('rgb', 'rgba').replace(')', ', 0.0)'));
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: 'Citas Canceladas',
        data: [2, 3, 1, 4, 2, 3, 1],
        borderColor: colors.secondary,
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.secondary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  // Gráfico 2: Pacientes por Especialidad (Barras)
  const especialidadesData = {
    labels: ['Medicina General', 'Pediatría', 'Cardiología', 'Dermatología', 'Traumatología'],
    datasets: [
      {
        label: 'Pacientes',
        data: [65, 45, 30, 25, 35],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          colors.accent,
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)'
        ],
        borderColor: [
          colors.primary,
          colors.secondary,
          colors.accent,
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  // Gráfico 3: Ingresos Mensuales (Línea)
  const ingresosData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos ($)',
        data: [12500, 15000, 13500, 18000, 16500, 21000],
        borderColor: colors.accent,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, colors.accent.replace('rgb', 'rgba').replace(')', ', 0.6)'));
          gradient.addColorStop(1, colors.accent.replace('rgb', 'rgba').replace(')', ', 0.0)'));
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: colors.accent,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4
      }
    ]
  };

  // Gráfico 4: Satisfacción NPS (Doughnut)
  const satisfaccionData = {
    labels: ['Promotores (9-10)', 'Neutros (7-8)', 'Detractores (0-6)'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          colors.primary,
          colors.secondary,
          'rgb(239, 68, 68)'
        ],
        borderColor: [
          colors.primary,
          colors.secondary,
          'rgb(239, 68, 68)'
        ],
        borderWidth: 3,
        hoverOffset: 15
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colors.text,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: colors.text,
        bodyColor: colors.text,
        borderColor: colors.primary,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed + '%';
            return label;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="space-y-6">
      {/* Primera fila: Gráficos de línea y barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Citas por Día */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📊 Citas por Día
          </h3>
          <div className="h-72">
            <Line data={citasData} options={commonOptions} />
          </div>
        </div>

        {/* Gráfico de Pacientes por Especialidad */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            👥 Pacientes por Especialidad
          </h3>
          <div className="h-72">
            <Bar
              data={especialidadesData}
              options={{
                ...commonOptions,
                indexAxis: 'y',
                plugins: {
                  ...commonOptions.plugins,
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Segunda fila: Ingresos y Satisfacción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ingresos Mensuales */}
        <div className={`lg:col-span-2 rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            💰 Ingresos Mensuales
          </h3>
          <div className="h-72">
            <Line data={ingresosData} options={commonOptions} />
          </div>
        </div>

        {/* Gráfico de Satisfacción NPS */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ⭐ Satisfacción NPS
          </h3>
          <div className="h-72">
            <Doughnut data={satisfaccionData} options={doughnutOptions} />
          </div>
          <div className="mt-4 text-center">
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              40
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Score NPS
            </p>
          </div>
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📈 Métricas Clave
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasa de Ocupación</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>87%</p>
            <p className="text-xs text-green-500 mt-1">↑ 5% vs mes anterior</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tiempo Espera Promedio</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>12 min</p>
            <p className="text-xs text-green-500 mt-1">↓ 3 min vs mes anterior</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pacientes Nuevos</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>143</p>
            <p className="text-xs text-green-500 mt-1">↑ 18% vs mes anterior</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ingresos Totales</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$96.5K</p>
            <p className="text-xs text-green-500 mt-1">↑ 22% vs mes anterior</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCharts;
