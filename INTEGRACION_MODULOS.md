# INTEGRACIÓN ENTRE MÓDULOS - GUÍA COMPLETA

## 📋 OBJETIVO

Todos los módulos del sistema están completamente interconectados. Los datos fluyen entre ellos automáticamente:

- **Trabajadores** creados en el módulo de Operarios aparecen automáticamente en:
  - Cuadrillas
  - Partes de Trabajo
  - Liquidaciones
  - Vacaciones

- **Proyectos** creados en Gestión de Obras aparecen en:
  - Partes de Trabajo
  - Mediciones
  - Certificaciones
  - Presupuestos
  - Control de Costes

- **Clientes** del CRM se vinculan con:
  - Proyectos
  - Certificaciones
  - Presupuestos

---

## 🔗 ESTRUCTURA DE RELACIONES

### Base de Datos

```
workers (Trabajadores)
  ├─→ work_report_details (Partes de trabajo)
  ├─→ crew_members (Miembros de cuadrillas)
  ├─→ payroll_settlements (Liquidaciones)
  └─→ vacation_requests (Vacaciones)

projects (Proyectos)
  ├─→ work_reports (Partes de trabajo)
  ├─→ certifications (Certificaciones)
  ├─→ project_measurements (Mediciones)
  ├─→ budgets (Presupuestos)
  └─→ clients (via client_id FK)

clients (Clientes)
  ├─→ projects (via FK)
  └─→ certifications (via projects)

crews (Cuadrillas)
  └─→ crew_members → workers
```

### Foreign Keys Implementadas

Todas las foreign keys necesarias están configuradas:

```sql
-- Trabajadores en partes de trabajo
work_report_details.worker_id → workers.id

-- Proyectos en partes de trabajo
work_reports.project_id → projects.id

-- Clientes en proyectos
projects.client_id → clients.id

-- Trabajadores en cuadrillas
crew_members.worker_id → workers.id

-- Trabajadores en vacaciones
vacation_requests.worker_id → workers.id

-- Proyectos en certificaciones
certifications.project_id → projects.id

-- Proyectos en mediciones
project_measurements.project_id → projects.id
```

---

## 🎣 HOOKS COMPARTIDOS

### Ubicación
`/src/hooks/useSharedData.ts`

### Hooks Disponibles

#### 1. `useWorkers()`
Carga todos los trabajadores del sistema.

```typescript
import { useWorkers } from '../hooks/useSharedData';

function MyComponent() {
  const { workers, loading, error, reload } = useWorkers();

  return (
    <select>
      {workers.map(worker => (
        <option key={worker.id} value={worker.id}>
          {worker.full_name} - {worker.category}
        </option>
      ))}
    </select>
  );
}
```

**Datos incluidos:**
- `id`, `worker_code`, `first_name`, `last_name`
- `full_name` (calculado automáticamente)
- `dni`, `category`, `status`
- `hourly_rate`, `monthly_rate`

#### 2. `useProjects()`
Carga todos los proyectos con información del cliente.

```typescript
import { useProjects } from '../hooks/useSharedData';

function MyComponent() {
  const { projects, loading, error, reload } = useProjects();

  return (
    <select>
      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.code} - {project.name}
        </option>
      ))}
    </select>
  );
}
```

**Datos incluidos:**
- `id`, `code`, `name`
- `client_id`, `client_name`
- `status`, `start_date`, `end_date`
- `location`, `budget`

#### 3. `useClients()`
Carga todos los clientes del sistema.

```typescript
import { useClients } from '../hooks/useSharedData';

function MyComponent() {
  const { clients, loading, error, reload } = useClients();

  return (
    <select>
      {clients.map(client => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  );
}
```

#### 4. `useSuppliers()`
Carga todos los proveedores.

```typescript
import { useSuppliers } from '../hooks/useSharedData';
```

#### 5. `useCrews()`
Carga todas las cuadrillas con información del supervisor.

```typescript
import { useCrews } from '../hooks/useSharedData';
```

### Funciones Helper

#### `getWorkerById(workerId: string)`
Obtiene un trabajador específico por ID.

```typescript
import { getWorkerById } from '../hooks/useSharedData';

const worker = await getWorkerById('uuid-del-trabajador');
console.log(worker?.full_name);
```

#### `getProjectById(projectId: string)`
Obtiene un proyecto específico con información del cliente.

