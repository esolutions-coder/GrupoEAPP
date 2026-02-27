# Guía de Módulos de Proveedores

## 📋 Resumen

El sistema tiene **DOS módulos de proveedores diferentes** pero **SINCRONIZADOS AUTOMÁTICAMENTE**:

1. **Módulo Principal de Proveedores** (Proveedores & Recursos → Proveedores)
2. **Módulo de Pagos de Alquileres** (Flota y Maquinaria → Proveedores)

---

## 🏢 1. Módulo Principal de Proveedores

### Ubicación
**Menú: Proveedores & Recursos → Proveedores**

### Componente
`SuppliersModule.tsx`

### Tabla de Base de Datos
`suppliers`

### Funcionalidad
Este es el módulo **MAESTRO** de proveedores donde gestionas:

- ✅ **Datos de proveedores**
  - Código de proveedor
  - Nombre comercial
  - Nombre legal
  - CIF/NIF
  - Categoría
  - Persona de contacto
  - Teléfono, email
  - Dirección completa
  - Condiciones de pago
  - Cuenta bancaria
  - Valoración
  - Certificaciones
  - Estado (activo/inactivo)

- ✅ **Contratos**
  - Gestión de contratos con proveedores
  - Fechas de inicio/fin
  - Importes
  - Renovaciones

- ✅ **Pedidos**
  - Crear pedidos a proveedores
  - Seguimiento de entregas
  - Control de cantidades

- ✅ **Albaranes**
  - Registro de entregas
  - Control de calidad
  - Cantidades aceptadas/rechazadas

- ✅ **Facturas**
  - Gestión de facturas
  - Control de pagos
  - Estados

### Operaciones
- Crear proveedor
- Editar proveedor
- Eliminar proveedor (si no tiene máquinas asociadas)
- Importar proveedores desde Excel
- Exportar a Excel/PDF
- Ver detalles completos

---

## 💰 2. Módulo de Pagos de Alquileres de Maquinaria

### Ubicación
**Menú: Flota y Maquinaria → Control de Flota → Tab "Proveedores"**

### Componente
`SupplierPaymentsModule.tsx`

### Vista de Base de Datos
`v_supplier_monthly_payments` (hace JOIN con tabla `suppliers`)

### Funcionalidad
Este es un módulo **ESPECIALIZADO** que muestra:

- 💵 **Pagos mensuales por proveedor**
  - Solo proveedores con máquinas en alquiler
  - Total mensual por proveedor
  - Número de máquinas alquiladas
  - Listado de máquinas por proveedor
  - Datos de contacto del proveedor
  - Pago promedio por máquina

- 📊 **Dashboard de KPIs**
  - Total proveedores activos (con alquileres)
  - Total máquinas en alquiler
  - Total a pagar mensualmente

- 📤 **Exportación**
  - Excel con detalle completo
  - Útil para contabilidad

### ¿Cuándo muestra datos?
Este módulo muestra datos cuando:
1. ✅ Existe un proveedor en la tabla `suppliers`
2. ✅ Existe una máquina con `ownership_type = 'rented'`
3. ✅ La máquina tiene `supplier_id` apuntando al proveedor
4. ✅ Se han calculado costes mensuales para esa máquina (usando el botón "Calcular Costes" en Rentabilidad)

---

## 🔄 Sincronización Automática

### ¿Cómo se conectan?

Ambos módulos usan la **MISMA tabla de base de datos**: `suppliers`

```sql
-- Vista que conecta proveedores con maquinaria
CREATE VIEW v_supplier_monthly_payments AS
SELECT
  s.id as supplier_id,
  s.commercial_name as supplier_name,  -- ← Del módulo principal
  s.contact_person,                     -- ← Del módulo principal
  s.email,                              -- ← Del módulo principal
  s.phone,                              -- ← Del módulo principal
  mc.year,
  mc.month,
  mc.period,
  COUNT(DISTINCT m.id) as machinery_count,
  SUM(mc.rental_cost) as total_rental_cost,
  STRING_AGG(m.name, ', ') as machinery_list
FROM suppliers s                        -- ← Tabla compartida
INNER JOIN machinery m ON m.supplier_id = s.id
INNER JOIN machinery_monthly_costs mc ON mc.machinery_id = m.id
GROUP BY s.id, s.commercial_name, ...
```

### Flujo de Datos

