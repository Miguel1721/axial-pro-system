import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecurityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [consents, setConsents] = useState([]);

  // Estados para MFA
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('app');
  const [mfaCode, setMfaCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Estados para gestión de consentimientos
  const [consentType, setConsentType] = useState('treatment');
  const [consentAction, setConsentAction] = useState('grant');

  // Estados para cifrado
  const [encryptionInput, setEncryptionInput] = useState('');
  const [decryptionInput, setDecryptionInput] = useState('');
  const [encryptedOutput, setEncryptedOutput] = useState(null);
  const [decryptedOutput, setDecryptedOutput] = useState(null);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchSecurityStats();
      fetchAuditLogs();
    } else if (activeTab === 'mfa') {
      fetchMfaStatus();
    } else if (activeTab === 'consents') {
      fetchConsents();
    }
  }, [activeTab]);

  const fetchSecurityStats = async () => {
    try {
      const response = await fetch('/api/security/dashboard/overview');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching security stats:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/security/audit/logs');
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.data.events || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchMfaStatus = async () => {
    try {
      const response = await fetch('/api/security/mfa/status');
      const data = await response.json();
      if (data.success) {
        setMfaEnabled(data.data.enabled);
      }
    } catch (error) {
      console.error('Error fetching MFA status:', error);
    }
  };

  const fetchConsents = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'current-user';
      const response = await fetch(`/api/security/compliance/consents?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setConsents(data.data);
      }
    } catch (error) {
      console.error('Error fetching consents:', error);
    }
  };

  const handleMfaSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: mfaMethod })
      });
      const data = await response.json();

      if (data.success) {
        if (data.data.qrCodeUrl) {
          alert('Por favor, escanea el código QR con tu app de autenticación');
          console.log('Código QR:', data.data.qrCodeUrl);
        }
        setBackupCodes(data.data.backupCodes);
        alert('Configuración de MFA iniciada. Verifica con el código para completar.');
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
      alert('Error al configurar MFA');
    }
    setLoading(false);
  };

  const handleMfaVerify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode })
      });
      const data = await response.json();

      if (data.success) {
        alert('MFA verificado y habilitado exitosamente');
        setMfaCode('');
        fetchMfaStatus();
      } else {
        alert(data.message || 'Código MFA inválido');
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      alert('Error al verificar MFA');
    }
    setLoading(false);
  };

  const handleConsentAction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/compliance/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: consentType,
          purpose: `Consentimiento para ${consentType}`,
          dataCategories: ['personal', 'medical'],
          consentAction: consentAction
        })
      });
      const data = await response.json();

      if (data.success) {
        alert('Consentimiento actualizado exitosamente');
        fetchConsents();
      } else {
        alert('Error al actualizar consentimiento');
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      alert('Error al actualizar consentimiento');
    }
    setLoading(false);
  };

  const handleEncrypt = async () => {
    if (!encryptionInput) return;

    try {
      const response = await fetch('/api/security/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: encryptionInput })
      });
      const data = await response.json();

      if (data.success) {
        setEncryptedOutput(data.data);
      }
    } catch (error) {
      console.error('Error encrypting:', error);
      alert('Error al cifrar datos');
    }
  };

  const handleDecrypt = async () => {
    if (!decryptionInput) return;

    try {
      const response = await fetch('/api/security/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encrypted: decryptionInput })
      });
      const data = await response.json();

      if (data.success) {
        setDecryptedOutput(data.data);
      }
    } catch (error) {
      console.error('Error decrypting:', error);
      alert('Error al descifrar datos');
    }
  };

  const handleRequestDataAccess = async () => {
    try {
      const response = await fetch('/api/security/compliance/data-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (data.success) {
        alert('Solicitud de acceso a datos enviada. Revisa tu correo.');
      }
    } catch (error) {
      console.error('Error requesting data access:', error);
      alert('Error al solicitar acceso a datos');
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Total Eventos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.audit?.totalEvents || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Eventos Críticos</h3>
          <p className="text-3xl font-bold text-red-600">{stats?.audit?.last24h?.critical || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">MFA Habilitado</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.mfa?.enabledUsers || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Puntuación Seguridad</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.audit?.riskScore ? (100 - stats.audit.riskScore).toFixed(0) : 100}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Cumplimiento Normativo</h3>
            <div className="space-y-4">
              {stats?.compliance && (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GDPR</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.compliance.gdpr?.score || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${stats.compliance.gdpr?.score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HIPAA</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.compliance.hipaa?.score || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${stats.compliance.hipaa?.score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CCPA</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stats.compliance.ccpa?.score || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${stats.compliance.ccpa?.score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Estado de Backups</h3>
            {stats?.backup && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Último Backup</span>
                  <span className="text-sm font-medium">
                    {stats.backup.lastBackup ? new Date(stats.backup.lastBackup).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Backups</span>
                  <span className="text-sm font-medium">{stats.backup.totalBackups || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tamaño Total</span>
                  <span className="text-sm font-medium">{((stats.backup.totalSize || 0) / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Logs de Auditoría Recientes</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.slice(0, 10).map((log, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      log.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      log.severity === 'ALERT' ? 'bg-orange-100 text-orange-800' :
                      log.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.severity}
                    </span>
                    <p className="mt-1 font-medium">{log.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{log.userId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMfa = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Autenticación Multi-Factor (MFA)</h3>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg">MFA Activado</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {mfaEnabled ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {!mfaEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Método de MFA</label>
                <select
                  value={mfaMethod}
                  onChange={(e) => setMfaMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="app">App de Autenticación (Recomendado)</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <button
                onClick={handleMfaSetup}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Configurando...' : 'Configurar MFA'}
              </button>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  MFA está activo y protegiendo tu cuenta.
                </p>
              </div>
            </div>
          )}
        </div>

        {!mfaEnabled && backupCodes.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Códigos de Resaldo</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Guarda estos códigos de forma segura. Se usan si pierdes acceso a tu dispositivo principal.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded text-sm font-mono border">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderConsents = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Gestión de Consentimientos</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Consentimiento</label>
              <select
                value={consentType}
                onChange={(e) => setConsentType(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              >
                <option value="treatment">Tratamiento Médico</option>
                <option value="data_processing">Procesamiento de Datos</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Acción</label>
              <select
                value={consentAction}
                onChange={(e) => setConsentAction(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
              >
                <option value="grant">Conceder</option>
                <option value="revoke">Revocar</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleConsentAction}
                disabled={loading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Actualizar Consentimiento'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-lg font-medium mb-3">Consentimientos Actuales</h4>
          <div className="space-y-2">
            {consents.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No hay consentimientos registrados</p>
            ) : (
              consents.map((consent, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{consent.type.replace('_', ' ')}</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(consent.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      !consent.revoked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {!consent.revoked ? 'Activo' : 'Revocado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Mis Derechos (GDPR/CCPA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleRequestDataAccess}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Solicitar Acceso a Mis Datos
          </button>
          <button
            onClick={() => navigate('/privacy/report')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Generar Reporte de Privacidad
          </button>
        </div>
      </div>
    </div>
  );

  const renderEncryption = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Cifrado de Datos</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium mb-3">Cifrar Datos</h4>
            <div className="space-y-3">
              <textarea
                value={encryptionInput}
                onChange={(e) => setEncryptionInput(e.target.value)}
                placeholder="Ingresa los datos a cifrar..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 h-24"
              />
              <button
                onClick={handleEncrypt}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Cifrar Datos
              </button>
              {encryptedOutput && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Datos Cifrados:</label>
                  <textarea
                    readOnly
                    value={JSON.stringify(encryptedOutput, null, 2)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 h-32 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-lg font-medium mb-3">Descifrar Datos</h4>
            <div className="space-y-3">
              <textarea
                value={decryptionInput}
                onChange={(e) => setDecryptionInput(e.target.value)}
                placeholder="Pega los datos cifrados en formato JSON..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 h-24"
              />
              <button
                onClick={handleDecrypt}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Descifrar Datos
              </button>
              {decryptedOutput && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Datos Descifrados:</label>
                  <textarea
                    readOnly
                    value={JSON.stringify(decryptedOutput, null, 2)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 h-32"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard de Seguridad
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona la seguridad, cumplimiento y privacidad del sistema
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('mfa')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mfa'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              MFA
            </button>
            <button
              onClick={() => setActiveTab('consents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'consents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consentimientos
            </button>
            <button
              onClick={() => setActiveTab('encryption')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'encryption'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cifrado
            </button>
          </nav>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-center">Procesando...</p>
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'mfa' && renderMfa()}
      {activeTab === 'consents' && renderConsents()}
      {activeTab === 'encryption' && renderEncryption()}
    </div>
  );
};

export default SecurityDashboard;