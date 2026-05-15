import { useState, useRef, useEffect } from 'react';
import { Brain, MessageSquare, Ticket, Settings, Zap, Shield,
         Activity, LogOut, Plus, Trash2, Edit2, CheckCircle,
         Clock, X, Send, BarChart3, ChevronRight } from 'lucide-react';

const TEMAS = {
  cian:    { id:'cian',    nombre:'🔵 Cian Neon',    p:'#00d4ff', s:'#004488', bg:'#050810', panel:'rgba(0,212,255,0.07)',  border:'rgba(0,212,255,0.3)',  glow:'0 0 25px rgba(0,212,255,0.5)'  },
  violeta: { id:'violeta', nombre:'🟣 Violeta',      p:'#c060ff', s:'#440088', bg:'#080510', panel:'rgba(192,96,255,0.07)', border:'rgba(192,96,255,0.3)', glow:'0 0 25px rgba(192,96,255,0.5)' },
  verde:   { id:'verde',   nombre:'🟢 Verde Matrix', p:'#00ff88', s:'#004422', bg:'#040a06', panel:'rgba(0,255,136,0.07)',  border:'rgba(0,255,136,0.3)',  glow:'0 0 25px rgba(0,255,136,0.5)'  },
  rojo:    { id:'rojo',    nombre:'🔴 Rojo Fuego',   p:'#ff4060', s:'#880022', bg:'#0a0405', panel:'rgba(255,64,96,0.07)',  border:'rgba(255,64,96,0.3)',  glow:'0 0 25px rgba(255,64,96,0.5)'  },
  dorado:  { id:'dorado',  nombre:'🟡 Dorado',       p:'#ffd700', s:'#664400', bg:'#090700', panel:'rgba(255,215,0,0.07)',  border:'rgba(255,215,0,0.3)',  glow:'0 0 25px rgba(255,215,0,0.5)'  },
};

const USERS_DB = [
  { id:1, user:'admin',    pass:'admin123', rol:'ADMIN',          nombre:'Juan Martín' },
  { id:2, user:'oficina',  pass:'ofic456',  rol:'ADMINISTRACION', nombre:'María García' },
  { id:3, user:'tecnico1', pass:'tec789',   rol:'TECNICO',        nombre:'Carlos López' },
];

const TICKETS_INIT = [
  { id:1, titulo:'Cámara sin señal - Palermo',  cliente:'Supermercado Norte', estado:'Pendiente', prioridad:'Alta',  tecnico:'Carlos López', fecha:'2026-05-10', desc:'Cámara IP exterior sin imagen.' },
  { id:2, titulo:'Alarma activada en falso',    cliente:'Farmacia Central',   estado:'En curso',  prioridad:'Media', tecnico:'Carlos López', fecha:'2026-05-12', desc:'Sensor de movimiento mal calibrado.' },
  { id:3, titulo:'Instalación red WiFi',        cliente:'Oficina Belgrano',   estado:'Resuelto',  prioridad:'Baja',  tecnico:'Carlos López', fecha:'2026-05-08', desc:'Router instalado y configurado.' },
];

const AGENTES_INIT = [
  { id:1, nombre:'Chami',   rol:'Asistente General', estado:'activo', personalidad:'amigable',   voz:'es-AR' },
  { id:2, nombre:'TechBot', rol:'Soporte Técnico',   estado:'activo', personalidad:'preciso',    voz:'es-ES' },
  { id:3, nombre:'SalesAI', rol:'Ventas',            estado:'pausa',  personalidad:'persuasivo', voz:'es-MX' },
];

const ESTADO_COLOR = { 'Pendiente':'#ffaa00', 'En curso':'#00aaff', 'Resuelto':'#00ff88', 'Cancelado':'#ff4444' };

const RESPUESTAS = [
  (u)=>`¡Hola ${u}! Soy Chami 🤖. ¿En qué te puedo ayudar hoy?`,
  ()=>'Revisando el sistema... todo funcionando al 100% ✅',
  ()=>'¿Necesitás que genere un reporte de actividad técnica?',
  (u)=>`${u}, hay tickets de alta prioridad pendientes. ¿Los revisamos?`,
  ()=>'Los sistemas de seguridad están operativos. Sin alertas activas 🟢',
  ()=>'¿Querés que programe un mantenimiento preventivo para esta semana?',
  ()=>'Encontré 3 cámaras que no enviaron señal en las últimas 24hs. Te mando el detalle.',
  ()=>'Procesando tu solicitud... dame un segundo 🔄',
  ()=>'¡Perfecto! Eso lo puedo gestionar desde acá mismo.',
];

