import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { LayoutDashboard, Users, Ticket, Package, UserCircle, Bot, Bell, Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Menu, X, Mic, MicOff, Volume2, Upload, FileText, File, Brain, Send, Trash2, Download, Play, Pause, Settings, Instagram, Facebook, Linkedin, Palette, Zap, Target, TrendingUpIcon, Globe, Newspaper, BarChart3, Map, MapPin, Route, Navigation, Phone, Mail, Home, LogOut, Shield } from 'lucide-react';

// ============================================
// CONTEXT DE AUTENTICACIÓN Y ROLES
// ============================================
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

// ============================================
// SISTEMA DE PERMISOS
// ============================================
const PERMISSIONS = {
  ADMIN: {
    canViewAll: true,
    canEdit: true,
    canDelete: true,
    canCreateUsers: true,
    canViewFinances: true,
    canConfigureSystem: true,
    canAccessChami: 'full', // Acceso completo a todos los datos
    chamiCapabilities: ['all']
  },
  ADMINISTRACION: {
    canViewAll: true,
    canEdit: true,
    canDelete: false, // NO puede borrar nada
    canCreateUsers: false,
    canViewFinances: true,
    canConfigureSystem: false,
    canAccessChami: 'limited', // Acceso limitado
    chamiCapabilities: ['clientes', 'presupuestos', 'agenda', 'facturacion']
  },
  TECNICO: {
    canViewAll: false,
    canEdit: false,
    canDelete: false,
    canCreateUsers: false,
    canViewFinances: false,
    canConfigureSystem: false,
    canAccessChami: 'basic', // Solo info de sus trabajos
    chamiCapabilities: ['ordenes_trabajo', 'especificaciones']
  }
};

// Usuarios de ejemplo (en producción vendrían de BD)
const USERS_DB = [
  { id: 1, email: 'admin@infratec.com', password: 'admin123', name: 'Dueño INFRATEC', role: 'ADMIN' },
  { id: 2, email: 'oficina@infratec.com', password: 'oficina123', name: 'Administración', role: 'ADMINISTRACION' },
  { id: 3, email: 'tecnico@infratec.com', password: 'tecnico123', name: 'Juan Pérez', role: 'TECNICO' }
];

