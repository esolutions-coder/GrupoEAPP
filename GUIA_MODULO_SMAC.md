# Guía del Módulo de Gestión de SMAC

## Descripción General

El **Módulo de Gestión de SMAC** (Servicios de Mediación, Arbitraje y Conciliación) es un sistema completo diseñado para controlar y gestionar todos los procedimientos legales relacionados con reclamaciones laborales de ex trabajadores.

Este módulo permite a las empresas de construcción llevar un seguimiento exhaustivo de:
- Procedimientos SMAC (previos a demandas judiciales)
- Demandas judiciales laborales
- Costes asociados
- Fechas importantes
- Resoluciones y acuerdos
- Evaluación de riesgos

---

## Características Principales

### 1. Gestión Completa de Procedimientos

#### Datos del Procedimiento
- **Número SMAC**: Identificación única del procedimiento
- **Número Judicial**: Si deriva en demanda judicial
- **Fechas clave**:
  - Fecha de presentación
  - Fecha de conciliación
  - Fecha de juicio
  - Fecha de resolución

#### Datos del Trabajador Demandante
- Nombre completo y DNI
- Contacto (teléfono y email)
- Fechas de alta y baja en la empresa
- Puesto de trabajo
- Último salario

### 2. Tipos de Reclamaciones

El sistema soporta los siguientes tipos de reclamaciones laborales:
- **Despido Improcedente**
- **Despido Nulo**
- **Despido Disciplinario**
- **Reclamación de Finiquito**
- **Indemnización**
- **Reclamación de Cantidad**
- **Salarios Impagados**
- **Horas Extras**
- **Vacaciones no Disfrutadas**
- **Modificación Sustancial**
- **Acoso Laboral**
- **Seguridad Social**
- **Otros**

### 3. Estados del Procedimiento

El módulo rastrea el estado actual de cada caso:

1. **Presentado**: SMAC recién presentado
2. **Citado**: Citación para acto de conciliación recibida
3. **Conciliado**: Acuerdo alcanzado en conciliación
4. **Sin Avenencia**: No se alcanzó acuerdo, procede demanda
5. **Demanda Judicial**: Demanda presentada en Juzgado
6. **Juicio Pendiente**: A la espera de celebración del juicio
7. **Sentencia Pendiente**: Juicio celebrado, pendiente de sentencia
8. **Resuelto Favorable**: Resolución favorable a la empresa
9. **Resuelto Desfavorable**: Resolución desfavorable
10. **Desistimiento**: El trabajador desiste de la reclamación
11. **Caducado**: Procedimiento caducado

### 4. Control Económico

El sistema controla exhaustivamente los costes:

- **Importe Reclamado**: Cantidad que reclama el trabajador
- **Importe Conciliado/Acordado**: Cantidad final acordada
- **Costes Legales**: Honorarios de abogados
- **Tasas Judiciales**: Tasas del procedimiento
- **Costes de Conciliación**: Gastos del acto de conciliación
- **Coste Total**: Suma automática de todos los costes

### 5. Evaluación de Riesgos

Cada caso se evalúa según:
- **Nivel de Riesgo**: Bajo, Medio, Alto, Crítico
- **Probabilidad de Pérdida**: Porcentaje de 0 a 100%

Esto permite priorizar casos y asignar recursos adecuadamente.

### 6. Representación Legal

- Abogado de la empresa
- Abogado del trabajador
- Juzgado de lo Social asignado

### 7. Calendario y Actuaciones

Sistema de seguimiento de:
- Fechas límite
- Acciones requeridas
- Presentación de escritos
- Comparecencias
- Recordatorios automáticos

### 8. Documentación

Gestión de toda la documentación asociada:
- Escritos
- Sentencias
- Acuerdos de conciliación
- Pruebas
- Comunicaciones

---

## Indicadores y Estadísticas

### Panel de Control

El módulo proporciona estadísticas en tiempo real:

#### Resumen General
- **Total de Casos**: Número total de SMAC registrados
- **Casos Activos**: Procedimientos en curso
- **Tasa de Conciliación**: Porcentaje de casos resueltos en conciliación
- **Coste Total**: Suma de todos los costes

#### Resumen Económico
- Total reclamado por los trabajadores
- Total acordado o sentenciado
- Costes totales del procedimiento
- Promedio por caso

#### Distribución por Estado
Visualización gráfica de:
- Casos por estado
- Porcentaje de cada categoría
- Evolución temporal