```typescript
import { getProjectById } from '../hooks/useSharedData';

const project = await getProjectById('uuid-del-proyecto');
console.log(project?.name, project?.client_name);
```

#### `getActiveWorkers()`
Obtiene solo trabajadores activos.

```typescript
import { getActiveWorkers } from '../hooks/useSharedData';

const activeWorkers = await getActiveWorkers();
```

#### `getActiveProjects()`
Obtiene solo proyectos en progreso o planificación.

```typescript
import { getActiveProjects } from '../hooks/useSharedData';

const activeProjects = await getActiveProjects();
```

---

## 🔧 FUNCIONES SQL DISPONIBLES

### En Base de Datos

#### `get_worker_full_name(worker_id uuid)`
Retorna el nombre completo de un trabajador.

```sql
SELECT get_worker_full_name('uuid-del-trabajador');
-- Retorna: "Juan Pérez García"
```

#### `get_project_name(project_id uuid)`
Retorna el nombre de un proyecto.

```sql
SELECT get_project_name('uuid-del-proyecto');
-- Retorna: "Autopista A-7 Valencia"
```

#### `get_client_name(client_id uuid)`
Retorna el nombre de un cliente.

```sql
SELECT get_client_name('uuid-del-cliente');
-- Retorna: "Ministerio de Fomento"
```

#### `get_project_workers(project_id uuid)`
Retorna todos los trabajadores de un proyecto con sus horas.

```sql
SELECT * FROM get_project_workers('uuid-del-proyecto');
```

Retorna:
- `worker_id`
- `worker_name`
- `worker_category`
- `total_hours`
- `last_work_date`

#### `get_worker_projects(worker_id uuid)`
Retorna todos los proyectos de un trabajador.

```sql
SELECT * FROM get_worker_projects('uuid-del-trabajador');
```

Retorna:
- `project_id`
- `project_name`
- `project_code`
- `total_hours`
- `last_work_date`

#### `get_worker_stats(worker_id uuid)`
Retorna estadísticas completas de un trabajador.

```sql
SELECT get_worker_stats('uuid-del-trabajador');
```

Retorna JSON con:
```json
{
  "total_work_reports": 45,
  "total_hours": 360,
  "active_crews": 2,
  "pending_vacation_days": 15
}
```

#### `get_project_stats(project_id uuid)`
Retorna estadísticas completas de un proyecto.

```sql
SELECT get_project_stats('uuid-del-proyecto');
```

Retorna JSON con:
```json
{
  "total_work_reports": 120,
  "total_measurements": 25,
  "total_certifications": 3,
  "total_hours": 2400,
  "unique_workers": 15
}
```

---

## 📊 EJEMPLOS DE USO COMPLETO

### Ejemplo 1: Crear Parte de Trabajo

```typescript
import { useWorkers, useProjects, useCrews } from '../hooks/useSharedData';

function WorkReportForm() {
  const { workers } = useWorkers();
  const { projects } = useProjects();
  const { crews } = useCrews();

  const [form, setForm] = useState({
    project_id: '',
    worker_id: '',
    crew_id: '',
    hours: 8,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async () => {
    // Los IDs ya están vinculados correctamente
    await supabase.from('work_report_details').insert([{
      work_report_id: reportId,
      worker_id: form.worker_id, // → workers.id
      crew_id: form.crew_id,      // → crews.id
      hours_worked: form.hours
    }]);

    await supabase.from('work_reports').insert([{
      project_id: form.project_id, // → projects.id
      report_date: form.date
    }]);
  };

  return (
    <form>
      <select onChange={(e) => setForm({...form, project_id: e.target.value})}>
        {projects.map(p => (
          <option key={p.id} value={p.id}>
            {p.code} - {p.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setForm({...form, worker_id: e.target.value})}>
        {workers.map(w => (
          <option key={w.id} value={w.id}>
            {w.full_name} ({w.category})
          </option>
        ))}
      </select>

      <button onClick={handleSubmit}>Crear Parte</button>
    </form>
  );
}
```

### Ejemplo 2: Ver Historial de Trabajador

```typescript
import { getWorkerById, getWorkerProjects, getWorkerStats } from '../hooks/useSharedData';

async function showWorkerHistory(workerId: string) {
  // Obtener datos del trabajador
  const worker = await getWorkerById(workerId);

  // Obtener proyectos donde ha trabajado
  const projects = await getWorkerProjects(workerId);

  // Obtener estadísticas
  const stats = await supabase
    .rpc('get_worker_stats', { p_worker_id: workerId });

  console.log(`Trabajador: ${worker?.full_name}`);
  console.log(`Proyectos: ${projects.length}`);
  console.log(`Horas totales: ${stats.data.total_hours}`);
  console.log(`Vacaciones pendientes: ${stats.data.pending_vacation_days}`);
}
```

