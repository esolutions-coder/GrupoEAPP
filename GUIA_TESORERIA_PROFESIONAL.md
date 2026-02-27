# Guía del Módulo de Tesorería Multibanco Profesional

## 📋 Resumen

El módulo de Tesorería Multibanco es un sistema completo de gestión financiera que te permite controlar todas tus cuentas bancarias, movimientos, y generar informes profesionales en PDF y Excel.

---

## 🎯 Características Principales

### ✅ Pool Bancario Mensual
- Consolidado de todas las cuentas bancarias
- Saldo total en tiempo real
- Ingresos y gastos del mes
- Flujo neto de efectivo
- Detalle por cada cuenta

### ✅ Movimientos de Tesorería
- Lista completa de todos los movimientos
- Filtrado por búsqueda
- Clasificación por tipo (ingreso/gasto)
- Estado de conciliación
- Vinculación con proyectos, clientes y proveedores

### ✅ Exportación Profesional
- **PDF**: Informes listos para imprimir
- **Excel**: Datos para análisis detallado
- Pool bancario completo
- Movimientos mensuales

### ✅ Análisis Financiero
- KPIs en tiempo real
- Comparativa ingresos vs gastos
- Balance por cuenta
- Movimientos conciliados vs pendientes

---

## 📊 Estructura del Módulo

### 1. Pool Bancario

El pool bancario es el **consolidado mensual** de todas tus cuentas bancarias. Te muestra:

#### KPIs Principales (Tarjetas Superiores)

**🔵 Saldo Total**
- Suma de saldos de todas las cuentas activas
- Número de cuentas bancarias
- Se actualiza automáticamente con cada movimiento conciliado

**🟢 Ingresos del Mes**
- Total de ingresos confirmados del periodo
- Solo incluye movimientos conciliados
- Incluye: certificaciones, cobros de clientes, transferencias recibidas, etc.

**🔴 Gastos del Mes**
- Total de gastos confirmados del periodo
- Solo incluye movimientos conciliados
- Incluye: nóminas, pagos a proveedores, impuestos, alquileres, etc.

**📈 Flujo Neto del Mes**
- Diferencia entre ingresos y gastos
- Color verde si es positivo (superávit)
- Color rojo si es negativo (déficit)
- Muestra total de movimientos registrados

#### Tabla de Detalle por Cuenta

Muestra cada cuenta bancaria con:
- **Banco**: Entidad financiera
- **Cuenta**: Alias descriptivo
- **IBAN**: Número de cuenta completo
- **Saldo Actual**: Balance en tiempo real
- **Movimientos**: Cantidad de operaciones del mes
- **Ingresos**: Total ingresado en la cuenta
- **Gastos**: Total gastado desde la cuenta

**Fila de Totales**: Suma de todas las cuentas

### 2. Movimientos

Lista completa de todas las operaciones bancarias del mes seleccionado.

#### Filtros y Búsqueda
- **Búsqueda**: Por concepto, banco o cuenta
- **Periodo**: Mes y año seleccionables

#### KPIs de Movimientos
- Total de movimientos
- Cantidad de ingresos
- Cantidad de gastos
- Movimientos conciliados

#### Tabla de Movimientos

Cada movimiento muestra:
- **Fecha**: Fecha de operación y fecha valor
- **Banco/Cuenta**: Dónde se realizó la operación
- **Concepto**: Descripción del movimiento
  - Proyecto asociado (si aplica)
  - Cliente o proveedor relacionado
- **Importe**:
  - Verde con + para ingresos
  - Rojo con - para gastos
- **Estado**:
  - ✅ Conciliado: Confirmado y contabilizado
  - ⚠️ Pendiente: Por revisar o confirmar

---

## 📤 Exportación de Informes

### PDF Pool Bancario

Genera un informe profesional en PDF con:

**Página 1: Resumen General**
- Título: "POOL BANCARIO MENSUAL"
- Periodo seleccionado
- Tabla resumen con:
  - Total cuentas
  - Saldo total
  - Movimientos del mes
  - Ingresos totales
  - Gastos totales
  - Flujo neto

