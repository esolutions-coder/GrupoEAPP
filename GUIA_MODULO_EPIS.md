# 🛡️ GUÍA COMPLETA DEL MÓDULO DE EPIs

## ✅ MÓDULO EN PRODUCCIÓN

El módulo de gestión de Equipos de Protección Individual está completamente operativo con datos de ejemplo cargados.

---

## 📊 DATOS PRECARGADOS

### 7 Categorías de EPIs:

| Categoría | Total EPIs | Stock Total | Valor Total |
|-----------|------------|-------------|-------------|
| **Protección anticaídas** | 2 | 32 unidades | €3,200.00 |
| **Protección de cabeza** | 2 | 250 unidades | €725.00 |
| **Protección de manos** | 2 | 140 unidades | €720.00 |
| **Protección de pies** | 2 | 85 unidades | €3,400.00 |
| **Protección respiratoria** | 2 | 315 unidades | €1,035.00 |
| **Protección visual** | 2 | 95 unidades | €712.50 |
| **Ropa de trabajo** | 3 | 140 unidades | €2,262.50 |

### **TOTAL: 15 EPIs diferentes | 1,057 unidades | €12,055.00**

---

## 🎯 EPIs DE EJEMPLO INCLUIDOS

### 🪖 Protección de cabeza
- Casco de seguridad blanco (50 unidades)
- Tapones auditivos desechables (200 unidades)

### 🧤 Protección de manos
- Guantes de nitrilo (100 unidades - tallas S, M, L, XL)
- Guantes anticorte nivel 5 (40 unidades)

### 👢 Protección de pies
- Botas de seguridad S3 (60 unidades - tallas 39-46)
- Botas impermeables de agua (25 unidades)

### 👓 Protección visual
- Gafas de seguridad transparentes (75 unidades)
- Pantalla facial completa (20 unidades)

### 😷 Protección respiratoria
- Mascarillas FFP2 (300 unidades)
- Respirador con filtros P3 (15 unidades)

### 👕 Ropa de trabajo
- Chaleco reflectante naranja (80 unidades)
- Mono de trabajo azul (35 unidades)
- Impermeable amarillo (25 unidades)

### ⛓️ Protección anticaídas
- Arnés de seguridad (20 unidades)
- Línea de vida retráctil 3m (12 unidades)

---

## 🚀 CÓMO ACCEDER AL MÓDULO

### Paso 1: Acceder desde el Menú
```
Panel de Gestión → Recursos → EPIs
```

### Paso 2: Navegar por las Secciones
El módulo tiene 6 vistas principales:
1. **Dashboard** - Resumen general y estadísticas
2. **Inventario** - Gestión de stock de EPIs
3. **Entregas** - Registro de entregas a trabajadores
4. **Pedidos** - Gestión de pedidos a proveedores
5. **Alertas** - Notificaciones de stock bajo
6. **Historial** - Histórico de movimientos

---

## 📱 FUNCIONALIDADES PRINCIPALES

### 1️⃣ DASHBOARD - Vista General

**Estadísticas en tiempo real:**
- Total de items en inventario
- Stock total disponible
- Items con stock bajo
- Items en nivel crítico
- Pedidos activos
- Entregas del día
- Alertas pendientes
- Valor total del inventario

**Gráficos y visualizaciones:**
- Distribución de stock por categoría
- Tendencias de entregas
- Estado de pedidos
- Alertas críticas

---

### 2️⃣ INVENTARIO - Gestión de Stock

#### ➕ Agregar Nuevo EPI

**Campos requeridos:**
- **Categoría**: Seleccionar de las 7 categorías disponibles
- **Nombre**: Identificación del EPI
- **Descripción**: Detalles técnicos
- **Tallas disponibles**: Múltiples tallas (ej: S, M, L, XL)
- **Stock actual**: Cantidad en inventario
- **Stock mínimo**: Nivel para generar alerta
- **Frecuencia de reposición**: Diaria, Semanal, Mensual, Anual
- **Precio unitario**: Coste por unidad
- **Ubicación**: Localización en almacén
- **Proveedor**: Proveedor habitual

**Ejemplo:**
```
Categoría: Protección de manos
Nombre: Guantes de cuero reforzados
Descripción: Guantes con palma de cuero y dorso textil
Tallas: M, L, XL
Stock actual: 50
Stock mínimo: 20
Frecuencia: Mensual
Precio: €4.50
Ubicación: Almacén A - Estantería 2
```

#### 🔍 Buscar y Filtrar

