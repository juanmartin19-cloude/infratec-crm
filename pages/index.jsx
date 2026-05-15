import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { LayoutDashboard, Users, Ticket, Package, UserCircle, Bot, Bell, Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Menu, X, Mic, MicOff, Volume2, Upload, FileText, File, Brain, Send, Trash2, Download, Play, Pause, Settings, Instagram, Facebook, Linkedin, Palette, Zap, Target, Globe, Newspaper, BarChart3, Map, MapPin, Route, Navigation, Phone, Mail, Home, LogOut, Shield, Plus, Edit2, Power, Sparkles, Heart } from 'lucide-react';

const AuthContext = createContext();
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

const PERMISSIONS = {
  ADMIN: { canViewAll: true, canEdit: true, canDelete: true, canCreateUsers: true, canViewFinances: true, canConfigureSystem: true, canAccessChami: 'full', chamiCapabilities: ['all'] },
  ADMINISTRACION: { canViewAll: true, canEdit: true, canDelete: false, canCreateUsers: false, canViewFinances: true, canConfigureSystem: false, canAccessChami: 'limited', chamiCapabilities: ['clientes', 'presupuestos', 'agenda', 'facturacion'] },
  TECNICO: { canViewAll: false, canEdit: false, canDelete: false, canCreateUsers: false, canViewFinances: false, canConfigureSystem: false, canAccessChami: 'basic', chamiCapabilities: ['ordenes_trabajo', 'especificaciones'] }
};

const USERS_DB = [
  { id: 1, email: 'admin@infratec.com', password: 'admin123', name: 'Dueño INFRATEC', role: 'ADMIN' },
  { id: 2, email: 'oficina@infratec.com', password: 'oficina123', name: 'Administración', role: 'ADMINISTRACION' },
  { id: 3, email: 'tecnico@infratec.com', password: 'tecnico123', name: 'Juan Pérez', role: 'TECNICO' }
];

const AGENTES_INICIALES = [
  { id: 1, nombre: 'Chami', rol: 'Asistente General', descripcion: 'Agente principal de INFRATEC. Atiende consultas de todos los roles con acceso diferenciado.', personalidad: 'Cercano, profesional, usa jerga argentina. Siempre positivo y orientado a soluciones.', capacidades: ['clientes', 'presupuestos', 'agenda', 'facturacion', 'ordenes_trabajo', 'especificaciones', 'analisis'], nivelAcceso: 'ADMIN', activo: true, color: 'from-pink-500 to-purple-500', createdAt: '2024-01-15' },
  { id: 2, nombre: 'TechBot', rol: 'Soporte Técnico', descripcion: 'Especialista en instalaciones, especificaciones de equipos y resolución de problemas técnicos.', personalidad: 'Técnico y preciso. Explica conceptos complejos de forma simple.', capacidades: ['ordenes_trabajo', 'especificaciones', 'manuales'], nivelAcceso: 'TECNICO', activo: true, color: 'from-green-500 to-emerald-500', createdAt: '2024-02-01' },
  { id: 3, nombre: 'SalesAI', rol: 'Ventas y Cotizaciones', descripcion: 'Agente enfocado en generar presupuestos, seguimiento de leads y estrategia comercial.', personalidad: 'Entusiasta, persuasivo y orientado a resultados comerciales.', capacidades: ['presupuestos', 'clientes', 'facturacion'], nivelAcceso: 'ADMINISTRACION', activo: false, color: 'from-blue-500 to-cyan-500', createdAt: '2024-03-10' }
];

const CAPACIDADES_DISPONIBLES = [
  { id: 'clientes', label: 'Gestión de Clientes' },
  { id: 'presupuestos', label: 'Presupuestos y Cotizaciones' },
  { id: 'agenda', label: 'Agenda e Instalaciones' },
  { id: 'facturacion', label: 'Facturación' },
  { id: 'ordenes_trabajo', label: 'Órdenes de Trabajo' },
  { id: 'especificaciones', label: 'Especificaciones Técnicas' },
  { id: 'analisis', label: 'Análisis y Reportes' },
  { id: 'manuales', label: 'Manuales y Documentación' },
  { id: 'marketing', label: 'Marketing y Redes Sociales' },
  { id: 'rrhh', label: 'Recursos Humanos' },
];

