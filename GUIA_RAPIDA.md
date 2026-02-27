# 🚀 GUÍA RÁPIDA: CÓMO USAR EL SISTEMA

## ✅ CORRECCIONES IMPLEMENTADAS

### Problema 1: Presupuestos en Borrador ✅ SOLUCIONADO
**Antes:** No se podía aprobar un presupuesto desde el estado "Borrador"
**Ahora:** Se puede aprobar directamente desde "Borrador" O enviarlo primero a "Revisión"

### Problema 2: Mediciones sin Vincular ✅ SOLUCIONADO
**Antes:** Las mediciones no estaban vinculadas a proyectos
**Ahora:** Al aprobar un presupuesto, se crea automáticamente un proyecto con todas las mediciones vinculadas

---

## 📋 FLUJO COMPLETO PASO A PASO

### PASO 1: CREAR PRESUPUESTO

1. Ir a **Módulo de Presupuestos** (desde el menú lateral)
2. Clic en **"Nuevo Presupuesto"**
3. En la pestaña **"Datos Generales"**:
   - **Código de Presupuesto:** PRES-2024-001 (ejemplo)
   - **Contratista/Empresa:** Grupo EA (o el nombre de tu empresa)
   - **Fecha de Emisión:** Seleccionar la fecha
   - Dejar los porcentajes por defecto (Gastos Generales 13%, Beneficio 6%, IVA 21%)
   - Agregar notas si es necesario
4. Clic en **"Siguiente: Partidas"**

---

### PASO 2: AGREGAR CAPÍTULOS Y PARTIDAS

En la pestaña **"Capítulos y Partidas"**:

#### Agregar Capítulos:
1. **Código:** 01 (o CAP-01)
2. **Nombre:** Movimiento de Tierras
3. Clic en el botón **"+"**

Repetir para más capítulos:
- 02 - Cimentación
- 03 - Estructura
- 04 - Cerramientos
- etc.

#### Agregar Partidas a cada Capítulo:
1. Expandir el capítulo (clic en la flecha)
2. En "Nueva Partida", completar:
   - **Código:** M-01.001
   - **Descripción:** Excavación en terreno suelto
   - **Ud (Unidad):** m³
   - **Cant (Cantidad):** 150
   - **Precio:** 12.50
3. Clic en **"Agregar Partida"**

Ejemplo completo:
```
Capítulo 01: Movimiento de Tierras
  ├─ M-01.001 | Excavación en terreno suelto | 150 m³ × €12.50 = €1,875.00
  ├─ M-01.002 | Relleno y compactado | 100 m³ × €8.75 = €875.00
  └─ M-01.003 | Transporte de tierras | 200 m³ × €5.00 = €1,000.00

Capítulo 02: Cimentación
  ├─ C-02.001 | Hormigón HA-25 para zapatas | 50 m³ × €95.00 = €4,750.00
  ├─ C-02.002 | Acero corrugado B 500 S | 3,500 kg × €1.20 = €4,200.00
  └─ C-02.003 | Encofrado de zapatas | 180 m² × €22.00 = €3,960.00
```

4. Clic en **"Siguiente: Resumen"**

---

### PASO 3: REVISAR RESUMEN Y GUARDAR

En la pestaña **"Resumen Económico"**:

1. Verificar el cálculo automático:
   - ✅ Subtotal (suma de todas las partidas)
   - ✅ + Gastos Generales (13%)
   - ✅ + Beneficio Industrial (6%)
   - ✅ - Descuento (si aplica)
   - ✅ Base Imponible
   - ✅ + IVA (21%)
   - ✅ **TOTAL PRESUPUESTO**

2. Revisar el resumen de partidas:
   - Número de capítulos
   - Número de partidas
   - Total de ejecución material

3. Clic en **"Guardar Presupuesto"**

**Resultado:** Presupuesto creado con estado "Borrador"

---

### PASO 4: APROBAR PRESUPUESTO (CREA PROYECTO AUTOMÁTICAMENTE)

#### Opción A: Aprobar Directamente (RECOMENDADO)
1. En la lista de presupuestos, clic en el ícono **"👁️ Ver detalle"**
2. En la vista de detalle, clic en el botón verde **"✅ Aprobar y Crear Proyecto"**
3. Confirmar en el diálogo: *"¿Aprobar este presupuesto? Se creará automáticamente un proyecto con todas sus partidas."*
4. El sistema muestra: **"Presupuesto aprobado correctamente. El proyecto se está creando automáticamente..."**
5. Después de 2 segundos: **"✅ Proyecto creado automáticamente. ID: [uuid]"**

#### Opción B: Enviar a Revisión Primero
1. Clic en **"Enviar a Revisión"** (botón amarillo)
2. El estado cambia a "En Revisión"
3. Luego clic en **"✅ Aprobar y Crear Proyecto"** (botón verde)

