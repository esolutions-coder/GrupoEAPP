# INTEGRACIÓN COMPLETA: PRESUPUESTOS → PROYECTOS → MEDICIONES → CERTIFICACIONES

## 📋 RESUMEN EJECUTIVO

El sistema ahora integra completamente los cuatro módulos principales para que trabajen en conjunto automáticamente. Cuando se aprueba un presupuesto, se crea automáticamente un proyecto con todas sus partidas, que luego alimentan las mediciones y certificaciones.

---

## 🔄 FLUJO DE TRABAJO COMPLETO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  1. PRESUPUESTO (Budgets)                                              │
│     ↓                                                                   │
│     • Se crea presupuesto draft                                        │
│     • Se agregan capítulos (ej: Movimiento de tierras, Estructura)     │
│     • Se agregan partidas por capítulo                                 │
│     • Estado: draft → in_review → approved                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  2. APROBACIÓN DEL PRESUPUESTO                                         │
│     ↓                                                                   │
│     • Usuario marca presupuesto como "approved"                        │
│     • TRIGGER AUTOMÁTICO se ejecuta                                    │
│     • Se crea PROYECTO nuevo automáticamente                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  3. PROYECTO CREADO AUTOMÁTICAMENTE                                    │
│     ↓                                                                   │
│     • Nombre: "OBRA: [código-presupuesto]"                            │
│     • budget_id: vinculado al presupuesto origen                       │
│     • created_from_budget: true                                        │
│     • Se copian todos los capítulos del presupuesto                    │
│     • Se copian todas las partidas del presupuesto                     │
│     • Estado inicial: "planning"                                       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  4. MEDICIONES VINCULADAS                                              │
│     ↓                                                                   │
│     • Cada partida de presupuesto se convierte en measurement_item     │
│     • budget_item_id: vinculación con partida original                 │
│     • budgeted_quantity: cantidad presupuestada                        │
│     • budgeted_unit_price: precio unitario del presupuesto            │
│     • Los trabajadores registran cantidades ejecutadas                 │
│     • El progreso se actualiza AUTOMÁTICAMENTE                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  5. CERTIFICACIONES GENERADAS                                          │
│     ↓                                                                   │
│     • Se crean certificaciones basadas en mediciones                   │
│     • measurement_item_id: vinculación con mediciones                  │
│     • Se calculan cantidades acumuladas                                │
│     • Estado del proyecto se actualiza AUTOMÁTICAMENTE                 │
│     • certified_total actualizado en tiempo real                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ ESTRUCTURA DE DATOS INTEGRADA

### Relaciones entre Tablas

```
budgets (Presupuestos)
  ├─ id
  ├─ generated_project_id ──────┐
  ├─ can_generate_project       │
  └─ status                      │
                                 │
budget_chapters                  │
  ├─ budget_id (FK)              │
  └─ chapter_code                │
                                 │
budget_items (Partidas)          │
  ├─ budget_id (FK)              │
  ├─ chapter_id (FK)             │
  ├─ item_code                   │
  ├─ estimated_quantity          │
  └─ unit_price                  │
                                 │
                                 ▼
projects (Obras)                 │
  ├─ id ◄──────────────────────┘
  ├─ budget_id (FK) ──┐
  ├─ created_from_budget
  ├─ budget_total
  ├─ certified_total
  └─ percentage_complete
                       │
measurement_chapters   │
  ├─ project_id (FK) ◄─┘
  └─ chapter_code
                       │
measurement_items      │
  ├─ project_id (FK) ◄─┘
  ├─ budget_item_id (FK) ──┐ (Vincula con presupuesto)
  ├─ budgeted_quantity     │
  ├─ budgeted_unit_price   │
  └─ budgeted_total        │
                           │
measurement_records        │
  ├─ item_id (FK) ◄────────┘
  ├─ measured_quantity
  ├─ is_certified
  └─ certification_number
                           │
certifications             │
  ├─ project_id (FK) ◄─────┘
  ├─ total_amount
  ├─ accumulated_amount
  └─ status
                           │
certification_items        │
  ├─ certification_id (FK) │
  ├─ measurement_item_id (FK) ◄─┘
  ├─ current_quantity
  └─ accumulated_quantity
```

---

## ⚡ TRIGGERS AUTOMÁTICOS IMPLEMENTADOS

