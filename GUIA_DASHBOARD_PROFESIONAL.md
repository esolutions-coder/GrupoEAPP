# Guía del Dashboard Profesional

## 📋 Resumen

El Dashboard Profesional es el centro de control ejecutivo de la empresa. Genera informes completos en PDF y Excel para análisis mensual, anual, por proyecto y por trabajador. Todo basado en datos reales de la base de datos.

---

## 🎯 Características Principales

### ✅ Informes Ejecutivos
- **Informe Mensual PDF**: Resumen completo del mes
- **Informe Anual PDF**: Consolidado del año
- **Informe por Proyecto PDF**: Análisis detallado de proyecto
- **Informe por Trabajador PDF**: Historial completo del trabajador
- **Excel Completo**: Todas las métricas en formato editable

### ✅ KPIs en Tiempo Real
Conectado a Supabase, muestra:
- Trabajadores activos vs totales
- Proyectos activos vs totales
- Saldo de tesorería
- Maquinaria operativa
- Ingresos y gastos mensuales
- Flujo de caja neto
- Certificaciones
- Liquidaciones pendientes
- Presupuestos (aprobados/pendientes)

### ✅ Análisis Financiero
- Balance ingresos/gastos
- Ratio de rentabilidad
- Estado del periodo (superávit/déficit)
- Liquidez disponible
- Tendencias

### ✅ Accesos Rápidos
Botones directos a todos los módulos principales

---

## 📊 Tipos de Informes

### 1. **Informe Mensual** 📅

**Qué incluye:**
```
1. RESUMEN EJECUTIVO
   - Recursos Humanos
     • Trabajadores activos
     • Liquidaciones pendientes

   - Proyectos
     • Proyectos activos
     • Certificaciones del mes

   - Finanzas
     • Ingresos del mes
     • Gastos del mes
     • Flujo neto
     • Saldo tesorería

   - Operaciones
     • Maquinaria activa
     • Presupuestos (aprobados/pendientes)

2. PROYECTOS ACTIVOS (TOP 5)
   - Nombre y código
   - Presupuesto
   - Total certificado
   - Margen (%)

3. INDICADORES FINANCIEROS
   - Ratio Ingresos/Gastos
   - Liquidez disponible
   - Estado del periodo
```

**Formato:** PDF de 1-2 páginas
**Archivo:** `informe_mensual_YYYY-MM.pdf`

**Cuándo usarlo:**
- Reuniones mensuales con dirección
- Análisis de resultados del mes
- Presentaciones a inversores
- Reportes internos
- Histórico de gestión

### 2. **Informe Anual** 📆

**Qué incluye:**
```
RESUMEN CONSOLIDADO ANUAL
- Total trabajadores
- Total proyectos ejecutados
- Proyectos activos
- Total certificaciones
- Ingresos totales (proyección anual)
- Gastos totales (proyección anual)
- Resultado neto
- Saldo tesorería final
```

**Formato:** PDF de 1 página
**Archivo:** `informe_anual_YYYY.pdf`

**Cuándo usarlo:**
- Cierres de ejercicio
- Reuniones con accionistas
- Auditorías
- Planificación estratégica
- Memorias anuales

### 3. **Informe por Proyecto** 🏗️

**Qué incluye:**
```
INFORMACIÓN DEL PROYECTO
- Nombre y código
- Cliente
- Estado (activo/completado/pausado)
- Fecha inicio y fin

ANÁLISIS FINANCIERO
- Presupuesto total
- Total certificado
- Total costes
- Margen (€ y %)
- % Avance

CERTIFICACIONES
- Lista de todas las certificaciones
- Fechas e importes
- Histórico completo
```

**Formato:** PDF de 2-3 páginas
**Archivo:** `informe_proyecto_[CODIGO].pdf`

**Cuándo usarlo:**
- Seguimiento de obras
- Presentación a clientes
- Análisis de rentabilidad
- Informes de progreso
- Cierre de proyectos

### 4. **Informe por Trabajador** 👷

