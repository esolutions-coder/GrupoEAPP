# Guía: Actas de Entrega de EPIs

## Nuevas Funcionalidades en Gestión de EPIs

Se han implementado dos nuevas funcionalidades en el módulo de **Gestión de EPIs** para mejorar la administración de entregas:

### 1. Imprimir Acta de Entrega
### 2. Eliminar Entrega (con restauración de stock)

---

## 1. IMPRIMIR ACTA DE ENTREGA

### Descripción
Genera un documento PDF profesional que certifica la entrega de Equipos de Protección Individual a un trabajador, cumpliendo con la normativa de prevención de riesgos laborales.

### Ubicación
**Gestión → Proveedores & Recursos → EPIs → Pestaña "Entregas"**

### Cómo Usar

1. Navegar al módulo de **EPIs**
2. Hacer clic en la pestaña **"Entregas"**
3. Localizar la entrega deseada en la tabla
4. Hacer clic en el botón azul **🖨️ (Impresora)** en la columna "Acciones"
5. El PDF se descarga automáticamente

### Contenido del Acta

El acta de entrega generada incluye:

#### Información de la Empresa
```
Empresa: GRUPO EA OBRAS Y SERVICIOS S.L.
NIF: B12345678
```

#### Información del Proyecto
```
Obra: {Nombre de la obra}
Fecha: {Fecha de entrega en formato dd/mm/yyyy}
Responsable de obra: {Nombre del responsable}
```

#### Datos del Trabajador
```
Nombre: {Nombre completo del operario}
DNI/NIE: {DNI del trabajador}
Puesto: {Categoría profesional}
```

#### Tabla de EPIs Entregados
| Nº | Código | Descripción | Talla | Lote | Cantidad | Observaciones |
|----|--------|-------------|-------|------|----------|---------------|
| 1  | ABC123 | Casco seg. | N/A   | N/A  | 1        | Buen estado   |

#### Declaración Legal
Incluye el texto legal requerido:
```
El trabajador declara haber recibido los equipos relacionados,
encontrarlos en buen estado y conocer su uso y mantenimiento.
Se le ha informado de la obligatoriedad de su uso conforme a
la normativa interna y de prevención de riesgos laborales.
```

#### Firmas
- Firma del trabajador
- Firma del responsable de entrega
- Sello y firma de la empresa

#### Observaciones Adicionales
Campo para notas específicas de la entrega

### Nombre del Archivo Generado

El PDF se descarga con el siguiente formato:
```
acta_entrega_EPI_{codigo_trabajador}_{fecha}.pdf

Ejemplo: acta_entrega_EPI_WK001_2024-12-27.pdf
```

### Datos Utilizados

El acta obtiene información de las siguientes tablas:

| Tabla | Campos Utilizados |
|-------|-------------------|
| `workers` | first_name, last_name, dni, category, worker_code |
| `epi_items` | id, name |
| `epi_deliveries` | delivery_date, quantity, size, condition, notes, delivered_by |
| `projects` | name, manager_name |

### Casos de Error

| Error | Causa | Solución |
|-------|-------|----------|
| "Entrega no encontrada" | ID de entrega inválido | Recargar la página e intentar de nuevo |
| "Datos incompletos" | Falta información del EPI o trabajador | Verificar que los datos estén completos en la base de datos |
| Error al generar PDF | Problema técnico | Revisar consola del navegador (F12) |

---

## 2. ELIMINAR ENTREGA

### Descripción
Elimina una entrega registrada y **restaura automáticamente** el stock del EPI que fue entregado. Esta funcionalidad es útil para corregir errores de registro.

### Ubicación
**Gestión → Proveedores & Recursos → EPIs → Pestaña "Entregas"**

### Cómo Usar

1. Navegar al módulo de **EPIs**
2. Hacer clic en la pestaña **"Entregas"**
3. Localizar la entrega que desea eliminar
4. Hacer clic en el botón rojo **🗑️ (Papelera)** en la columna "Acciones"
5. Confirmar la acción en el diálogo que aparece:
   ```
   ¿Eliminar esta entrega? El stock del EPI será restaurado.
   ```
6. Hacer clic en **"Aceptar"**

### Proceso Automático

Cuando se elimina una entrega, el sistema realiza las siguientes acciones:

#### 1. Obtiene los datos de la entrega
```sql
SELECT * FROM epi_deliveries WHERE id = '{entrega_id}'
```

#### 2. Consulta el stock actual del EPI
```sql
SELECT current_stock FROM epi_items WHERE id = '{epi_item_id}'
```

#### 3. Restaura el stock
```sql
UPDATE epi_items
SET current_stock = current_stock + {cantidad_entregada}
WHERE id = '{epi_item_id}'
```

#### 4. Elimina el registro de entrega
```sql
DELETE FROM epi_deliveries WHERE id = '{entrega_id}'
```