### 1. `trigger_create_project_from_budget`

**Cuándo se ejecuta:** Cuando un presupuesto cambia su estado a "approved"

**Qué hace:**
1. ✅ Crea un nuevo proyecto con nombre "OBRA: [código-presupuesto]"
2. ✅ Vincula el proyecto con el presupuesto (budget_id)
3. ✅ Marca created_from_budget = true
4. ✅ Copia budget_total al proyecto
5. ✅ Crea todos los capítulos de medición desde budget_chapters
6. ✅ Crea todas las partidas de medición desde budget_items
7. ✅ Vincula cada measurement_item con su budget_item_id
8. ✅ Actualiza generated_project_id en el presupuesto

**Condiciones:**
- Status cambia de cualquier estado a "approved"
- No existe generated_project_id previo
- can_generate_project = true

**Código trigger:**
```sql
CREATE TRIGGER trigger_create_project_from_budget
  AFTER UPDATE ON budgets
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION create_project_from_approved_budget();
```

---

### 2. `trigger_update_project_progress`

**Cuándo se ejecuta:** Cuando se inserta o actualiza un measurement_record

**Qué hace:**
1. ✅ Suma todas las cantidades medidas del proyecto
2. ✅ Compara con el total presupuestado
3. ✅ Calcula porcentaje de ejecución
4. ✅ Actualiza percentage_complete en projects
5. ✅ Actualiza updated_at del proyecto

**Cálculo:**
```
percentage_complete = (total_measured / total_budgeted) * 100
```

**Código trigger:**
```sql
CREATE TRIGGER trigger_update_project_progress
  AFTER INSERT OR UPDATE ON measurement_records
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_from_measurements();
```

---

### 3. `trigger_update_project_certified`

**Cuándo se ejecuta:** Cuando una certificación cambia su estado a "certified"

**Qué hace:**
1. ✅ Suma todas las certificaciones aprobadas del proyecto
2. ✅ Actualiza certified_total en projects
3. ✅ Actualiza updated_at del proyecto

**Código trigger:**
```sql
CREATE TRIGGER trigger_update_project_certified
  AFTER INSERT OR UPDATE ON certifications
  FOR EACH ROW
  WHEN (NEW.status = 'certified')
  EXECUTE FUNCTION update_project_certified_totals();
```

---

## 📊 VISTAS INTEGRADAS CREADAS

### 1. `integrated_project_summary`

**Propósito:** Vista única con resumen completo de cada proyecto

**Columnas principales:**
- project_id, project_name, project_status
- budget_id, budget_code, budget_status
- budget_total, certified_total, percentage_complete
- pending_to_certify (calculado: budget_total - certified_total)
- total_measurement_items, total_measurements
- total_certifications, certified_amount
- last_certification_number
- created_from_budget (indica origen automático)

**Uso:**
```sql
SELECT * FROM integrated_project_summary
WHERE project_status = 'in_progress'
ORDER BY percentage_complete DESC;
```

---

### 2. `project_measurement_status`

**Propósito:** Estado detallado de cada partida de medición

**Columnas principales:**
- project_id, project_name
- chapter_name, item_code, description
- budgeted_quantity, budgeted_unit_price, budgeted_total
- total_measured_quantity, total_measured_amount
- certified_quantity, certified_amount
- pending_quantity, pending_amount
- execution_percentage (calculado por partida)

**Uso:**
```sql
SELECT * FROM project_measurement_status
WHERE project_id = '[uuid]'
  AND execution_percentage < 100
ORDER BY chapter_name, item_code;
```

---

### 3. `budget_vs_certified_comparison`

**Propósito:** Comparativa económica presupuesto vs certificado

**Columnas principales:**
- project_id, project_name
- budget_id, budget_code
- budget_total, budget_subtotal
- certified_total, pending_to_certify
- certification_percentage (calculado)
- total_budget_items, total_measurement_items
- total_certifications
- budget_approved_date, project_start_date

**Uso:**
```sql
SELECT * FROM budget_vs_certified_comparison
WHERE budget_status = 'approved'
  AND certification_percentage < 90
ORDER BY certification_percentage ASC;
```

---

## 🔧 FUNCIONES AUXILIARES

### `sync_budget_items_to_measurements(budget_id, project_id)`