**Qué incluye:**
```
INFORMACIÓN DEL TRABAJADOR
- Nombre completo y DNI
- Categoría profesional
- Tipo de contrato
- Fecha de alta
- Estado (activo/inactivo)

MÉTRICAS LABORALES
- Total horas trabajadas
- Total pagado (neto)
- Liquidaciones pendientes
- Número de liquidaciones

LIQUIDACIONES RECIENTES (últimas 10)
- Fecha de liquidación
- Periodo (inicio - fin)
- Salario bruto
- Salario neto
- Estado (pagada/pendiente)
```

**Formato:** PDF de 2-3 páginas
**Archivo:** `informe_trabajador_[DNI].pdf`

**Cuándo usarlo:**
- Revisión individual de empleados
- Solicitud del trabajador
- Auditorías laborales
- Análisis de costes de personal
- Procesos de nómina

### 5. **Excel Completo** 📊

**Qué incluye:**

**Hoja 1: KPIs**
- Todos los indicadores del dashboard
- Recursos humanos
- Proyectos
- Finanzas
- Operaciones

**Hoja 2: Proyectos**
- Lista completa de proyectos activos
- Columnas: Nombre, Código, Estado, Presupuesto, Certificado, Gastos, Margen, Margen %

**Hoja 3: Trabajadores**
- Lista de trabajadores
- Columnas: Nombre, Categoría, Tipo Contrato, Liquidaciones Pendientes, Última Liquidación

**Formato:** Excel (.xlsx)
**Archivo:** `dashboard_completo_YYYY-MM.xlsx`

**Cuándo usarlo:**
- Análisis detallado con tablas dinámicas
- Gráficos personalizados
- Exportación a otros sistemas
- Análisis financiero avanzado
- Contabilidad

---

## 🎛️ Interfaz del Dashboard

### Selector de Tipo de Informe

```
┌─────────────────────────────────────────────────────────────┐
│ Tipo de Informe: [Mensual ▾]                                │
│                                                               │
│ Mes: [2025-01 ▾]                                            │
│                                                               │
│ [ Actualizar ]  [ PDF Mensual ]  [ Excel Completo ]        │
└─────────────────────────────────────────────────────────────┘
```

**Opciones:**
1. **Mensual**: Requiere seleccionar mes (YYYY-MM)
2. **Anual**: Requiere seleccionar año (YYYY)
3. **Por Proyecto**: Requiere seleccionar proyecto de lista
4. **Por Trabajador**: Requiere seleccionar trabajador de lista

### KPIs Principales (4 Tarjetas)

```
┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ 👥 Trabajadores      │ 🏗️ Proyectos         │ 🏦 Saldo Tesorería   │ 🚛 Maquinaria        │
│                      │                      │                      │                      │
│     247              │     18               │  125.450 €           │     45               │
│                      │                      │                      │                      │
│ de 280 totales       │ de 25 totales        │ disponible           │ de 52 totales        │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

### Tarjetas Financieras (3 Tarjetas)

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│ 🟢 Ingresos del Mes  │ 🔴 Gastos del Mes    │ 📈 Flujo Neto        │
│                      │                      │                      │
│   285.000 €          │   198.500 €          │   +86.500 €          │
│                      │                      │                      │
│ 12 certificaciones   │ operativos y finan.  │ Superávit            │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

**Colores:**
- 🟢 Verde: Ingresos, positivo
- 🔴 Rojo: Gastos, negativo
- 📈 Azul: Superávit / 🔶 Naranja: Déficit

### Panel de Proyectos Activos

```
┌─────────────────────────────────────────────────────────┐
│ 🏗️ Proyectos Activos (Top 5)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📁 Autopista A-7 Valencia                    [A7-2024]  │
│ Presupuesto: 1.250.000 €                                │
│ Certificado: 875.000 €                                   │
│ Margen: 18.5%                                           │
│ [ 👁️ Ver detalles ]                                     │
│                                                          │
│ 📁 Edificio Residencial Marina              [ERM-2024]  │
│ Presupuesto: 850.000 €                                   │
│ Certificado: 520.000 €                                   │
│ Margen: 22.3%                                           │
│ [ 👁️ Ver detalles ]                                     │
│                                                          │
│ ... (3 proyectos más)                                    │
└─────────────────────────────────────────────────────────┘
```

### Panel de Indicadores Operacionales

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Indicadores Operacionales                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🏆 Certificaciones                              12      │
│                                                          │
│ 💰 Liquidaciones Pendientes                     8       │
│                                                          │
│ ✅ Presupuestos Aprobados                      15       │
│                                                          │
│ ⏱️ Presupuestos Pendientes                      5       │
│                                                          │
│ 🚛 Ratio Maquinaria                            87%      │
└─────────────────────────────────────────────────────────┘
```

