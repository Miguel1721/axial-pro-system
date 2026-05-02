#!/bin/bash

# Script para generar iconos PWA para Axial Pro Clinic
# Requiere: ImageMagick (convert)

cd /home/ubuntu/axial-pro-system/frontend/public

# Crear un SVG base con el logo de Axial Pro
cat > axial-pro-icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Fondo con gradiente -->
  <rect width="512" height="512" rx="115" ry="115" fill="url(#grad)"/>

  <!-- Cruz médica -->
  <rect x="200" y="120" width="112" height="272" rx="16" fill="white" opacity="0.95"/>
  <rect x="120" y="200" width="272" height="112" rx="16" fill="white" opacity="0.95"/>

  <!-- Texto "A" estilizado -->
  <text x="400" y="440" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="white" opacity="0.9">A</text>
</svg>
EOF

echo "✅ SVG base creado"

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick no está instalado. Instalando..."
    apk add --no-cache imagemagick 2>/dev/null || apt-get install -y imagemagick 2>/dev/null
fi

# Generar iconos en diferentes tamaños
if command -v convert &> /dev/null; then
    # Icono 192x192
    convert axial-pro-icon.svg -resize 192x192 pwa-192x192.png
    echo "✅ pwa-192x192.png creado"

    # Icono 512x512
    convert axial-pro-icon.svg -resize 512x512 pwa-512x512.png
    echo "✅ pwa-512x512.png creado"

    # Apple touch icon 180x180
    convert axial-pro-icon.svg -resize 180x180 pwa-apple-180x180.png
    echo "✅ pwa-apple-180x180.png creado"

    # Favicon 32x32
    convert axial-pro-icon.svg -resize 32x32 favicon-32x32.png
    echo "✅ favicon-32x32.png creado"

    # Masked icon (para máscara de icono)
    convert axial-pro-icon.svg -resize 512x512 masked-icon.svg
    echo "✅ masked-icon.svg creado"

    echo "🎉 Todos los iconos PWA han sido generados"
else
    echo "❌ No se pudo generar los PNG. ImageMagick no está disponible."
    echo "📝 El SVG base está disponible en: axial-pro-icon.svg"
fi

ls -lah pwa-*.png favicon-*.png masked-icon.* 2>/dev/null || echo "ℹ️  Archivos PNG no generados (SVG disponible)"