```
1. CREAR PROVEEDOR
   ↓
   [Módulo Principal] → tabla suppliers → [Módulo de Pagos]
                            ↓
                    (sincronización automática)

2. EDITAR PROVEEDOR
   ↓
   [Módulo Principal] → tabla suppliers → [Módulo de Pagos]
                            ↓
                    (cambios reflejados inmediatamente)

3. ELIMINAR PROVEEDOR
   ↓
   [Módulo Principal] → tabla suppliers → [Módulo de Pagos]
                            ↓
                    (desaparece de ambos módulos)
```

---

## 📝 Flujo de Trabajo Completo

### Paso 1: Crear Proveedor
1. Ve a **Proveedores & Recursos → Proveedores**
2. Click en **"+ Nuevo Proveedor"**
3. Rellena los datos:
   - Código: `PROV-001`
   - Nombre comercial: `Alquileres Martínez S.L.`
   - CIF: `B12345678`
   - Contacto: `Juan Martínez`
   - Teléfono: `912345678`
   - Email: `contacto@alquileres-martinez.com`
   - Categoría: `Maquinaria`
   - Estado: `Activo`
4. Guardar

✅ **Resultado**: El proveedor ahora existe en el sistema

### Paso 2: Alquilar Maquinaria
1. Ve a **Flota y Maquinaria → Control de Flota → Tab "Maquinaria"**
2. Click en **"+ Nueva Maquinaria"**
3. Rellena datos básicos:
   - Código: `EXC-001`
   - Nombre: `Excavadora CAT 320`
   - Categoría: `Excavadora`
   - Tarifa/hora: `85 €`
4. **Sección "Tipo de Tenencia y Costes"**:
   - Tipo: **Alquiler** ←
   - Proveedor: **Alquileres Martínez S.L.** ← (aparece automáticamente)
   - Alquiler Mensual: `5.000 €`
   - Fecha Inicio: `01/01/2025`
   - Coste Operador: `2.000 €/mes`
   - Seguro: `200 €/mes`
5. Guardar

✅ **Resultado**: La máquina está vinculada al proveedor

### Paso 3: Calcular Costes
1. Ve a **Flota y Maquinaria → Control de Flota → Tab "Rentabilidad"**
2. Selecciona el mes (ej: Enero 2025)
3. Click en **"Calcular Costes"**
4. El sistema automáticamente:
   - Lee el alquiler mensual: 5.000 €
   - Lee el coste del operador: 2.000 €
   - Lee el seguro: 200 €
   - Suma combustible de partes diarios
   - Suma mantenimientos del mes
   - **Guarda todo en `machinery_monthly_costs`**

✅ **Resultado**: Los costes del mes están calculados

### Paso 4: Ver Informe de Pagos
1. Ve a **Flota y Maquinaria → Control de Flota → Tab "Proveedores"**
2. Selecciona el mes (ej: Enero 2025)
3. **Verás**:
   - **Alquileres Martínez S.L.**
     - Contacto: Juan Martínez
     - Email: contacto@alquileres-martinez.com
     - Teléfono: 912345678
     - **Total a pagar: 5.000 €/mes**
     - Máquinas: Excavadora CAT 320 (EXC-001)

✅ **Resultado**: Informe mensual de pagos listo para contabilidad

---

## 🔍 Diferencias Clave

| Característica | Módulo Principal | Módulo de Pagos |
|---------------|------------------|-----------------|
| **Propósito** | Gestionar datos maestros | Visualizar pagos mensuales |
| **Operaciones** | CRUD completo | Solo lectura |
| **Proveedores mostrados** | Todos | Solo con máquinas en alquiler |
| **Información** | Completa (contratos, pedidos, etc.) | Solo alquileres de maquinaria |
| **Filtros** | Estado, categoría | Mes/Año |
| **Exportación** | Excel/PDF completo | Excel con pagos mensuales |
| **Uso principal** | Administración | Contabilidad/Control |

---

## ⚠️ Puntos Importantes

### 1. Datos Sincronizados
- ✅ Cuando editas un proveedor en el módulo principal, los cambios se reflejan **inmediatamente** en el módulo de pagos
- ✅ Cuando borras un proveedor, desaparece de ambos módulos
- ✅ NO es necesario "actualizar" o "sincronizar" manualmente

