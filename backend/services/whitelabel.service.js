const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class WhiteLabelService {
  // Update branding for clinic
  static async updateBranding(clinicId, brandingData) {
    const branding = {
      logo: brandingData.logo,
      primary_color: brandingData.primaryColor || '#3B82F6',
      secondary_color: brandingData.secondaryColor || '#10B981',
      clinic_name: brandingData.clinicName,
      theme: brandingData.theme || 'default',
      custom_domains: brandingData.customDomains || [],
      email_templates: brandingData.emailTemplates || {},
      ui_customizations: brandingData.uiCustomizations || {}
    };

    // Save branding data
    const brandingPath = path.join(process.cwd(), 'data', 'whitelabel', `${clinicId}.json`);
    await fs.mkdir(path.dirname(brandingPath), { recursive: true });
    await fs.writeFile(brandingPath, JSON.stringify(branding, null, 2));

    // Update CSS theme
    await this.updateCSSTheme(clinicId, branding);

    // Update email templates
    await this.updateEmailTemplates(clinicId, branding.email_templates);

    return branding;
  }

  // Update CSS theme
  static async updateCSSTheme(clinicId, branding) {
    const cssContent = `
      :root {
        --primary-color: ${branding.primary_color};
        --secondary-color: ${branding.secondary_color};
        --clinic-name: "${branding.clinic_name}";
      }

      .primary-bg {
        background-color: ${branding.primary_color} !important;
      }

      .primary-text {
        color: ${branding.primary_color} !important;
      }

      .secondary-bg {
        background-color: ${branding.secondary_color} !important;
      }

      .secondary-text {
        color: ${branding.secondary_color} !important;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      ::-webkit-scrollbar-thumb {
        background: ${branding.primary_color};
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${branding.secondary_color};
      }

      /* Custom animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .fade-in {
        animation: fadeIn 0.5s ease-in;
      }

      /* Custom button styles */
      .btn-primary {
        background-color: ${branding.primary_color} !important;
        border-color: ${branding.primary_color} !important;
        transition: all 0.3s ease;
      }

      .btn-primary:hover {
        background-color: ${this.darkenColor(branding.primary_color, 10)} !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .btn-secondary {
        background-color: ${branding.secondary_color} !important;
        border-color: ${branding.secondary_color} !important;
        transition: all 0.3s ease;
      }

      .btn-secondary:hover {
        background-color: ${this.darkenColor(branding.secondary_color, 10)} !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;

    const cssPath = path.join(process.cwd(), 'public', 'styles', `whitelabel-${clinicId}.css`);
    await fs.mkdir(path.dirname(cssPath), { recursive: true });
    await fs.writeFile(cssPath, cssContent);

    // Create CDN URL for custom CSS
    return `/styles/whitelabel-${clinicId}.css`;
  }

  // Update email templates
  static async updateEmailTemplates(clinicId, templates) {
    const templatesPath = path.join(process.cwd(), 'data', 'email-templates', clinicId);
    await fs.mkdir(templatesPath, { recursive: true });

    const defaultTemplates = {
      welcome: {
        subject: 'Bienvenido a {{clinic_name}}',
        html: `
          <h1>Bienvenido a {{clinic_name}}</h1>
          <p>Gracias por registrarte en nuestra plataforma de gestión médica.</p>
          <p>Tu cuenta está lista para comenzar. Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <button class="btn-primary">Comenzar ahora</button>
        `
      },
      appointment_reminder: {
        subject: 'Recordatorio de cita - {{clinic_name}}',
        html: `
          <h1>Recordatorio de cita</h1>
          <p>Tienes una cita programada para el {{appointment_date}} a las {{appointment_time}}.</p>
          <p>Por favor, llega 15 minutos antes para completar tu registro.</p>
          <button class="btn-primary">Ver detalles de la cita</button>
        `
      },
      invoice: {
        subject: 'Factura de {{clinic_name}}',
        html: `
          <h1>Factura #{{invoice_number}}</h1>
          <p>Tu factura está lista para pago.</p>
          <table class="invoice-table">
            <tr><td>Descripción:</td><td>{{service_description}}</td></tr>
            <tr><td>Fecha:</td><td>{{invoice_date}}</td></tr>
            <tr><td>Total:</td><td>{{total_amount}}</td></tr>
          </table>
          <button class="btn-primary">Pagar ahora</button>
        `
      }
    };

    const mergedTemplates = { ...defaultTemplates, ...templates };
    await fs.writeFile(
      path.join(templatesPath, 'templates.json'),
      JSON.stringify(mergedTemplates, null, 2)
    );

    return templatesPath;
  }

  // Generate white-label application
  static async generateWhiteLabelApp(clinicId, branding) {
    const appConfig = {
      name: branding.clinic_name,
      version: '1.0.0',
      description: 'Sistema de gestión médica personalizado',
      branding: branding,
      features: {
        custom_domains: branding.custom_domains,
        custom_css: `/styles/whitelabel-${clinicId}.css`,
        custom_icons: await this.generateCustomIcons(branding),
        custom_fonts: await this.generateCustomFonts(branding),
        custom_analytics: await this.setupCustomAnalytics(clinicId, branding)
      },
      integrations: {
        payment_gateways: ['epayco', 'wompi', 'payu', 'placetopay'],
        calendar: ['google', 'outlook'],
        storage: ['s3', 'google-drive'],
        notifications: ['email', 'sms', 'push']
      }
    };

    // Create white-label package
    const packagePath = path.join(process.cwd(), 'data', 'whitelabel-apps', clinicId);
    await fs.mkdir(packagePath, { recursive: true });
    await fs.writeFile(
      path.join(packagePath, 'config.json'),
      JSON.stringify(appConfig, null, 2)
    );

    // Generate deployment scripts
    const deployScript = `
      #!/bin/bash
      # Deploy white-label app for clinic ${clinicId}

      echo "Deploying ${branding.clinic_name}..."

      # Copy branding assets
      cp -r ${packagePath}/config.json /var/www/clinic-${clinicId}/config/

      # Update nginx config
      cp ${packagePath}/nginx.conf /etc/nginx/sites-available/clinic-${clinicId}

      # Restart services
      systemctl reload nginx
      systemctl restart clinic-${clinicId}

      echo "Deployment completed successfully"
    `;

    await fs.writeFile(
      path.join(packagePath, 'deploy.sh'),
      deployScript
    );

    return packagePath;
  }

  // Generate custom icons
  static async generateCustomIcons(branding) {
    const icons = {
      favicon: await this.createIcon(branding.primary_color, 16),
      apple_touch: await this.createIcon(branding.primary_color, 180),
      android: await this.createIcon(branding.primary_color, 192),
      ms_tile: await this.createIcon(branding.primary_color, 144)
    };

    const iconsPath = path.join(process.cwd(), 'data', 'icons');
    await fs.mkdir(iconsPath, { recursive: true });

    // Save icons (simplified - in real implementation, use actual image generation)
    await fs.writeFile(path.join(iconsPath, 'favicon.ico'), icons.favicon);
    await fs.writeFile(path.join(iconsPath, 'apple-touch-icon.png'), icons.apple_touch);
    await fs.writeFile(path.join(iconsPath, 'android-chrome-192x192.png'), icons.android);
    await fs.writeFile(path.join(iconsPath, 'mstile-144x144.png'), icons.ms_tile);

    return {
      favicon: '/icons/favicon.ico',
      apple_touch: '/icons/apple-touch-icon.png',
      android: '/icons/android-chrome-192x192.png',
      ms_tile: '/icons/mstile-144x144.png'
    };
  }

  // Create icon (placeholder - implement actual icon generation)
  static async createIcon(color, size) {
    return `Icon data for ${size}x${size} with color ${color}`;
  }

  // Setup custom analytics
  static async setupCustomAnalytics(clinicId, branding) {
    const analyticsConfig = {
      tracking_id: `ga_${clinicId}`,
      pixel_id: `fb_${clinicId}`,
      hotjar_id: `hk_${clinicId}`,
      custom_events: {
        'appointment_booked': { category: 'Engagement', action: 'Appointment' },
        'payment_completed': { category: 'Revenue', action: 'Payment' },
        'feature_used': { category: 'Usage', action: 'Feature' }
      },
      goals: [
        { name: 'Booking Completion', value: 50 },
        { name: 'Payment Conversion', value: 100 },
        { name: 'Feature Adoption', value: 25 }
      ]
    };

    const analyticsPath = path.join(process.cwd(), 'data', 'analytics', `${clinicId}.json`);
    await fs.mkdir(path.dirname(analyticsPath), { recursive: true });
    await fs.writeFile(analyticsPath, JSON.stringify(analyticsConfig, null, 2));

    return analyticsConfig;
  }

  // Helper functions
  static darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Get branding for clinic
  static async getBranding(clinicId) {
    try {
      const brandingPath = path.join(process.cwd(), 'data', 'whitelabel', `${clinicId}.json`);
      const data = await fs.readFile(brandingPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  // Deploy white-label application
  static async deployWhiteLabel(clinicId) {
    try {
      const branding = await this.getBranding(clinicId);
      if (!branding) {
        throw new Error('Branding not found');
      }

      // Generate deployment script
      const deployScript = `
        #!/bin/bash
        echo "Deploying white-label app for clinic ${clinicId}..."

        # Create app directory
        mkdir -p /var/www/clinic-${clinicId}

        # Copy branding assets
        cp -r ${path.join(process.cwd(), 'data', 'whitelabel-apps', clinicId)}/* /var/www/clinic-${clinicId}/

        # Setup nginx
        cat > /etc/nginx/sites-available/clinic-${clinicId} << EOF
        server {
          listen 80;
          server_name ${branding.custom_domains.join(',')};
          root /var/www/clinic-${clinicId}/public;
          index index.html;

          location / {
            try_files \$uri \$uri/ /index.html;
          }

          location /api {
            proxy_pass http://localhost:3000;
          }
        }
        EOF

        # Enable site
        ln -sf /etc/nginx/sites-available/clinic-${clinicId} /etc/nginx/sites-enabled/

        # Reload nginx
        systemctl reload nginx

        echo "Deployment completed successfully"
      `;

      await fs.writeFile(
        path.join(process.cwd(), 'data', 'deploy', `${clinicId}.sh`),
        deployScript
      );

      return { status: 'success', message: 'Deployment script created' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = WhiteLabelService;