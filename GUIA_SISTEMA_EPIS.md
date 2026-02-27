# 📋 GUÍA COMPLETA DEL SISTEMA DE GESTIÓN DE EPIs

## ✅ SISTEMA IMPLEMENTADO COMPLETAMENTE

El sistema de gestión de EPIs (Equipos de Protección Individual) está completamente integrado en la aplicación de Grupo EA.

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### ✅ Panel Principal (Dashboard)
- **Estadísticas en tiempo real:**
  - Total de EPIs en inventario
  - Stock total disponible
  - Items con stock crítico
  - Items con stock bajo
  - Pedidos activos
  - Entregas realizadas hoy
  - Alertas pendientes
  - Valor total del inventario

- **Alertas críticas de stock:** Muestra EPIs con stock por debajo del mínimo
- **Pedidos pendientes:** Lista de pedidos en proceso
- **Generación automática de pedidos:** Un solo clic para crear pedidos de todos los EPIs con stock bajo

### ✅ Gestión de Inventario
- **Listado completo** de todos los EPIs con:
  - Nombre y descripción
  - Stock actual vs mínimo
  - Estado (Crítico/Bajo/OK)
  - Precio unitario
  - Ubicación en almacén
  - Categoría

- **Búsqueda y filtros:**
  - Búsqueda por nombre
  - Filtro por categoría

- **Acciones disponibles:**
  - Añadir nuevo EPI
  - Editar EPI existente
  - Eliminar EPI (cambio de estado a inactivo)

### ✅ Registro de Entregas
- **Formulario completo para registrar entregas a operarios:**
  - Selección de EPI (con stock disponible)
  - Selección de trabajador
  - Cantidad a entregar
  - Talla
  - Fecha de entrega
  - Estado del equipo (Nuevo/En uso/Dañado/Perdido)
  - Observaciones

- **Actualización automática:**
  - El stock se reduce automáticamente al registrar la entrega
  - Se genera alerta si el stock queda por debajo del mínimo
  - Se actualiza la fecha de última entrega

### ✅ Gestión de Pedidos
- **Crear pedidos a proveedores:**
  - Número de pedido
  - Selección de proveedor (integrado con módulo de proveedores)
  - Fecha de pedido y entrega esperada
  - Múltiples items por pedido
  - Cálculo automático de total

- **Estado de pedidos:**
  - Pendiente
  - Enviado
  - Recibido
  - Cancelado

- **Recepción de pedidos:**
  - Marcar pedido como recibido con un clic
  - Actualización automática del stock
  - Resolución automática de alertas de stock bajo

### ✅ Sistema de Alertas
- **Alertas automáticas generadas por:**
  - Stock bajo (cuando stock actual ≤ stock mínimo)
  - Pedidos pendientes de hace más de 7 días
  - Entregas necesarias por frecuencia de reposición

- **Gestión de alertas:**
  - Ver todas las alertas pendientes
  - Resolver alertas manualmente
  - Alertas resueltas automáticamente al recibir pedidos

### ✅ Historial
- Registro completo de todas las actividades
- Entregas realizadas
- Pedidos generados
- Cambios de stock

---

## 🚀 CÓMO USAR EL SISTEMA

### PASO 1: Acceder al Módulo de EPIs

1. Iniciar sesión en la aplicación de gestión
2. En el menú lateral, clic en **"Gestión EPIs"**
3. Se abre el panel principal con todas las estadísticas

---

### PASO 2: Configurar Inventario Inicial

#### Añadir un nuevo EPI:

1. Clic en botón **"Añadir EPI"** (azul, esquina superior derecha)
2. Completar el formulario:
   - **Nombre *:** Casco de Seguridad MSA V-Gard
   - **Categoría *:** Protección de cabeza
   - **Descripción:** Casco con certificación CE
   - **Stock Actual:** 50
   - **Stock Mínimo:** 20
   - **Precio Unitario:** 45.50
   - **Ubicación:** Almacén A, Estante 3
   - **Frecuencia de Reposición:** Mensual
   - **Proveedor:** Seleccionar de la lista

3. Clic en **"Guardar"**

**Resultado:** El EPI aparece en el inventario con estado "OK" (verde)

#### Categorías predeterminadas creadas:
- ✅ Protección de cabeza (Cascos, gorros, protectores auditivos)
- ✅ Protección de manos (Guantes de trabajo, protección térmica)
- ✅ Protección de pies (Botas de seguridad, calzado antideslizante)
- ✅ Protección visual (Gafas de seguridad, pantallas faciales)
- ✅ Protección respiratoria (Mascarillas, respiradores)
- ✅ Ropa de trabajo (Chalecos, monos, impermeables)
- ✅ Protección anticaídas (Arneses, líneas de vida)