**Página 1 (continuación): Detalle por Cuenta**
- Tabla con todas las cuentas
- Columnas: Banco, Cuenta, IBAN, Saldo, Movimientos, Ingresos, Gastos
- Formato profesional listo para imprimir

**Uso**: Presentar a dirección, bancos, inversores, auditorías

### Excel Pool Bancario

Genera un archivo Excel con dos hojas:

**Hoja 1: Pool Bancario**
- Resumen general editable
- Detalle por cuenta
- Formato con anchos de columna optimizados
- Listo para análisis con fórmulas

**Hoja 2: Movimientos**
- Lista completa de movimientos del mes
- Columnas: Fecha Op., Fecha Valor, Banco, Cuenta, Concepto, Tipo, Importe, Estado, Proyecto, Cliente, Proveedor
- Perfecto para análisis con tablas dinámicas
- Filtros y ordenación personalizables

**Uso**: Análisis financiero, contabilidad, reportes internos

### PDF Movimientos

Genera un informe PDF de movimientos en formato horizontal (landscape):

**Contenido:**
- Título: "MOVIMIENTOS DE TESORERÍA"
- Periodo seleccionado
- Tabla completa de movimientos
- Columnas: Fecha, Banco, Cuenta, Concepto, Tipo, Importe, Conciliado
- Formato compacto para ver muchos movimientos

**Uso**: Revisión de movimientos, auditoría, conciliación

---

## 🔄 Flujo de Trabajo Completo

### Paso 1: Configuración Inicial (Una sola vez)

#### 1.1 Crear Bancos
1. Ve a **Finanzas → Tesorería** (en el módulo completo, no el simplificado)
2. Pestaña **"Bancos"**
3. Click **"+ Nuevo Banco"**
4. Rellena:
   - Nombre: `BBVA`
   - BIC/SWIFT: `BBVAESMM`
   - Gestor: `Juan Pérez`
   - Teléfono: `912345678`
   - Email: `gestor@bbva.es`
5. Guardar

Repite para cada banco con el que trabajas (Santander, CaixaBank, Sabadell, etc.)

#### 1.2 Crear Cuentas Bancarias
1. Pestaña **"Cuentas"**
2. Click **"+ Nueva Cuenta"**
3. Rellena:
   - Banco: Seleccionar `BBVA`
   - Alias: `BBVA Operativa Principal`
   - IBAN: `ES91 2100 0418 4502 0005 1332`
   - Tipo: `Operativa` (o Ahorro, Crédito, etc.)
   - Saldo inicial: `50.000,00 €`
   - Fecha saldo inicial: `01/01/2025`
   - Estado: `Activa`
4. Guardar

Repite para cada cuenta bancaria de la empresa.

### Paso 2: Registro de Movimientos

#### Opción A: Registro Manual

1. Pestaña **"Movimientos"**
2. Click **"+ Nuevo Movimiento"**
3. Rellena:
   - Cuenta bancaria: Seleccionar cuenta
   - Fecha operación: `15/01/2025`
   - Fecha valor: `15/01/2025`
   - Tipo: `Ingreso` o `Gasto`
   - Importe: `12.500,00 €`
   - Concepto: `Certificación enero - Obra A-7`
   - Proyecto: Seleccionar (opcional)
   - Cliente/Proveedor: Seleccionar (opcional)
   - Referencia: `CERT-2025-001`
   - Estado: `Conciliado`
4. Guardar

#### Opción B: Importación desde Excel

1. Descarga extracto bancario en Excel
2. Pestaña **"Movimientos"**
3. Click **"Importar"**
4. Selecciona archivo Excel
5. Mapea columnas:
   - Fecha → Columna A
   - Concepto → Columna B
   - Importe → Columna C
6. Revisa y confirma
7. Los movimientos se importan como "Pendientes"
8. Revísalos y márcalos como "Conciliados"