**Propósito:** Sincronizar manualmente partidas de presupuesto a mediciones

**Cuándo usar:**
- Si se modificó el presupuesto después de crear el proyecto
- Si se agregaron nuevas partidas al presupuesto
- Para resincronizar datos

**Uso:**
```sql
SELECT sync_budget_items_to_measurements(
  '[budget-uuid]'::uuid,
  '[project-uuid]'::uuid
);
```

**Qué hace:**
1. Lee todos los capítulos del presupuesto
2. Crea capítulos en measurement_chapters si no existen
3. Lee todas las partidas del presupuesto
4. Crea partidas en measurement_items si no existen
5. Vincula con budget_item_id
6. NO duplica si ya existe (usa item_code como referencia)

---

## 💼 GUÍA DE USO PASO A PASO

### PASO 1: Crear Presupuesto

```typescript
// 1. Crear presupuesto
const { data: budget, error } = await supabase
  .from('budgets')
  .insert({
    project_id: null, // Se creará después
    contractor: 'Grupo EA',
    budget_code: 'PRES-2024-001',
    issue_date: '2024-01-15',
    status: 'draft',
    general_expenses_percentage: 13.00,
    industrial_benefit_percentage: 6.00,
    tax_percentage: 21.00
  })
  .select()
  .single();

const budgetId = budget.id;
```

### PASO 2: Agregar Capítulos

```typescript
// 2. Crear capítulos
const chapters = [
  {
    budget_id: budgetId,
    chapter_code: 'CAP-01',
    chapter_name: 'Movimiento de Tierras',
    display_order: 1
  },
  {
    budget_id: budgetId,
    chapter_code: 'CAP-02',
    chapter_name: 'Cimentación',
    display_order: 2
  },
  {
    budget_id: budgetId,
    chapter_code: 'CAP-03',
    chapter_name: 'Estructura',
    display_order: 3
  }
];

const { data: createdChapters } = await supabase
  .from('budget_chapters')
  .insert(chapters)
  .select();
```

### PASO 3: Agregar Partidas

```typescript
// 3. Crear partidas del presupuesto
const items = [
  {
    budget_id: budgetId,
    chapter_id: createdChapters[0].id,
    item_code: 'M-01.001',
    description: 'Excavación en terreno suelto',
    unit_of_measure: 'm³',
    estimated_quantity: 150.00,
    unit_price: 12.50,
    display_order: 1
  },
  {
    budget_id: budgetId,
    chapter_id: createdChapters[0].id,
    item_code: 'M-01.002',
    description: 'Relleno y compactado',
    unit_of_measure: 'm³',
    estimated_quantity: 100.00,
    unit_price: 8.75,
    display_order: 2
  }
  // ... más partidas
];

await supabase
  .from('budget_items')
  .insert(items);
```

### PASO 4: Aprobar Presupuesto (CREA PROYECTO AUTOMÁTICAMENTE)

```typescript
// 4. Aprobar presupuesto - ESTO ES LA CLAVE
const { data: approvedBudget } = await supabase
  .from('budgets')
  .update({
    status: 'approved',  // ← TRIGGER SE EJECUTA AQUÍ
    approved_by: 'usuario@grupoea.com',
    approved_at: new Date().toISOString()
  })
  .eq('id', budgetId)
  .select()
  .single();

// ✨ MAGIA: El trigger crea automáticamente:
// - 1 proyecto nuevo
// - 3 measurement_chapters
// - Todas las measurement_items con vinculación

console.log('Proyecto generado:', approvedBudget.generated_project_id);
```

### PASO 5: Consultar Proyecto Generado

```typescript
// 5. Obtener el proyecto generado
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('id', approvedBudget.generated_project_id)
  .single();

console.log('Proyecto:', project.name); // "OBRA: PRES-2024-001"
console.log('Vinculado a presupuesto:', project.budget_id);
console.log('Creado automáticamente:', project.created_from_budget); // true
console.log('Total presupuestado:', project.budget_total);
```

### PASO 6: Ver Partidas de Medición Creadas