---

### PASO 3: Registrar Entrega a Operario

1. Clic en botón **"Registrar Entrega"** (verde)
2. Completar formulario:
   - **EPI:** Casco de Seguridad MSA V-Gard (se muestra stock disponible)
   - **Trabajador:** Seleccionar de lista (Juan García Martínez)
   - **Cantidad:** 1
   - **Talla:** Talla Única
   - **Fecha de Entrega:** 15/12/2024 (por defecto hoy)
   - **Estado:** Nuevo
   - **Observaciones:** Entregado para obra de Valencia

3. Clic en **"Registrar Entrega"**

**Resultado automático:**
- ✅ Stock del EPI se reduce en 1 (de 50 a 49)
- ✅ Se registra la entrega en el historial
- ✅ Si el stock queda ≤ mínimo (20), se genera alerta automática

---

### PASO 4: Crear Pedido a Proveedor

#### Opción A: Pedido Manual

1. Clic en botón **"Crear Pedido"** (morado)
2. Datos generales:
   - **Nº Pedido:** PED-2024-001
   - **Proveedor:** Seleccionar proveedor de EPIs
   - **Fecha de Pedido:** 15/12/2024
   - **Entrega Esperada:** 22/12/2024
   - **Notas:** Pedido urgente para obra

3. Agregar items al pedido:
   - Seleccionar EPI del dropdown
   - Clic en botón "+" para agregarlo
   - El sistema sugiere automáticamente: **Cantidad = (Stock Mínimo × 2) - Stock Actual**
   - Ejemplo: Si stock mínimo es 20 y actual es 15, sugiere 25 unidades
   - Ajustar cantidad si es necesario
   - Repetir para más EPIs

4. Revisar total del pedido
5. Clic en **"Crear Pedido"**

**Resultado:** Pedido creado con estado "Pendiente"

#### Opción B: Pedidos Automáticos (RECOMENDADO)

1. En el Dashboard, clic en **"Generar Pedidos Automáticos"** (botón naranja)
2. El sistema identifica todos los EPIs con stock ≤ mínimo
3. Confirmar: *"Se generarán pedidos automáticos para X EPIs. ¿Continuar?"*
4. Clic en **"Aceptar"**

**Resultado automático:**
- ✅ Se crea un pedido para cada EPI con stock bajo
- ✅ Cantidad calculada automáticamente
- ✅ Se asigna al proveedor configurado en el EPI
- ✅ Fecha de entrega esperada: 7 días desde hoy
- ✅ Estado: Pendiente

---

### PASO 5: Recibir Pedido

1. Ir a pestaña **"Pedidos"**
2. Localizar el pedido con estado "Pendiente"
3. Clic en botón **"Recibido"**
4. Confirmar la recepción

**Resultado automático:**
- ✅ Estado del pedido cambia a "Recibido"
- ✅ **Stock se actualiza automáticamente** sumando las cantidades del pedido
- ✅ **Alertas de stock bajo se resuelven automáticamente**
- ✅ Fecha de recepción se registra

---

### PASO 6: Gestionar Alertas

1. Ir a pestaña **"Alertas"**
2. Ver lista de alertas pendientes con:
   - Tipo de alerta (Stock bajo, Pedido pendiente, etc.)
   - Mensaje descriptivo
   - EPI afectado
   - Fecha de creación

3. Para resolver una alerta:
   - Clic en botón **"Resolver"**
   - La alerta se marca como resuelta

**Alertas se resuelven automáticamente:**
- Al recibir un pedido → resuelve alertas de stock bajo
- Al crear un pedido → puede resolver alerta de restock_due

---

## 📊 DASHBOARD - INTERPRETACIÓN

### Tarjetas de Estadísticas:

1. **Total EPIs:** Número de tipos de EPIs en el catálogo (activos)
2. **Stock Total:** Suma de unidades de todos los EPIs
3. **Stock Crítico:** EPIs con stock ≤ mínimo (ROJO - Requiere acción inmediata)
4. **Stock Bajo:** EPIs con stock entre mínimo y mínimo × 1.5 (AMARILLO - Advertencia)
5. **Pedidos Activos:** Pedidos en estado "Pendiente" o "Enviado"
6. **Entregas Hoy:** Número de entregas registradas hoy
7. **Alertas Pendientes:** Alertas sin resolver
8. **Valor Total:** Valor económico del inventario (stock × precio unitario)

### Sección "Alertas Críticas de Stock":
- Muestra hasta 5 EPIs con stock crítico
- Botón **"Pedir"** para crear pedido directo
- Actualización en tiempo real

### Sección "Pedidos Pendientes":
- Últimos 5 pedidos activos
- Estado y fecha esperada
- Colores por estado