// ============================================
// MÓDULO DE MAPA CON CLIENTES
// ============================================
function MapaClientes({ user, speak }) {
  const [clientes, setClientes] = useState([
    { id: 1, name: 'Fábrica Metalúrgica S.A.', lat: -34.6037, lng: -58.3816, tipo: 'B2B', servicios: ['CCTV', 'Alarmas'], estado: 'Activo' },
    { id: 2, name: 'Supermercado Don Pedro', lat: -34.6158, lng: -58.4333, tipo: 'B2B', servicios: ['CCTV'], estado: 'Activo' },
    { id: 3, name: 'Residencia Martínez', lat: -34.5976, lng: -58.3820, tipo: 'B2C', servicios: ['Alarma', 'Control Acceso'], estado: 'Activo' },
    { id: 4, name: 'Oficinas TechCorp', lat: -34.6092, lng: -58.3842, tipo: 'B2B', servicios: ['CCTV', 'Redes'], estado: 'Mantenimiento' },
    { id: 5, name: 'Comercio Los Andes', lat: -34.6010, lng: -58.3900, tipo: 'B2B', servicios: ['CCTV'], estado: 'Activo' }
  ]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modoRuta, setModoRuta] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState([]);
  const [tecnicoAsignado, setTecnicoAsignado] = useState('');
  const [zonaActiva, setZonaActiva] = useState('Capital Federal');

  const contadorClientes = clientes.length;
  const contadorB2B = clientes.filter(c => c.tipo === 'B2B').length;
  const contadorB2C = clientes.filter(c => c.tipo === 'B2C').length;

  const toggleClienteEnRuta = (cliente) => {
    if (rutaSeleccionada.find(c => c.id === cliente.id)) {
      setRutaSeleccionada(rutaSeleccionada.filter(c => c.id !== cliente.id));
      speak(`Cliente ${cliente.name} removido de la ruta`);
    } else {
      setRutaSeleccionada([...rutaSeleccionada, cliente]);
      speak(`Cliente ${cliente.name} agregado a la ruta`);
    }
  };

  const generarHojaDeRuta = () => {
    if (!tecnicoAsignado) {
      speak('Necesito que asignes un técnico primero');
      return;
    }

    speak(`Generando hoja de ruta para ${tecnicoAsignado} con ${rutaSeleccionada.length} paradas`);
    // Aquí se generaría el PDF o se guardaría en BD
    alert(`Hoja de ruta generada:\n\nTécnico: ${tecnicoAsignado}\nClientes: ${rutaSeleccionada.length}\n\n${rutaSeleccionada.map((c, i) => `${i+1}. ${c.name}`).join('\n')}`);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-500/30">
          <MapPin className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{contadorClientes}</p>
          <p className="text-sm text-gray-400">Total Clientes</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-500/30">
          <Users className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{contadorB2B}</p>
          <p className="text-sm text-gray-400">Clientes B2B</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-500/30">
          <Home className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{contadorB2C}</p>
          <p className="text-sm text-gray-400">Clientes B2C</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-500/30">
          <Route className="w-8 h-8 text-orange-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{rutaSeleccionada.length}</p>
          <p className="text-sm text-gray-400">En ruta actual</p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setModoRuta(!modoRuta)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            modoRuta
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-gray-600'
          }`}
        >
          <Route className="w-5 h-5 inline mr-2" />
          {modoRuta ? 'Modo Ruta ACTIVO' : 'Crear Hoja de Ruta'}
        </button>

        {modoRuta && (
          <>
            <input
              type="text"
              value={tecnicoAsignado}
              onChange={(e) => setTecnicoAsignado(e.target.value)}
              placeholder="Nombre del técnico..."
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={generarHojaDeRuta}
              disabled={rutaSeleccionada.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5 inline mr-2" />
              Generar Hoja ({rutaSeleccionada.length})
            </button>
          </>
        )}
      </div>

      {/* Mapa simulado + Lista de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa (placeholder - en producción sería Leaflet/Google Maps) */}
        <div className="lg:col-span-2 bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 min-h-[500px]">
          <div className="w-full h-full bg-gradient-to-br from-blue-900/10 to-green-900/10 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Simulación de mapa */}
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Calles simuladas */}
                <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="2" />
                <line x1="0" y1="200" x2="400" y2="200" stroke="currentColor" strokeWidth="2" />
                <line x1="0" y1="300" x2="400" y2="300" stroke="currentColor" strokeWidth="2" />
                <line x1="100" y1="0" x2="100" y2="400" stroke="currentColor" strokeWidth="2" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="2" />
                <line x1="300" y1="0" x2="300" y2="400" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {/* Markers de clientes */}
            {clientes.map((cliente, idx) => {
              const x = 50 + (idx * 60);
              const y = 100 + ((idx % 3) * 120);
              const enRuta = rutaSeleccionada.find(c => c.id === cliente.id);
              
              return (
                <div
                  key={cliente.id}
                  onClick={() => modoRuta ? toggleClienteEnRuta(cliente) : setClienteSeleccionado(cliente)}
                  className={`absolute cursor-pointer transition-all hover:scale-125 ${
                    enRuta ? 'animate-pulse' : ''
                  }`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <MapPin className={`w-8 h-8 ${
                    enRuta ? 'text-orange-400' :
                    cliente.tipo === 'B2B' ? 'text-blue-400' : 'text-purple-400'
                  }`} />
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                    {cliente.name}
                  </span>
                </div>
              );
            })}

            <div className="absolute bottom-4 right-4 bg-gray-900/90 p-3 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">B2B</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">B2C</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">En ruta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-100">Clientes en {zonaActiva}</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {clientes.map((cliente) => {
              const enRuta = rutaSeleccionada.find(c => c.id === cliente.id);
              return (
                <div
                  key={cliente.id}
                  onClick={() => modoRuta ? toggleClienteEnRuta(cliente) : setClienteSeleccionado(cliente)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    clienteSeleccionado?.id === cliente.id
                      ? 'bg-blue-500/20 border-blue-500'
                      : enRuta
                      ? 'bg-orange-500/20 border-orange-500'
                      : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-100 text-sm">{cliente.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{cliente.servicios.join(', ')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      cliente.tipo === 'B2B' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {cliente.tipo}
                    </span>
                  </div>
                  {enRuta && (
                    <div className="mt-2 text-xs text-orange-400 font-semibold">
                      ✓ En ruta (Orden: {rutaSeleccionada.findIndex(c => c.id === cliente.id) + 1})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalle del cliente seleccionado */}
      {clienteSeleccionado && !modoRuta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100">Información del Cliente</h3>
              <button onClick={() => setClienteSeleccionado(null)} className="p-2 hover:bg-gray-800 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-lg font-semibold text-gray-100">{clienteSeleccionado.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  clienteSeleccionado.tipo === 'B2B' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {clienteSeleccionado.tipo}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Servicios Instalados</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {clienteSeleccionado.servicios.map((servicio, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                  clienteSeleccionado.estado === 'Activo' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {clienteSeleccionado.estado}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="text-sm text-gray-300">{clienteSeleccionado.lat}, {clienteSeleccionado.lng}</p>
              </div>

              <div className="flex gap-2 mt-6">
                <button className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-500/30">
                  Ver Historial
                </button>
                <button className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 hover:bg-green-500/30">
                  Nueva Orden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD ADMIN (Dueño - Acceso Total)
// ============================================
function AdminDashboard({ user, speak }) {
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <div className="space-y-6">
      {/* Header Admin */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-6 border-2 border-red-500/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Panel de Administración
            </h2>
            <p className="text-gray-400 mt-1">Acceso Total - Nivel Dueño</p>
          </div>
          <Shield className="w-12 h-12 text-red-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'mapa', label: 'Mapa de Clientes', icon: Map },
          { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
          { id: 'usuarios', label: 'Usuarios', icon: Users },
          { id: 'config', label: 'Configuración', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeModule === tab.id
                  ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-500 text-red-300'
                  : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido según módulo */}
      {activeModule === 'mapa' && <MapaClientes user={user} speak={speak} />}

      {activeModule === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-500/30">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
            <p className="text-3xl font-bold text-gray-100">$452K</p>
            <p className="text-sm text-gray-400">Facturación Mensual</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-500/30">
            <Users className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-3xl font-bold text-gray-100">142</p>
            <p className="text-sm text-gray-400">Clientes Activos</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-500/30">
            <Ticket className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-3xl font-bold text-gray-100">23</p>
            <p className="text-sm text-gray-400">Órdenes Pendientes</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-500/30">
            <Package className="w-8 h-8 text-orange-400 mb-3" />
            <p className="text-3xl font-bold text-gray-100">8</p>
            <p className="text-sm text-gray-400">Stock Bajo</p>
          </div>
        </div>
      )}

      {activeModule === 'finanzas' && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Módulo de Finanzas</h3>
          <p className="text-gray-400">Vista completa de ingresos, egresos, márgenes y proyecciones financieras.</p>
          <p className="text-sm text-gray-600 mt-2">Solo visible para el Administrador</p>
        </div>
      )}

      {activeModule === 'usuarios' && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Gestión de Usuarios</h3>
          <div className="space-y-3">
            {USERS_DB.map(u => (
              <div key={u.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-100">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                  u.role === 'ADMINISTRACION' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD ADMINISTRACIÓN (Oficina)
// ============================================
function AdministracionDashboard({ user, speak }) {
  const [activeModule, setActiveModule] = useState('clientes');

  return (
    <div className="space-y-6">
      {/* Header Administración */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border-2 border-blue-500/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Panel de Administración
            </h2>
            <p className="text-gray-400 mt-1">Gestión Operativa</p>
          </div>
          <Users className="w-12 h-12 text-blue-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'clientes', label: 'Clientes', icon: Users },
          { id: 'presupuestos', label: 'Presupuestos', icon: FileText },
          { id: 'facturacion', label: 'Facturación', icon: DollarSign },
          { id: 'agenda', label: 'Agenda', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeModule === tab.id
                  ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-500 text-blue-300'
                  : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-100 mb-4">
          {activeModule === 'clientes' && 'Gestión de Clientes'}
          {activeModule === 'presupuestos' && 'Presupuestos y Cotizaciones'}
          {activeModule === 'facturacion' && 'Facturación'}
          {activeModule === 'agenda' && 'Agenda de Instalaciones'}
        </h3>
        <p className="text-gray-400">Módulo de {activeModule}</p>
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400">⚠️ Permisos: Puede editar pero NO eliminar registros</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD TÉCNICO (Campo)
// ============================================
function TecnicoDashboard({ user, speak }) {
  const ordenesAsignadas = [
    { id: 1, cliente: 'Supermercado Don Pedro', direccion: 'Av. Corrientes 4532', hora: '09:00', tipo: 'Instalación CCTV', prioridad: 'Alta' },
    { id: 2, cliente: 'Residencia Martínez', direccion: 'Calle Falsa 123', hora: '14:00', tipo: 'Mantenimiento Alarma', prioridad: 'Media' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Técnico */}
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border-2 border-green-500/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Mis Órdenes de Trabajo
            </h2>
            <p className="text-gray-400 mt-1">Hoy: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
          <Navigation className="w-10 h-10 text-green-400" />
        </div>
      </div>

      {/* Órdenes del día */}
      <div className="space-y-3">
        {ordenesAsignadas.map((orden) => (
          <div key={orden.id} className="p-5 bg-gray-900/50 rounded-xl border-2 border-green-500/30 hover:border-green-400/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-100">{orden.cliente}</h4>
                <p className="text-sm text-gray-400 mt-1">{orden.direccion}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                orden.prioridad === 'Alta' ? 'bg-red-500/20 text-red-400' :
                orden.prioridad === 'Media' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {orden.prioridad}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{orden.hora}</span>
              </div>
              <div className="flex items-center gap-1">
                <Ticket className="w-4 h-4" />
                <span>{orden.tipo}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-500/30 text-sm font-semibold">
                Ver Detalles
              </button>
              <button className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 hover:bg-green-500/30 text-sm font-semibold">
                Iniciar Trabajo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón de reporte */}
      <button
        onClick={() => speak('Abriendo formulario de reporte de instalación')}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg hover:from-green-600 hover:to-emerald-600"
      >
        <Upload className="w-6 h-6 inline mr-2" />
        Subir Reporte de Instalación
      </button>
    </div>
  );
}

// ============================================
// CHAMI INTEGRADO (Con permisos por rol)
// ============================================
function ChamiAssistant({ user, speak }) {
  const permissions = PERMISSIONS[user.role];
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: getWelcomeMessage(user),
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  function getWelcomeMessage(user) {
    if (user.role === 'ADMIN') {
      return `¡Hola ${user.name}! 👑 Soy Chami, tu agente maestro. Tengo acceso completo a todos los datos de INFRATEC. Puedo ayudarte con estrategia, finanzas, operaciones, marketing, gestión de equipos... lo que necesites para tomar las mejores decisiones.`;
    } else if (user.role === 'ADMINISTRACION') {
      return `¡Hola ${user.name}! Soy Chami, tu asistente de gestión operativa. Puedo ayudarte con clientes, presupuestos, facturación y coordinación de instalaciones. ¿En qué te ayudo?`;
    } else {
      return `¡Hola ${user.name}! Soy Chami, tu asistente técnico. Puedo ayudarte con especificaciones de equipos, procedimientos de instalación y reportes. ¿Qué necesitás?`;
    }
  }

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Simular respuesta de Chami según permisos
    setTimeout(() => {
      let response = '';
      
      if (user.role === 'ADMIN') {
        response = `Como Admin, puedo darte una visión completa. Sobre "${text}": tengo acceso a todas las áreas de INFRATEC (finanzas, operaciones, marketing, RRHH). ¿Qué aspecto específico querés que analice?`;
      } else if (user.role === 'ADMINISTRACION') {
        response = `Perfecto, te ayudo con la gestión operativa. Para "${text}": puedo coordinar con clientes, generar presupuestos y organizar la agenda de instalaciones. ¿Qué querés que haga?`;
      } else {
        response = `Dale, te asisto con lo técnico. Sobre "${text}": puedo darte specs de equipos, procedimientos de instalación y ayudarte con el reporte. ¿Necesitás algo específico?`;
      }

      const assistantMsg = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      speak(response);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">Chami AI</h3>
            <p className="text-xs text-gray-500">Nivel de acceso: {user.role}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl p-4 ${
              msg.role === 'user'
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-purple-500/10 border border-purple-500/30'
            }`}>
              <p className="text-sm leading-relaxed text-gray-200">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu consulta..."
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={() => sendMessage()}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE LOGIN
// ============================================
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = USERS_DB.find(u => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              INFRATEC
            </h1>
            <p className="text-gray-500 mt-2">Sistema de Gestión Integral</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500/50"
                placeholder="usuario@infratec.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg text-white font-bold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all"
            >
              Iniciar Sesión
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
            <p className="text-xs text-gray-500 text-center mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Admin: admin@infratec.com / admin123</p>
              <p>Oficina: oficina@infratec.com / oficina123</p>
              <p>Técnico: tecnico@infratec.com / tecnico123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function InfratecCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Función de voz
  const speak = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const permissions = PERMISSIONS[currentUser.role];

  // Menú según rol
  const getMenuItems = () => {
    if (currentUser.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'chami', label: 'Chami AI', icon: Bot }
      ];
    } else if (currentUser.role === 'ADMINISTRACION') {
      return [
        { id: 'dashboard', label: 'Gestión', icon: Users },
        { id: 'chami', label: 'Asistente', icon: Bot }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Mis Órdenes', icon: Ticket },
        { id: 'chami', label: 'Ayuda', icon: Bot }
      ];
    }
  };

  return (
    <AuthContext.Provider value={{ user: currentUser, permissions, speak }}>
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-0 h-full bg-[#0d1220] border-r border-gray-800/50 backdrop-blur-xl z-50 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg ${
                  currentUser.role === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                  currentUser.role === 'ADMINISTRACION' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                  'bg-gradient-to-br from-green-500 to-emerald-500'
                }`}>
                  IT
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-100">INFRATEC</h1>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {getMenuItems().map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? currentUser.role === 'ADMIN'
                          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400'
                          : currentUser.role === 'ADMINISTRACION'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400'
                          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800/50">
              <button
                onClick={() => setCurrentUser(null)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <header className="sticky top-0 z-40 bg-[#0d1220]/80 backdrop-blur-xl border-b border-gray-800/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-800/50"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-100">{currentUser.name}</h2>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">
            {activeTab === 'dashboard' && (
              <>
                {currentUser.role === 'ADMIN' && <AdminDashboard user={currentUser} speak={speak} />}
                {currentUser.role === 'ADMINISTRACION' && <AdministracionDashboard user={currentUser} speak={speak} />}
                {currentUser.role === 'TECNICO' && <TecnicoDashboard user={currentUser} speak={speak} />}
              </>
            )}

            {activeTab === 'chami' && <ChamiAssistant user={currentUser} speak={speak} />}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