#### Indicadores Clave (KPIs)
- **Tasa de Conciliación**: % de casos resueltos sin llegar a juicio
- **Tasa de Resoluciones Favorables**: % de casos ganados o bien conciliados
- **Juicios Pendientes**: Casos en fase judicial
- **Duración Media**: Tiempo promedio de resolución

---

## Funcionalidades Avanzadas

### 1. Filtros y Búsqueda
- Búsqueda por nombre del trabajador
- Búsqueda por DNI
- Búsqueda por número de SMAC o judicial
- Filtro por estado del procedimiento

### 2. Exportación a Excel
Exportación completa de todos los datos a formato Excel incluyendo:
- Todos los campos del procedimiento
- Fechas importantes
- Importes y costes
- Información de representación legal
- Evaluación de riesgos
- Observaciones

El archivo Excel generado es compatible con Microsoft Excel y LibreOffice Calc.

### 3. Sistema de Alertas
El módulo puede generar alertas automáticas para:
- Fechas límite próximas
- Acciones requeridas
- Fechas de juicio
- Pagos pendientes

### 4. Plantillas Documentales
Gestión de plantillas reutilizables para:
- Contestaciones a demandas
- Escritos judiciales
- Recursos
- Acuerdos de conciliación

### 5. Precedentes Jurisprudenciales
Base de conocimiento de:
- Sentencias relevantes anteriores
- Jurisprudencia aplicable
- Puntos clave de cada precedente
- Resultado de casos similares

---

## Cómo Usar el Módulo

### Crear un Nuevo SMAC

1. Acceder a **Asesoría Legal > Gestión SMAC** en el menú lateral
2. Hacer clic en el botón **"Nuevo SMAC"**
3. Rellenar los datos requeridos:
   - **Procedimiento**: Número SMAC y fecha de presentación
   - **Seleccionar Trabajador**: Elegir el trabajador de la lista desplegable (los datos se auto-completarán)
     - Si el trabajador está en el sistema, sus datos (nombre, DNI, categoría, fechas de alta/baja y salario) se cargarán automáticamente
     - Si no está en el sistema, puedes introducir los datos manualmente
   - **Datos del Trabajador**: Se completarán automáticamente al seleccionar el trabajador, pero pueden editarse
   - **Reclamación**: Tipo y descripción de lo reclamado
   - **Evaluación**: Nivel de riesgo estimado
4. Hacer clic en **"Guardar"**

**Nota Importante**: El sistema está completamente integrado con el módulo de Trabajadores, por lo que todos los trabajadores registrados en el sistema estarán disponibles para seleccionar, incluyendo su categoría profesional (Oficial, Ayudante, Peón, Maquinista, Especialista).

### Actualizar el Estado de un SMAC

1. Localizar el SMAC en la lista
2. Hacer clic en el icono de **editar** (lápiz)
3. Actualizar los campos necesarios:
   - Cambiar el estado si hay avances
   - Añadir fechas importantes (conciliación, juicio)
   - Actualizar importes si se alcanzó acuerdo
   - Modificar la evaluación de riesgo si procede
4. Guardar los cambios

### Consultar Estadísticas

1. En la vista principal, hacer clic en el icono de **gráficos** en la parte superior
2. Revisar:
   - Resumen económico total
   - Distribución de casos por estado
   - Indicadores clave de rendimiento
3. Cambiar de nuevo a vista de lista cuando se desee

### Exportar Datos a Excel

1. Aplicar los filtros deseados (por ejemplo, solo casos activos)
2. Hacer clic en **"Exportar Excel"**
3. El archivo se descargará automáticamente
4. Abrir con Excel o LibreOffice

### Buscar un Caso Específico

Usar la barra de búsqueda superior para:
- Buscar por nombre: escribir el nombre del trabajador
- Buscar por DNI: escribir el DNI
- Buscar por número: escribir el número SMAC o judicial

---

## Mejores Prácticas

### 1. Registro Inmediato
Registrar cada SMAC tan pronto como se reciba la notificación para:
- No perder fechas límite
- Tener tiempo para preparar defensa
- Evaluar correctamente el riesgo

### 2. Actualización Constante
Mantener actualizado cada caso con:
- Cambios de estado en tiempo real
- Todas las fechas importantes
- Documentación asociada
- Notas sobre evolución del caso