### Accesos Rápidos

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ 🏗️      │ 👥      │ 🏦      │ 🏆      │ 💰      │ 📄      │
│ Proyec. │ Trabaj. │ Tesorer.│ Certif. │ Liquid. │ Presupu.│
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

Click en cualquier botón para ir directamente al módulo.

---

## 📤 Generación de Informes - Paso a Paso

### Informe Mensual

1. **Seleccionar Tipo**
   - En "Tipo de Informe" selecciona **"Mensual"**

2. **Seleccionar Mes**
   - En "Mes" selecciona el periodo (ej: `2025-01` para enero 2025)
   - El sistema carga automáticamente todos los datos del mes

3. **Revisar KPIs**
   - Verifica que los datos mostrados son correctos
   - Revisa ingresos, gastos y flujo neto

4. **Generar PDF**
   - Click en botón **"PDF Mensual"** (rojo)
   - Descarga automática
   - Archivo: `informe_mensual_2025-01.pdf`

5. **Usar el Informe**
   - Abre el PDF
   - Listo para imprimir o enviar
   - Presenta en reuniones

**Tiempo:** 30 segundos

### Informe Anual

1. **Seleccionar Tipo**
   - En "Tipo de Informe" selecciona **"Anual"**

2. **Seleccionar Año**
   - En "Año" escribe el año (ej: `2024`)
   - Los datos se proyectan anualmente

3. **Generar PDF**
   - Click en botón **"PDF Anual"** (rojo)
   - Descarga automática
   - Archivo: `informe_anual_2024.pdf`

**Tiempo:** 20 segundos

### Informe por Proyecto

1. **Seleccionar Tipo**
   - En "Tipo de Informe" selecciona **"Por Proyecto"**

2. **Seleccionar Proyecto**
   - En el desplegable "Proyecto" elige uno
   - Aparecen ordenados por nombre
   - Muestra: `Nombre del Proyecto (CODIGO)`

3. **Generar PDF**
   - Click en botón **"PDF Proyecto"** (rojo)
   - Si no hay proyecto seleccionado, el botón está deshabilitado
   - Descarga automática
   - Archivo: `informe_proyecto_A7-2024.pdf`

**El informe incluye:**
- Información completa del proyecto
- Análisis financiero
- Lista de todas las certificaciones
- Cálculo de margen

**Tiempo:** 45 segundos

### Informe por Trabajador

1. **Seleccionar Tipo**
   - En "Tipo de Informe" selecciona **"Por Trabajador"**

2. **Seleccionar Trabajador**
   - En el desplegable "Trabajador" elige uno
   - Aparecen ordenados por nombre
   - Muestra: `Nombre Completo`

3. **Generar PDF**
   - Click en botón **"PDF Trabajador"** (rojo)
   - Si no hay trabajador seleccionado, el botón está deshabilitado
   - Descarga automática
   - Archivo: `informe_trabajador_12345678A.pdf`

**El informe incluye:**
- Datos personales y laborales
- Total horas trabajadas
- Total pagado
- Lista de liquidaciones recientes

**Tiempo:** 45 segundos

### Excel Completo

1. **Seleccionar Periodo**
   - Elige tipo "Mensual" o "Anual"
   - Selecciona el periodo

2. **Generar Excel**
   - Click en botón **"Excel Completo"** (verde)
   - Genera 3 hojas: KPIs, Proyectos, Trabajadores
   - Descarga automática
   - Archivo: `dashboard_completo_2025-01.xlsx`

3. **Usar el Excel**
   - Abre con Microsoft Excel, LibreOffice o Google Sheets
   - Todas las columnas tienen anchos optimizados
   - Crea tablas dinámicas
   - Genera gráficos personalizados
   - Exporta a contabilidad

**Tiempo:** 30 segundos

---

## 💡 Casos de Uso

