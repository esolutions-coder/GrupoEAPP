import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite por archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      cv: ['.pdf', '.doc', '.docx'],
      dni: ['.pdf', '.jpg', '.jpeg', '.png'],
      license: ['.pdf', '.jpg', '.jpeg', '.png'],
      certificates: ['.pdf', '.jpg', '.jpeg', '.png']
    };
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fieldAllowedTypes = allowedTypes[file.fieldname] || [];
    
    if (fieldAllowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido para ${file.fieldname}: ${fileExtension}`));
    }
  }
});

// Configurar nodemailer awaiting...

// const transporter = nodemailer.createTransporter({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // true para 465, false para otros puertos
//   requireTLS: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   },
//   tls: {
//     ciphers: 'SSLv3'
//   }
// });

// Verificar configuración de email
// transporter.verify((error, success) => {
//   if (error) {
//     console.log('Error en configuración de email:', error);
//   } else {
//     console.log('Servidor de email configurado correctamente');
//   }
// });

// Endpoint para recibir solicitudes de empleo
app.post('/api/submit-application', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'dni', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      position,
      experience,
      availability,
      hasLicense,
      hasVehicle,
      prlTraining,
      message
    } = req.body;

    // Preparar attachments
    const attachments = [];
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        attachments.push({
          filename: `${fieldName}_${firstName}_${lastName}_${file.originalname}`,
          path: file.path
        });
      });
    }

    // Crear contenido del email
    const emailContent = `
      <h2>Nueva Solicitud de Empleo - Grupo EA</h2>
      
      <h3>Información Personal:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${firstName} ${lastName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Teléfono:</strong> ${phone}</li>
        <li><strong>Dirección:</strong> ${address}</li>
        <li><strong>Ciudad:</strong> ${city}</li>
        <li><strong>Código Postal:</strong> ${postalCode}</li>
      </ul>

      <h3>Información Profesional:</h3>
      <ul>
        <li><strong>Puesto Deseado:</strong> ${position}</li>
        <li><strong>Experiencia:</strong> ${experience}</li>
        <li><strong>Disponibilidad:</strong> ${availability}</li>
        <li><strong>Carnet de Conducir:</strong> ${hasLicense}</li>
        <li><strong>Vehículo Propio:</strong> ${hasVehicle}</li>
        <li><strong>Formación PRL:</strong> ${prlTraining || 'No especificada'}</li>
      </ul>

      <h3>Mensaje Adicional:</h3>
      <p>${message || 'Sin mensaje adicional'}</p>

      <h3>Documentos Adjuntos:</h3>
      <ul>
        ${attachments.map(att => `<li>${att.filename}</li>`).join('')}
      </ul>

      <hr>
      <p><em>Solicitud enviada desde la web de Grupo EA - ${new Date().toLocaleString('es-ES')}</em></p>
    `;

    // Configurar email
    const mailOptions = {
      from: `"Grupo EA - Recursos Humanos" <${process.env.SMTP_USER}>`,
      to: process.env.HR_EMAIL,
      subject: `Nueva Solicitud de Empleo: ${firstName} ${lastName} - ${position}`,
      html: emailContent,
      attachments: attachments
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    // Limpiar archivos temporales después del envío
    setTimeout(() => {
      attachments.forEach(att => {
        if (fs.existsSync(att.path)) {
          fs.unlinkSync(att.path);
        }
      });
    }, 5000);

    console.log(`Solicitud enviada exitosamente: ${firstName} ${lastName} - ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'Solicitud enviada correctamente a recursoshumanos@grupoea.es'
    });

  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    
    // Limpiar archivos en caso de error
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const file = req.files[fieldName][0];
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud. Inténtalo de nuevo.'
    });
  }
});

// Endpoint para contacto general
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, company, service, message } = req.body;

    const emailContent = `
      <h2>Nueva Consulta - Grupo EA</h2>
      
      <h3>Información del Cliente:</h3>
      <ul>
        <li><strong>Nombre:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Teléfono:</strong> ${phone}</li>
        <li><strong>Empresa:</strong> ${company || 'No especificada'}</li>
        <li><strong>Tipo de Servicio:</strong> ${service}</li>
      </ul>

      <h3>Mensaje:</h3>
      <p>${message}</p>

      <hr>
      <p><em>Consulta enviada desde la web de Grupo EA - ${new Date().toLocaleString('es-ES')}</em></p>
    `;

    const mailOptions = {
      from: `"Grupo EA - Contacto" <${process.env.SMTP_USER}>`,
      to: 'grupoea@grupoea.es',
      subject: `Nueva Consulta: ${name} - ${service}`,
      html: emailContent,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Consulta enviada correctamente'
    });

  } catch (error) {
    console.error('Error al enviar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la consulta. Inténtalo de nuevo.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en puerto ${PORT}`);
});