- **Buscador**: Por nombre o descripción
- **Filtro por categoría**: Ver EPIs de una categoría específica
- **Filtro por estado**: Activo, Inactivo, Descontinuado
- **Indicador de stock**:
  - 🟢 Verde: Stock OK
  - 🟡 Amarillo: Stock bajo
  - 🔴 Rojo: Stock crítico

#### ✏️ Editar EPI

1. Click en el botón de edición del EPI
2. Modificar los campos necesarios
3. Guardar cambios

#### 🗑️ Eliminar EPI

- Solo EPIs sin entregas registradas
- Confirmar eliminación

---

### 3️⃣ ENTREGAS - Registro a Trabajadores

#### 📦 Registrar Nueva Entrega

**Proceso:**
1. Click en "+ Nueva Entrega"
2. Completar formulario:
   - **EPI**: Seleccionar del inventario
   - **Trabajador**: Seleccionar de lista activa
   - **Cantidad**: Unidades a entregar
   - **Talla**: Si aplica
   - **Fecha de entrega**: Por defecto hoy
   - **Estado**: Nuevo, En uso, Dañado, Perdido
   - **Entregado por**: Responsable de entrega
   - **Notas**: Observaciones adicionales
   - **Firma digital**: Opcional

3. Al guardar:
   - ✅ Se descuenta del stock automáticamente
   - ✅ Se genera alerta si stock < mínimo
   - ✅ Se actualiza fecha última entrega
   - ✅ Se registra en historial

**Validaciones:**
- Stock suficiente para la entrega
- Trabajador activo
- Cantidad mayor a 0

#### 📊 Historial de Entregas

**Columnas:**
- Fecha de entrega
- Trabajador
- EPI entregado
- Cantidad
- Talla
- Estado
- Entregado por
- Notas

**Filtros:**
- Por trabajador
- Por EPI
- Por rango de fechas
- Por estado

**Exportar:**
- Excel con todas las entregas
- PDF de comprobante individual

---

### 4️⃣ PEDIDOS - Gestión de Compras

#### 🛒 Crear Nuevo Pedido

**Paso 1: Datos del pedido**
```
Número de pedido: PED-2024-001
Proveedor: Seleccionar de lista
Fecha de pedido: Hoy
Fecha entrega esperada: +15 días
```

**Paso 2: Agregar items**
1. Seleccionar EPI del dropdown
2. Especificar cantidad a pedir
3. Verificar precio unitario
4. Click en "+" para agregar
5. Repetir para más items

**Paso 3: Revisión**
- Ver lista de items agregados
- Modificar cantidades si necesario
- Ver total del pedido
- Agregar notas si aplica

**Paso 4: Confirmar**
- Guardar pedido con estado "Pendiente"
- Se envía a proveedor

#### 📋 Estados de Pedido

| Estado | Descripción | Acciones |
|--------|-------------|----------|
| **Pendiente** | Pedido creado, esperando envío | Editar, Cancelar |
| **Enviado** | Enviado al proveedor | Marcar como recibido |
| **Recibido** | Mercancía recibida | Ver detalles |
| **Cancelado** | Pedido cancelado | Solo consulta |

#### 📥 Recibir Pedido

1. Localizar pedido en estado "Enviado"
2. Click en "Marcar como Recibido"
3. Confirmar cantidades recibidas
4. Sistema automático:
   - ✅ Incrementa stock de cada item
   - ✅ Resuelve alertas de stock bajo
   - ✅ Registra fecha de recepción
   - ✅ Actualiza estado a "Recibido"

---

### 5️⃣ ALERTAS - Sistema de Notificaciones

#### 🚨 Tipos de Alertas

**1. Stock Bajo** 🟡
- Se genera cuando: Stock <= Mínimo × 1.5
- Mensaje: "Stock bajo para [EPI]. Actual: X, Mínimo: Y"
- Acción: Considerar pedido próximamente

**2. Stock Crítico** 🔴
- Se genera cuando: Stock <= Mínimo
- Mensaje: "Stock crítico para [EPI]. Actual: X, Mínimo: Y"
- Acción: Pedido urgente necesario

**3. Reposición Programada** 📅
- Se genera según frecuencia configurada
- Mensaje: "Reposición programada para [EPI]"
- Acción: Verificar stock y pedir

**4. Pedido Pendiente** ⏱️
- Se genera cuando: Pedido sin recibir > 30 días
- Mensaje: "Pedido [NUM] pendiente desde [FECHA]"
- Acción: Contactar proveedor

#### ✅ Resolver Alertas

**Manual:**
- Click en botón "Resolver"
- Agregar comentario de resolución
- Marcar como resuelta

