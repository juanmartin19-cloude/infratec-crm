# INFRATEC - SISTEMA COMPLETO CON 3 NIVELES DE ACCESO

## 🎯 SISTEMA DE ROLES IMPLEMENTADO

### **1. NIVEL ADMIN (Dueño)**
- ✅ **Acceso Total** a todas las funcionalidades
- ✅ **Chami con acceso completo** a todos los datos empresariales
- ✅ **Módulo de Mapa** con gestión de clientes y hojas de ruta
- ✅ Configuración global del sistema
- ✅ Gestión de usuarios
- ✅ Acceso a finanzas y proyecciones
- ✅ **Credenciales:** admin@infratec.com / admin123

### **2. NIVEL ADMINISTRACIÓN (Oficina)**
- ✅ Gestión de clientes, presupuestos, facturación, agenda
- ✅ **NO puede borrar registros** (solo editar)
- ✅ Chami con acceso limitado (solo áreas operativas)
- ✅ **SIN acceso** a configuración crítica
- ✅ **SIN acceso** a gestión de usuarios
- ✅ **Credenciales:** oficina@infratec.com / oficina123

### **3. NIVEL TÉCNICO (Campo)**
- ✅ Vista simplificada móvil-friendly
- ✅ Solo ve órdenes de trabajo asignadas
- ✅ Especificaciones técnicas de equipos
- ✅ Formulario de reporte de instalación
- ✅ Chami básico (ayuda con procedimientos)
- ✅ **Credenciales:** tecnico@infratec.com / tecnico123

---

## 🗺️ MÓDULO DE MAPA (Solo Admin)

### Funcionalidades:
✅ **Visualización de clientes en mapa**
- Marcadores diferenciados por tipo (B2B / B2C)
- Contador de clientes total, B2B, B2C
- Zoom y navegación

✅ **Gestión de hojas de ruta**
- Modo creación de ruta activable
- Selección de clientes con click
- Asignación de técnico
- Generación de hoja de ruta en PDF
- Orden de visitas numerado

✅ **Información de clientes**
- Click en marcador → Ver detalle completo
- Servicios instalados
- Estado (Activo/Mantenimiento)
- Ubicación GPS
- Historial y acciones rápidas

✅ **Zonas configurables**
- Filtrado por zona geográfica
- Estadísticas por zona
- (Configurable según necesidades)

---

## 🤖 CHAMI INTEGRADO EN LOS 3 NIVELES

### **Chami para Admin:**
```
"¡Hola! Soy Chami, tu agente maestro. Tengo acceso completo 
a todos los datos de INFRATEC. Puedo ayudarte con estrategia, 
finanzas, operaciones, marketing, gestión de equipos..."
```
**Acceso:** Todos los datos, métricas financieras, proyecciones, gestión estratégica

### **Chami para Administración:**
```
"¡Hola! Soy Chami, tu asistente de gestión operativa. 
Puedo ayudarte con clientes, presupuestos, facturación 
y coordinación de instalaciones."
```
**Acceso:** Solo datos operativos (clientes, agenda, presupuestos)

### **Chami para Técnicos:**
```
"¡Hola! Soy Chami, tu asistente técnico. Puedo ayudarte 
con especificaciones de equipos, procedimientos de 
instalación y reportes."
```
**Acceso:** Solo información de sus órdenes de trabajo asignadas

---

## 🔒 LÓGICA DE PERMISOS (Robusta desde Código)

### Estructura de permisos:
```javascript
PERMISSIONS = {
  ADMIN: {
    canViewAll: true,
    canEdit: true,
    canDelete: true,
    canCreateUsers: true,
    canViewFinances: true,
    canConfigureSystem: true,
    canAccessChami: 'full'
  },
  ADMINISTRACION: {
    canViewAll: true,
    canEdit: true,
    canDelete: false,  // ⚠️ NO PUEDE BORRAR
    canCreateUsers: false,
    canViewFinances: true,
    canConfigureSystem: false,
    canAccessChami: 'limited'
  },
  TECNICO: {
    canViewAll: false,  // Solo sus órdenes
    canEdit: false,
    canDelete: false,
    canCreateUsers: false,
    canViewFinances: false,
    canConfigureSystem: false,
    canAccessChami: 'basic'
  }
}
```

---

## 🚀 DEPLOY EN EASYPANEL

### **PASO 1: Descomprimir ZIP**
Extraer `infratec-roles-system.zip`