### Caso 1: Reunión Mensual de Dirección

**Objetivo:** Presentar resultados del mes

**Proceso:**
1. Día 5 del mes siguiente
2. Genera informe mensual del mes cerrado
3. Revisa KPIs antes de exportar
4. Exporta a PDF
5. Imprime 5 copias para directivos
6. Presenta en reunión

**Lo que se discute:**
- ¿Los ingresos superaron a los gastos?
- ¿Qué proyectos tienen mejor margen?
- ¿Hay liquidez suficiente?
- ¿Cuántas certificaciones se lograron?
- ¿Hay liquidaciones atrasadas?

**Resultado:** Decisiones informadas para el mes siguiente

### Caso 2: Cierre de Año

**Objetivo:** Documentar el ejercicio fiscal

**Proceso:**
1. 31 de diciembre o 5 de enero
2. Genera informe anual del año
3. Genera Excel completo de diciembre
4. Exporta informes de todos los proyectos activos
5. Archiva en carpeta `Cierres/2024/`
6. Entrega a contabilidad y auditor

**Resultado:** Documentación completa para auditoría y contabilidad

### Caso 3: Análisis de Rentabilidad de Proyecto

**Objetivo:** Ver si un proyecto es rentable

**Proceso:**
1. Elige "Por Proyecto"
2. Selecciona el proyecto (ej: "Autopista A-7")
3. Genera PDF
4. Revisa el informe:
   - ✅ Margen positivo (>15%): Excelente
   - ⚠️ Margen bajo (5-15%): Revisar
   - ❌ Margen negativo: Problema

**Si el margen es bajo o negativo:**
- Analiza costes excesivos
- Revisa certificaciones pendientes
- Negocia extras con cliente
- Optimiza recursos

**Resultado:** Acción correctiva inmediata

### Caso 4: Solicitud de Informe de Trabajador

**Objetivo:** El trabajador pide su historial

**Proceso:**
1. Trabajador solicita informe a RRHH
2. RRHH entra al Dashboard
3. Selecciona "Por Trabajador"
4. Busca y selecciona al trabajador
5. Genera PDF
6. Revisa que no hay datos sensibles de otros
7. Entrega al trabajador (email o impreso)

**El trabajador recibe:**
- Sus datos completos
- Total horas trabajadas
- Total cobrado
- Liquidaciones detalladas

**Resultado:** Transparencia y cumplimiento legal

### Caso 5: Análisis Financiero con Excel

**Objetivo:** Hacer análisis avanzado de tendencias

**Proceso:**
1. Genera Excel completo de cada mes (enero a diciembre)
2. Abre todos los archivos
3. Crea un consolidado en nuevo Excel
4. Usa tablas dinámicas para:
   - Evolución mensual de ingresos
   - Evolución mensual de gastos
   - Proyectos más rentables
   - Costes de personal por mes
5. Genera gráficos de líneas
6. Presenta tendencias a dirección

**Resultado:** Visión estratégica del año

### Caso 6: Auditoría Externa

**Objetivo:** Facilitar datos al auditor

**Proceso:**
1. Auditor solicita documentación
2. Genera:
   - Informe anual del año
   - Informes mensuales de todos los meses
   - Excel completo de cada mes
   - Informes de todos los proyectos
3. Organiza en carpeta: `Auditoria_2024/`
4. Entrega al auditor

**Resultado:** Auditoría fluida y rápida

---

## 🎨 Interpretación de Colores y Estados

### Tarjetas de KPIs

**Azul** (🔵)
- Información general
- Trabajadores
- Proyectos
- Datos neutrales

**Verde** (🟢)
- Ingresos
- Valores positivos
- Certificaciones
- Presupuestos aprobados

**Rojo** (🔴)
- Gastos
- Valores negativos
- Alertas

**Morado** (🟣)
- Finanzas
- Tesorería

**Naranja** (🟠)
- Maquinaria
- Operaciones
- Pendientes

### Flujo Neto

**Verde** (Superávit)
- Los ingresos superan a los gastos
- Situación financiera saludable
- Crecimiento

**Naranja/Rojo** (Déficit)
- Los gastos superan a los ingresos
- Requiere atención
- Tomar medidas correctivas