**Automático:**
- Se resuelven al recibir pedido con ese EPI
- Se resuelven al ajustar stock manualmente

---

### 6️⃣ HISTORIAL - Trazabilidad Completa

#### 📜 Registro de Movimientos

**Eventos registrados:**
- Creación de EPIs
- Modificación de stock
- Entregas a trabajadores
- Pedidos creados
- Pedidos recibidos
- Alertas generadas
- Alertas resueltas

**Información de auditoría:**
- Fecha y hora exacta
- Usuario responsable
- Tipo de operación
- Valores antes/después
- Motivo del cambio

**Filtros disponibles:**
- Por rango de fechas
- Por tipo de movimiento
- Por EPI específico
- Por trabajador
- Por proveedor

---

## 🎨 DASHBOARD - MÉTRICAS CLAVE

### 📊 KPIs Principales

```
┌─────────────────────────────────────────────────────┐
│  INVENTARIO GENERAL                                 │
├─────────────────────────────────────────────────────┤
│  📦 Total Items: 15                                 │
│  📊 Stock Total: 1,057 unidades                     │
│  💰 Valor Total: €12,055.00                         │
│  🟡 Stock Bajo: 0 items                             │
│  🔴 Stock Crítico: 0 items                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ACTIVIDAD                                          │
├─────────────────────────────────────────────────────┤
│  📦 Entregas Hoy: 0                                 │
│  🛒 Pedidos Activos: 0                              │
│  🚨 Alertas Pendientes: 0                           │
└─────────────────────────────────────────────────────┘
```

### 📈 Gráficos

**1. Stock por Categoría**
- Gráfico de barras horizontal
- Muestra stock actual vs mínimo
- Código de colores por estado

**2. Top 5 EPIs más entregados**
- Gráfico de barras
- Últimos 30 días
- Ayuda a prever demanda

**3. Valor del inventario**
- Desglose por categoría
- Gráfico de pastel
- Identifica inversión por área

---

## 🔧 FUNCIONES AUTOMÁTICAS

### 🤖 Triggers de Base de Datos

**1. Actualización de Stock en Entregas**
```sql
Cuando: Se registra una entrega
Acción:
  - Descuenta cantidad del stock actual
  - Actualiza fecha de última entrega
  - Genera alerta si stock <= mínimo
```

**2. Actualización de Stock en Recepción**
```sql
Cuando: Se marca pedido como "Recibido"
Acción:
  - Incrementa stock con cantidades recibidas
  - Resuelve alertas de stock bajo
  - Registra fecha de recepción real
```

**3. Cálculo de Total de Pedido**
```sql
Cuando: Se agregan items a pedido
Acción:
  - Calcula subtotal de cada item
  - Suma total del pedido automáticamente
```

---

## 📤 EXPORTACIÓN DE DATOS

### Excel

**Inventario completo:**
- Click en botón "Exportar a Excel"
- Incluye: Nombre, categoría, stock, precio, ubicación, proveedor

**Entregas:**
- Filtrar por periodo
- Exportar con todos los detalles
- Incluye: Trabajador, EPI, cantidad, fecha, firmante

**Pedidos:**
- Exportar pedidos pendientes/recibidos
- Incluye: Número, proveedor, items, totales

### PDF

**Comprobante de entrega:**
- Genera PDF individual por entrega
- Incluye firma digital si disponible
- Logo de empresa
- Datos del trabajador y EPIs entregados

---

## 🔄 INTEGRACIÓN CON OTROS MÓDULOS

### 👷 Trabajadores
- Lista de trabajadores activos para entregas
- Filtrado por estado de empleo
- Información de contacto

### 📦 Proveedores
- Lista de proveedores activos
- Información comercial y contacto
- Histórico de pedidos por proveedor

### 📊 Control de Costes
- Valor del inventario en tiempo real
- Gastos en EPIs por proyecto
- Análisis de costes por trabajador

---

## ⚙️ CONFIGURACIÓN Y PERSONALIZACIÓN

### 🎨 Categorías

**Agregar nueva categoría:**
```sql
INSERT INTO epi_categories (name, description, icon)
VALUES ('Nueva categoría', 'Descripción', 'icon-name');
```

### 📋 Niveles de Stock

**Configurar alertas:**
- Stock bajo: cuando <= Mínimo × 1.5
- Stock crítico: cuando <= Mínimo
- Personalizable por EPI

### 📅 Frecuencias de Reposición

- **Diaria**: Materiales consumibles
- **Semanal**: Equipos de alto uso
- **Mensual**: Equipos de uso regular
- **Anual**: Equipos duraderos