function MapaClientes({ user, speak }) {
  const [clientes] = useState([
    { id: 1, name: 'Fábrica Metalúrgica S.A.', tipo: 'B2B', servicios: ['CCTV', 'Alarmas'], estado: 'Activo' },
    { id: 2, name: 'Supermercado Don Pedro', tipo: 'B2B', servicios: ['CCTV'], estado: 'Activo' },
    { id: 3, name: 'Residencia Martínez', tipo: 'B2C', servicios: ['Alarma', 'Control Acceso'], estado: 'Activo' },
    { id: 4, name: 'Oficinas TechCorp', tipo: 'B2B', servicios: ['CCTV', 'Redes'], estado: 'Mantenimiento' },
    { id: 5, name: 'Comercio Los Andes', tipo: 'B2B', servicios: ['CCTV'], estado: 'Activo' }
  ]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modoRuta, setModoRuta] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState([]);
  const [tecnicoAsignado, setTecnicoAsignado] = useState('');

  const toggleClienteEnRuta = (cliente) => {
    if (rutaSeleccionada.find(c => c.id === cliente.id)) {
      setRutaSeleccionada(rutaSeleccionada.filter(c => c.id !== cliente.id));
    } else {
      setRutaSeleccionada([...rutaSeleccionada, cliente]);
    }
  };

  const generarHojaDeRuta = () => {
    if (!tecnicoAsignado) { speak('Necesito que asignes un técnico primero'); return; }
    alert(`Hoja de ruta generada:\n\nTécnico: ${tecnicoAsignado}\nClientes: ${rutaSeleccionada.length}\n\n${rutaSeleccionada.map((c, i) => `${i+1}. ${c.name}`).join('\n')}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-500/30">
          <MapPin className="w-8 h-8 text-blue-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{clientes.length}</p>
          <p className="text-sm text-gray-400">Total Clientes</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-500/30">
          <Users className="w-8 h-8 text-green-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{clientes.filter(c => c.tipo === 'B2B').length}</p>
          <p className="text-sm text-gray-400">Clientes B2B</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-500/30">
          <Home className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{clientes.filter(c => c.tipo === 'B2C').length}</p>
          <p className="text-sm text-gray-400">Clientes B2C</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-500/30">
          <Route className="w-8 h-8 text-orange-400 mb-2" />
          <p className="text-3xl font-bold text-gray-100">{rutaSeleccionada.length}</p>
          <p className="text-sm text-gray-400">En ruta actual</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => setModoRuta(!modoRuta)} className={`px-4 py-2 rounded-lg font-semibold transition-all ${modoRuta ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-gray-600'}`}>
          <Route className="w-5 h-5 inline mr-2" />
          {modoRuta ? 'Modo Ruta ACTIVO' : 'Crear Hoja de Ruta'}
        </button>
        {modoRuta && (
          <>
            <input type="text" value={tecnicoAsignado} onChange={(e) => setTecnicoAsignado(e.target.value)} placeholder="Nombre del técnico..." className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-orange-500 focus:outline-none" />
            <button onClick={generarHojaDeRuta} disabled={rutaSeleccionada.length === 0} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-5 h-5 inline mr-2" />Generar Hoja ({rutaSeleccionada.length})
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 min-h-96">
          <div className="w-full h-96 bg-gradient-to-br from-blue-900/10 to-green-900/10 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <line x1="0" y1="75" x2="400" y2="75" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="225" x2="400" y2="225" stroke="currentColor" strokeWidth="1" />
                <line x1="80" y1="0" x2="80" y2="300" stroke="currentColor" strokeWidth="1" />
                <line x1="160" y1="0" x2="160" y2="300" stroke="currentColor" strokeWidth="1" />
                <line x1="240" y1="0" x2="240" y2="300" stroke="currentColor" strokeWidth="1" />
                <line x1="320" y1="0" x2="320" y2="300" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            {clientes.map((cliente, idx) => {
              const positions = [{x:60,y:80},{x:180,y:120},{x:100,y:200},{x:280,y:80},{x:220,y:200}];
              const pos = positions[idx] || {x:50+idx*50,y:100};
              const enRuta = rutaSeleccionada.find(c => c.id === cliente.id);
              return (
                <div key={cliente.id} onClick={() => modoRuta ? toggleClienteEnRuta(cliente) : setClienteSeleccionado(cliente)} className={`absolute cursor-pointer transition-all hover:scale-125 ${enRuta ? 'animate-pulse' : ''}`} style={{left:`${pos.x}px`,top:`${pos.y}px`}}>
                  <MapPin className={`w-8 h-8 ${enRuta ? 'text-orange-400' : cliente.tipo === 'B2B' ? 'text-blue-400' : 'text-purple-400'}`} />
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 px-1 py-0.5 rounded text-xs whitespace-nowrap text-gray-300 opacity-0 hover:opacity-100">{cliente.name}</span>
                </div>
              );
            })}
            <div className="absolute bottom-3 right-3 bg-gray-900/90 p-2 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" /><span className="text-gray-300">B2B</span></div>
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-purple-400" /><span className="text-gray-300">B2C</span></div>
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-400" /><span className="text-gray-300">En ruta</span></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-gray-100">Clientes</h3>
          {clientes.map((cliente) => {
            const enRuta = rutaSeleccionada.find(c => c.id === cliente.id);
            return (
              <div key={cliente.id} onClick={() => modoRuta ? toggleClienteEnRuta(cliente) : setClienteSeleccionado(cliente)} className={`p-3 rounded-lg border cursor-pointer transition-all ${clienteSeleccionado?.id === cliente.id ? 'bg-blue-500/20 border-blue-500' : enRuta ? 'bg-orange-500/20 border-orange-500' : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-100 text-sm">{cliente.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{cliente.servicios.join(', ')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${cliente.tipo === 'B2B' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{cliente.tipo}</span>
                </div>
                {enRuta && <p className="mt-1 text-xs text-orange-400 font-semibold">✓ En ruta ({rutaSeleccionada.findIndex(c => c.id === cliente.id) + 1})</p>}
              </div>
            );
          })}
        </div>
      </div>

      {clienteSeleccionado && !modoRuta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-blue-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-100">Información del Cliente</h3>
              <button onClick={() => setClienteSeleccionado(null)} className="p-2 hover:bg-gray-800 rounded"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><p className="text-sm text-gray-500">Nombre</p><p className="text-lg font-semibold text-gray-100">{clienteSeleccionado.name}</p></div>
              <div><p className="text-sm text-gray-500">Tipo</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${clienteSeleccionado.tipo === 'B2B' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{clienteSeleccionado.tipo}</span></div>
              <div><p className="text-sm text-gray-500">Servicios</p><div className="flex flex-wrap gap-2 mt-1">{clienteSeleccionado.servicios.map((s,i) => <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{s}</span>)}</div></div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 hover:bg-blue-500/30 text-sm">Ver Historial</button>
                <button className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 hover:bg-green-500/30 text-sm">Nueva Orden</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentesManager({ speak }) {
  const [agentes, setAgentes] = useState(AGENTES_INICIALES);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', rol: '', descripcion: '', personalidad: '', capacidades: [], nivelAcceso: 'ADMINISTRACION', color: 'from-blue-500 to-cyan-500', activo: true });

  const colores = [
    { value: 'from-pink-500 to-purple-500', label: 'Rosa / Violeta' },
    { value: 'from-blue-500 to-cyan-500', label: 'Azul / Cyan' },
    { value: 'from-green-500 to-emerald-500', label: 'Verde / Esmeralda' },
    { value: 'from-orange-500 to-red-500', label: 'Naranja / Rojo' },
    { value: 'from-yellow-500 to-orange-500', label: 'Amarillo / Naranja' },
    { value: 'from-indigo-500 to-purple-500', label: 'Índigo / Violeta' },
  ];

  const resetForm = () => { setForm({ nombre: '', rol: '', descripcion: '', personalidad: '', capacidades: [], nivelAcceso: 'ADMINISTRACION', color: 'from-blue-500 to-cyan-500', activo: true }); setAgenteEditando(null); setMostrarFormulario(false); };

  const abrirEdicion = (agente) => { setAgenteEditando(agente.id); setForm({ nombre: agente.nombre, rol: agente.rol, descripcion: agente.descripcion, personalidad: agente.personalidad, capacidades: [...agente.capacidades], nivelAcceso: agente.nivelAcceso, color: agente.color, activo: agente.activo }); setMostrarFormulario(true); };

  const toggleCapacidad = (capId) => setForm(prev => ({ ...prev, capacidades: prev.capacidades.includes(capId) ? prev.capacidades.filter(c => c !== capId) : [...prev.capacidades, capId] }));

  const guardarAgente = () => {
    if (!form.nombre.trim() || !form.rol.trim()) { speak('Completá al menos el nombre y el rol'); return; }
    if (agenteEditando) {
      setAgentes(prev => prev.map(a => a.id === agenteEditando ? { ...a, ...form } : a));
    } else {
      setAgentes(prev => [...prev, { id: Date.now(), ...form, createdAt: new Date().toISOString().split('T')[0] }]);
    }
    speak(agenteEditando ? `Agente ${form.nombre} actualizado` : `Agente ${form.nombre} creado`);
    resetForm();
  };

  const toggleActivo = (id) => setAgentes(prev => prev.map(a => { if (a.id === id) { speak(`Agente ${a.nombre} ${!a.activo ? 'activado' : 'desactivado'}`); return { ...a, activo: !a.activo }; } return a; }));

  const eliminarAgente = (id) => { const a = agentes.find(x => x.id === id); if (window.confirm(`¿Eliminár "${a?.nombre}"?`)) { setAgentes(prev => prev.filter(x => x.id !== id)); speak(`Agente ${a?.nombre} eliminado`); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-100">Gestión de Agentes IA</h3>
          <p className="text-sm text-gray-400 mt-1">{agentes.filter(a => a.activo).length} activos · {agentes.length} total</p>
        </div>
        <button onClick={() => { resetForm(); setMostrarFormulario(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
          <Plus className="w-5 h-5" />Nuevo Agente
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-gray-900/80 rounded-xl border-2 border-purple-500/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" />{agenteEditando ? 'Editar Agente' : 'Crear Nuevo Agente'}</h4>
            <button onClick={resetForm} className="p-2 hover:bg-gray-800 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: MarketingBot" className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 placeholder-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Rol / Especialidad *</label>
              <input type="text" value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))} placeholder="Ej: Especialista en Marketing" className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 placeholder-gray-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="¿Qué hace este agente?" rows={2} className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 placeholder-gray-600 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Personalidad y tono</label>
            <textarea value={form.personalidad} onChange={e => setForm(p => ({ ...p, personalidad: e.target.value }))} placeholder="Ej: Formal y conciso. Responde con datos concretos." rows={2} className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500 placeholder-gray-600 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Capacidades</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CAPACIDADES_DISPONIBLES.map(cap => (
                <label key={cap.id} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${form.capacidades.includes(cap.id) ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                  <input type="checkbox" className="hidden" checked={form.capacidades.includes(cap.id)} onChange={() => toggleCapacidad(cap.id)} />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${form.capacidades.includes(cap.id) ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}>
                    {form.capacidades.includes(cap.id) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  {cap.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Nivel de acceso</label>
              <select value={form.nivelAcceso} onChange={e => setForm(p => ({ ...p, nivelAcceso: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500">
                <option value="ADMIN">Solo Admin</option>
                <option value="ADMINISTRACION">Admin + Administración</option>
                <option value="TECNICO">Todos los roles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Color</label>
              <select value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500">
                {colores.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={guardarAgente} className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">{agenteEditando ? 'Guardar Cambios' : 'Crear Agente'}</button>
            <button onClick={resetForm} className="px-6 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-all">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentes.map(agente => (
          <div key={agente.id} className={`bg-gray-900/50 rounded-xl border ${agente.activo ? 'border-gray-700/50' : 'border-gray-800/30 opacity-60'} p-5 space-y-3`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agente.color} flex items-center justify-center`}><Bot className="w-5 h-5 text-white" /></div>
                <div><h4 className="font-bold text-gray-100">{agente.nombre}</h4><p className="text-xs text-gray-500">{agente.rol}</p></div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${agente.activo ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>{agente.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{agente.descripcion}</p>
            <div className="flex flex-wrap gap-1">
              {agente.capacidades.slice(0,3).map(cap => { const c = CAPACIDADES_DISPONIBLES.find(x => x.id === cap); return c ? <span key={cap} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded text-xs border border-purple-500/20">{c.label}</span> : null; })}
              {agente.capacidades.length > 3 && <span className="px-2 py-0.5 bg-gray-700/50 text-gray-500 rounded text-xs">+{agente.capacidades.length - 3} más</span>}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
              <span className="text-xs text-gray-600">Acceso: {agente.nivelAcceso}</span>
              <div className="flex gap-1">
                <button onClick={() => abrirEdicion(agente)} className="p-1.5 hover:bg-gray-700 rounded-lg" title="Editar"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => toggleActivo(agente.id)} className={`p-1.5 rounded-lg ${agente.activo ? 'text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-500 hover:bg-green-500/10 hover:text-green-400'}`} title={agente.activo ? 'Desactivar' : 'Activar'}><Power className="w-4 h-4" /></button>
                <button onClick={() => eliminarAgente(agente.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gray-600" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard({ user, speak }) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
    { id: 'agentes', label: 'Agentes IA', icon: Bot },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-6 border-2 border-red-500/50">
        <div className="flex items-center justify-between">
          <div><h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Panel de Administración</h2><p className="text-gray-400 mt-1">Acceso Total - Nivel Dueño</p></div>
          <Shield className="w-12 h-12 text-red-400" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveModule(tab.id)} className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeModule === tab.id ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-2 border-red-500 text-red-300' : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600/50'}`}>
            <Icon className="w-4 h-4" />{tab.label}
          </button>
        ); })}
      </div>
      {activeModule === 'mapa' && <MapaClientes user={user} speak={speak} />}
      {activeModule === 'agentes' && <AgentesManager speak={speak} />}
      {activeModule === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-xl border border-blue-500/30"><TrendingUp className="w-8 h-8 text-blue-400 mb-3" /><p className="text-3xl font-bold text-gray-100">$452K</p><p className="text-sm text-gray-400">Facturación Mensual</p></div>
          <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-xl border border-green-500/30"><Users className="w-8 h-8 text-green-400 mb-3" /><p className="text-3xl font-bold text-gray-100">142</p><p className="text-sm text-gray-400">Clientes Activos</p></div>
          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl border border-purple-500/30"><Ticket className="w-8 h-8 text-purple-400 mb-3" /><p className="text-3xl font-bold text-gray-100">23</p><p className="text-sm text-gray-400">Órdenes Pendientes</p></div>
          <div className="p-6 bg-gradient-to-br from-orange-900/20 to-orange-800/20 rounded-xl border border-orange-500/30"><Package className="w-8 h-8 text-orange-400 mb-3" /><p className="text-3xl font-bold text-gray-100">8</p><p className="text-sm text-gray-400">Stock Bajo</p></div>
        </div>
      )}
      {activeModule === 'finanzas' && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Módulo de Finanzas</h3>
          <p className="text-gray-400">Vista completa de ingresos, egresos, márgenes y proyecciones.</p>
        </div>
      )}
      {activeModule === 'usuarios' && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Gestión de Usuarios</h3>
          <div className="space-y-3">
            {USERS_DB.map(u => (
              <div key={u.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-between">
                <div><p className="font-semibold text-gray-100">{u.name}</p><p className="text-sm text-gray-500">{u.email}</p></div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : u.role === 'ADMINISTRACION' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdministracionDashboard({ user, speak }) {
  const [activeModule, setActiveModule] = useState('clientes');
  const tabs = [{ id: 'clientes', label: 'Clientes', icon: Users }, { id: 'presupuestos', label: 'Presupuestos', icon: FileText }, { id: 'facturacion', label: 'Facturación', icon: DollarSign }, { id: 'agenda', label: 'Agenda', icon: Clock }];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border-2 border-blue-500/50">
        <div className="flex items-center justify-between">
          <div><h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Panel de Administración</h2><p className="text-gray-400 mt-1">Gestión Operativa</p></div>
          <Users className="w-12 h-12 text-blue-400" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveModule(tab.id)} className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeModule === tab.id ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-2 border-blue-500 text-blue-300' : 'bg-gray-800/30 border border-gray-700/50 text-gray-400 hover:border-gray-600/50'}`}>
            <Icon className="w-4 h-4" />{tab.label}
          </button>
        ); })}
      </div>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-gray-100 mb-4">{{ clientes: 'Gestión de Clientes', presupuestos: 'Presupuestos y Cotizaciones', facturacion: 'Facturación', agenda: 'Agenda de Instalaciones' }[activeModule]}</h3>
        <p className="text-gray-400">Módulo de {activeModule}</p>
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"><p className="text-sm text-yellow-400">⚠️ Permisos: Puede editar pero NO eliminar registros</p></div>
      </div>
    </div>
  );
}

function TecnicoDashboard({ user, speak }) {
  const ordenes = [
    { id: 1, cliente: 'Supermercado Don Pedro', direccion: 'Av. Corrientes 4532', hora: '09:00', tipo: 'Instalación CCTV', prioridad: 'Alta' },
    { id: 2, cliente: 'Residencia Martínez', direccion: 'Calle Falsa 123', hora: '14:00', tipo: 'Mantenimiento Alarma', prioridad: 'Media' }
  ];
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-6 border-2 border-green-500/50">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Mis Órdenes de Trabajo</h2><p className="text-gray-400 mt-1">Hoy: {new Date().toLocaleDateString('es-AR')}</p></div>
          <Navigation className="w-10 h-10 text-green-400" />
        </div>
      </div>
      {ordenes.map(orden => (
        <div key={orden.id} className="p-5 bg-gray-900/50 rounded-xl border-2 border-green-500/30 hover:border-green-400/50 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1"><h4 className="text-lg font-bold text-gray-100">{orden.cliente}</h4><p className="text-sm text-gray-400">{orden.direccion}</p></div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${orden.prioridad === 'Alta' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{orden.prioridad}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{orden.hora}</span>
            <span className="flex items-center gap-1"><Ticket className="w-4 h-4" />{orden.tipo}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-300 text-sm font-semibold">Ver Detalles</button>
            <button className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm font-semibold">Iniciar Trabajo</button>
          </div>
        </div>
      ))}
      <button onClick={() => speak('Abriendo formulario de reporte')} className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg">
        <Upload className="w-6 h-6 inline mr-2" />Subir Reporte de Instalación
      </button>
    </div>
  );
}

const CHAMI_RESPUESTAS = {
  ADMIN: [
    (t) => `Mirá, sobre "${t}"... lo analicé y te cuento. Tengo acceso a todas las áreas de INFRATEC así que puedo darte el panorama completo. ¿Querés que me enfoque en los números, en el equipo, o en la operación?`,
    (t) => `Buena pregunta. "${t}" toca varios módulos del negocio. ¿Qué aspecto te preocupa más ahora mismo?`,
    (t) => `Dale, te escucho. Con "${t}" podemos ir por varios caminos. Lo que veo en los datos sugiere que hay oportunidades que todavía no estamos aprovechando. ¿Te cuento?`,
    (t) => `Entendido. Sobre "${t}": puedo cruzar la info de finanzas, operaciones y clientes para darte una visión real. ¿Preferís un resumen o el detalle?`,
  ],
  ADMINISTRACION: [
    (t) => `Anotado. Para "${t}" puedo ayudarte con clientes, presupuestos y agenda. ¿Qué necesitás primero?`,
    (t) => `Perfecto. "${t}" — lo tengo claro. ¿Hay algún plazo o cliente que tenga prioridad?`,
    (t) => `Te entiendo. Sobre "${t}": esto pasa seguido en la gestión del día a día. ¿Lo organizamos juntos ahora?`,
  ],
  TECNICO: [
    (t) => `Dale. Para "${t}" te doy los specs técnicos y el procedimiento paso a paso. ¿Tenés el equipo a mano?`,
    (t) => `Entendido. "${t}" — esto lo resolvemos. ¿Estás en el campo ahora o planeando la instalación?`,
    (t) => `Claro. Sobre "${t}": el procedimiento estándar de INFRATEC para esto es directo. ¿Qué modelo de equipo tenés?`,
  ]
};

const SUGERENCIAS = {
  ADMIN: ['¿Cómo viene la facturación este mes?', '¿Qué clientes tienen contratos por vencer?', 'Analizá el rendimiento del equipo técnico', 'Estrategia para aumentar clientes B2B'],
  ADMINISTRACION: ['Necesito generar un presupuesto', '¿Qué instalaciones hay esta semana?', 'Buscá clientes con pagos pendientes', 'Coordiná una visita de mantenimiento'],
  TECNICO: ['Especificaciones para cámara Hikvision', '¿Cómo configuro una alarma Paradox?', 'Procedimiento de instalación de red', 'Reporte de trabajo completado'],
};

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-white" /></div>
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 flex items-center gap-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
      </div>
    </div>
  );
}

function ChamiAssistant({ user, speak }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [estado, setEstado] = useState('listo');
  const [interacciones, setInteracciones] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    const hora = new Date().getHours();
    const saludo = hora < 13 ? '¡Buenos días' : hora < 20 ? '¡Buenas tardes' : '¡Buenas noches';
    let bienvenida;
    if (user.role === 'ADMIN') bienvenida = `${saludo}, ${user.name.split(' ')[0]}! 👋 Soy Chami, tu agente de confianza en INFRATEC. Tengo acceso completo a todos los módulos — finanzas, operaciones, clientes, equipo. ¿Por dónde empezamos hoy?`;
    else if (user.role === 'ADMINISTRACION') bienvenida = `${saludo}! Soy Chami 😊 Estoy acá para ayudarte con la gestión del día. Clientes, presupuestos, agenda, facturación... ¿Qué tenés para hoy?`;
    else bienvenida = `${saludo}, ${user.name.split(' ')[0]}! Soy Chami, tu asistente técnico. Sé todo sobre los equipos y procedimientos de INFRATEC. ¿En qué instalación estás hoy?`;
    setMessages([{ role: 'assistant', content: bienvenida, ts: new Date().toISOString() }]);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const send = (text = input) => {
    if (!text.trim() || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: text, ts: new Date().toISOString() }]);
    setInput('');
    setIsTyping(true);
    setEstado('escribiendo');
    const respuestas = CHAMI_RESPUESTAS[user.role] || CHAMI_RESPUESTAS.TECNICO;
    const resp = respuestas[interacciones % respuestas.length](text);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: resp, ts: new Date().toISOString() }]);
      setIsTyping(false);
      setEstado('listo');
      setInteracciones(p => p + 1);
      speak(resp.slice(0, 120));
    }, 800 + Math.random() * 1200);
  };

  const estadoColor = { listo: 'bg-green-400', escribiendo: 'bg-blue-400 animate-pulse' };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 flex flex-col h-[680px]">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"><Brain className="w-6 h-6 text-white" /></div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${estadoColor[estado] || 'bg-green-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">Chami</h3>
            <p className={`text-xs font-medium ${estado === 'escribiendo' ? 'text-blue-400' : 'text-green-400'}`}>{estado === 'escribiendo' ? 'escribiendo...' : 'disponible'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : user.role === 'ADMINISTRACION' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{user.role}</span>
          <Heart className="w-5 h-5 text-pink-500" />
        </div>
      </div>

      {interacciones === 0 && (
        <div className="px-4 pt-3">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Sugerencias</p>
          <div className="flex gap-2 flex-wrap">
            {(SUGERENCIAS[user.role] || []).map((s, i) => (
              <button key={i} onClick={() => send(s)} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300 hover:bg-purple-500/20 transition-all">{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1"><Brain className="w-4 h-4 text-white" /></div>}
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-purple-500/10 border border-purple-500/30'}`}>
              <p className="text-sm leading-relaxed text-gray-200">{msg.content}</p>
              <p className="text-xs text-gray-600 mt-1">{new Date(msg.ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1"><UserCircle className="w-4 h-4 text-white" /></div>}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribí tu consulta..." className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50" />
          <button onClick={() => send()} disabled={!input.trim() || isTyping} className="px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const handleLogin = () => { const u = USERS_DB.find(u => u.email === email && u.password === password); if (u) onLogin(u); else setError('Credenciales incorrectas'); };
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900/50 rounded-2xl border border-gray-700/50 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Shield className="w-10 h-10 text-white" /></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">INFRATEC</h1>
          <p className="text-gray-500 mt-2">Sistema de Gestión Integral</p>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-gray-300 mb-2">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500/50" placeholder="usuario@infratec.com" /></div>
          <div><label className="block text-sm font-semibold text-gray-300 mb-2">Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500/50" placeholder="••••••••" /></div>
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
          <button onClick={handleLogin} className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg text-white font-bold hover:opacity-90 transition-all">Iniciar Sesión</button>
        </div>
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-xs text-gray-400 space-y-1">
          <p className="text-gray-500 text-center mb-1">Usuarios de prueba:</p>
          <p>Admin: admin@infratec.com / admin123</p>
          <p>Oficina: oficina@infratec.com / oficina123</p>
          <p>Técnico: tecnico@infratec.com / tecnico123</p>
        </div>
      </div>
    </div>
  );
}

export default function InfratecCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const speak = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-AR';
      window.speechSynthesis.speak(u);
    }
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  const menuItems = currentUser.role === 'ADMIN'
    ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'chami', label: 'Chami AI', icon: Bot }]
    : currentUser.role === 'ADMINISTRACION'
    ? [{ id: 'dashboard', label: 'Gestión', icon: Users }, { id: 'chami', label: 'Asistente', icon: Bot }]
    : [{ id: 'dashboard', label: 'Mis Órdenes', icon: Ticket }, { id: 'chami', label: 'Ayuda', icon: Bot }];

  const roleGradient = currentUser.role === 'ADMIN' ? 'from-red-500 to-orange-500' : currentUser.role === 'ADMINISTRACION' ? 'from-blue-500 to-cyan-500' : 'from-green-500 to-emerald-500';
  const activeStyle = currentUser.role === 'ADMIN' ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400' : currentUser.role === 'ADMINISTRACION' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400' : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400';

  return (
    <AuthContext.Provider value={{ user: currentUser, permissions: PERMISSIONS[currentUser.role], speak }}>
      <div className="min-h-screen bg-[#0a0e1a] text-gray-100">
        <aside className={`fixed left-0 top-0 h-full bg-[#0d1220] border-r border-gray-800/50 z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-800/50 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleGradient} flex items-center justify-center font-bold text-lg`}>IT</div>
              {sidebarOpen && <div><h1 className="text-xl font-bold text-gray-100">INFRATEC</h1><p className="text-xs text-gray-500">{currentUser.role}</p></div>}
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map(item => { const Icon = item.icon; return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id ? activeStyle : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}>
                  <Icon className="w-5 h-5" />{sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ); })}
            </nav>
            <div className="p-4 border-t border-gray-800/50">
              <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut className="w-5 h-5" />{sidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
              </button>
            </div>
          </div>
        </aside>

        <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <header className="sticky top-0 z-40 bg-[#0d1220]/80 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-800/50"><Menu className="w-5 h-5" /></button>
            <div><h2 className="text-xl font-bold text-gray-100">{currentUser.name}</h2><p className="text-xs text-gray-500">{currentUser.email}</p></div>
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