### 3. Evaluación de Riesgos Precisa
Evaluar correctamente el riesgo ayuda a:
- Priorizar recursos
- Decidir estrategia (conciliar vs litigar)
- Provisionar adecuadamente
- Informar a dirección

### 4. Documentación Completa
Adjuntar todos los documentos relevantes:
- Escritos presentados
- Documentación recibida
- Pruebas
- Comunicaciones importantes

### 5. Revisión Periódica
Realizar revisiones periódicas de:
- Casos pendientes de acción
- Fechas próximas
- Evolución de costes
- Tendencias en tipos de reclamaciones

---

## Integración con Otros Módulos

El módulo SMAC está completamente integrado con otros módulos del sistema para proporcionar información coherente y evitar duplicación de datos:

### Módulo de Trabajadores ⭐ **INTEGRACIÓN COMPLETA**

El módulo SMAC está **directamente conectado** con la base de datos de trabajadores:

#### Funcionalidades Integradas:
- **Selección directa de trabajadores**: Al crear un SMAC, puedes seleccionar cualquier trabajador registrado en el sistema
- **Auto-completado de datos**: Al seleccionar un trabajador, se completan automáticamente:
  - Nombre completo
  - DNI/NIE
  - Teléfono y email
  - **Categoría Profesional** (Oficial, Ayudante, Peón, Maquinista, Especialista)
  - Fecha de alta en la empresa
  - Fecha de baja (si corresponde)
  - Último salario (mensual o por hora)

#### Ventajas de la Integración:
1. **Consistencia de Datos**: Los datos del trabajador son siempre los mismos en todo el sistema
2. **Ahorro de Tiempo**: No necesitas volver a introducir información que ya existe
3. **Trazabilidad**: Se mantiene el vínculo con el trabajador original
4. **Actualización Automática**: Si actualizas datos del trabajador en su módulo, los cambios se reflejan
5. **Categoría Profesional Visible**: La categoría del trabajador se muestra en:
   - La lista de SMAC (en color azul)
   - Los detalles del procedimiento
   - Las exportaciones a Excel

#### Cómo Funciona:
1. Cuando creas un nuevo SMAC, verás un desplegable con todos los trabajadores
2. El desplegable muestra: "Apellidos, Nombre - DNI - Categoría"
3. Al seleccionar, todos los campos del trabajador se completan automáticamente
4. Puedes editar cualquier campo si es necesario (por ejemplo, si el salario cambió)

### Módulo de Proyectos
- Vinculación del SMAC con el proyecto correspondiente
- Control de incidencias por obra
- Análisis de conflictividad por proyecto
- Identificación de proyectos problemáticos

### Módulo de Tesorería
- Provisiones para casos pendientes
- Control de pagos realizados
- Impacto en flujo de caja
- Previsión de gastos legales

---

## Preguntas Frecuentes (FAQ)

### ¿Qué es un SMAC?
SMAC son los Servicios de Mediación, Arbitraje y Conciliación. Es un procedimiento previo obligatorio antes de presentar una demanda laboral en España. El objetivo es intentar llegar a un acuerdo entre empresa y trabajador antes de ir a juicio.

### ¿Cuándo debo registrar un caso?
Inmediatamente al recibir la citación del SMAC o la notificación de demanda judicial.

### ¿Puedo modificar un caso ya cerrado?
Sí, todos los casos pueden editarse en cualquier momento para corregir datos o añadir información adicional.

### ¿Cómo calculo el nivel de riesgo?
Considere factores como:
- Fundamento de la reclamación
- Documentación disponible
- Precedentes similares
- Opinión del abogado

### ¿Los datos están seguros?
Sí, el módulo utiliza:
- Row Level Security (RLS) de Supabase
- Acceso solo para usuarios autenticados
- Respaldo automático en la nube

### ¿Puedo generar informes personalizados?
El módulo permite exportar a Excel, donde puede crear los informes personalizados que necesite usando las funcionalidades de Excel.

---

## Soporte Técnico

Para cualquier duda o problema con el módulo:

1. Revisar esta guía completa
2. Consultar con el departamento de IT
3. Verificar los logs en la consola del navegador (F12)

---

## Actualizaciones Futuras

Mejoras planificadas:
- Generación automática de documentos legales
- Alertas por correo electrónico
- Dashboard ejecutivo con gráficos avanzados
- Integración con calendarios
- App móvil para consultas rápidas

---

*Última actualización: Diciembre 2024*