### Ejemplo 3: Dashboard de Proyecto

```typescript
import { getProjectById, getProjectWorkers, getProjectStats } from '../hooks/useSharedData';

async function showProjectDashboard(projectId: string) {
  // Obtener datos del proyecto
  const project = await getProjectById(projectId);

  // Obtener trabajadores del proyecto
  const workers = await getProjectWorkers(projectId);

  // Obtener estadísticas
  const stats = await supabase
    .rpc('get_project_stats', { p_project_id: projectId });

  return {
    projectName: project?.name,
    client: project?.client_name,
    workersCount: stats.data.unique_workers,
    totalHours: stats.data.total_hours,
    certificationsCount: stats.data.total_certifications
  };
}
```

---

## ✅ VERIFICACIÓN DE INTEGRACIÓN

### Checklist

- [x] Trabajadores creados aparecen en selectores de Partes de Trabajo
- [x] Proyectos creados aparecen en todos los módulos relacionados
- [x] Clientes vinculados automáticamente con proyectos
- [x] Cuadrillas pueden asignar trabajadores existentes
- [x] Vacaciones se calculan por trabajador
- [x] Liquidaciones se generan por trabajador
- [x] Mediciones vinculadas a proyectos
- [x] Certificaciones vinculadas a proyectos y clientes
- [x] Estadísticas cruzadas funcionando

### Comandos de Prueba SQL

```sql
-- Ver trabajadores con sus proyectos
SELECT
  w.first_name || ' ' || w.last_name as worker,
  p.name as project,
  SUM(wrd.hours_worked) as hours
FROM workers w
JOIN work_report_details wrd ON wrd.worker_id = w.id
JOIN work_reports wr ON wr.id = wrd.work_report_id
JOIN projects p ON p.id = wr.project_id
GROUP BY w.id, w.first_name, w.last_name, p.name;

-- Ver proyectos con sus clientes
SELECT
  p.code,
  p.name as project,
  c.name as client
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id;

-- Ver estadísticas de un proyecto
SELECT get_project_stats('uuid-del-proyecto');
```

---

## 🚀 MEJORES PRÁCTICAS

### 1. Usar Hooks en Componentes
Siempre usa los hooks compartidos para cargar datos:
```typescript
const { workers } = useWorkers(); // ✅ Correcto
// NO hacer fetch directo en cada componente
```

### 2. Recargar Datos Después de Crear
Usa la función `reload()` después de crear/editar:
```typescript
const { workers, reload } = useWorkers();

await createWorker(newWorker);
reload(); // Actualizar la lista
```

### 3. Validar Relaciones
Antes de crear relaciones, verifica que existen:
```typescript
const worker = await getWorkerById(workerId);
if (!worker) {
  alert('Trabajador no encontrado');
  return;
}
```

### 4. Usar Funciones SQL para Estadísticas
Para datos agregados, usa las funciones SQL:
```typescript
const { data: stats } = await supabase
  .rpc('get_worker_stats', { p_worker_id: workerId });
```

---

## 📚 RECURSOS ADICIONALES

- **Hooks:** `/src/hooks/useSharedData.ts`
- **Migraciones:** `/supabase/migrations/`
- **Documentación Completa:** `/REQUISITOS_FUNCIONALES.md`
- **Supabase Docs:** https://supabase.com/docs

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema: "No aparecen trabajadores en el selector"
**Solución:** Verifica que:
1. Los trabajadores estén creados en la tabla `workers`
2. El estado del trabajador sea 'active'
3. El hook `useWorkers()` esté importado correctamente

### Problema: "Error al crear parte de trabajo"
**Solución:** Verifica que:
1. El `project_id` existe en la tabla `projects`
2. El `worker_id` existe en la tabla `workers`
3. Las foreign keys están correctamente configuradas

### Problema: "Cliente no aparece en proyecto"
**Solución:**
1. Verifica que `client_id` en `projects` sea UUID válido
2. Ejecuta la migración `create_minimal_integration`
3. Recarga los datos con `reload()`

---

© 2024 Grupo EA - Sistema de Gestión Integrado