const SUGERENCIAS = {
  ADMIN:          ['Ver tickets pendientes', 'Estado del sistema', 'Reporte semanal', 'Gestionar agentes'],
  ADMINISTRACION: ['Tickets abiertos', 'Clientes activos', 'Nuevo ticket', 'Facturación pendiente'],
  TECNICO:        ['Mis órdenes del día', 'Ticket más urgente', 'Cómo cerrar un ticket', 'Materiales disponibles'],
};

function gridBg(t) {
  return {
    backgroundImage: `repeating-linear-gradient(${t.border} 0 1px,transparent 1px 100%),repeating-linear-gradient(90deg,${t.border} 0 1px,transparent 1px 100%)`,
    backgroundSize: '40px 40px',
  };
}

function EsferaVoz({ hablando, tema }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {[196, 160, 124, 88].map((sz, i) => (
          <div key={i} className={`absolute rounded-full ${hablando ? 'animate-ping' : ''}`}
            style={{
              width: sz, height: sz,
              border: `1px solid ${tema.p}`,
              opacity: hablando ? 0.08 + i * 0.06 : 0.04 + i * 0.03,
              animationDelay: `${i * 0.25}s`,
              animationDuration: '2s',
              transition: 'opacity 0.5s',
            }} />
        ))}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${hablando ? 'animate-pulse' : ''}`}
          style={{
            background: `radial-gradient(circle at 33% 28%, ${tema.s}cc, #00000099)`,
            boxShadow: `${tema.glow}, inset 0 0 40px ${tema.s}66`,
            border: `2px solid ${tema.p}`,
            transition: 'all 0.3s',
          }}>
          <Brain className="w-11 h-11" style={{ color: tema.p, filter: `drop-shadow(0 0 8px ${tema.p})` }} />
        </div>
      </div>
      <div className="text-xs font-mono tracking-widest" style={{ color: tema.p, opacity: 0.7 }}>
        {hablando ? '◉ HABLANDO...' : '● EN ESPERA'}
      </div>
    </div>
  );
}