---

### PASO 5: VERIFICAR PROYECTO CREADO

**El trigger automático ha creado:**

✅ **1 Proyecto nuevo**
- Nombre: "OBRA: PRES-2024-001"
- Estado: "planning"
- Vinculado al presupuesto original (budget_id)
- Total presupuestado copiado

✅ **Todos los Capítulos de Medición**
- Se copiaron todos los capítulos del presupuesto
- Mismo código y nombre
- Vinculados al nuevo proyecto

✅ **Todas las Partidas de Medición**
- Se copiaron todas las partidas con:
  - Código de partida
  - Descripción
  - Unidad de medida
  - Cantidad presupuestada
  - Precio unitario presupuestado
  - **budget_item_id**: Vinculación con partida original del presupuesto

---

### PASO 6: VER PROYECTO Y MEDICIONES

#### Ver el Proyecto Creado:
1. Ir a **Módulo de Proyectos** (menú lateral)
2. Buscar el proyecto: "OBRA: PRES-2024-001"
3. Verás:
   - Estado del proyecto
   - Presupuesto total
   - Información del presupuesto origen
   - Pestaña de "Mediciones"

#### Ver las Mediciones:
1. Ir a **Módulo de Mediciones** (menú lateral)
2. Seleccionar el proyecto en el dropdown
3. Verás todos los capítulos y partidas creados automáticamente:

```
📂 Capítulo 01: Movimiento de Tierras
  ├─ M-01.001 | Excavación | Presup: 150 m³ | Ejecutado: 0 m³
  ├─ M-01.002 | Relleno | Presup: 100 m³ | Ejecutado: 0 m³
  └─ M-01.003 | Transporte | Presup: 200 m³ | Ejecutado: 0 m³

📂 Capítulo 02: Cimentación
  ├─ C-02.001 | Hormigón HA-25 | Presup: 50 m³ | Ejecutado: 0 m³
  ├─ C-02.002 | Acero corrugado | Presup: 3,500 kg | Ejecutado: 0 kg
  └─ C-02.003 | Encofrado | Presup: 180 m² | Ejecutado: 0 m²
```

---

### PASO 7: REGISTRAR MEDICIONES EN OBRA

#### Registrar Primera Medición:
1. En el **Módulo de Mediciones**, expandir un capítulo
2. Clic en una partida (ejemplo: M-01.001 Excavación)
3. Clic en **"+ Nueva Medición"**
4. Completar el formulario:
   - **Fecha:** 15/03/2024
   - **Cantidad Ejecutada:** 50 (de 150 presupuestadas)
   - **Preliminar/Definitiva:** Seleccionar
   - **Medido por:** Nombre del capataz
   - **Observaciones:** "Primera medición semanal"
5. Clic en **"Guardar Medición"**

**Resultado automático:**
- ✅ Se guarda la medición
- ✅ El proyecto actualiza automáticamente su **percentage_complete**
- ✅ Se puede ver en el dashboard el progreso en tiempo real

---

### PASO 8: CREAR CERTIFICACIÓN

#### Cuando llegue el momento de certificar (fin de mes):
1. Ir a **Módulo de Certificaciones**
2. Clic en **"Nueva Certificación"**
3. Completar:
   - **Número de Certificación:** 001
   - **Período:** 01/03/2024 - 31/03/2024
   - **Seleccionar Proyecto:** OBRA: PRES-2024-001
4. El sistema muestra automáticamente todas las partidas con mediciones
5. Revisar cantidades acumuladas
6. Agregar firmas/autorizaciones
7. Cambiar estado a **"Certificada"**

**Resultado automático:**
- ✅ Se crea la certificación
- ✅ El proyecto actualiza automáticamente su **certified_total**
- ✅ Se calcula el pendiente por certificar
- ✅ Se puede exportar a PDF/Excel

---

## 🎯 VISTA INTEGRADA: RESUMEN COMPLETO

Puedes consultar en cualquier momento el estado completo del proyecto:

### SQL Query para Vista Integrada:
```sql
SELECT * FROM integrated_project_summary
WHERE project_name LIKE '%PRES-2024-001%';
```

**Muestra:**
- Nombre del proyecto
- Código del presupuesto origen
- Estado del proyecto y presupuesto
- Total presupuestado
- Total certificado a la fecha
- Pendiente por certificar
- % de avance (desde mediciones)
- % certificado
- Número de capítulos, partidas, mediciones
- Última certificación

---

## 📊 DASHBOARD Y REPORTES

### Ver Progreso en Tiempo Real:
1. Ir a **Módulo de Proyectos**
2. Seleccionar el proyecto
3. Ver:
   - 📊 Barra de progreso de ejecución (basada en mediciones)
   - 💰 Barra de progreso de certificación
   - 📈 Gráficos de avance por capítulo
   - 💼 Resumen económico actualizado

