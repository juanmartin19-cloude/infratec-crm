import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, Ticket, Bot, CheckCircle, Clock, DollarSign, Menu, X, FileText, Brain, Send, Trash2, Map, Home, LogOut, Shield, Plus, Edit2, Power, Sparkles, Volume2, Settings, Palette, Activity, AlertTriangle, Navigation, Package } from 'lucide-react';

const TEMAS = {
  cian:    { id:'cian',    nombre:'🔵 Cian Neon',    p:'#00d4ff', s:'#004488', bg:'#050810', panel:'rgba(0,212,255,0.06)',   border:'rgba(0,212,255,0.3)',   glow:'0 0 25px rgba(0,212,255,0.5)'    },
  violeta: { id:'violeta', nombre:'🟣 Violeta',      p:'#c060ff', s:'#6600cc', bg:'#080510', panel:'rgba(192,96,255,0.06)',  border:'rgba(192,96,255,0.3)',  glow:'0 0 25px rgba(192,96,255,0.5)'   },
  verde:   { id:'verde',   nombre:'🟢 Verde Matrix', p:'#00ff88', s:'#008844', bg:'#050a06', panel:'rgba(0,255,136,0.06)',   border:'rgba(0,255,136,0.3)',   glow:'0 0 25px rgba(0,255,136,0.5)'    },
  rojo:    { id:'rojo',    nombre:'🔴 Rojo Fuego',   p:'#ff4060', s:'#990020', bg:'#0a0505', panel:'rgba(255,64,96,0.06)',   border:'rgba(255,64,96,0.3)',   glow:'0 0 25px rgba(255,64,96,0.5)'    },
  dorado:  { id:'dorado',  nombre:'🟡 Dorado',       p:'#ffd700', s:'#886600', bg:'#080700', panel:'rgba(255,215,0,0.06)',   border:'rgba(255,215,0,0.3)',   glow:'0 0 25px rgba(255,215,0,0.5)'    },
};

const USERS_DB = [
  { id:1, email:'admin@infratec.com',   password:'admin123',   name:'Dueño INFRATEC', role:'ADMIN' },
  { id:2, email:'oficina@infratec.com', password:'oficina123', name:'Administración',  role:'ADMINISTRACION' },
  { id:3, email:'tecnico@infratec.com', password:'tecnico123', name:'Juan Pérez',      role:'TECNICO' },
];

const TICKETS_INIT = [
  { id:1, titulo:'Cámara sin señal - Supermercado Don Pedro',      cliente:'Supermercado Don Pedro',   tipo:'CCTV',   prioridad:'Alta',  estado:'Abierto',     tecnico:'Juan Pérez',   fecha:'2026-05-14', desc:'La cámara del sector caja no transmite desde las 08:00.' },
  { id:2, titulo:'Alarma disparando sin motivo - Residencia Martínez', cliente:'Residencia Martínez', tipo:'Alarma', prioridad:'Media', estado:'En Progreso',  tecnico:'Carlos López', fecha:'2026-05-13', desc:'La alarma perimetral se activa sola de noche.' },
  { id:3, titulo:'Instalación red cat6 - TechCorp',                cliente:'Oficinas TechCorp',        tipo:'Redes',  prioridad:'Baja',  estado:'Pendiente',    tecnico:'',             fecha:'2026-05-12', desc:'Red cat6 para 20 puestos de trabajo.' },
  { id:4, titulo:'Mantenimiento CCTV - Fábrica Metalúrgica',       cliente:'Fábrica Metalúrgica S.A.', tipo:'CCTV',   prioridad:'Media', estado:'Resuelto',     tecnico:'Juan Pérez',   fecha:'2026-05-10', desc:'Mantenimiento preventivo de 32 cámaras.' },
];

