import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// Importar registro de Service Worker para PWA
import { registerSW } from 'virtual:pwa-register'

// Función para ocultar el splash screen
export const hideSplashScreen = () => {
  const splashScreen = document.getElementById('splash-screen')
  if (splashScreen) {
    splashScreen.classList.add('fade-out')
    document.body.classList.remove('splash-active')

    // Remover el splash screen después de la transición
    setTimeout(() => {
      splashScreen.remove()
    }, 500)
  }
}

// Registrar Service Worker con actualización automática
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('✅ App lista para uso offline')
  },
  onRegistered(registration) {
    console.log('✅ Service Worker registrado')

    // Verificar actualizaciones cada 5 minutos
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 5 * 60 * 1000)
    }
  },
  onRegisterError(error) {
    console.error('❌ Error registrando Service Worker:', error)
  }
})

// Ocultar splash screen cuando la app esté montada
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

// Ocultar splash screen después de que React se monte
setTimeout(() => {
  hideSplashScreen()
}, 2000)