```typescript
// 6. Ver partidas de medición creadas automáticamente
const { data: measurementItems } = await supabase
  .from('measurement_items')
  .select(`
    *,
    chapter:measurement_chapters(chapter_name),
    budget_item:budget_items(description, unit_of_measure)
  `)
  .eq('project_id', project.id)
  .order('item_code');

// Cada measurement_item está vinculado a su budget_item original
measurementItems.forEach(item => {
  console.log(`${item.item_code}: ${item.description}`);
  console.log(`  Presupuestado: ${item.budgeted_quantity} ${item.unit_of_measure}`);
  console.log(`  Precio: €${item.budgeted_unit_price}`);
  console.log(`  Vinculado a partida: ${item.budget_item_id}`);
});
```

### PASO 7: Registrar Mediciones

```typescript
// 7. Registrar cantidades ejecutadas
const { data: measurement } = await supabase
  .from('measurement_records')
  .insert({
    item_id: measurementItems[0].id,
    record_date: '2024-03-15',
    measured_quantity: 50.00,  // De 150 presupuestadas
    is_preliminary: false,
    measured_by: 'Capataz 1',
    observations: 'Primera medición'
  })
  .select()
  .single();

// ✨ TRIGGER actualiza automáticamente:
// - percentage_complete del proyecto
// - updated_at del proyecto
```

### PASO 8: Verificar Progreso Actualizado

```typescript
// 8. Ver progreso actualizado automáticamente
const { data: updatedProject } = await supabase
  .from('projects')
  .select('*, percentage_complete, budget_total, certified_total')
  .eq('id', project.id)
  .single();

console.log('Progreso:', updatedProject.percentage_complete + '%');
// Calculado automáticamente basado en mediciones
```

### PASO 9: Crear Certificación

```typescript
// 9. Crear certificación
const { data: certification } = await supabase
  .from('certifications')
  .insert({
    project_id: project.id,
    certification_number: 'CERT-001',
    contractor: 'Grupo EA',
    issue_date: '2024-03-31',
    period_start: '2024-03-01',
    period_end: '2024-03-31',
    status: 'draft'
  })
  .select()
  .single();
```

### PASO 10: Agregar Partidas a Certificación

```typescript
// 10. Agregar partidas certificadas (basadas en mediciones)
const { data: certItems } = await supabase
  .from('certification_items')
  .insert(
    measurementItems.map(item => ({
      certification_id: certification.id,
      measurement_item_id: item.id,
      item_code: item.item_code,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      unit_price: item.budgeted_unit_price,
      budgeted_quantity: item.budgeted_quantity,
      previous_quantity: 0,
      current_quantity: 50, // Cantidad medida
      accumulated_quantity: 50
    }))
  )
  .select();
```

### PASO 11: Aprobar Certificación

```typescript
// 11. Aprobar certificación
const { data: approvedCert } = await supabase
  .from('certifications')
  .update({
    status: 'certified'  // ← TRIGGER actualiza proyecto
  })
  .eq('id', certification.id)
  .select()
  .single();

// ✨ TRIGGER actualiza automáticamente:
// - certified_total del proyecto
```

### PASO 12: Vista Integrada Final

```typescript
// 12. Ver resumen completo integrado
const { data: summary } = await supabase
  .from('integrated_project_summary')
  .select('*')
  .eq('project_id', project.id)
  .single();

console.log('=== RESUMEN INTEGRADO ===');
console.log('Proyecto:', summary.project_name);
console.log('Estado:', summary.project_status);
console.log('Presupuesto:', summary.budget_code);
console.log('Total presupuestado:', summary.budget_total);
console.log('Total certificado:', summary.certified_total);
console.log('Pendiente certificar:', summary.pending_to_certify);
console.log('% Completado:', summary.percentage_complete);
console.log('Partidas medición:', summary.total_measurement_items);
console.log('Mediciones totales:', summary.total_measurements);
console.log('Certificaciones:', summary.total_certifications);
```

---

## 🔍 CONSULTAS ÚTILES

### Ver todos los proyectos creados desde presupuestos

```sql
SELECT
  p.name,
  p.status,
  b.budget_code,
  b.status as budget_status,
  p.budget_total,
  p.certified_total,
  p.percentage_complete
FROM projects p
INNER JOIN budgets b ON p.budget_id = b.id
WHERE p.created_from_budget = true
ORDER BY p.created_at DESC;
```

### Ver progreso detallado de un proyecto

```sql
SELECT * FROM project_measurement_status
WHERE project_id = '[uuid]'
ORDER BY chapter_name, item_code;
```