### 2. Proveedor sin Pagos
- Si un proveedor no tiene máquinas en alquiler, **aparecerá en el módulo principal** pero **NO en el módulo de pagos**
- Esto es normal y correcto

### 3. Cálculo de Costes
- Para que aparezcan datos en el módulo de pagos, **debes calcular costes** del mes en la pestaña "Rentabilidad"
- Sin costes calculados, no habrá datos que mostrar

### 4. Periodo Seleccionado
- El módulo de pagos muestra datos **por periodo (mes/año)**
- Si cambias el periodo, verás datos diferentes
- Solo se muestran proveedores con costes calculados para ese periodo específico

---

## 🎯 Casos de Uso

### Caso 1: Revisar Pagos Mensuales
**Objetivo**: Saber cuánto pagas a cada proveedor este mes

1. Ve al **Módulo de Pagos** (Flota → Proveedores)
2. Selecciona mes actual
3. Ve el total por proveedor
4. Exporta a Excel para contabilidad

### Caso 2: Actualizar Datos de Proveedor
**Objetivo**: Cambiar el contacto o teléfono

1. Ve al **Módulo Principal** (Proveedores & Recursos → Proveedores)
2. Edita el proveedor
3. Guarda los cambios
4. Los cambios se reflejan automáticamente en el módulo de pagos

### Caso 3: Añadir Nuevo Proveedor
**Objetivo**: Registrar un nuevo proveedor de alquileres

1. Ve al **Módulo Principal**
2. Crea el proveedor
3. Ve a **Flota → Maquinaria**
4. Crea/edita la máquina alquilada
5. Selecciona el nuevo proveedor
6. Calcula costes en **Rentabilidad**
7. Ve el informe en **Proveedores**

---

## 💡 Preguntas Frecuentes

### P: ¿Por qué no veo un proveedor en el módulo de pagos?
**R**: Posibles razones:
1. El proveedor no tiene máquinas en alquiler asociadas
2. Las máquinas no tienen costes calculados para ese mes
3. Estás viendo un periodo diferente (verifica mes/año)

### P: ¿Dónde edito los datos de un proveedor?
**R**: En el **Módulo Principal** (Proveedores & Recursos → Proveedores)

### P: ¿Dónde veo cuánto pago a cada proveedor?
**R**: En el **Módulo de Pagos** (Flota → Proveedores)

### P: ¿Se actualizan automáticamente?
**R**: SÍ, ambos módulos usan la misma tabla de base de datos (`suppliers`)

### P: ¿Puedo editar proveedores desde el módulo de pagos?
**R**: NO, el módulo de pagos es solo lectura. Edita en el módulo principal.

### P: ¿Por qué necesito calcular costes?
**R**: El módulo de pagos muestra datos de la tabla `machinery_monthly_costs`, que se llena cuando calculas costes en la pestaña Rentabilidad.

---

## 🔧 Solución de Problemas

### Problema: No veo datos en módulo de pagos

**Solución**:
1. ✅ Verifica que el proveedor existe: **Proveedores & Recursos → Proveedores**
2. ✅ Verifica que tienes máquinas en alquiler: **Flota → Maquinaria** (filtrar por "Alquiler")
3. ✅ Verifica que las máquinas tienen `supplier_id` configurado
4. ✅ Calcula costes del mes: **Flota → Rentabilidad → Calcular Costes**
5. ✅ Vuelve a **Flota → Proveedores** y actualiza

### Problema: Los datos no coinciden

**Solución**:
1. Los datos SON los mismos (misma tabla)
2. El módulo de pagos solo muestra proveedores con alquileres activos
3. Verifica que estás viendo el mismo periodo (mes/año)

### Problema: Cambié un proveedor pero no se actualiza

**Solución**:
1. Refresca la página (F5)
2. Si persiste, verifica en el módulo principal que el cambio se guardó
3. La sincronización es automática e inmediata

---

## ✅ Resumen

- **Dos módulos, una tabla** (`suppliers`)
- **Módulo Principal**: Gestión completa de proveedores
- **Módulo de Pagos**: Informe mensual de alquileres de maquinaria
- **Sincronización**: Automática e inmediata
- **Flujo**: Crear proveedor → Alquilar máquina → Calcular costes → Ver informe

**Todo está conectado y sincronizado. No necesitas hacer nada especial para mantenerlos actualizados.**
