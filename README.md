# Grupo EA - Sitio Web Corporativo

Sitio web profesional para Grupo EA, especialistas en construcción, obra civil, edificación y movimientos de tierras.

## 🚀 Características

- **Diseño Corporativo**: Colores azul corporativo y gris oscuro
- **WhatsApp Integrado**: Botón flotante con respuestas automáticas (+34 658 93 66 51)
- **Sistema de Empleo**: Formulario completo para operarios con envío automático a recursoshumanos@grupoea.es
- **Responsive Design**: Optimizado para todos los dispositivos
- **SEO Optimizado**: Meta tags y estructura semántica

## 🛠️ Tecnologías

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Express
- **Email**: Nodemailer
- **Upload**: Multer para archivos
- **Icons**: Lucide React

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales SMTP

# Desarrollo (frontend + backend)
npm run dev:full

# Solo frontend
npm run dev

# Solo backend
npm run server
```

## ⚙️ Configuración de Email

Edita el archivo `.env`:

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=grupoea@grupoea.es
SMTP_PASS=tu-contraseña-de-aplicacion-outlook
HR_EMAIL=recursoshumanos@grupoea.es

## 📧 Funcionalidades de Email

### Solicitudes de Empleo
- **Destino**: recursoshumanos@grupoea.es
- **Archivos**: CV, DNI/NIE, Carnet, Certificados
- **Límite**: 10MB por archivo
- **Formatos**: PDF, DOC, DOCX, JPG, PNG

### Consultas Generales
- **Destino**: grupoea@grupoea.es
- **Formulario**: Contacto general
- **Respuesta**: Automática en 24h

## 🔧 Estructura del Proyecto

```
src/
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── WhatsAppButton.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ServicesPage.tsx
│   ├── GalleryPage.tsx
│   ├── RecruitmentPage.tsx
│   └── ContactPage.tsx
└── App.tsx

server/
└── index.js (Backend API)
```

## 🚀 Despliegue

### Frontend (Netlify)
```bash
npm run build
# Subir carpeta dist/ a Netlify
```

### Backend (Heroku/VPS)
```bash
# Configurar variables de entorno en producción
# Desplegar server/index.js
```

## 📱 WhatsApp Integration

- **Número**: +34 658 93 66 51
- **Respuestas Automáticas**:
  - Solicitar Presupuesto
  - Información de Servicios
  - Oportunidades de Trabajo
  - Consulta Urgente
  - Consulta General

## 🎨 Colores Corporativos

```css
/* Azul Corporativo */
--corporate-blue-600: #1e40af
--corporate-blue-700: #1e3a8a

/* Gris Oscuro */
--corporate-gray-800: #1f2937
--corporate-gray-900: #111827
```

## 📞 Contacto

- **Teléfono**: +34 960 22 54 69
- **Email**: grupoea@grupoea.es
- **WhatsApp**: +34 658 93 66 51
- **Dirección**: Calle Jacomar 64, 46019 Valencia, España

## 📄 Licencia

© 2024 Grupo EA. Todos los derechos reservados.