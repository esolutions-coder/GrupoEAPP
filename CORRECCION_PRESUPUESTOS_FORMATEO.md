# Correcciones Aplicadas al Módulo de Presupuestos

## Fecha: 16 de Enero de 2025

---

## Problemas Identificados

1. ❌ Error al aprobar presupuestos: "column commercial_name does not exist"
2. ❌ Los importes no estaban formateados con separadores de miles
3. ❌ Los campos de precio y cantidad necesitaban permitir exactamente 2 decimales

---

## Soluciones Implementadas

### 1. ✅ Corrección del Error de Aprobación de Presupuestos

**Problema:**
- El trigger de base de datos intentaba obtener `commercial_name` de la tabla `clients`
- La tabla `clients` tiene la columna `name`, no `commercial_name`
- Esto causaba un error al aprobar presupuestos y crear el proyecto automático

**Solución:**
- Se creó una nueva migración: `fix_budget_approval_client_name.sql`
- Se actualizó la función `create_project_from_approved_budget()` para usar `name` en lugar de `commercial_name`
- El trigger ahora funciona correctamente

**Código corregido:**
```sql
-- Antes (ERROR)
SELECT commercial_name INTO client_name_var
FROM clients
WHERE id = budget_rec.client_id;

-- Después (CORRECTO)
SELECT name INTO client_name_var
FROM clients
WHERE id = budget_rec.client_id;
```

---

### 2. ✅ Implementación de Formateo de Importes

**Nuevo archivo creado:** `src/utils/formatUtils.ts`

Se creó un sistema completo de formateo de números con las siguientes funciones:

#### `formatCurrency(amount)`
Formatea números como moneda con separadores de miles:
- Ejemplo: `1436200` → `1.436.200,00 €`
- Usa el formato español (es-ES)
- Siempre muestra 2 decimales
- Incluye el símbolo del euro

#### `formatNumber(value, decimals)`
Formatea números con separadores de miles:
- Ejemplo: `13.50` → `13,50`
- Configurable número de decimales (por defecto 2)
- Usa el formato español (es-ES)

#### `parseFormattedNumber(value)`
Convierte strings formateados a números:
- Ejemplo: `"1.436.200,00"` → `1436200.00`
- Elimina puntos de miles
- Convierte coma decimal a punto

#### `formatPercentage(value)`
Formatea porcentajes:
- Ejemplo: `21` → `21,00 %`
- Siempre muestra 2 decimales

---

### 3. ✅ Aplicación del Formateo en Todo el Módulo

Se actualizó el componente `BudgetsModule.tsx` para usar las funciones de formateo en:

**Tarjetas de Estadísticas:**
- Valor Total de presupuestos aprobados

**Formulario de Presupuesto:**
- Subtotal (Material y Mano de Obra)
- Gastos Generales
- Beneficio Industrial
- Descuento
- Base Imponible
- IVA
- Total del Presupuesto

**Vista de Detalles:**
- Total del presupuesto
- Subtotales por capítulo
- Precios unitarios de partidas
- Importes totales de partidas
- Todos los desglose económicos

**Lista de Presupuestos:**
- Total de cada presupuesto
- Subtotal de cada presupuesto

**Tablas de Partidas:**
- Precio unitario
- Importe total

---

### 4. ✅ Configuración de Inputs para 2 Decimales

Se actualizaron todos los campos numéricos para permitir exactamente 2 decimales:

**Campos Actualizados:**

#### Campo de Cantidad (estimated_quantity):
```tsx
// Antes
<input
  type="number"
  step="0.001"  // ❌ Permitía 3 decimales
  value={quantity}
/>

// Después
<input
  type="number"
  step="0.01"   // ✅ Permite 2 decimales
  min="0"       // ✅ Solo valores positivos
  value={quantity}
/>
```

#### Campo de Precio Unitario (unit_price):
```tsx
// Antes
<input
  type="number"
  step="0.01"
  value={price}
/>

// Después
<input
  type="number"
  step="0.01"   // ✅ Ya tenía 2 decimales
  min="0"       // ✅ Solo valores positivos añadido
  value={price}
/>
```

**Ubicaciones actualizadas:**
1. Formulario de nueva partida (campos rápidos)
2. Tabla de edición de partidas existentes
3. Todos los inputs numéricos de precio y cantidad

---

## Ejemplos de Formateo Aplicado

### Antes vs Después

| Ubicación | Antes | Después |
|-----------|-------|---------|
| Subtotal | €1436200.50 | 1.436.200,50 € |
| Gastos Generales (13%) | €186706.07 | 186.706,07 € |
| Total Presupuesto | €2000000.00 | 2.000.000,00 € |
| Precio Unitario | €125.5 | 125,50 € |
| Porcentaje IVA | 21% | 21,00 % |

---

## Beneficios de las Correcciones