---

## 🔄 FLUJO COMPLETO DE TRABAJO

### Flujo Normal (Día a Día):

```
1. Operario necesita EPI
   ↓
2. Supervisor registra entrega en el sistema
   ↓
3. Stock se reduce automáticamente
   ↓
4. Si stock ≤ mínimo → Alerta automática
   ↓
5. Al final del día/semana: Revisar Dashboard
   ↓
6. Clic en "Generar Pedidos Automáticos"
   ↓
7. Pedidos creados y enviados a proveedores
   ↓
8. Al recibir mercancía: Marcar pedido como "Recibido"
   ↓
9. Stock actualizado y alertas resueltas automáticamente
```

### Flujo Preventivo (Recomendado):

```
Lunes:
- Revisar Dashboard
- Identificar EPIs con stock bajo (amarillo)
- Generar pedidos preventivos antes que lleguen a crítico

Miércoles:
- Revisar alertas
- Seguimiento de pedidos pendientes

Viernes:
- Recibir pedidos de la semana
- Marcar como recibidos
- Exportar reporte semanal
```

---

## 💡 CARACTERÍSTICAS AVANZADAS

### 1. Frecuencia de Reposición

Cada EPI tiene configurada su frecuencia:
- **Diaria:** Para EPIs de uso intensivo (ej: mascarillas desechables)
- **Semanal:** Para EPIs de desgaste rápido (ej: guantes de trabajo)
- **Mensual:** Para EPIs estándar (ej: chalecos, cascos)
- **Anual:** Para EPIs duraderos (ej: arneses, gafas)

El sistema puede generar alertas preventivas basadas en esta frecuencia.

### 2. Tallas Disponibles

Al crear un EPI, se pueden especificar las tallas disponibles.
Al registrar una entrega, se selecciona la talla específica.

### 3. Estado del Equipo

Al entregar un EPI, se registra su estado:
- **Nuevo:** EPI recién adquirido
- **En uso:** EPI funcional en uso
- **Dañado:** EPI que requiere reemplazo por daño
- **Perdido:** EPI extraviado

Esto permite trazabilidad completa.

### 4. Integración con Proveedores

El sistema está **completamente integrado** con el módulo de proveedores existente:
- Al crear un EPI, se selecciona su proveedor habitual
- Los pedidos automáticos se asignan a los proveedores correctos
- Se puede filtrar por proveedor

### 5. Integración con Trabajadores

El sistema está **completamente integrado** con el módulo de trabajadores:
- Al registrar entregas, se selecciona el trabajador de la lista
- Se muestra código de trabajador y nombre completo
- Historial de entregas por trabajador disponible

### 6. Reportes y Exportaciones

**Exportar a Excel:**
- Clic en botón **"Exportar Excel"** en Dashboard
- Se genera archivo con:
  - Listado completo de EPIs
  - Stock actual y mínimo
  - Precios y ubicaciones
  - Valor total

**Reportes disponibles:**
- Stock actual por categoría
- Entregas por período
- Pedidos realizados
- Valor del inventario

---

## 🔐 BASE DE DATOS

### Tablas Creadas:

1. **epi_categories** - Categorías de EPIs
2. **epi_items** - Inventario de EPIs
3. **epi_deliveries** - Entregas a trabajadores
4. **epi_orders** - Pedidos a proveedores
5. **epi_order_items** - Partidas de pedidos
6. **epi_alerts** - Alertas del sistema

### Triggers Automáticos:

✅ **trigger_update_stock** - Actualiza stock al registrar entrega
✅ **trigger_order_received** - Actualiza stock al recibir pedido
✅ **trigger_calculate_total** - Calcula total del pedido automáticamente

### Vistas Creadas:

✅ **epi_stock_summary** - Vista resumen de stock con estadísticas
✅ **epi_deliveries_by_worker** - Entregas agrupadas por trabajador
✅ **epi_pending_orders** - Pedidos pendientes con detalles

---

## 📱 INTERFAZ Y NAVEGACIÓN

### Pestañas Principales:

1. **Panel Principal** - Dashboard con estadísticas y alertas
2. **Inventario** - Listado completo de EPIs con acciones
3. **Entregas** - Historial de entregas realizadas
4. **Pedidos** - Gestión de pedidos a proveedores
5. **Alertas** - Alertas pendientes del sistema
6. **Historial** - Registro completo de actividades

### Botones de Acción Rápida:

- **Añadir EPI** (Azul) - Crear nuevo EPI en inventario
- **Registrar Entrega** (Verde) - Registrar entrega a operario
- **Crear Pedido** (Morado) - Crear pedido manual
- **Generar Pedidos Automáticos** (Naranja) - Pedidos automáticos para stock bajo
- **Exportar Excel** (Verde) - Exportar datos a Excel