---

## 🎯 CASOS DE USO TÍPICOS

### Caso 1: Nuevo Trabajador Ingresa

```
1. Ir a "Entregas"
2. Click "+ Nueva Entrega"
3. Seleccionar trabajador nuevo
4. Agregar múltiples entregas:
   - Casco
   - Botas (seleccionar talla)
   - Chaleco
   - Guantes
   - Gafas
5. Guardar cada entrega
6. Sistema descuenta stock automáticamente
7. Imprimir comprobantes
```

### Caso 2: Stock Bajo Detectado

```
1. Ver alerta en Dashboard "🔴 Stock crítico: Guantes de nitrilo"
2. Ir a "Pedidos"
3. Crear nuevo pedido
4. Agregar "Guantes de nitrilo" con cantidad suficiente
5. Agregar otros items si necesario
6. Confirmar y enviar a proveedor
7. Alerta se mantendrá hasta recibir pedido
```

### Caso 3: Recepción de Mercancía

```
1. Proveedor entrega pedido PED-2024-001
2. Ir a "Pedidos" → Filtrar "Enviados"
3. Localizar PED-2024-001
4. Click "Marcar como Recibido"
5. Verificar cantidades
6. Confirmar recepción
7. Sistema:
   - Incrementa stock automáticamente
   - Resuelve alertas relacionadas
   - Registra fecha de recepción
```

### Caso 4: Inventario Mensual

```
1. Ir a "Inventario"
2. Revisar cada EPI
3. Comparar stock físico vs sistema
4. Ajustar si hay diferencias
5. Exportar a Excel
6. Generar alertas de reposición
7. Crear pedidos necesarios
```

---

## 🛡️ SEGURIDAD Y RLS

### Políticas Implementadas

```sql
- Acceso público a todas las tablas (para testing)
- En producción: configurar políticas por roles
- Auditoría completa de cambios
- Registro de usuario en cada operación
```

### Trazabilidad

- Todos los campos tienen `created_at`
- Campos `updated_at` en tablas principales
- Campos `created_by` y `delivered_by` para auditoría

---

## 📈 MÉTRICAS Y REPORTES

### Reportes Disponibles

**1. Inventario Valorado**
- Stock actual por categoría
- Valor económico del inventario
- Items en stock crítico

**2. Entregas por Periodo**
- Total entregas por trabajador
- EPIs más entregados
- Tendencias de uso

**3. Análisis de Proveedores**
- Pedidos por proveedor
- Tiempos de entrega
- Cumplimiento de plazos

**4. Gestión de Costes**
- Gasto total en EPIs
- Coste por trabajador
- Proyección de necesidades

---

## 🚀 PRÓXIMOS PASOS

### Funcionalidades Futuras

- [ ] Notificaciones push para alertas críticas
- [ ] QR codes en EPIs para tracking
- [ ] App móvil para entregas en campo
- [ ] Integración con sistema de nómina
- [ ] Predicción de necesidades con IA
- [ ] Gestión de devoluciones
- [ ] Control de caducidades
- [ ] Firma digital integrada

---

## 📞 SOPORTE

### Problemas Comunes

**"No veo datos en el módulo"**
- ✅ SOLUCIONADO: Ruta corregida de 'epis' a 'epi'
- ✅ Datos de ejemplo cargados
- Refrescar página

**"Error al registrar entrega"**
- Verificar stock suficiente
- Verificar trabajador activo
- Revisar cantidad > 0

**"No puedo crear pedido"**
- Verificar proveedor seleccionado
- Agregar al menos un item
- Verificar número de pedido único

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Migración de base de datos aplicada
- [x] Tablas creadas con RLS
- [x] Triggers configurados
- [x] Vistas creadas
- [x] Categorías precargadas
- [x] EPIs de ejemplo insertados
- [x] Componente frontend conectado
- [x] Ruta en ManagementApp corregida
- [x] Build exitoso
- [x] Módulo totalmente funcional

---

## 🎉 ESTADO FINAL

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║     ✅ MÓDULO DE EPIs EN PRODUCCIÓN              ║
║                                                   ║
║  📦 15 EPIs cargados                             ║
║  🏷️ 7 categorías configuradas                    ║
║  💰 €12,055.00 en inventario                     ║
║  🛠️ Todas las funciones operativas               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**El módulo está listo para usar. Accede desde:**
```
Panel de Gestión → Recursos → EPIs
```

---

© 2024 - Sistema de Gestión Integral
**Módulo:** Gestión de EPIs
**Versión:** 1.0.0
**Estado:** ✅ PRODUCCIÓN