### Paso 3: Consulta del Pool Bancario

1. Ve al **Módulo Simplificado**: **Finanzas → Tesorería**
2. Pestaña **"Pool Bancario"**
3. Selecciona mes: `Enero 2025`
4. Verás:
   - ✅ Saldo total de todas las cuentas
   - ✅ Ingresos y gastos del mes
   - ✅ Flujo neto
   - ✅ Detalle por cada cuenta

### Paso 4: Generación de Informes

#### Pool Bancario Mensual

**Para PDF:**
1. Pestaña **"Pool Bancario"**
2. Selecciona mes
3. Click **"PDF Pool"**
4. Se descarga automáticamente
5. Archivo: `pool_bancario_2025-01.pdf`

**Para Excel:**
1. Pestaña **"Pool Bancario"**
2. Selecciona mes
3. Click **"Excel Pool"**
4. Se descarga automáticamente
5. Archivo: `pool_bancario_2025-01.xlsx`

#### Movimientos Mensuales

1. Pestaña **"Movimientos"**
2. Selecciona mes
3. (Opcional) Filtra con búsqueda
4. Click **"PDF Movimientos"**
5. Se descarga: `movimientos_tesoreria_2025-01.pdf`

---

## 📈 Casos de Uso

### Caso 1: Revisión Mensual con Dirección

**Objetivo**: Presentar situación financiera del mes

**Proceso:**
1. Asegúrate de que todos los movimientos están conciliados
2. Ve a Pool Bancario del mes
3. Exporta a PDF
4. Revisa el informe:
   - ✅ Saldo total disponible
   - ✅ Si el flujo neto es positivo
   - ✅ Qué cuentas tienen más movimiento
5. Presenta en reunión

**Resultado**: Informe profesional de 1-2 páginas con toda la info

### Caso 2: Preparación para Auditoría

**Objetivo**: Documentación completa de movimientos

**Proceso:**
1. Selecciona cada mes del año
2. Exporta Pool Bancario a Excel
3. Exporta Movimientos a Excel
4. Organiza en carpeta: `Tesorería 2025/`
   - `01-Enero/pool_bancario_2025-01.xlsx`
   - `01-Enero/movimientos_2025-01.xlsx`
   - `02-Febrero/...`
5. Entrega a auditor

**Resultado**: Documentación completa y trazable

### Caso 3: Análisis de Liquidez

**Objetivo**: Ver si tenemos suficiente efectivo

**Proceso:**
1. Ve a Pool Bancario
2. Revisa **Saldo Total**
3. Compara con:
   - Pagos programados próximos 30 días
   - Nóminas del mes
   - Facturas pendientes de pago
4. Si saldo es insuficiente:
   - Revisa **Ingresos esperados** (certificaciones)
   - Considera usar póliza de crédito
   - Negocia pagos aplazados

**Resultado**: Decisión informada sobre liquidez

### Caso 4: Control de Gastos por Proyecto

**Objetivo**: Ver cuánto se ha gastado en cada obra

**Proceso:**
1. Ve a Movimientos
2. Exporta a Excel
3. Abre el archivo
4. Filtra columna "Proyecto" por: `Autopista A-7`
5. Suma gastos:
   - Materiales
   - Nóminas
   - Alquileres
6. Compara con presupuesto

**Resultado**: Control de desviaciones por proyecto

### Caso 5: Solicitud de Financiación

**Objetivo**: Demostrar solvencia al banco

**Proceso:**
1. Exporta Pool Bancario de últimos 6 meses
2. Genera PDF de cada mes
3. Prepara carpeta: `Solvencia Empresa/`
   - `pool_bancario_2024-07.pdf`
   - `pool_bancario_2024-08.pdf`
   - ...
   - `pool_bancario_2024-12.pdf`
4. Destaca:
   - ✅ Saldo medio mensual
   - ✅ Flujos netos positivos
   - ✅ Crecimiento de ingresos
5. Presenta al banco