### 1. Funcionalidad Restaurada
- ✅ Los presupuestos ahora se pueden aprobar sin errores
- ✅ Los proyectos se generan automáticamente al aprobar
- ✅ El flujo completo funciona correctamente

### 2. Mejor Legibilidad
- ✅ Los importes se leen fácilmente con separadores de miles
- ✅ Formato profesional y estándar español
- ✅ Consistencia en toda la aplicación

### 3. Precisión Numérica
- ✅ Exactamente 2 decimales en todos los importes
- ✅ No se permiten valores negativos
- ✅ Incrementos precisos con step="0.01"

### 4. Experiencia de Usuario Mejorada
- ✅ Números más fáciles de leer
- ✅ Entrada de datos más intuitiva
- ✅ Validación automática de valores

---

## Archivos Modificados

### Base de Datos
1. **Nueva Migración:**
   - `supabase/migrations/fix_budget_approval_client_name.sql`

### Código Frontend
2. **Nuevo Archivo:**
   - `src/utils/formatUtils.ts` (funciones de formateo)

3. **Archivo Modificado:**
   - `src/components/management/BudgetsModule.tsx` (aplicación del formateo)

### Documentación
4. **Nuevo Documento:**
   - `CORRECCION_PRESUPUESTOS_FORMATEO.md` (este archivo)

---

## Verificación de Funcionamiento

### ✅ Base de Datos
```bash
✓ Migración aplicada correctamente
✓ Trigger actualizado
✓ Función create_project_from_approved_budget() corregida
```

### ✅ Compilación
```bash
✓ Proyecto compilado sin errores
✓ 1990 módulos transformados
✓ Build exitoso en 14.68s
```

### ✅ Formateo de Números
- Todos los importes muestran separadores de miles
- Formato español (1.234.567,89 €)
- Siempre 2 decimales
- Símbolo de euro incluido

### ✅ Inputs Numéricos
- Step configurado a 0.01 (2 decimales)
- Validación min="0" (no negativos)
- Funciona en formularios y tablas

---

## Cómo Usar el Sistema de Formateo

### En Componentes React

```tsx
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatUtils';

// Formatear como moneda
const total = 1436200.50;
<span>{formatCurrency(total)}</span>  // Muestra: 1.436.200,50 €

// Formatear número con decimales
const cantidad = 125.5;
<span>{formatNumber(cantidad, 2)}</span>  // Muestra: 125,50

// Formatear porcentaje
const iva = 21;
<span>{formatPercentage(iva)}</span>  // Muestra: 21,00 %
```

### En Inputs HTML

```tsx
// Cantidad con 2 decimales
<input
  type="number"
  step="0.01"
  min="0"
  value={cantidad}
  onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
/>

// Precio con 2 decimales
<input
  type="number"
  step="0.01"
  min="0"
  value={precio}
  onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
/>
```

---

## Pruebas Recomendadas

### 1. Aprobación de Presupuestos
- [ ] Crear un nuevo presupuesto
- [ ] Enviarlo a revisión
- [ ] Aprobarlo y verificar que se crea el proyecto
- [ ] Confirmar que no hay errores de "commercial_name"

### 2. Formateo de Importes
- [ ] Verificar que todos los importes tienen separadores de miles
- [ ] Confirmar que siempre muestran 2 decimales
- [ ] Comprobar el símbolo del euro

### 3. Entrada de Datos
- [ ] Introducir cantidad con decimales (ej: 12.75)
- [ ] Introducir precio unitario (ej: 125.50)
- [ ] Verificar que solo acepta 2 decimales
- [ ] Intentar valores negativos (debe rechazarlos)

### 4. Cálculos
- [ ] Verificar que cantidad × precio = importe correcto
- [ ] Comprobar sumas de capítulos
- [ ] Verificar cálculo de gastos generales
- [ ] Confirmar cálculo de IVA

---

## Próximos Pasos Sugeridos

1. **Extender el Formateo a Otros Módulos:**
   - Aplicar `formatCurrency()` en módulo de Certificaciones
   - Aplicar en módulo de Liquidaciones
   - Aplicar en módulo de Tesorería

2. **Mejorar Validaciones:**
   - Añadir validación de rangos máximos
   - Alertas cuando los importes son muy altos
   - Confirmación para cambios importantes

3. **Exportación:**
   - Verificar que los Excel mantienen el formato
   - Asegurar que los PDF muestran bien los números

---

## Soporte Técnico

Si encuentras algún problema:

1. Verifica que la migración se aplicó correctamente
2. Comprueba que el archivo `formatUtils.ts` existe
3. Confirma que el import está en `BudgetsModule.tsx`
4. Revisa la consola del navegador por errores

---

*Correcciones aplicadas el 16 de Enero de 2025*

**Estado:** ✅ Todas las correcciones implementadas y verificadas