const AGENTES_INIT = [
  { id:1, nombre:'Chami',   rol:'Asistente General', desc:'Agente principal con acceso completo a INFRATEC.', activo:true,  color:'#c060ff', nivel:'ADMIN' },
  { id:2, nombre:'TechBot', rol:'Soporte Técnico',   desc:'Especialista en instalaciones y equipos.',         activo:true,  color:'#00ff88', nivel:'TECNICO' },
  { id:3, nombre:'SalesAI', rol:'Ventas',             desc:'Agente de presupuestos y captación de leads.',     activo:false, color:'#00d4ff', nivel:'ADMINISTRACION' },
];

const ESTADO_COLOR = {
  'Abierto':     { bg:'rgba(255,64,96,0.15)',   text:'#ff4060', border:'rgba(255,64,96,0.5)'   },
  'En Progreso': { bg:'rgba(255,165,0,0.15)',   text:'#ffa500', border:'rgba(255,165,0,0.5)'   },
  'Pendiente':   { bg:'rgba(192,96,255,0.15)',  text:'#c060ff', border:'rgba(192,96,255,0.5)'  },
  'Resuelto':    { bg:'rgba(0,255,136,0.15)',   text:'#00ff88', border:'rgba(0,255,136,0.5)'   },
  'Cerrado':     { bg:'rgba(128,128,128,0.15)', text:'#808080', border:'rgba(128,128,128,0.5)' },
};

const RESPUESTAS = {
  ADMIN: [
    t => `Mirá, sobre "${t}"... lo analicé. Tengo acceso a todas las áreas. ¿Te enfoco en números, equipo u operación?`,
    t => `Buena pregunta. "${t}" toca varios módulos. ¿Qué te preocupa más ahora?`,
    t => `Dale. Con "${t}" hay oportunidades sin aprovechar. ¿Te cuento cómo las veo?`,
    t => `Entendido. Puedo cruzar datos de finanzas, operaciones y clientes. ¿Resumen o detalle?`,
  ],
  ADMINISTRACION: [
    t => `Anotado. Para "${t}" coordino clientes, presupuestos y agenda. ¿Qué primero?`,
    t => `Perfecto. "${t}" — ¿hay algún plazo o cliente prioritario?`,
    t => `Te entiendo. Sobre "${t}": ¿lo organizamos juntos ahora?`,
  ],
  TECNICO: [
    t => `Dale. Para "${t}" te doy los specs y el procedimiento paso a paso.`,
    t => `Entendido. "${t}" — ¿estás en campo o planeando la visita?`,
    t => `Claro. Para "${t}" ¿qué modelo de equipo tenés?`,
  ],
};

const SUGERENCIAS = {
  ADMIN:          ['¿Cómo viene la facturación?', '¿Contratos por vencer?', 'Rendimiento del equipo técnico', 'Estrategia para más clientes B2B'],
  ADMINISTRACION: ['Generar presupuesto nuevo', 'Instalaciones esta semana', 'Clientes con pagos pendientes', 'Coordinar visita de mantenimiento'],
  TECNICO:        ['Especificaciones Hikvision DS-2CD', 'Cómo configurar alarma Paradox', 'Procedimiento cableado red cat6', 'Formulario reporte de trabajo'],
};