**Resultado**: Mayor probabilidad de aprobación

---

## 🎨 Interpretación de Colores

### Tarjetas KPI
- **🔵 Azul**: Información general (saldo, cuentas)
- **🟢 Verde**: Ingresos, positivo, superávit
- **🔴 Rojo**: Gastos, negativo, déficit

### Tabla de Movimientos
- **Verde (+)**: Ingresos
- **Rojo (-)**: Gastos

### Estados
- **Verde (✅)**: Conciliado, confirmado, activo
- **Amarillo (⚠️)**: Pendiente, requiere atención

---

## ⚠️ Puntos Importantes

### 1. Movimientos Conciliados vs Pendientes

**Conciliado**:
- Confirmado en extracto bancario
- Afecta al saldo de la cuenta
- Se incluye en totales del pool

**Pendiente**:
- Registrado pero no confirmado
- NO afecta al saldo de la cuenta
- NO se incluye en totales del pool
- Útil para pre-registrar operaciones futuras

**Recomendación**: Concilia movimientos al menos semanalmente

### 2. Fecha Operación vs Fecha Valor

**Fecha Operación**: Cuando se ordenó la transacción
**Fecha Valor**: Cuando realmente se hace efectiva en la cuenta

**Ejemplo**:
- Transfieres el viernes 15 (fecha operación)
- El banco lo procesa el lunes 18 (fecha valor)

**El módulo usa fecha operación para el filtrado mensual**

### 3. Actualización de Saldos

Los saldos se actualizan **automáticamente** mediante triggers cuando:
- ✅ Creas un movimiento conciliado
- ✅ Cambias un movimiento de pendiente a conciliado
- ✅ Editas el importe de un movimiento conciliado

**No necesitas actualizar saldos manualmente**

### 4. Pool Bancario = Foto del Mes

El pool bancario muestra:
- **Saldo actual**: De TODAS las cuentas (no varía con el mes seleccionado)
- **Ingresos/Gastos**: Solo del mes seleccionado
- **Flujo Neto**: Solo del mes seleccionado

**Esto te permite ver cómo el mes actual afectó al saldo total**

### 5. Exportación Incluye Filtros

Cuando exportas movimientos:
- Si has usado la búsqueda, solo se exportan los movimientos filtrados
- Para exportar todo, borra el término de búsqueda antes de exportar

---

## 🔧 Solución de Problemas

### Problema: No veo ningún dato

**Solución**:
1. ✅ Verifica que has creado bancos
2. ✅ Verifica que has creado cuentas bancarias
3. ✅ Verifica que has registrado movimientos
4. ✅ Verifica que los movimientos son del mes seleccionado
5. ✅ Click en "Actualizar"

### Problema: Los saldos no cuadran

**Solución**:
1. ✅ Verifica que el saldo inicial de cada cuenta es correcto
2. ✅ Verifica que todos los movimientos están conciliados
3. ✅ Busca movimientos duplicados
4. ✅ Revisa que no hay movimientos con signos incorrectos
5. ✅ Compara con extracto bancario real

### Problema: Movimientos no aparecen en el pool

**Solución**:
1. ✅ Verifica que están marcados como "Conciliados"
2. ✅ Verifica que la fecha está en el mes seleccionado
3. ✅ Actualiza la página

### Problema: El Excel no se abre correctamente

**Solución**:
1. ✅ Usa Microsoft Excel 2010 o superior
2. ✅ Usa LibreOffice Calc 6.0 o superior
3. ✅ Google Sheets también funciona
4. ✅ Si los números tienen puntos en lugar de comas, configura el formato de celda

### Problema: El PDF no muestra todos los datos

**Solución**:
1. ✅ Los PDF tienen límite de páginas razonable
2. ✅ Si tienes muchos movimientos, usa Excel en su lugar
3. ✅ O exporta por rangos de fechas más pequeños

---

## 💡 Mejores Prácticas