---

## ⚠️ Puntos Importantes

### 1. Datos en Tiempo Real

**El dashboard está conectado a Supabase:**
- Todos los números son reales
- Se actualizan automáticamente
- No hay datos mockeados
- Refleja el estado actual de la empresa

**Recomendación:** Click en "Actualizar" antes de generar informes

### 2. Periodos Cerrados vs Actuales

**Periodo Cerrado** (mes pasado):
- Datos completos
- Todas las operaciones registradas
- Informes definitivos

**Periodo Actual** (mes en curso):
- Datos parciales
- Operaciones aún en proceso
- Informes preliminares

**Recomendación:** Genera informes ejecutivos de periodos cerrados

### 3. Proyección Anual

El informe anual **proyecta** multiplicando por 12:
- Si estás en enero, proyecta enero × 12
- Si estás en diciembre, es el total real

**Recomendación:** Usa informe anual solo a final de año para datos reales

### 4. Selección de Proyecto/Trabajador

Los desplegables muestran:
- **Proyectos:** Solo activos (top 10)
- **Trabajadores:** Solo activos (top 10)

**Si no encuentras uno:**
- Puede estar inactivo
- Ve al módulo específico para buscarlo
- Genera el informe desde allí

### 5. Excel vs PDF

**PDF:** Para presentar, imprimir, archivar
**Excel:** Para analizar, editar, procesar

**Usa PDF cuando:**
- Reuniones
- Presentaciones
- Auditorías
- Archivo histórico

**Usa Excel cuando:**
- Análisis detallado
- Tablas dinámicas
- Gráficos personalizados
- Exportar a contabilidad

---

## 🔧 Solución de Problemas

### Problema: Los KPIs muestran ceros

**Causas posibles:**
1. No hay datos en la base de datos
2. El periodo seleccionado no tiene movimientos
3. Error de conexión a Supabase

**Solución:**
1. ✅ Verifica que hay proyectos, trabajadores, etc. en el sistema
2. ✅ Cambia el periodo al mes actual
3. ✅ Click en "Actualizar"
4. ✅ Revisa conexión a internet

### Problema: El PDF no se descarga

**Causas posibles:**
1. Bloqueador de pop-ups del navegador
2. Falta de espacio en disco
3. Permisos de descarga

**Solución:**
1. ✅ Permite descargas en tu navegador
2. ✅ Verifica espacio en disco
3. ✅ Prueba con otro navegador

### Problema: El Excel está vacío o corrupto

**Causas posibles:**
1. No hay datos para el periodo
2. Error al generar
3. Software no compatible

**Solución:**
1. ✅ Verifica que hay datos
2. ✅ Regenera el Excel
3. ✅ Abre con Excel 2010+, LibreOffice 6+ o Google Sheets

### Problema: No aparece mi proyecto/trabajador

**Causas:**
- Está inactivo
- No está en el top 10

**Solución:**
1. ✅ Ve al módulo de Proyectos o Trabajadores
2. ✅ Busca el que necesitas
3. ✅ Genera el informe desde allí (si disponible)
4. ✅ O actívalo para que aparezca en el dashboard

### Problema: Los números no cuadran

**Causas:**
1. Movimientos sin conciliar
2. Datos incompletos
3. Error de cálculo

**Solución:**
1. ✅ Revisa que todos los movimientos estén conciliados
2. ✅ Verifica liquidaciones, certificaciones, etc.
3. ✅ Compara con módulos específicos
4. ✅ Contacta a soporte si persiste

---

## 💡 Mejores Prácticas

### Generación de Informes

1. **Periodicidad:**
   - Mensual: Primeros 5 días del mes siguiente
   - Anual: En enero del año siguiente
   - Por proyecto: Mensual + al finalizar
   - Por trabajador: Bajo demanda

2. **Antes de Generar:**
   - ✅ Verifica que todos los datos del periodo están registrados
   - ✅ Concilia movimientos de tesorería
   - ✅ Cierra liquidaciones del mes
   - ✅ Valida certificaciones

3. **Después de Generar:**
   - ✅ Revisa el informe antes de compartir
   - ✅ Archiva en carpeta organizada
   - ✅ Respalda en la nube
   - ✅ Mantén histórico