### Ver comparativa económica

```sql
SELECT * FROM budget_vs_certified_comparison
WHERE project_id = '[uuid]';
```

### Ver historial de un presupuesto a proyecto

```sql
SELECT
  b.budget_code,
  b.created_at as presupuesto_creado,
  b.approved_at as presupuesto_aprobado,
  p.name as proyecto_nombre,
  p.created_at as proyecto_creado,
  p.status as proyecto_estado,
  p.percentage_complete as progreso
FROM budgets b
LEFT JOIN projects p ON b.generated_project_id = p.id
WHERE b.id = '[uuid]';
```

---

## 🎯 CASOS DE USO

### Caso 1: Presupuesto Aprobado → Obra Automática

**Escenario:** Cliente aprueba presupuesto

1. Usuario marca presupuesto como "approved"
2. Sistema crea obra automáticamente
3. Todas las partidas se copian a mediciones
4. Jefe de obra puede empezar a registrar avances inmediatamente

**Beneficio:** Cero duplicación de datos, inicio inmediato de obra

---

### Caso 2: Seguimiento de Ejecución en Tiempo Real

**Escenario:** Capataz registra avances diarios

1. Capataz ingresa mediciones en measurement_records
2. Sistema calcula progreso automáticamente
3. Dashboard muestra % completado actualizado
4. Dirección ve estado en tiempo real

**Beneficio:** Visibilidad instantánea del progreso

---

### Caso 3: Certificación Mensual Automatizada

**Escenario:** Fin de mes, hay que certificar

1. Usuario crea certificación nueva
2. Sistema muestra partidas con mediciones acumuladas
3. Usuario revisa y aprueba certificación
4. Total certificado se actualiza en proyecto automáticamente
5. Vista comparativa muestra presupuesto vs certificado

**Beneficio:** Certificaciones basadas en datos reales, no estimaciones

---

### Caso 4: Modificación de Presupuesto

**Escenario:** Cliente solicita modificación en presupuesto ya aprobado

1. Se marca can_generate_project = false en presupuesto original
2. Se crea nuevo presupuesto (versión 2)
3. Al aprobar, se genera nuevo proyecto
4. ó se usa función sync_budget_items_to_measurements() para actualizar proyecto existente

**Beneficio:** Flexibilidad para modificaciones

---

### Caso 5: Análisis de Desviaciones

**Escenario:** Revisar desviaciones presupuestarias

1. Consultar vista budget_vs_certified_comparison
2. Ver pending_to_certify por proyecto
3. Identificar proyectos con baja certification_percentage
4. Tomar acciones correctivas

**Beneficio:** Control económico proactivo

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. Orden de Creación

**SIEMPRE:**
1. Crear presupuesto (draft)
2. Agregar capítulos
3. Agregar partidas
4. Aprobar presupuesto (genera proyecto)
5. Registrar mediciones
6. Crear certificaciones

**NUNCA:**
- Crear proyecto manualmente y luego vincular presupuesto
- Aprobar presupuesto sin partidas
- Modificar directamente measurement_items después de creación automática

---

### 2. Control de can_generate_project

```typescript
// Desactivar generación automática
await supabase
  .from('budgets')
  .update({ can_generate_project: false })
  .eq('id', budgetId);

// Útil cuando:
// - Es una revisión de presupuesto existente
// - Solo es una cotización, no una obra real
// - Ya existe un proyecto manual
```

---

### 3. Sincronización Manual

```sql
-- Si agregaste partidas DESPUÉS de aprobar presupuesto
SELECT sync_budget_items_to_measurements(
  '[budget-id]'::uuid,
  '[project-id]'::uuid
);

-- Esto agregará las nuevas partidas SIN duplicar las existentes
```

---

### 4. Permisos y Seguridad

Las políticas RLS existentes se mantienen:
- Usuarios autenticados pueden ver/crear/actualizar
- Los triggers se ejecutan con permisos del sistema
- No se requiere configuración adicional

---

## 📈 MÉTRICAS Y KPIs DISPONIBLES

### Por Proyecto
```sql
SELECT
  name,
  percentage_complete as "% Ejecutado",
  (certified_total / budget_total * 100) as "% Certificado",
  budget_total - certified_total as "Pendiente €"
FROM projects
WHERE status = 'in_progress'
ORDER BY percentage_complete DESC;
```