### Registro de Movimientos
1. ✅ Registra movimientos al menos semanalmente
2. ✅ Usa referencias claras (número de factura, certificación, etc.)
3. ✅ Vincula movimientos con proyectos siempre que sea posible
4. ✅ Concilia movimientos contra extracto bancario mensualmente

### Nomenclatura de Cuentas
1. ✅ Usa alias descriptivos: `BBVA Operativa Principal`
2. ✅ No uses solo números: ❌ `Cuenta 1234`
3. ✅ Incluye el propósito: `Santander Nóminas`, `CaixaBank Proveedores`

### Gestión de Periodo
1. ✅ Cierra cada mes conciliando todos los movimientos
2. ✅ Genera y archiva pool bancario mensual
3. ✅ Revisa flujo neto mensualmente
4. ✅ Compara mes actual vs meses anteriores

### Exportaciones
1. ✅ Guarda los PDF en carpeta organizada por fecha
2. ✅ Usa Excel para análisis detallado
3. ✅ Usa PDF para presentaciones y archivo
4. ✅ Mantén histórico de al menos 3 años

---

## 📞 Preguntas Frecuentes

### P: ¿Puedo importar extractos del banco directamente?
**R**: Sí, en el módulo completo hay una opción de importación desde Excel. Mapea las columnas y los movimientos se cargan automáticamente.

### P: ¿El pool bancario se actualiza en tiempo real?
**R**: Sí, cada vez que concilias un movimiento, los saldos y totales se actualizan automáticamente.

### P: ¿Puedo tener múltiples cuentas del mismo banco?
**R**: Sí, puedes tener todas las cuentas que necesites de cualquier banco.

### P: ¿Cómo vinculo un movimiento con un proyecto?
**R**: Al crear o editar un movimiento, selecciona el proyecto de la lista desplegable.

### P: ¿Qué diferencia hay entre este módulo y el de TreasuryManagement?
**R**: Este es el módulo SIMPLIFICADO enfocado en pool bancario e informes. TreasuryManagement es el módulo COMPLETO con pólizas, factoring, leasing, previsiones, etc.

### P: ¿Puedo personalizar los informes PDF?
**R**: Los informes están optimizados para uso profesional general. Si necesitas personalizaciones, contacta al equipo de desarrollo.

### P: ¿Los datos se guardan en la nube?
**R**: Sí, todos los datos se almacenan de forma segura en Supabase con encriptación y backups automáticos.

---

## ✅ Checklist Mensual

Usa esta lista para tu rutina mensual de tesorería:

**Inicio del Mes**
- [ ] Registrar movimientos del mes anterior
- [ ] Conciliar todos los movimientos contra extractos
- [ ] Verificar que saldos coinciden con bancos
- [ ] Generar pool bancario del mes cerrado
- [ ] Archivar informes PDF/Excel

**Durante el Mes**
- [ ] Registrar movimientos semanalmente
- [ ] Revisar flujo de efectivo semanal
- [ ] Identificar movimientos pendientes
- [ ] Actualizar proyecciones

**Fin del Mes**
- [ ] Conciliación final
- [ ] Generar pool bancario preliminar
- [ ] Revisar flujo neto con dirección
- [ ] Preparar análisis de desviaciones
- [ ] Planificar mes siguiente

---

## 🎯 Resumen Rápido

**Para ver tu situación financiera:**
1. Ve a **Finanzas → Tesorería**
2. Tab **"Pool Bancario"**
3. Selecciona mes
4. Listo ✅

**Para generar informe PDF:**
1. Pool Bancario
2. Click **"PDF Pool"**
3. Descarga automática ✅

**Para generar informe Excel:**
1. Pool Bancario
2. Click **"Excel Pool"**
3. Descarga con 2 hojas: Pool + Movimientos ✅

**Para análisis detallado:**
1. Tab **"Movimientos"**
2. Busca, filtra
3. Exporta a Excel
4. Analiza con tablas dinámicas ✅

---

**¡El módulo está listo para usar! Profesional, funcional y completo.**
