import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Palette, Sun, Moon, Eye, Zap, Cpu, User } from 'lucide-react';
import { medicalThemes, getThemeByRole, getAvailableThemes } from '../themes/medicalThemes';
import { useTheme as useMedicalTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isDark } = useMedicalTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Obtener tema según rol del usuario
  const userTheme = getThemeByRole(user?.rol);
  const availableThemes = getAvailableThemes(user?.rol);

  // Cambiar tema
  const handleThemeChange = (themeId) => {
    toggleTheme();
    setPreviewMode(false);
    setIsOpen(false);

    // Guardar preferencia por rol
    localStorage.setItem(`theme_${user?.rol}`, themeId);
  };

  // Activar/desactivar modo preview
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Cambiar a modo claro/oscuro (mantener tema médico)
  const handleThemeModeToggle = () => {
    toggleTheme();
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 ${
          isDark
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
        title="Cambiar tema"
        aria-label="Seleccionar tema"
      >
        <Palette className="w-5 h-5" size={20} />
        <span className="font-medium">Temas</span>
        {userTheme && (
          <span
            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              isDark
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
            }`}
          >
            {medicalThemes[userTheme.id]?.name}
          </span>
        )}
      </button>

      {/* Panel de temas */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar selector de temas"
          />

          {/* Panel de selección */}
          <div className={`absolute right-0 top-14 w-[450px] rounded-2xl shadow-2xl z-50 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Temas Médicos
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <Zap size={20} />
                </button>
              </div>
            </div>

            {/* Lista de temas */}
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {availableThemes.map((theme) => {
                const isCurrentTheme = userTheme?.id === theme.id;
                const colors = medicalThemes[theme.id]?.colors || medicalThemes.azul_clinico.colors;

                return (
                  <div key={theme.id} className="space-y-2">
                    {/* Preview del tema */}
                    <div
                      onClick={() => handleThemeChange(theme.id)}
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isCurrentTheme
                          ? 'border-transparent ring-2 ring-offset-2 ring-blue-500'
                          : isDark
                          ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      title={theme.description}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {/* Icono del tema */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}>
                            {theme.icon}
                          </div>

                          {/* Nombre del tema */}
                          <div>
                            <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {theme.name}
                            </h4>
                            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {theme.description}
                            </p>
                          </div>
                        </div>

                        {/* Indicador de tema actual */}
                        {isCurrentTheme && (
                          <span className="text-green-500">
                            <Eye size={16} />
                          </span>
                        )}
                      </div>

                      {/* Preview de colores */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Colores principales:
                          </span>
                          <div className="flex space-x-1">
                            <div
                              className={`w-6 h-6 rounded border-2 ${
                                isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                              }`}
                              style={{ backgroundColor: colors.primary[500] }}
                            />
                            <div
                              className={`w-6 h-6 rounded border-2 ${
                                isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
                              }`}
                              style={{ backgroundColor: colors.text.primary }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Primary', color: colors.primary[500] },
                            { label: 'Secondary', color: colors.secondary[500] },
                            { label: 'Accent', color: colors.accent[500] },
                            { label: 'Fondo', color: colors.background.light }
                          ].map((color) => (
                            <div key={color.label}>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} block mb-1`}>
                                {color.label}
                              </span>
                              <div
                                className={`w-full h-4 rounded border transition-colors ${
                                  isDark ? 'border-gray-600' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.color }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Opciones adicionales */}
            <div className={`p-4 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h4 className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Opciones Adicionales
              </h4>
              <div className="space-y-3">
                {/* Modo oscuro/claro independiente */}
                <button
                  onClick={handleThemeModeToggle}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                  <div className="text-left">
                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      (mantener tema médico)
                    </span>
                  </div>
                </button>

                {/* Información sobre tema */}
                <div className={`p-3 rounded-xl ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                }`}>
                  <div className="flex items-start space-x-2">
                    <Cpu className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Tema según rol
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.rol && (
                          <span>
                            {user.rol === 'admin' && 'Administrador: Tema Azul Clínico'}
                            {user.rol === 'medico' && 'Médico: Tema Verde Quirófano'}
                            {user.rol === 'recepcion' && 'Recepción: Tema Rojo Emergencia'}
                            {user.rol === 'caja' && 'Caja: Tema Azul Clínico'}
                            {user.rol === 'paciente' && 'Paciente: Tema Morado Elegante'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información sobre tema actual */}
            <div className={`p-4 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Tema Personalizado
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Personaliza colores en Configuración
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;