function TypingDots({ tema }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
          style={{ background: tema.p, animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function Ticketera({ tema, rol }) {
  const [tickets, setTickets] = useState(TICKETS_INIT);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ titulo: '', cliente: '', estado: 'Pendiente', prioridad: 'Media', tecnico: '', desc: '' });
  const [filtro, setFiltro] = useState('Todos');

  const filtrados = filtro === 'Todos' ? tickets : tickets.filter(t => t.estado === filtro);

  function abrirNuevo() {
    setForm({ titulo: '', cliente: '', estado: 'Pendiente', prioridad: 'Media', tecnico: '', desc: '' });
    setModal('nuevo');
  }
  function abrirEditar(t) { setForm({ ...t }); setModal('editar'); }
  function guardar() {
    if (!form.titulo.trim()) return;
    if (modal === 'nuevo') setTickets(p => [...p, { ...form, id: Date.now(), fecha: new Date().toISOString().slice(0, 10) }]);
    else setTickets(p => p.map(t => t.id === form.id ? { ...form } : t));
    setModal(null);
  }
  function eliminar(id) { setTickets(p => p.filter(t => t.id !== id)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-mono" style={{ color: tema.p }}>🎫 TICKETERA</h2>
        {rol !== 'TECNICO' && (
          <button onClick={abrirNuevo} className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
            style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
            <Plus className="w-4 h-4" /> Nuevo Ticket
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['Todos', 'Pendiente', 'En curso', 'Resuelto', 'Cancelado'].map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            className="px-3 py-1 rounded-full text-sm font-mono transition-all"
            style={{
              background: filtro === e ? tema.p : 'transparent',
              color: filtro === e ? '#000' : tema.p,
              border: `1px solid ${tema.border}`,
              boxShadow: filtro === e ? tema.glow : 'none',
            }}>
            {e}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtrados.map(t => (
          <div key={t.id} className="rounded-2xl p-4 flex items-start justify-between gap-3"
            style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ESTADO_COLOR[t.estado] || '#888' }} />
                <span className="font-semibold truncate" style={{ color: tema.p }}>{t.titulo}</span>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: (ESTADO_COLOR[t.estado] || '#888') + '33', color: ESTADO_COLOR[t.estado] || '#888' }}>
                  {t.estado}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: tema.panel, border: `1px solid ${tema.border}`, color: '#aaa' }}>
                  {t.prioridad}
                </span>
              </div>
              <div className="text-sm opacity-60 mb-1">{t.cliente} · {t.fecha}</div>
              <div className="text-sm opacity-70">{t.desc}</div>
              {t.tecnico && <div className="text-xs mt-1 opacity-40">Técnico: {t.tecnico}</div>}
            </div>
            {rol !== 'TECNICO' && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => abrirEditar(t)} className="p-2 rounded-xl transition-all"
                  style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
                  <Edit2 className="w-4 h-4" style={{ color: tema.p }} />
                </button>
                {rol === 'ADMIN' && (
                  <button onClick={() => eliminar(t.id)} className="p-2 rounded-xl"
                    style={{ background: 'rgba(255,64,64,0.1)', border: '1px solid rgba(255,64,64,0.3)' }}>
                    <Trash2 className="w-4 h-4" style={{ color: '#ff4444' }} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="text-center py-12 opacity-40 font-mono" style={{ color: tema.p }}>
            — SIN TICKETS EN ESTA CATEGORÍA —
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: '#08111e', border: `1px solid ${tema.border}`, boxShadow: tema.glow }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg font-mono" style={{ color: tema.p }}>
                {modal === 'nuevo' ? '+ NUEVO TICKET' : '✏ EDITAR TICKET'}
              </h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5" style={{ color: tema.p }} /></button>
            </div>
            <div className="space-y-3">
              {[['titulo', 'Título del ticket'], ['cliente', 'Cliente'], ['tecnico', 'Técnico asignado']].map(([k, l]) => (
                <input key={k} placeholder={l} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                  style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
              ))}
              {[['estado', ['Pendiente', 'En curso', 'Resuelto', 'Cancelado']], ['prioridad', ['Alta', 'Media', 'Baja']]].map(([k, ops]) => (
                <select key={k} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl outline-none capitalize"
                  style={{ border: `1px solid ${tema.border}`, background: '#08111e', color: '#fff' }}>
                  {ops.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <textarea placeholder="Descripción" value={form.desc || ''} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                rows={3} className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none resize-none"
                style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
            </div>
            <button onClick={guardar} className="mt-5 w-full py-3 rounded-xl font-bold text-lg transition-all"
              style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
              GUARDAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Configuracion({ tema, setTemaId, voces, vozSeleccionada, setVozSeleccionada }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-mono" style={{ color: tema.p }}>⚙️ CONFIGURACIÓN</h2>
      <div className="rounded-2xl p-5" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
        <h3 className="font-semibold mb-4 font-mono text-sm" style={{ color: tema.p }}>🎨 TEMA DE COLOR</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.values(TEMAS).map(t => (
            <button key={t.id} onClick={() => setTemaId(t.id)}
              className="px-3 py-3 rounded-xl font-mono text-sm transition-all"
              style={{
                border: `2px solid ${t.id === tema.id ? t.p : t.border}`,
                background: t.id === tema.id ? t.panel : 'transparent',
                color: t.p,
                boxShadow: t.id === tema.id ? t.glow : 'none',
              }}>
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      {voces.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
          <h3 className="font-semibold mb-4 font-mono text-sm" style={{ color: tema.p }}>🗣️ VOZ DE CHAMI</h3>
          <select value={vozSeleccionada} onChange={e => setVozSeleccionada(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none"
            style={{ border: `1px solid ${tema.border}`, background: '#08111e', color: '#fff' }}>
            {voces.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
          <p className="text-xs mt-2 opacity-40" style={{ color: tema.p }}>
            La voz se activa cuando Chami responde. Probala enviando un mensaje.
          </p>
        </div>
      )}

      <div className="rounded-2xl p-5" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
        <h3 className="font-semibold mb-3 font-mono text-sm" style={{ color: tema.p }}>ℹ️ INFO DEL SISTEMA</h3>
        <div className="space-y-2 text-sm opacity-60">
          <div>Versión: <span style={{ color: tema.p }}>2.0.0 Futuristic</span></div>
          <div>Stack: <span style={{ color: tema.p }}>Next.js 14 + React 18</span></div>
          <div>Deploy: <span style={{ color: tema.p }}>Vercel</span></div>
        </div>
      </div>
    </div>
  );
}

function AgentesManager({ tema }) {
  const [agentes, setAgentes] = useState(AGENTES_INIT);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', rol: '', personalidad: 'amigable', estado: 'activo' });

  function guardar() {
    if (!form.nombre.trim()) return;
    setAgentes(p => [...p, { ...form, id: Date.now() }]);
    setModal(false);
    setForm({ nombre: '', rol: '', personalidad: 'amigable', estado: 'activo' });
  }
  function toggleEstado(id) {
    setAgentes(p => p.map(a => a.id === id ? { ...a, estado: a.estado === 'activo' ? 'pausa' : 'activo' } : a));
  }
  function eliminar(id) { setAgentes(p => p.filter(a => a.id !== id)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-mono" style={{ color: tema.p }}>🤖 AGENTES IA</h2>
        <button onClick={() => setModal(true)} className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
          <Plus className="w-4 h-4" /> Nuevo Agente
        </button>
      </div>
      <div className="space-y-3">
        {agentes.map(a => (
          <div key={a.id} className="rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle, ${tema.s}, #000)`,
                  border: `1px solid ${tema.p}`,
                  boxShadow: a.estado === 'activo' ? tema.glow : 'none',
                }}>
                <Brain className="w-5 h-5" style={{ color: tema.p }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: tema.p }}>{a.nombre}</div>
                <div className="text-xs opacity-50">{a.rol} · {a.personalidad}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-mono"
                style={{
                  background: a.estado === 'activo' ? 'rgba(0,255,136,0.12)' : 'rgba(255,170,0,0.12)',
                  color: a.estado === 'activo' ? '#00ff88' : '#ffaa00',
                  border: `1px solid ${a.estado === 'activo' ? 'rgba(0,255,136,0.3)' : 'rgba(255,170,0,0.3)'}`,
                }}>
                {a.estado === 'activo' ? '● ACTIVO' : '⏸ PAUSA'}
              </span>
              <button onClick={() => toggleEstado(a.id)} className="p-2 rounded-xl"
                style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
                <Zap className="w-4 h-4" style={{ color: tema.p }} />
              </button>
              <button onClick={() => eliminar(a.id)} className="p-2 rounded-xl"
                style={{ background: 'rgba(255,64,64,0.1)', border: '1px solid rgba(255,64,64,0.3)' }}>
                <Trash2 className="w-4 h-4" style={{ color: '#ff4444' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: '#08111e', border: `1px solid ${tema.border}`, boxShadow: tema.glow }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg font-mono" style={{ color: tema.p }}>+ NUEVO AGENTE</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5" style={{ color: tema.p }} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nombre del agente" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
              <input placeholder="Rol (ej: Soporte Técnico)" value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
              <select value={form.personalidad} onChange={e => setForm(p => ({ ...p, personalidad: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl outline-none"
                style={{ border: `1px solid ${tema.border}`, background: '#08111e', color: '#fff' }}>
                {['amigable', 'preciso', 'persuasivo', 'formal', 'informal'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={guardar} className="mt-5 w-full py-3 rounded-xl font-bold text-lg"
              style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
              CREAR AGENTE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChamiAssistant({ tema, usuario, rol, speak, hablando }) {
  const [msgs, setMsgs] = useState([
    { id: 0, de: 'chami', texto: `¡Hola ${usuario}! Soy Chami, tu asistente IA de INFRATEC 🤖. ¿En qué te puedo ayudar?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [vista, setVista] = useState('chat');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  function enviar(texto) {
    const t = (texto || input).trim();
    if (!t) return;
    setInput('');
    setMsgs(p => [...p, { id: Date.now(), de: 'user', texto: t }]);
    setTyping(true);
    setTimeout(() => {
      const resp = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)](usuario, t);
      setTyping(false);
      setMsgs(p => [...p, { id: Date.now() + 1, de: 'chami', texto: resp }]);
      speak(resp);
    }, 1000 + Math.random() * 1000);
  }

  const sugs = SUGERENCIAS[rol] || [];

  return (
    <div className="flex flex-col" style={{ minHeight: '75vh' }}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold font-mono" style={{ color: tema.p }}>🤖 CHAMI ASSISTANT</h2>
        <div className="flex gap-2 ml-auto">
          {[['chat', '💬 Chat'], ['esfera', '🔮 Esfera']].map(([v, l]) => (
            <button key={v} onClick={() => setVista(v)}
              className="px-3 py-1.5 rounded-xl text-sm font-mono transition-all"
              style={{
                background: vista === v ? tema.p : 'transparent',
                color: vista === v ? '#000' : tema.p,
                border: `1px solid ${tema.border}`,
                boxShadow: vista === v ? tema.glow : 'none',
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {vista === 'esfera' ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-8 py-8">
          <EsferaVoz hablando={hablando} tema={tema} />
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {sugs.map(s => (
              <button key={s} onClick={() => { enviar(s); setVista('chat'); }}
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{ background: tema.panel, border: `1px solid ${tema.border}`, color: tema.p }}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 w-full max-w-md">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="Escribí tu consulta..." className="flex-1 px-4 py-3 rounded-xl bg-transparent outline-none"
              style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
            <button onClick={() => enviar()} className="px-4 py-3 rounded-xl"
              style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4" style={{ maxHeight: '52vh' }}>
            {msgs.map(m => (
              <div key={m.id} className={`flex ${m.de === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {m.de === 'chami' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `radial-gradient(circle, ${tema.s}, #000)`, border: `1px solid ${tema.p}` }}>
                    <Brain className="w-4 h-4" style={{ color: tema.p }} />
                  </div>
                )}
                <div className="max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: m.de === 'user' ? tema.p + '22' : tema.panel,
                    border: `1px solid ${m.de === 'user' ? tema.p + '66' : tema.border}`,
                    color: '#fff',
                  }}>
                  {m.texto}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: `radial-gradient(circle, ${tema.s}, #000)`, border: `1px solid ${tema.p}` }}>
                  <Brain className="w-4 h-4" style={{ color: tema.p }} />
                </div>
                <TypingDots tema={tema} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {sugs.map(s => (
              <button key={s} onClick={() => enviar(s)}
                className="px-3 py-1 rounded-full text-xs transition-all"
                style={{ background: tema.panel, border: `1px solid ${tema.border}`, color: tema.p }}>
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="Escribile a Chami..." className="flex-1 px-4 py-3 rounded-xl bg-transparent outline-none"
              style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
            <button onClick={() => enviar()} className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
              style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Dashboard({ tema }) {
  const stats = [
    { label: 'Total Tickets', valor: TICKETS_INIT.length, color: tema.p },
    { label: 'Pendientes', valor: TICKETS_INIT.filter(t => t.estado === 'Pendiente').length, color: '#ffaa00' },
    { label: 'En Curso', valor: TICKETS_INIT.filter(t => t.estado === 'En curso').length, color: '#00aaff' },
    { label: 'Resueltos', valor: TICKETS_INIT.filter(t => t.estado === 'Resuelto').length, color: '#00ff88' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-mono" style={{ color: tema.p }}>📊 DASHBOARD</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex flex-col items-center text-center"
            style={{ background: tema.panel, border: `1px solid ${tema.border}`, boxShadow: `0 0 20px ${s.color}18` }}>
            <div className="text-4xl font-bold font-mono mb-1" style={{ color: s.color, textShadow: `0 0 15px ${s.color}88` }}>
              {s.valor}
            </div>
            <div className="text-xs opacity-50">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
        <h3 className="font-semibold mb-4 font-mono text-sm" style={{ color: tema.p }}>📋 TICKETS RECIENTES</h3>
        <div className="space-y-3">
          {TICKETS_INIT.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: tema.border + '44' }}>
              <div>
                <div className="text-sm font-medium text-white">{t.titulo}</div>
                <div className="text-xs opacity-40">{t.cliente} · {t.fecha}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0"
                style={{ background: (ESTADO_COLOR[t.estado] || '#888') + '22', color: ESTADO_COLOR[t.estado] || '#888' }}>
                {t.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: tema.panel, border: `1px solid ${tema.border}` }}>
        <h3 className="font-semibold mb-4 font-mono text-sm" style={{ color: tema.p }}>⚡ ESTADO DEL SISTEMA</h3>
        {[['Cámaras online', 87], ['Alarmas activas', 94], ['Red estable', 100], ['Backups al día', 72]].map(([l, v]) => (
          <div key={l} className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: '#aaa' }}>{l}</span>
              <span className="font-mono" style={{ color: tema.p }}>{v}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: tema.border + '55' }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${v}%`, background: tema.p, boxShadow: tema.glow }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login({ onLogin, tema }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  function handleLogin() {
    const found = USERS_DB.find(u => u.user === user.trim() && u.pass === pass);
    if (found) onLogin(found);
    else setErr('Usuario o contraseña incorrectos');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: tema.bg, ...gridBg(tema) }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 40%, ${tema.s}55 0%, transparent 65%)` }} />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex w-24 h-24 rounded-full items-center justify-center mb-5"
            style={{
              background: `radial-gradient(circle at 33% 28%, ${tema.s}cc, #00000099)`,
              border: `2px solid ${tema.p}`,
              boxShadow: `${tema.glow}, inset 0 0 40px ${tema.s}66`,
            }}>
            <Shield className="w-12 h-12" style={{ color: tema.p, filter: `drop-shadow(0 0 8px ${tema.p})` }} />
          </div>
          <h1 className="text-4xl font-bold font-mono tracking-widest"
            style={{ color: tema.p, textShadow: tema.glow }}>
            INFRATEC
          </h1>
          <p className="text-sm opacity-40 mt-2 font-mono tracking-wider" style={{ color: tema.p }}>
            SISTEMA DE GESTIÓN · v2.0
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(5,8,16,0.96)', border: `1px solid ${tema.border}`, boxShadow: tema.glow }}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono tracking-widest mb-2 block opacity-60" style={{ color: tema.p }}>
                USUARIO
              </label>
              <input value={user} onChange={e => { setUser(e.target.value); setErr(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="ingresá tu usuario"
                className="w-full px-4 py-3 rounded-xl bg-transparent outline-none font-mono"
                style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
            </div>
            <div>
              <label className="text-xs font-mono tracking-widest mb-2 block opacity-60" style={{ color: tema.p }}>
                CONTRASEÑA
              </label>
              <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-transparent outline-none font-mono"
                style={{ border: `1px solid ${tema.border}`, color: '#fff' }} />
            </div>
            {err && (
              <div className="text-sm text-center py-2 rounded-xl font-mono"
                style={{ color: '#ff4444', background: 'rgba(255,64,64,0.1)', border: '1px solid rgba(255,64,64,0.2)' }}>
                {err}
              </div>
            )}
            <button onClick={handleLogin}
              className="w-full py-3.5 rounded-xl font-bold text-xl font-mono tracking-widest transition-all"
              style={{ background: tema.p, color: '#000', boxShadow: tema.glow }}>
              INGRESAR →
            </button>
          </div>
          <div className="mt-6 pt-5 border-t text-xs opacity-25 text-center font-mono space-y-1"
            style={{ borderColor: tema.border, color: tema.p }}>
            <div>admin / admin123</div>
            <div>oficina / ofic456</div>
            <div>tecnico1 / tec789</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfratecCRM() {
  const [temaId, setTemaId] = useState('cian');
  const [usuario, setUsuario] = useState(null);
  const [seccion, setSeccion] = useState('dashboard');
  const [hablando, setHablando] = useState(false);
  const [voces, setVoces] = useState([]);
  const [vozSel, setVozSel] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tema = TEMAS[temaId];

  useEffect(() => {
    function cargarVoces() {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
      setVoces(vs);
      if (vs.length > 0 && !vozSel) setVozSel(vs[0].name);
    }
    cargarVoces();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', cargarVoces);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', cargarVoces);
    }
  }, []);

  function speak(texto) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const v = voces.find(v => v.name === vozSel) || voces[0];
    if (v) u.voice = v;
    u.lang = 'es-AR'; u.rate = 1.05; u.pitch = 1.1;
    u.onstart = () => setHablando(true);
    u.onend = () => setHablando(false);
    u.onerror = () => setHablando(false);
    window.speechSynthesis.speak(u);
  }

  if (!usuario) return <Login onLogin={u => { setUsuario(u); setSeccion('dashboard'); }} tema={tema} />;

  const NAV = {
    ADMIN: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'chami',     label: 'Chami IA',  icon: Brain },
      { id: 'tickets',   label: 'Tickets',   icon: Ticket },
      { id: 'agentes',   label: 'Agentes',   icon: Zap },
      { id: 'config',    label: 'Config',    icon: Settings },
    ],
    ADMINISTRACION: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'chami',     label: 'Chami IA',  icon: Brain },
      { id: 'tickets',   label: 'Tickets',   icon: Ticket },
      { id: 'config',    label: 'Config',    icon: Settings },
    ],
    TECNICO: [
      { id: 'chami',   label: 'Chami IA',    icon: Brain },
      { id: 'tickets', label: 'Mis Órdenes', icon: Ticket },
    ],
  };

  const nav = NAV[usuario.rol] || NAV.TECNICO;

  function renderContenido() {
    switch (seccion) {
      case 'dashboard': return <Dashboard tema={tema} />;
      case 'chami':     return <ChamiAssistant tema={tema} usuario={usuario.nombre} rol={usuario.rol} speak={speak} hablando={hablando} />;
      case 'tickets':   return <Ticketera tema={tema} rol={usuario.rol} />;
      case 'agentes':   return <AgentesManager tema={tema} />;
      case 'config':    return <Configuracion tema={tema} setTemaId={setTemaId} voces={voces} vozSeleccionada={vozSel} setVozSeleccionada={setVozSel} />;
      default:          return null;
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: tema.bg, color: '#fff' }}>
      <div style={{ ...gridBg(tema), position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.35 }} />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 15% 50%, ${tema.s}33 0%, transparent 60%)`, zIndex: 0 }} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-10 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 230, background: 'rgba(3,6,14,0.98)', borderRight: `1px solid ${tema.border}`, boxShadow: `6px 0 40px ${tema.s}33` }}>
        <div className="p-5 border-b" style={{ borderColor: tema.border }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `radial-gradient(circle, ${tema.s}, #000)`, border: `1px solid ${tema.p}`, boxShadow: tema.glow }}>
              <Shield className="w-5 h-5" style={{ color: tema.p }} />
            </div>
            <div>
              <div className="font-bold font-mono text-sm" style={{ color: tema.p }}>INFRATEC</div>
              <div className="text-xs opacity-40 font-mono" style={{ color: tema.p }}>CRM v2.0</div>
            </div>
          </div>
          <div className="mt-3 text-xs font-mono" style={{ color: tema.p, opacity: 0.5 }}>
            {usuario.nombre}<br />
            <span style={{ opacity: 0.6 }}>{usuario.rol}</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(n => (
            <button key={n.id} onClick={() => { setSeccion(n.id); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-all"
              style={{
                background: seccion === n.id ? tema.p + '1a' : 'transparent',
                color: seccion === n.id ? tema.p : 'rgba(255,255,255,0.5)',
                border: `1px solid ${seccion === n.id ? tema.border : 'transparent'}`,
                boxShadow: seccion === n.id ? tema.glow : 'none',
              }}>
              <n.icon className="w-4 h-4 flex-shrink-0" />
              {n.label}
              {seccion === n.id && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: tema.border }}>
          <button onClick={() => setUsuario(null)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-mono transition-all"
            style={{ color: 'rgba(255,100,100,0.8)', background: 'rgba(255,64,64,0.06)', border: '1px solid rgba(255,64,64,0.18)' }}>
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="flex items-center gap-3 px-4 py-3 border-b lg:hidden"
          style={{ background: 'rgba(3,6,14,0.97)', borderColor: tema.border }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl"
            style={{ border: `1px solid ${tema.border}` }}>
            <Activity className="w-5 h-5" style={{ color: tema.p }} />
          </button>
          <span className="font-bold font-mono" style={{ color: tema.p }}>INFRATEC CRM</span>
          <div className="ml-auto flex items-center gap-2">
            {hablando && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />}
            <span className="text-xs opacity-40 font-mono">{usuario.nombre}</span>
          </div>
        </header>

        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b"
          style={{ background: 'rgba(3,6,14,0.85)', borderColor: tema.border }}>
          <div className="flex items-center gap-3">
            <span className="font-bold font-mono" style={{ color: tema.p }}>
              {nav.find(n => n.id === seccion)?.label?.toUpperCase() || 'DASHBOARD'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {hablando && (
              <div className="flex items-center gap-2 text-xs font-mono" style={{ color: '#00ff88' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
                Chami hablando...
              </div>
            )}
            <div className="text-xs opacity-30 font-mono" style={{ color: tema.p }}>
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContenido()}
        </main>
      </div>
    </div>
  );
}