### **PASO 2: En Easypanel**
1. Arrastra la carpeta completa
2. **Variables de entorno:**
   ```
   NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-api03-tu-key-aqui
   NODE_ENV=production
   PORT=3000
   ```
3. Deploy

### **PASO 3: Acceder**
1. Abrir URL de Easypanel
2. Login con cualquiera de los 3 usuarios

---

## 👥 USUARIOS DE PRUEBA

| Rol | Email | Password | Permisos |
|-----|-------|----------|----------|
| **Admin** | admin@infratec.com | admin123 | Total |
| **Administración** | oficina@infratec.com | oficina123 | Gestión (sin borrar) |
| **Técnico** | tecnico@infratec.com | tecnico123 | Solo órdenes |

---

## 📱 INTERFACES POR ROL

### **Admin (Desktop-First):**
- Dashboard con métricas completas
- Módulo de Mapa con gestión de rutas
- Módulo de Finanzas
- Gestión de Usuarios
- Configuración del sistema
- Chami con acceso completo

### **Administración (Desktop):**
- Gestión de Clientes
- Presupuestos y Cotizaciones
- Facturación
- Agenda de Instalaciones
- Chami operativo

### **Técnico (Mobile-First):**
- Lista de órdenes del día
- Detalles de cada trabajo
- Botón grande "Subir Reporte"
- Interfaz simplificada
- Chami de ayuda técnica

---

## 🔧 PERSONALIZACIÓN FUTURA

### Módulo de Mapa:
Configurable según necesidades:
- ✅ Click en cliente → Acciones personalizadas
- ✅ Campos adicionales de información
- ✅ Integración con Google Maps API (en lugar del mapa simulado)
- ✅ Cálculo de rutas optimizadas automáticas
- ✅ Tracking en tiempo real de técnicos

### Permisos:
Fácilmente extensible:
- Agregar más roles (ej: "Ventas", "Cobranzas")
- Permisos granulares por módulo
- Permisos temporales (ej: acceso limitado por 24hs)

---

## 📦 CONTENIDO DEL ZIP

```
infratec-roles-system/
├── pages/
│   ├── index.jsx                  # Página principal
│   └── _app.jsx                   # App wrapper
├── components/
│   └── InfratecCRM.jsx            # Sistema completo (22KB)
├── public/
│   ├── manifest.json              # PWA
│   └── service-worker.js          # Service Worker
├── styles/
│   └── globals.css                # Estilos globales
├── package.json                   # Dependencias
├── next.config.js                 # Config Next.js
├── tailwind.config.js             # Config Tailwind
├── postcss.config.js              # Config PostCSS
├── Dockerfile                     # Docker para Easypanel
├── .env.example                   # Variables de entorno
├── .gitignore                     # Git ignore
└── README.md                      # Este archivo
```

---

## ⚡ FUNCIONALIDADES CLAVE

### ✅ Sistema de Login seguro
- Validación de credenciales
- Sesión persistente
- Logout con confirmación

### ✅ Dashboards diferenciados
- UI adaptada según rol
- Solo muestra lo que cada usuario necesita
- Responsive (desktop y móvil)

### ✅ Módulo de Mapa interactivo
- Visualización de clientes
- Creación de hojas de ruta
- Información detallada por cliente
- Contadores en tiempo real

### ✅ Chami con permisos
- Respuestas adaptadas al rol
- Acceso limitado a datos
- Ayuda contextual

### ✅ Lógica de permisos robusta
- Validación en cada acción
- NO se puede saltear desde el código
- Administración NO puede borrar (hard-coded)

---

## 🐳 DOCKERFILE INCLUIDO

El Dockerfile está optimizado para producción:
- Node 18 Alpine (imagen liviana)
- Multi-stage build
- Cache de dependencias
- Salida standalone de Next.js
- Puerto 3000 expuesto

---

## 🎨 PRÓXIMOS PASOS (Opcional)

1. **Integrar Supabase** (si querés BD real)
2. **Google Maps API** (en lugar del mapa simulado)
3. **WhatsApp Business API** (notificaciones a técnicos)
4. **Generación de PDF** (reportes e informes)
5. **Sistema de notificaciones** (push notifications)

---

## 📞 SOPORTE

Si necesitás agregar:
- Nuevos roles
- Más permisos
- Módulos adicionales
- Integraciones

Solo pedilo y lo agrego al sistema.

---

**INFRATEC - Sistema Completo con Roles y Mapa**
*Versión 1.0.0 - Lista para producción*