### Organización de Archivos

```
Informes/
├── 2024/
│   ├── Mensuales/
│   │   ├── informe_mensual_2024-01.pdf
│   │   ├── informe_mensual_2024-02.pdf
│   │   └── ...
│   ├── Proyectos/
│   │   ├── informe_proyecto_A7-2024.pdf
│   │   ├── informe_proyecto_ERM-2024.pdf
│   │   └── ...
│   ├── Excel/
│   │   ├── dashboard_completo_2024-01.xlsx
│   │   └── ...
│   └── Anual/
│       └── informe_anual_2024.pdf
├── 2025/
│   └── ...
```

### Uso en Reuniones

1. **Prepara con anticipación:**
   - Genera informes 1 día antes
   - Revisa los números
   - Prepara explicaciones

2. **Durante la reunión:**
   - Proyecta el dashboard en vivo
   - Muestra KPIs en tiempo real
   - Distribuye PDFs impresos

3. **Después de la reunión:**
   - Envía PDFs por email
   - Archiva actas con informes
   - Programa acciones

---

## 📞 Preguntas Frecuentes

### P: ¿Puedo personalizar los informes PDF?
**R:** Los informes están optimizados para uso profesional general. Las personalizaciones requieren desarrollo adicional.

### P: ¿Cuántos informes puedo generar?
**R:** Ilimitados. Genera todos los que necesites.

### P: ¿Los datos están actualizados al segundo?
**R:** Los datos se cargan al abrir el dashboard y al hacer click en "Actualizar". Para datos en tiempo real, actualiza antes de generar informes.

### P: ¿Puedo exportar a otros formatos?
**R:** Actualmente PDF y Excel. Desde Excel puedes convertir a CSV, JSON, etc.

### P: ¿El Excel tiene fórmulas?
**R:** No, tiene datos estáticos. Puedes agregar tus propias fórmulas.

### P: ¿Los informes incluyen gráficos?
**R:** Los PDF no incluyen gráficos (solo tablas). Usa Excel para crear gráficos personalizados.

### P: ¿Puedo programar informes automáticos?
**R:** Actualmente debes generarlos manualmente. La automatización requiere desarrollo adicional.

### P: ¿Los informes se guardan en la base de datos?
**R:** No, se generan dinámicamente. Debes archivar los PDFs/Excel que descargues.

---

## ✅ Checklist de Uso

### Diario
- [ ] Revisar KPIs principales
- [ ] Verificar flujo neto del día (si disponible)

### Semanal
- [ ] Actualizar dashboard
- [ ] Revisar proyectos activos
- [ ] Verificar liquidaciones pendientes

### Mensual
- [ ] Cerrar mes (conciliar todo)
- [ ] Generar informe mensual PDF
- [ ] Generar Excel completo
- [ ] Archivar informes
- [ ] Presentar en reunión de dirección
- [ ] Generar informes de proyectos principales

### Anual
- [ ] Cerrar año fiscal
- [ ] Generar informe anual PDF
- [ ] Generar Excel de todos los meses
- [ ] Generar informes de todos los proyectos
- [ ] Preparar documentación para auditoría
- [ ] Archivar todo en carpeta del año

---

## 🎯 Resumen Rápido

**Para generar informe mensual:**
1. Tipo: "Mensual"
2. Mes: Selecciona
3. Click "PDF Mensual"
4. ¡Listo! ✅

**Para generar informe anual:**
1. Tipo: "Anual"
2. Año: Escribe
3. Click "PDF Anual"
4. ¡Listo! ✅

**Para generar informe de proyecto:**
1. Tipo: "Por Proyecto"
2. Proyecto: Selecciona
3. Click "PDF Proyecto"
4. ¡Listo! ✅

**Para generar informe de trabajador:**
1. Tipo: "Por Trabajador"
2. Trabajador: Selecciona
3. Click "PDF Trabajador"
4. ¡Listo! ✅

**Para Excel completo:**
1. Tipo: Cualquiera
2. Periodo: Selecciona
3. Click "Excel Completo"
4. ¡Listo! ✅

---

**¡El Dashboard Profesional está completamente funcional! Genera todos los informes que necesites en segundos.**