### Ejemplo Práctico

**Situación inicial:**
- EPI: Casco de seguridad
- Stock antes de entrega: 50 unidades
- Cantidad entregada: 5 unidades
- Stock después de entrega: 45 unidades

**Acción: Eliminar entrega**

**Resultado:**
- Stock restaurado: 45 + 5 = **50 unidades**
- Entrega eliminada de la base de datos
- Notificación: "Entrega eliminada y stock restaurado correctamente"

### Medidas de Seguridad

1. **Confirmación obligatoria:** Se requiere confirmación del usuario antes de eliminar
2. **Mensaje informativo:** El diálogo indica claramente que el stock será restaurado
3. **Transacción completa:** El stock se restaura antes de eliminar la entrega
4. **Notificaciones:** El usuario recibe feedback inmediato sobre el resultado

### Cuándo Usar Esta Función

#### ✅ Usar cuando:
- Se registró una entrega por error
- Se entregó al trabajador incorrecto
- Se registró una cantidad incorrecta
- Hay duplicados de entregas

#### ❌ NO usar cuando:
- El trabajador devolvió el EPI (crear una nueva entrega con cantidad negativa o usar otro módulo)
- Se quiere llevar un histórico de devoluciones
- La entrega fue correcta (solo mantener el registro)

---

## COLUMNA DE ACCIONES

La tabla de entregas ahora incluye una nueva columna **"Acciones"** a la derecha con dos botones:

### Vista de la Tabla

| Fecha | EPI | Trabajador | Cant. | Talla | Estado | Entregado por | **Acciones** |
|-------|-----|------------|-------|-------|--------|---------------|-------------|
| 27/12/2024 | Casco | Juan Pérez | 1 | N/A | Nuevo | Admin | 🖨️ 🗑️ |

### Botones

| Icono | Color | Función | Tooltip |
|-------|-------|---------|---------|
| 🖨️ (Impresora) | Azul | Imprimir Acta de Entrega | "Imprimir Acta de Entrega" |
| 🗑️ (Papelera) | Rojo | Eliminar Entrega | "Eliminar Entrega" |

### Diseño Responsivo

Los botones incluyen:
- **Hover effect:** Cambian de color al pasar el cursor
- **Tooltip:** Muestra el nombre de la acción
- **Transiciones suaves:** Mejoran la experiencia de usuario
- **Íconos claros:** Facilitan la identificación rápida

---

## FLUJO DE TRABAJO RECOMENDADO

### Registrar una Entrega

1. Hacer clic en **"Registrar Entrega"** (botón verde en la parte superior)
2. Seleccionar el EPI a entregar
3. Seleccionar el trabajador
4. Indicar cantidad y talla
5. Agregar observaciones si es necesario
6. Guardar

### Generar el Acta de Entrega

7. Localizar la entrega recién creada en la tabla
8. Hacer clic en el botón azul 🖨️
9. Descargar el PDF generado
10. Imprimir el acta
11. Obtener firmas del trabajador y responsable

### Archivar

12. Guardar el acta firmada en el archivo físico o digital de la empresa
13. El registro digital permanece en el sistema

### En Caso de Error

Si se registró incorrectamente:
1. Hacer clic en el botón rojo 🗑️
2. Confirmar la eliminación
3. Verificar que el stock se haya restaurado
4. Registrar la entrega correctamente

---

## REQUISITOS Y DEPENDENCIAS

### Librerías Utilizadas

```json
{
  "jspdf": "^3.0.2",
  "jspdf-autotable": "^5.0.2"
}
```

### Tablas de Base de Datos

- `workers` - Información de trabajadores
- `epi_items` - Catálogo de EPIs
- `epi_deliveries` - Registro de entregas
- `projects` - Información de obras/proyectos

### Campos Requeridos

#### workers
- `id`, `worker_code`, `first_name`, `last_name`, `dni`, `category`

#### epi_items
- `id`, `name`, `current_stock`

#### epi_deliveries
- `id`, `epi_item_id`, `worker_id`, `quantity`, `size`, `condition`, `delivery_date`, `notes`, `delivered_by`

#### projects
- `id`, `name`, `manager_name`

---

## PREGUNTAS FRECUENTES

### ¿Puedo generar actas de entregas antiguas?
Sí, puedes generar el acta de cualquier entrega registrada en el sistema, sin importar su fecha.

### ¿El acta incluye múltiples EPIs?
No, cada acta se genera para una entrega específica. Si un trabajador recibió varios EPIs, cada uno tendrá su propia entrega y su propia acta.

### ¿Qué pasa si elimino una entrega por error?
Tendrás que volver a registrarla manualmente. El stock se habrá restaurado, por lo que podrás hacerlo sin problemas.

### ¿Se pueden editar las entregas?
Actualmente no hay función de edición. Si hay un error, debes eliminar la entrega y crearla de nuevo.