### Comparativa Presupuesto vs Ejecutado:
```sql
SELECT * FROM project_measurement_status
WHERE project_name LIKE '%PRES-2024-001%'
ORDER BY chapter_name, item_code;
```

**Muestra por partida:**
- Cantidad presupuestada
- Cantidad ejecutada acumulada
- Cantidad certificada
- Pendiente por ejecutar
- % de ejecución por partida
- Importes (presupuestado, ejecutado, certificado)

---

## ⚠️ PUNTOS IMPORTANTES

### ✅ HACER:
1. **Completar el presupuesto con todos los capítulos y partidas** antes de aprobar
2. **Revisar los cálculos** en la pestaña "Resumen" antes de guardar
3. **Aprobar solo cuando esté listo para iniciar la obra**
4. **Registrar mediciones regularmente** para mantener el progreso actualizado
5. **Crear certificaciones periódicas** (mensualmente típicamente)

### ❌ NO HACER:
1. **NO aprobar presupuestos vacíos** sin capítulos ni partidas
2. **NO modificar manualmente las measurement_items** después de la creación automática
3. **NO crear proyectos manualmente** si hay un presupuesto aprobado
4. **NO duplicar partidas** manualmente en mediciones (ya están creadas automáticamente)

---

## 🔗 VERIFICACIÓN DE VINCULACIONES

### Para verificar que todo está correctamente vinculado:

```sql
-- Ver presupuesto y proyecto generado
SELECT
  b.budget_code,
  b.status as budget_status,
  b.generated_project_id,
  p.name as project_name,
  p.created_from_budget
FROM budgets b
LEFT JOIN projects p ON b.generated_project_id = p.id
WHERE b.budget_code = 'PRES-2024-001';

-- Ver partidas de presupuesto y mediciones vinculadas
SELECT
  bi.item_code as budget_code,
  bi.description as budget_desc,
  mi.item_code as measurement_code,
  mi.budget_item_id,
  mi.project_id
FROM budget_items bi
LEFT JOIN measurement_items mi ON bi.id = mi.budget_item_id
WHERE bi.budget_id = '[budget-uuid]';

-- Ver progreso del proyecto
SELECT
  name,
  budget_total,
  certified_total,
  percentage_complete,
  budget_total - certified_total as pending
FROM projects
WHERE name LIKE '%PRES-2024-001%';
```

---

## 💡 CONSEJOS PRÁCTICOS

### Para Presupuestos:
- Usar códigos de capítulo simples: 01, 02, 03 o CAP-01, CAP-02
- Usar códigos de partida descriptivos: M-01.001 (M=Movimiento, 01=Capítulo, 001=Partida)
- Incluir siempre la unidad de medida correcta
- Revisar precios unitarios antes de aprobar

### Para Mediciones:
- Registrar mediciones semanalmente o quincenalmente
- Usar el campo "Medido por" para trazabilidad
- Agregar observaciones relevantes
- Marcar como "Definitiva" solo cuando esté validada

### Para Certificaciones:
- Crear certificaciones al final de cada mes
- Verificar que todas las mediciones del período estén incluidas
- Revisar cantidades acumuladas vs presupuestadas
- Obtener firmas/autorizaciones necesarias antes de aprobar

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### P: No veo el proyecto después de aprobar el presupuesto
**R:** Esperar 2-3 segundos. El trigger de la base de datos tarda un momento en ejecutarse. Refrescar la página o ir al módulo de Proyectos.

### P: Las partidas de medición no aparecen
**R:** Verificar que:
1. El presupuesto tenía capítulos y partidas antes de aprobar
2. El estado del presupuesto es "approved"
3. El proyecto se creó correctamente (ver generated_project_id en el presupuesto)

### P: No puedo aprobar un presupuesto en borrador
**R:** Ahora SÍ puedes. Abre el detalle del presupuesto y verás el botón "✅ Aprobar y Crear Proyecto" directamente.

### P: El progreso no se actualiza automáticamente
**R:** Verificar que:
1. Las mediciones se están guardando correctamente en `measurement_records`
2. El `item_id` corresponde a un `measurement_item` válido del proyecto
3. Refrescar el módulo de Proyectos

---

## 📚 DOCUMENTACIÓN ADICIONAL

Para más detalles técnicos, consultar:
- **INTEGRACION_COMPLETA.md** - Documentación técnica completa con código
- **RESUMEN_INTEGRACION.md** - Resumen ejecutivo de la integración
- **FLUJO_VISUAL.md** - Diagramas visuales del flujo completo

---

© 2024 Grupo EA - Sistema de Gestión Integral
**Versión:** 2.0 - Integración Completa
**Última actualización:** 27/12/2024