### Por Presupuesto
```sql
SELECT
  b.budget_code,
  b.total as presupuesto,
  p.certified_total as certificado,
  p.percentage_complete as avance,
  CASE
    WHEN b.approved_at IS NOT NULL THEN
      EXTRACT(days FROM now() - b.approved_at)::int
    ELSE NULL
  END as dias_desde_aprobacion
FROM budgets b
LEFT JOIN projects p ON b.generated_project_id = p.id
WHERE b.status = 'approved';
```

---

## 🚀 BENEFICIOS DE LA INTEGRACIÓN

### 1. Eliminación de Duplicación de Datos
- ✅ Partidas se ingresan UNA sola vez en presupuesto
- ✅ Se copian automáticamente a mediciones
- ✅ Se vinculan automáticamente a certificaciones
- ❌ Ya NO hay que copiar/pegar datos entre módulos

### 2. Actualización en Tiempo Real
- ✅ Progreso se calcula automáticamente
- ✅ Totales certificados se actualizan solos
- ✅ Vistas consolidadas siempre actualizadas
- ❌ Ya NO hay que recalcular manualmente

### 3. Trazabilidad Completa
- ✅ Cada medición vinculada a presupuesto original
- ✅ Cada certificación vinculada a mediciones reales
- ✅ Historial completo de presupuesto → proyecto → mediciones → certificaciones
- ❌ Ya NO se pierde la conexión entre módulos

### 4. Consistencia de Datos
- ✅ Precios unitarios consistentes en todo el ciclo
- ✅ Códigos de partida unificados
- ✅ Unidades de medida coherentes
- ❌ Ya NO hay discrepancias entre módulos

### 5. Eficiencia Operativa
- ✅ Creación de obra en segundos (antes: minutos/horas)
- ✅ Certificaciones basadas en datos reales
- ✅ Reportes automáticos y actualizados
- ❌ Ya NO hay trabajo manual repetitivo

---

## 🔮 PRÓXIMAS MEJORAS SUGERIDAS

### 1. Notificaciones Automáticas
- Email cuando presupuesto se aprueba y se crea proyecto
- Alertas cuando % ejecutado supera % certificado
- Avisos cuando hay desviaciones presupuestarias

### 2. Workflow de Aprobaciones
- Múltiples niveles de aprobación para presupuestos
- Firmas digitales en certificaciones
- Historial de cambios y auditoría

### 3. Integración Financiera
- Vinculación con módulo de Tesorería
- Facturación automática desde certificaciones
- Control de cobros vs certificado

### 4. IA y Predicciones
- Predicción de fin de obra basado en ritmo actual
- Alertas tempranas de desviaciones
- Sugerencias de optimización

---

## 📚 GLOSARIO

- **Budget (Presupuesto):** Documento con estimación de costes antes de iniciar obra
- **Project (Proyecto/Obra):** Obra física en ejecución
- **Measurement Item (Partida de Medición):** Unidad de trabajo a medir (ej: m³ de hormigón)
- **Measurement Record (Medición):** Registro de cantidad ejecutada en fecha específica
- **Certification (Certificación):** Documento oficial de avance para cobro
- **Budget Item (Partida de Presupuesto):** Línea del presupuesto con precio
- **Chapter (Capítulo):** Agrupación de partidas (ej: Estructura, Instalaciones)

---

## 🤝 SOPORTE

Para dudas sobre la integración:

1. Revisar esta documentación
2. Consultar las vistas SQL creadas
3. Verificar logs de triggers en Supabase
4. Revisar INTEGRACION_MODULOS.md para detalles técnicos

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [x] Migración de base de datos aplicada
- [x] Triggers automáticos creados
- [x] Vistas integradas disponibles
- [x] Función de sincronización manual lista
- [x] Documentación completa
- [x] Flujo presupuesto → proyecto probado
- [x] Actualización automática de progreso
- [x] Actualización automática de certificaciones
- [x] Vinculación bidireccional presupuesto ↔ proyecto
- [x] Trazabilidad completa implementada

---

© 2024 Grupo EA - Sistema de Gestión Integral
**Versión de Integración:** 2.0
**Última actualización:** 27/12/2024