// ══════════════════════════════════════════════
// ESFERA DE VOZ
// ══════════════════════════════════════════════
function EsferaVoz({ hablando, tema }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex items-center justify-center" style={{ width:180, height:180 }}>
        {[110, 132, 155, 178].map((sz, i) => (
          <div key={i} className={`absolute rounded-full ${hablando ? 'animate-ping' : ''}`}
            style={{ width:sz, height:sz, border:`1px solid ${tema.p}`, opacity: hablando ? Math.max(0.05, 0.35/(i+1)) : 0.08 + i*0.02, animationDelay:`${i*0.22}s`, animationDuration:'1.8s' }} />
        ))}
        {[95, 112].map((sz, i) => (
          <div key={`r${i}`} className="absolute rounded-full" style={{ width:sz, height:sz, border:`1px solid ${tema.p}`, opacity:0.18 }} />
        ))}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center relative ${hablando ? 'animate-pulse' : ''}`}
          style={{ background:`radial-gradient(circle at 33% 28%, ${tema.s}cc, #00000099)`, boxShadow:`${tema.glow}, inset 0 0 30px ${tema.p}22`, border:`2px solid ${tema.p}` }}>
          <Brain className="w-10 h-10" style={{ color:tema.p }} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-black tracking-widest uppercase" style={{ color:tema.p }}>
          {hablando ? '◉  HABLANDO' : '◎  CHAMI AI'}
        </p>
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_,i) => (
            <div key={i} className={`rounded-full ${hablando ? 'animate-bounce' : ''}`}
              style={{ width:4, height: hablando ? 8+i*4 : 6, background:tema.p, opacity:0.6+i*0.08, animationDelay:`${i*0.1}s` }} />
          ))}
          {[...Array(5)].map((_,i) => (
            <div key={`r${i}`} className={`rounded-full ${hablando ? 'animate-bounce' : ''}`}
              style={{ width:4, height: hablando ? 20-i*4 : 6, background:tema.p, opacity:0.6+(4-i)*0.08, animationDelay:`${(5+i)*0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TYPING DOTS
// ══════════════════════════════════════════════
function TypingDots({ tema }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background:`radial-gradient(circle, ${tema.s}, #000)`, border:`1px solid ${tema.p}` }}>
        <Brain className="w-4 h-4" style={{ color:tema.p }} />
      </div>
      <div className="rounded-xl px-4 py-3 flex items-center gap-1.5" style={{ background:tema.panel, border:`1px solid ${tema.border}` }}>
        {[0,150,300].map(d => <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background:tema.p, animationDelay:`${d}ms` }} />)}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// TICKETERA
// ══════════════════════════════════════════════
function Ticketera({ user, speak, tema }) {
  const [tickets, setTickets] = useState(TICKETS_INIT);
  const [filtro, setFiltro] = useState('Todos');
  const [detalle, setDetalle] = useState(null);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ titulo:'', cliente:'', tipo:'CCTV', prioridad:'Media', tecnico:'', desc:'' });

  const estados = ['Todos','Abierto','En Progreso','Pendiente','Resuelto','Cerrado'];
  const filtrados = filtro === 'Todos' ? tickets : tickets.filter(t => t.estado === filtro);

  const crearTicket = () => {
    if (!form.titulo || !form.cliente) { speak('Completá título y cliente'); return; }
    setTickets(prev => [{ id:Date.now(), ...form, estado:'Abierto', fecha:new Date().toISOString().split('T')[0] }, ...prev]);
    speak(`Ticket creado: ${form.titulo}`);
    setForm({ titulo:'', cliente:'', tipo:'CCTV', prioridad:'Media', tecnico:'', desc:'' });
    setCreando(false);
  };

  const cambiarEstado = (id, est) => {
    setTickets(prev => prev.map(t => t.id===id ? {...t, estado:est} : t));
    setDetalle(prev => prev ? {...prev, estado:est} : null);
    speak(`Ticket actualizado a ${est}`);
  };

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar este ticket?')) return;
    setTickets(prev => prev.filter(t => t.id!==id));
    setDetalle(null);
  };

  const ps = { background:tema.panel, border:`1px solid ${tema.border}` };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {['Abierto','En Progreso','Pendiente','Resuelto','Cerrado'].map(e => {
          const ec = ESTADO_COLOR[e];
          return (
            <div key={e} onClick={() => setFiltro(e)} className="rounded-xl p-3 text-center cursor-pointer transition-all hover:scale-105" style={{ background:ec.bg, border:`1px solid ${ec.border}` }}>
              <p className="text-2xl font-black" style={{ color:ec.text }}>{tickets.filter(t=>t.estado===e).length}</p>
              <p className="text-xs mt-0.5 font-semibold" style={{ color:ec.text }}>{e}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