---

## ⚠️ BUENAS PRÁCTICAS

### ✅ HACER:

1. **Revisar el Dashboard diariamente** - Ver estado general
2. **Registrar entregas inmediatamente** - Mantener stock actualizado
3. **Usar pedidos automáticos** - Ahorra tiempo y reduce errores
4. **Configurar stock mínimo realista** - Basado en consumo real
5. **Especificar ubicación** - Facilita localización física
6. **Agregar observaciones** - En entregas y pedidos
7. **Revisar alertas semanalmente** - No dejar acumular

### ❌ NO HACER:

1. **NO ignorar alertas críticas** - Stock crítico requiere acción inmediata
2. **NO modificar stock manualmente** - Usar solo el sistema de entregas/pedidos
3. **NO crear EPIs duplicados** - Verificar antes de crear nuevos
4. **NO dejar pedidos pendientes indefinidamente** - Hacer seguimiento
5. **NO olvidar marcar pedidos como recibidos** - Stock no se actualizará

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### P: El stock no se actualiza después de una entrega
**R:** Verifica que:
1. La entrega se registró correctamente (aparece en pestaña "Entregas")
2. La cantidad es correcta
3. Refresca la página

El trigger automático debería actualizar el stock instantáneamente.

### P: No aparecen trabajadores al registrar entrega
**R:** Verifica que:
1. Hay trabajadores activos en el módulo de Trabajadores
2. Su estado de empleo es "active"
3. Refresca los datos

### P: No aparecen proveedores al crear pedido
**R:** Verifica que:
1. Hay proveedores activos en el módulo de Proveedores
2. Su estado es "active"
3. Tienen categoría asignada

### P: Las alertas no se generan automáticamente
**R:** Las alertas se generan:
- Al registrar una entrega que deja el stock ≤ mínimo
- Verifica que el stock mínimo esté configurado
- Verifica que el trigger `trigger_update_stock` existe en la base de datos

### P: El pedido recibido no actualiza el stock
**R:** Asegúrate de:
1. Marcar el pedido como "Recibido" (no solo cambiar estado manualmente)
2. Las cantidades recibidas están configuradas
3. El trigger `trigger_order_received` existe

---

## 📈 REPORTES Y ANÁLISIS

### Métricas Clave a Monitorear:

1. **Tasa de rotación de stock** - Entregas / Stock promedio
2. **Valor de inventario** - Costo total del stock disponible
3. **Frecuencia de pedidos** - Pedidos por mes
4. **Tiempo de entrega** - Días entre pedido y recepción
5. **Items críticos recurrentes** - EPIs que frecuentemente llegan a stock crítico

### Consultas SQL Útiles:

```sql
-- Stock actual de todos los EPIs
SELECT * FROM epi_stock_summary ORDER BY stock_status;

-- Entregas del último mes por trabajador
SELECT * FROM epi_deliveries_by_worker
WHERE delivery_date >= CURRENT_DATE - INTERVAL '30 days';

-- Pedidos pendientes con retraso
SELECT * FROM epi_pending_orders
WHERE expected_delivery_date < CURRENT_DATE;

-- Valor total del inventario
SELECT SUM(current_stock * unit_price) as total_value
FROM epi_items WHERE status = 'active';
```

---

## 🎓 CAPACITACIÓN

### Para Supervisores/Encargados:

1. **Registrar entregas diarias** - 5 minutos
2. **Revisar Dashboard** - 2 minutos
3. **Gestionar alertas** - 10 minutos semanales
4. **Generar pedidos** - 5 minutos semanales

### Para Administradores:

1. **Configurar EPIs nuevos** - Según necesidad
2. **Revisar pedidos y recepciones** - Diario
3. **Análisis de inventario** - Mensual
4. **Exportar reportes** - Mensual

---

## 🔗 INTEGRACIÓN COMPLETA

El sistema de EPIs está **completamente integrado** con:

✅ **Módulo de Trabajadores** - Para asignar entregas
✅ **Módulo de Proveedores** - Para gestionar pedidos
✅ **Sistema de Base de Datos** - Con triggers automáticos
✅ **Menú de Navegación** - Acceso directo desde sidebar

**No requiere configuración adicional. Todo está listo para usar.**

---

## 📞 SOPORTE

Para cualquier duda o problema:
1. Revisar esta guía completa
2. Verificar la sección "Solución de Problemas"
3. Contactar con soporte técnico

---

© 2024 Grupo EA - Sistema de Gestión Integral
**Módulo:** Gestión de EPIs v1.0
**Estado:** ✅ COMPLETAMENTE OPERATIVO
**Última actualización:** 27/12/2024
