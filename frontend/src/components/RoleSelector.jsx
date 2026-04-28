import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, DollarSign, Shield, User } from 'lucide-react';

const RoleSelector = () => {
  const { user, changeRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: 'admin', name: 'Admin', icon: Shield, color: 'bg-red-500' },
    { id: 'medico', name: 'Médico', icon: UserCheck, color: 'bg-blue-500' },
    { id: 'recepcion', name: 'Recepción', icon: Users, color: 'bg-green-500' },
    { id: 'caja', name: 'Caja', icon: DollarSign, color: 'bg-yellow-500' },
    { id: 'paciente', name: 'Paciente', icon: User, color: 'bg-purple-500' }
  ];

  const currentRole = roles.find(r => r.id === user?.rol);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
      >
        {currentRole && (
          <div className={`p-1 rounded-full ${currentRole.color}`}>
            <currentRole.icon size={16} />
          </div>
        )}
        <span className="font-medium">{currentRole?.name || 'Seleccionar Rol'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <p className="text-sm font-semibold text-gray-700">🎭 Modo Demo - Cambiar Rol</p>
            <p className="text-xs text-gray-500 mt-1">Selecciona un rol para explorar diferentes funcionalidades</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = user?.rol === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => {
                    changeRole(role.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors ${
                    isSelected ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${role.color}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>{role.name}</p>
                    <p className="text-xs text-gray-500">Funcionalidades de {role.name.toLowerCase()}</p>
                  </div>
                  {isSelected && (
                    <div className="text-indigo-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-500">
              💡 Actual: <span className="font-medium">{currentRole?.name}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;