### ¿El PDF es válido legalmente?
El PDF sirve como comprobante de entrega. Para validez legal completa, debe ser impreso y firmado por ambas partes (trabajador y responsable de entrega).

### ¿Dónde se almacenan los PDFs generados?
Los PDFs se descargan directamente al dispositivo del usuario. No se almacenan en el servidor. Es responsabilidad de la empresa archivarlos adecuadamente.

### ¿Puedo personalizar el formato del acta?
El formato está estandarizado según la normativa. Para cambios específicos, contacta con el equipo de desarrollo.

---

## SOLUCIÓN DE PROBLEMAS

### El botón de imprimir no genera el PDF

**Posibles causas:**
1. Datos incompletos en la entrega
2. Error de conexión con la base de datos
3. Problema con las librerías de PDF

**Solución:**
```javascript
// Abrir consola del navegador (F12)
// Verificar errores en rojo
// Buscar mensajes relacionados con jsPDF o autoTable
```

### El stock no se restaura al eliminar

**Verificación:**
```sql
-- Antes de eliminar
SELECT current_stock FROM epi_items WHERE id = '{epi_id}';

-- Después de eliminar
SELECT current_stock FROM epi_items WHERE id = '{epi_id}';
-- Debe ser: stock_antes + cantidad_entregada
```

**Si el problema persiste:**
1. Recargar la página
2. Verificar la consola del navegador
3. Contactar con soporte técnico

### Los botones no aparecen en la tabla

**Verificación:**
1. Asegurarse de estar en la pestaña "Entregas"
2. Verificar que hay entregas registradas
3. Actualizar la página (F5)
4. Limpiar caché del navegador

---

## NOTAS TÉCNICAS

### Generación del PDF

El PDF se genera en el lado del cliente usando:
- **jsPDF:** Librería para crear PDFs
- **jsPDF-autoTable:** Plugin para generar tablas

### Formato del Documento

- **Tamaño:** A4 (210 x 297 mm)
- **Márgenes:** 15mm
- **Fuente:** Helvetica
- **Encoding:** UTF-8 (soporta caracteres especiales)

### Rendimiento

- Generación instantánea (< 1 segundo)
- No requiere procesamiento en servidor
- Peso del PDF: ~ 50-100 KB

### Seguridad

- Los datos se obtienen de la base de datos en tiempo real
- No se almacenan en caché
- Requiere autenticación para acceder al módulo

---

## INTEGRACIÓN CON OTROS MÓDULOS

### Relación con Trabajadores

Las actas utilizan datos del módulo de **Trabajadores**:
- Nombre completo
- DNI/NIE
- Categoría profesional
- Código de trabajador

### Relación con Proyectos

Si la entrega está asociada a un proyecto:
- Nombre de la obra
- Responsable de la obra

### Relación con Stock

La eliminación de entregas impacta directamente en:
- Stock actual de EPIs
- Alertas de stock bajo
- Historial de movimientos

---

## MEJORAS FUTURAS

### Posibles Funcionalidades
- [ ] Generación de actas múltiples (por lote)
- [ ] Envío automático por email al trabajador
- [ ] Firma digital dentro del sistema
- [ ] Historial de impresiones
- [ ] Plantillas personalizables por empresa
- [ ] Generación de actas consolidadas (múltiples EPIs)
- [ ] Exportación a Word (.docx)
- [ ] Integración con sistema de archivo digital

---

## CUMPLIMIENTO NORMATIVO

### Normativa Aplicable

Las actas de entrega de EPIs cumplen con:

- **Ley 31/1995 de Prevención de Riesgos Laborales**
  - Artículo 17: Obligación de proporcionar EPIs
  - Artículo 18: Información, consulta y participación

- **RD 773/1997 sobre Equipos de Protección Individual**
  - Artículo 5: Obligaciones del empresario
  - Artículo 7: Utilización y mantenimiento

### Elementos Obligatorios

El acta incluye todos los elementos requeridos:
- ✅ Identificación de la empresa
- ✅ Identificación del trabajador
- ✅ Descripción del EPI entregado
- ✅ Cantidad y estado del EPI
- ✅ Fecha de entrega
- ✅ Declaración del trabajador
- ✅ Firmas de ambas partes

---

## CONTACTO Y SOPORTE

Para problemas técnicos o consultas:

**Equipo de Desarrollo**
- Email: soporte@grupoea.com
- Teléfono: +34 XXX XXX XXX

**Horario de Soporte**
- Lunes a Viernes: 8:00 - 18:00
- Respuesta en < 24 horas

---

© 2024 - GRUPO EA OBRAS Y SERVICIOS S.L.
**Módulo:** Gestión de EPIs - Actas de Entrega
**Versión:** 1.0.0
**Última actualización:** 27/12/2024
