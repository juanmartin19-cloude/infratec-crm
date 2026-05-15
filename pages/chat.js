export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, ctx } = req.body;
  const key = process.env.ANTHROPIC_API_KEY;

  if (!key) {
    const fb = ['Claro, lo proceso ahora mismo. ¿Algo más?','Anotado, ¿seguimos?','Dale, entendido. ¿Qué más necesitás?','Perfecto, lo gestiono ya.'];
    return res.json({ text: fb[Math.floor(Math.random()*fb.length)] });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: `Sos Chami, la IA principal de INFRATEC, empresa de seguridad electrónica en Buenos Aires Argentina. Hablás en español rioplatense usando "vos". Sos muy humano, cálido, directo y conciso (máximo 2 oraciones). Nunca decís que sos una IA a menos que te pregunten. Contexto del sistema: ${ctx}`,
        messages,
      }),
    });
    const d = await r.json();
    res.json({ text: d.content?.[0]?.text || 'Perdón, ¿me repetís?' });
  } catch {
    res.json({ text: 'Che, tuve un problema de conexión. Intentalo de nuevo.' });
  }
}
// ── CHAMI ASSISTANT ────────────────────────────────────────────────────────
function ChamiAssistant({ tema, usuario, rol, tickets, agentes, setAgentes, setTickets, tipoEsfera, setTipoEsfera, voiceState, setVoiceState, voces, vozSel, setVozSel }) {
  const [msgs, setMsgs] = useState([
    { id:0, de:'chami', texto:`¡Hola ${usuario}! Soy Chami 🤖. Puedo ayudarte con tickets, agentes y todo el sistema. ¿Qué necesitás?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [vista, setVista] = useState('chat');
  const bottomRef = useRef(null);
  const recogRef = useRef(null);
  const histRef = useRef([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs, typing]);

  // TTS chunkeado (fix del corte)
  function speakText(texto) {
    if (typeof window==='undefined'||!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const chunks = texto.match(/[^.!?¿¡]+[.!?]*/g)||[texto];
    let i = 0;
    const vs = VOICE_STATES[voiceState]||VOICE_STATES.normal;
    function next() {
      if (i>=chunks.length) { setHablando(false); return; }
      const chunk = chunks[i++].trim();
      if (!chunk) { next(); return; }
      const u = new SpeechSynthesisUtterance(chunk);
      const v = voces.find(v=>v.name===vozSel)||voces.find(v=>v.lang.startsWith('es'))||voces[0];
      if (v) u.voice = v;
      u.lang = 'es-AR'; u.rate = vs.rate; u.pitch = vs.pitch; u.volume = 1;
      u.onend = next; u.onerror = next;
      window.speechSynthesis.speak(u);
    }
    setHablando(true);
    next();
  }

  // Reconocimiento de voz
  function toggleMic() {
    if (typeof window==='undefined') return;
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if (!SR) { alert('Usá Chrome para el reconocimiento de voz.'); return; }
    if (!recogRef.current) {
      recogRef.current = new SR();
      recogRef.current.lang = 'es-AR';
      recogRef.current.continuous = false;
      recogRef.current.interimResults = false;
      recogRef.current.onresult = e => {
        const t = e.results[0][0].transcript;
        setEscuchando(false);
        enviar(t);
      };
      recogRef.current.onend = () => setEscuchando(false);
      recogRef.current.onerror = () => setEscuchando(false);
    }
    if (escuchando) { recogRef.current.stop(); setEscuchando(false); }
    else { recogRef.current.start(); setEscuchando(true); }
  }

  // Orquestación de comandos
  function ejecutarComando(texto) {
    const t = texto.toLowerCase();
    if (t.includes('crear ticket')||t.includes('nuevo ticket')) {
      const match = texto.match(/para (.+?)(?:\s+con|\s+prioridad|$)/i);
      const cliente = match?.[1]||'Cliente nuevo';
      const nuevoTicket = { id:Date.now(), titulo:`Ticket - ${cliente}`, cliente, estado:'Pendiente', prioridad:'Media', tecnico:'', fecha:new Date().toISOString().slice(0,10), desc:'Creado por Chami vía voz.' };
      setTickets(p=>[...p, nuevoTicket]);
      return `Listo! Creé el ticket para ${cliente} con prioridad Media. Ya está en el sistema ✅`;
    }
    if (t.includes('activar agente')||t.includes('activá el agente')) {
      const match = texto.match(/agente\s+(\w+)/i);
      const nombre = match?.[1]||'';
      setAgentes(p=>p.map(a=>a.nombre.toLowerCase()===nombre.toLowerCase()?{...a,estado:'activo'}:a));
      return nombre ? `Activé al agente ${nombre}. Ahora está online ✅` : 'Decime el nombre del agente que querés activar.';
    }
    if (t.includes('tickets pendientes')||t.includes('cuántos tickets')) {
      const pend = tickets.filter(t=>t.estado==='Pendiente').length;
      return `Tenés ${pend} ticket${pend!==1?'s':''} pendiente${pend!==1?'s':''}. ${pend>0?'¿Los revisamos?':'¡Todo al día!'}`;
    }
    if (t.includes('resumen')||t.includes('estado del sistema')) {
      const pend = tickets.filter(t=>t.estado==='Pendiente').length;
      const cur = tickets.filter(t=>t.estado==='En curso').length;
      const ag = agentes.filter(a=>a.estado==='activo').length;
      return `Sistema al día: ${pend} tickets pendientes, ${cur} en curso, ${ag} agentes activos. Todo operativo 🟢`;
    }
    return null;
  }

  async function enviar(texto) {
    const t = (texto||input).trim();
    if (!t) return;
    setInput('');
    window.speechSynthesis?.cancel();
    setHablando(false);

    const userMsg = { id:Date.now(), de:'user', texto:t };
    setMsgs(p=>[...p, userMsg]);
    histRef.current = [...histRef.current, { role:'user', content:t }];
    setTyping(true);

    // Check for direct commands first
    const cmd = ejecutarComando(t);
    if (cmd) {
      setTimeout(() => {
        setTyping(false);
        setMsgs(p=>[...p,{id:Date.now(),de:'chami',texto:cmd}]);
        histRef.current=[...histRef.current,{role:'assistant',content:cmd}];
        speakText(cmd);
      }, 800);
      return;
    }

    // Call AI API
    try {
      const pend = tickets.filter(t=>t.estado==='Pendiente').length;
      const r = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          messages: histRef.current.slice(-12),
          ctx: `Usuario: ${usuario}, Rol: ${rol}, Tickets pendientes: ${pend}, Agentes activos: ${agentes.filter(a=>a.estado==='activo').length}`,
        }),
      });
      const data = await r.json();
      const resp = data.text;
      setTyping(false);
      setMsgs(p=>[...p,{id:Date.now(),de:'chami',texto:resp}]);
      histRef.current=[...histRef.current,{role:'assistant',content:resp}];
      speakText(resp);
    } catch {
      const fb = 'Perdoná, tuve un problema. ¿Lo repetís?';
      setTyping(false);
      setMsgs(p=>[...p,{id:Date.now(),de:'chami',texto:fb}]);
      speakText(fb);
    }
  }

  const sugs = {
    ADMIN:['Resumen del sistema','¿Cuántos tickets pendientes?','Activá TechBot','Creá un ticket para Banco Sur'],
    ADMINISTRACION:['Tickets abiertos','Nuevo ticket para cliente','Resumen de hoy'],
    TECNICO:['Mi próxima orden','¿Qué hago primero hoy?','Cerrar ticket 2'],
  }[rol]||[];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>🤖 CHAMI</h2>
        <div className="flex gap-1 ml-auto flex-wrap">
          {['chat','esfera'].map(v=>(
            <button key={v} onClick={()=>setVista(v)}
              className="px-3 py-1 rounded-lg text-sm font-mono transition-all"
              style={{background:vista===v?tema.p:'transparent',color:vista===v?'#000':tema.p,
                border:`1px solid ${tema.border}`,boxShadow:vista===v?tema.glow:'none'}}>
              {v==='chat'?'💬 Chat':'🔮 Esfera'}
            </button>
          ))}
        </div>
      </div>

      {vista==='esfera' && (
        <div className="mb-4 rounded-2xl p-4" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
          <div className="text-xs font-mono mb-2" style={{color:tema.p}}>TIPO DE ESFERA</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(SPHERE_LABELS).map(([k,l])=>(
              <button key={k} onClick={()=>setTipoEsfera(k)}
                className="px-3 py-1 rounded-lg text-xs font-mono transition-all"
                style={{background:tipoEsfera===k?tema.p:'transparent',color:tipoEsfera===k?'#000':tema.p,
                  border:`1px solid ${tema.border}`,boxShadow:tipoEsfera===k?tema.glow:'none'}}>
                {l}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono mt-3 mb-2" style={{color:tema.p}}>ESTADO DE VOZ</div>
          <div className="flex gap-2">
            {Object.entries(VOICE_STATES).map(([k,v])=>(
              <button key={k} onClick={()=>setVoiceState(k)}
                className="px-3 py-1 rounded-lg text-xs font-mono"
                style={{background:voiceState===k?tema.p:'transparent',color:voiceState===k?'#000':tema.p,
                  border:`1px solid ${tema.border}`,boxShadow:voiceState===k?tema.glow:'none'}}>
                {v.label}
              </button>
            ))}
          </div>
          {voces.length>0 && <>
            <div className="text-xs font-mono mt-3 mb-2" style={{color:tema.p}}>VOZ ({voces.length} disponibles)</div>
            <select value={vozSel} onChange={e=>setVozSel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none text-sm"
              style={{border:`1px solid ${tema.border}`,background:'#08111e',color:'#fff'}}>
              {voces.slice(0,8).map(v=><option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          </>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1" style={{maxHeight:'52vh'}}>
        {msgs.map(m=>(
          <div key={m.id} className={`flex ${m.de==='user'?'justify-end':'justify-start'} items-end gap-2`}>
            {m.de==='chami' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{background:`radial-gradient(circle, ${tema.s}, #000)`,border:`1px solid ${tema.p}`}}>
                <Brain style={{width:14,height:14,color:tema.p}}/>
              </div>
            )}
            <div className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{background:m.de==='user'?tema.p+'22':tema.panel,
                border:`1px solid ${m.de==='user'?tema.p+'66':tema.border}`,color:'#fff'}}>
              {m.texto}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{background:`radial-gradient(circle, ${tema.s}, #000)`,border:`1px solid ${tema.p}`}}>
              <Brain style={{width:14,height:14,color:tema.p}}/>
            </div>
            <TypingDots tema={tema}/>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {sugs.map(s=>(
          <button key={s} onClick={()=>enviar(s)}
            className="px-3 py-1 rounded-full text-xs"
            style={{background:tema.panel,border:`1px solid ${tema.border}`,color:tema.p}}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={toggleMic}
          className="px-4 py-3 rounded-xl flex-shrink-0 transition-all"
          style={{
            background: escuchando?'rgba(255,64,64,0.2)':tema.panel,
            border: `1px solid ${escuchando?'#ff4444':tema.border}`,
            boxShadow: escuchando?'0 0 15px rgba(255,64,64,0.4)':tema.glow,
          }}>
          {escuchando
            ? <MicOff style={{width:18,height:18,color:'#ff4444'}}/>
            : <Mic style={{width:18,height:18,color:tema.p}}/>}
        </button>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&enviar()}
          placeholder={escuchando?'Escuchando... hablá ahora 🎙️':'Escribile a Chami o usá el micrófono...'}
          className="flex-1 px-4 py-3 rounded-xl bg-transparent outline-none"
          style={{border:`1px solid ${escuchando?'#ff4444':tema.border}`,color:'#fff'}}/>
        <button onClick={()=>enviar()}
          className="px-5 py-3 rounded-xl flex items-center gap-2"
          style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>
          <Send style={{width:16,height:16}}/>
        </button>
      </div>
    </div>
  );
}

// ── TICKETERA ─────────────────────────────────────────────────────────────
function Ticketera({ tema, rol, tickets, setTickets }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({titulo:'',cliente:'',estado:'Pendiente',prioridad:'Media',tecnico:'',desc:''});
  const [filtro, setFiltro] = useState('Todos');
  const filtrados = filtro==='Todos'?tickets:tickets.filter(t=>t.estado===filtro);

  function abrirNuevo() { setForm({titulo:'',cliente:'',estado:'Pendiente',prioridad:'Media',tecnico:'',desc:''}); setModal('nuevo'); }
  function abrirEditar(t) { setForm({...t}); setModal('editar'); }
  function guardar() {
    if (!form.titulo.trim()) return;
    if (modal==='nuevo') setTickets(p=>[...p,{...form,id:Date.now(),fecha:new Date().toISOString().slice(0,10)}]);
    else setTickets(p=>p.map(t=>t.id===form.id?{...form}:t));
    setModal(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>🎫 TICKETS</h2>
        {rol!=='TECNICO' && (
          <button onClick={abrirNuevo} className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>
            <Plus style={{width:14,height:14}}/> Nuevo
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['Todos','Pendiente','En curso','Resuelto','Cancelado'].map(e=>(
          <button key={e} onClick={()=>setFiltro(e)}
            className="px-3 py-1 rounded-full text-sm font-mono"
            style={{background:filtro===e?tema.p:'transparent',color:filtro===e?'#000':tema.p,
              border:`1px solid ${tema.border}`,boxShadow:filtro===e?tema.glow:'none'}}>
            {e}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtrados.map(t=>(
          <div key={t.id} className="rounded-2xl p-4 flex items-start justify-between gap-3"
            style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="w-2 h-2 rounded-full" style={{background:ESTADO_COLOR[t.estado]||'#888'}}/>
                <span className="font-semibold" style={{color:tema.p}}>{t.titulo}</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{background:(ESTADO_COLOR[t.estado]||'#888')+'22',color:ESTADO_COLOR[t.estado]||'#888'}}>
                  {t.estado}
                </span>
              </div>
              <div className="text-sm opacity-60">{t.cliente} · {t.fecha}</div>
              <div className="text-sm opacity-70 mt-1">{t.desc}</div>
            </div>
            {rol!=='TECNICO' && (
              <div className="flex gap-2">
                <button onClick={()=>abrirEditar(t)} className="p-2 rounded-xl"
                  style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
                  <Edit2 style={{width:14,height:14,color:tema.p}}/>
                </button>
                {rol==='ADMIN' && (
                  <button onClick={()=>setTickets(p=>p.filter(x=>x.id!==t.id))} className="p-2 rounded-xl"
                    style={{background:'rgba(255,64,64,0.1)',border:'1px solid rgba(255,64,64,0.3)'}}>
                    <Trash2 style={{width:14,height:14,color:'#ff4444'}}/>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background:'rgba(0,0,0,0.85)'}}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{background:'#08111e',border:`1px solid ${tema.border}`,boxShadow:tema.glow}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-mono" style={{color:tema.p}}>{modal==='nuevo'?'NUEVO TICKET':'EDITAR TICKET'}</h3>
              <button onClick={()=>setModal(null)}><X style={{width:18,height:18,color:tema.p}}/></button>
            </div>
            <div className="space-y-3">
              {[['titulo','Título'],['cliente','Cliente'],['tecnico','Técnico']].map(([k,l])=>(
                <input key={k} placeholder={l} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                  style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
              ))}
              {[['estado',['Pendiente','En curso','Resuelto','Cancelado']],['prioridad',['Alta','Media','Baja']]].map(([k,ops])=>(
                <select key={k} value={form[k]||''} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                  style={{border:`1px solid ${tema.border}`,background:'#08111e',color:'#fff'}}>
                  {ops.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
              <textarea placeholder="Descripción" value={form.desc||''} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}
                rows={3} className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none resize-none"
                style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
            </div>
            <button onClick={guardar} className="mt-4 w-full py-3 rounded-xl font-bold"
              style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>GUARDAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DOCUMENTOS ────────────────────────────────────────────────────────────
function Documentos({ tema }) {
  const [docs, setDocs] = useState(DOCS_INIT);
  const [filtro, setFiltro] = useState('Todos');
  const fileRef = useRef();
  const tipos = ['Todos','Contrato','Presupuesto','Manual','Informe','Otro'];
  const filtrados = filtro==='Todos'?docs:docs.filter(d=>d.tipo===filtro);

  function onFile(e) {
    const files = Array.from(e.target.files);
    files.forEach(f=>{
      const tipo = f.name.includes('contrat')?'Contrato':f.name.includes('presup')?'Presupuesto':'Otro';
      setDocs(p=>[...p,{id:Date.now()+Math.random(),nombre:f.name,tipo,fecha:new Date().toISOString().slice(0,10),size:`${(f.size/1024).toFixed(0)} KB`}]);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>📁 DOCUMENTOS</h2>
        <button onClick={()=>fileRef.current?.click()}
          className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>
          <Upload style={{width:14,height:14}}/> Subir
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={onFile}/>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tipos.map(t=>(
          <button key={t} onClick={()=>setFiltro(t)}
            className="px-3 py-1 rounded-full text-xs font-mono"
            style={{background:filtro===t?tema.p:'transparent',color:filtro===t?'#000':tema.p,
              border:`1px solid ${tema.border}`,boxShadow:filtro===t?tema.glow:'none'}}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtrados.map(d=>(
          <div key={d.id} className="rounded-xl p-3 flex items-center justify-between"
            style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
            <div className="flex items-center gap-3">
              <FileText style={{width:18,height:18,color:tema.p}}/>
              <div>
                <div className="text-sm font-medium text-white">{d.nombre}</div>
                <div className="text-xs opacity-50">{d.tipo} · {d.fecha} · {d.size}</div>
              </div>
            </div>
            <button onClick={()=>setDocs(p=>p.filter(x=>x.id!==d.id))} className="p-1.5 rounded-lg"
              style={{background:'rgba(255,64,64,0.1)',border:'1px solid rgba(255,64,64,0.2)'}}>
              <Trash2 style={{width:12,height:12,color:'#ff4444'}}/>
            </button>
          </div>
        ))}
        {filtrados.length===0 && <div className="text-center py-8 opacity-40 font-mono text-sm" style={{color:tema.p}}>— SIN DOCUMENTOS —</div>}
      </div>
    </div>
  );
}

// ── AGENTES ───────────────────────────────────────────────────────────────
function AgentesManager({ tema, agentes, setAgentes }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({nombre:'',rol:'',personalidad:'amigable',departamento:'General'});

  function guardar() {
    if (!form.nombre.trim()) return;
    setAgentes(p=>[...p,{...form,id:Date.now(),estado:'activo'}]);
    setModal(false);
    setForm({nombre:'',rol:'',personalidad:'amigable',departamento:'General'});
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>🤖 AGENTES IA</h2>
        <button onClick={()=>setModal(true)} className="px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>
          <Plus style={{width:14,height:14}}/> Nuevo
        </button>
      </div>
      <div className="space-y-3">
        {agentes.map(a=>(
          <div key={a.id} className="rounded-2xl p-4 flex items-center justify-between"
            style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{background:`radial-gradient(circle,${tema.s},#000)`,border:`1px solid ${tema.p}`,
                  boxShadow:a.estado==='activo'?tema.glow:'none'}}>
                <Brain style={{width:18,height:18,color:tema.p}}/>
              </div>
              <div>
                <div className="font-semibold" style={{color:tema.p}}>{a.nombre}</div>
                <div className="text-xs opacity-50">{a.rol} · {a.departamento}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full font-mono"
                style={{background:a.estado==='activo'?'rgba(0,255,136,0.12)':'rgba(255,170,0,0.12)',
                  color:a.estado==='activo'?'#00ff88':'#ffaa00'}}>
                {a.estado==='activo'?'● ON':'⏸ OFF'}
              </span>
              <button onClick={()=>setAgentes(p=>p.map(x=>x.id===a.id?{...x,estado:x.estado==='activo'?'pausa':'activo'}:x))}
                className="p-2 rounded-xl" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
                <Zap style={{width:14,height:14,color:tema.p}}/>
              </button>
              <button onClick={()=>setAgentes(p=>p.filter(x=>x.id!==a.id))} className="p-2 rounded-xl"
                style={{background:'rgba(255,64,64,0.1)',border:'1px solid rgba(255,64,64,0.3)'}}>
                <Trash2 style={{width:14,height:14,color:'#ff4444'}}/>
              </button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background:'rgba(0,0,0,0.85)'}}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{background:'#08111e',border:`1px solid ${tema.border}`,boxShadow:tema.glow}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold font-mono" style={{color:tema.p}}>NUEVO AGENTE</h3>
              <button onClick={()=>setModal(false)}><X style={{width:18,height:18,color:tema.p}}/></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nombre" value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
              <input placeholder="Rol" value={form.rol} onChange={e=>setForm(p=>({...p,rol:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
              <input placeholder="Departamento" value={form.departamento} onChange={e=>setForm(p=>({...p,departamento:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent outline-none"
                style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
              <select value={form.personalidad} onChange={e=>setForm(p=>({...p,personalidad:e.target.value}))}
                className="w-full px-4 py-2.5 rounded-xl outline-none"
                style={{border:`1px solid ${tema.border}`,background:'#08111e',color:'#fff'}}>
                {['amigable','preciso','persuasivo','formal','técnico'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={guardar} className="mt-4 w-full py-3 rounded-xl font-bold"
              style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>CREAR</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ tema, tickets }) {
  const [chartType, setChartType] = useState('barras');
  const [dolar, setDolar] = useState(null);
  const [clima, setClima] = useState(null);

  useEffect(()=>{
    fetch('https://dolarapi.com/v1/dolares/blue').then(r=>r.json()).then(d=>setDolar(d)).catch(()=>{});
    fetch('https://wttr.in/Buenos+Aires?format=%t|%C').then(r=>r.text()).then(t=>{
      const [temp,cond] = t.split('|');
      setClima({temp:temp?.trim(),cond:cond?.trim()});
    }).catch(()=>{});
  },[]);

  const stats = [
    {label:'Total',     valor:tickets.length,                                       color:tema.p},
    {label:'Pendiente', valor:tickets.filter(t=>t.estado==='Pendiente').length,     color:'#ffaa00'},
    {label:'En Curso',  valor:tickets.filter(t=>t.estado==='En curso').length,      color:'#00aaff'},
    {label:'Resueltos', valor:tickets.filter(t=>t.estado==='Resuelto').length,      color:'#00ff88'},
  ];

  const chartTypes = ['barras','torta','linea','area','radar','bubbles'];

  function renderChart() {
    if (chartType==='barras') return (
      <div className="flex items-end gap-3 h-32">
        {stats.map(s=>(
          <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-xs font-mono" style={{color:s.color}}>{s.valor}</div>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{height:`${Math.max(4,(s.valor/Math.max(tickets.length,1))*100)}%`,background:s.color,boxShadow:`0 0 10px ${s.color}66`}}/>
            <div className="text-xs opacity-50" style={{color:s.color}}>{s.label}</div>
          </div>
        ))}
      </div>
    );
    if (chartType==='torta') {
      const total = Math.max(tickets.length,1);
      let acc = 0;
      const slices = stats.filter(s=>s.valor>0).map(s=>{
        const pct = (s.valor/total)*100;
        const start = acc; acc += pct;
        return {...s,pct,start};
      });
      const gradient = slices.map(s=>`${s.color} ${s.start}% ${s.start+s.pct}%`).join(',');
      return (
        <div className="flex items-center gap-6">
          <div className="rounded-full flex-shrink-0"
            style={{width:100,height:100,background:slices.length?`conic-gradient(${gradient})`:'#333',boxShadow:tema.glow}}/>
          <div className="space-y-1">
            {stats.map(s=>(
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{background:s.color}}/>
                <span style={{color:'#aaa'}}>{s.label}: <span style={{color:s.color}}>{s.valor}</span></span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (chartType==='linea'||chartType==='area') {
      const max = Math.max(...stats.map(s=>s.valor),1);
      const pts = stats.map((s,i)=>`${i*33+16},${100-(s.valor/max)*80}`).join(' ');
      return (
        <svg viewBox="0 0 100 100" style={{height:120,width:'100%'}}>
          {chartType==='area' && <polygon points={`16,100 ${pts} ${stats.length*33-17},100`} fill={tema.p} opacity="0.15"/>}
          <polyline points={pts} fill="none" stroke={tema.p} strokeWidth="2" style={{filter:`drop-shadow(0 0 4px ${tema.p})`}}/>
          {stats.map((s,i)=>(
            <circle key={i} cx={i*33+16} cy={100-(s.valor/max)*80} r="3" fill={tema.p}/>
          ))}
        </svg>
      );
    }
    if (chartType==='radar') {
      const max = Math.max(...stats.map(s=>s.valor),1);
      const n = stats.length;
      const pts = stats.map((s,i)=>{
        const angle = (i/n)*Math.PI*2 - Math.PI/2;
        const r = (s.valor/max)*40;
        return `${50+Math.cos(angle)*r},${50+Math.sin(angle)*r}`;
      }).join(' ');
      const grid = stats.map((_,i)=>{
        const angle = (i/n)*Math.PI*2 - Math.PI/2;
        return `${50+Math.cos(angle)*40},${50+Math.sin(angle)*40}`;
      }).join(' ');
      return (
        <svg viewBox="0 0 100 100" style={{height:130,width:'100%'}}>
          <polygon points={grid} fill="none" stroke={tema.border} strokeWidth="0.5"/>
          <polygon points={pts} fill={tema.p} fillOpacity="0.2" stroke={tema.p} strokeWidth="1.5"/>
          {stats.map((s,i)=>{
            const angle = (i/n)*Math.PI*2 - Math.PI/2;
            const r = (s.valor/max)*40;
            return <circle key={i} cx={50+Math.cos(angle)*r} cy={50+Math.sin(angle)*r} r="2.5" fill={s.color}/>;
          })}
        </svg>
      );
    }
    // bubbles
    return (
      <div className="flex items-end gap-4 justify-center h-32">
        {stats.map(s=>{
          const sz = 20+s.valor*20;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div className="rounded-full flex items-center justify-center font-bold text-sm"
                style={{width:sz,height:sz,background:s.color+'33',border:`2px solid ${s.color}`,color:s.color,
                  boxShadow:`0 0 ${sz/2}px ${s.color}44`}}>
                {s.valor}
              </div>
              <div className="text-xs opacity-50">{s.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>📊 DASHBOARD</h2>

      {/* Widgets */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
          <DollarSign style={{width:24,height:24,color:'#00ff88'}}/>
          <div>
            <div className="text-xs opacity-50">Dólar Blue</div>
            {dolar ? (
              <div className="font-bold font-mono" style={{color:'#00ff88'}}>
                ${dolar.venta} <span className="text-xs opacity-50">venta</span>
              </div>
            ) : <div className="text-xs opacity-40">Cargando...</div>}
          </div>
        </div>
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
          <Cloud style={{width:24,height:24,color:'#00aaff'}}/>
          <div>
            <div className="text-xs opacity-50">Buenos Aires</div>
            {clima ? (
              <div className="font-bold font-mono text-sm" style={{color:'#00aaff'}}>{clima.temp}</div>
            ) : <div className="text-xs opacity-40">Cargando...</div>}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(s=>(
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{background:tema.panel,border:`1px solid ${tema.border}`,boxShadow:`0 0 20px ${s.color}18`}}>
            <div className="text-4xl font-bold font-mono" style={{color:s.color,textShadow:`0 0 15px ${s.color}88`}}>{s.valor}</div>
            <div className="text-xs opacity-50 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="rounded-2xl p-5" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-mono text-sm" style={{color:tema.p}}>GRÁFICO DE TICKETS</h3>
          <div className="flex gap-1 flex-wrap">
            {chartTypes.map(c=>(
              <button key={c} onClick={()=>setChartType(c)}
                className="px-2 py-0.5 rounded text-xs font-mono"
                style={{background:chartType===c?tema.p:'transparent',color:chartType===c?'#000':tema.p,
                  border:`1px solid ${tema.border}`}}>
                {c}
              </button>
            ))}
          </div>
        </div>
        {renderChart()}
      </div>

      {/* System status */}
      <div className="rounded-2xl p-5" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
        <h3 className="font-semibold font-mono text-sm mb-4" style={{color:tema.p}}>⚡ SISTEMA</h3>
        {[['Cámaras online',87],['Alarmas activas',94],['Red estable',100],['Backups',72]].map(([l,v])=>(
          <div key={l} className="mb-3">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{color:'#aaa'}}>{l}</span>
              <span className="font-mono" style={{color:tema.p}}>{v}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{background:tema.border+'55'}}>
              <div className="h-1.5 rounded-full" style={{width:`${v}%`,background:tema.p,boxShadow:tema.glow}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CONFIGURACION ─────────────────────────────────────────────────────────
function Configuracion({ tema, setTemaId, voces, vozSel, setVozSel, voiceState, setVoiceState }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold font-mono" style={{color:tema.p}}>⚙️ CONFIG</h2>
      <div className="rounded-2xl p-5" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
        <h3 className="font-mono text-sm mb-3" style={{color:tema.p}}>🎨 TEMA ({Object.keys(TEMAS).length} opciones)</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(TEMAS).map(t=>(
            <button key={t.id} onClick={()=>setTemaId(t.id)}
              className="px-2 py-2 rounded-xl text-xs font-mono transition-all"
              style={{border:`2px solid ${t.id===tema.id?t.p:t.border}`,background:t.id===tema.id?t.panel:'transparent',
                color:t.p,boxShadow:t.id===tema.id?t.glow:'none'}}>
              {t.n}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{background:tema.panel,border:`1px solid ${tema.border}`}}>
        <h3 className="font-mono text-sm mb-3" style={{color:tema.p}}>🗣️ VOZ</h3>
        {voces.length>0 && (
          <select value={vozSel} onChange={e=>setVozSel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl outline-none mb-3"
            style={{border:`1px solid ${tema.border}`,background:'#08111e',color:'#fff'}}>
            {voces.map(v=><option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          </select>
        )}
        <div className="flex gap-2">
          {Object.entries(VOICE_STATES).map(([k,v])=>(
            <button key={k} onClick={()=>setVoiceState(k)}
              className="flex-1 py-2 rounded-xl text-sm font-mono"
              style={{background:voiceState===k?tema.p:'transparent',color:voiceState===k?'#000':tema.p,
                border:`1px solid ${tema.border}`,boxShadow:voiceState===k?tema.glow:'none'}}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-4 text-xs font-mono opacity-40" style={{border:`1px solid ${tema.border}`,color:tema.p}}>
        Para IA real: agregá ANTHROPIC_API_KEY en Vercel → Settings → Environment Variables
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function Login({ onLogin, tema }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  function go() {
    const u = USERS_DB.find(u=>u.user===user.trim()&&u.pass===pass);
    if (u) onLogin(u); else setErr('Usuario o contraseña incorrectos');
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{background:tema.bg,...gridBg(tema)}}>
      <div className="absolute inset-0 pointer-events-none"
        style={{background:`radial-gradient(ellipse at 50% 40%, ${tema.s}55 0%, transparent 65%)`}}/>
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex w-24 h-24 rounded-full items-center justify-center mb-5"
            style={{background:`radial-gradient(circle at 33% 28%, ${tema.s}cc, #00000099)`,
              border:`2px solid ${tema.p}`,boxShadow:`${tema.glow},inset 0 0 40px ${tema.s}66`}}>
            <Shield style={{width:48,height:48,color:tema.p,filter:`drop-shadow(0 0 8px ${tema.p})`}}/>
          </div>
          <h1 className="text-4xl font-bold font-mono tracking-widest" style={{color:tema.p,textShadow:tema.glow}}>INFRATEC</h1>
          <p className="text-xs opacity-30 mt-2 font-mono tracking-widest" style={{color:tema.p}}>SISTEMA DE GESTIÓN · v2.0</p>
        </div>
        <div className="rounded-2xl p-8" style={{background:'rgba(5,8,16,0.96)',border:`1px solid ${tema.border}`,boxShadow:tema.glow}}>
          <div className="space-y-4">
            {[['USUARIO','text',user,setUser],['CONTRASEÑA','password',pass,setPass]].map(([l,type,val,set])=>(
              <div key={l}>
                <label className="text-xs font-mono tracking-widest mb-2 block opacity-50" style={{color:tema.p}}>{l}</label>
                <input type={type} value={val} onChange={e=>{set(e.target.value);setErr('');}}
                  onKeyDown={e=>e.key==='Enter'&&go()}
                  className="w-full px-4 py-3 rounded-xl bg-transparent outline-none font-mono"
                  style={{border:`1px solid ${tema.border}`,color:'#fff'}}/>
              </div>
            ))}
            {err && <div className="text-sm text-center py-2 rounded-xl font-mono"
              style={{color:'#ff4444',background:'rgba(255,64,64,0.1)',border:'1px solid rgba(255,64,64,0.2)'}}>
              {err}
            </div>}
            <button onClick={go} className="w-full py-3.5 rounded-xl font-bold text-xl font-mono tracking-widest"
              style={{background:tema.p,color:'#000',boxShadow:tema.glow}}>
              INGRESAR →
            </button>
          </div>
          <div className="mt-6 pt-4 border-t text-xs opacity-20 text-center font-mono space-y-1"
            style={{borderColor:tema.border,color:tema.p}}>
            <div>admin / admin123</div><div>oficina / ofic456</div><div>tecnico1 / tec789</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function InfratecCRM() {
  const [temaId, setTemaId]         = useState('cian');
  const [usuario, setUsuario]       = useState(null);
  const [seccion, setSeccion]       = useState('dashboard');
  const [tickets, setTickets]       = useState(TICKETS_INIT);
  const [agentes, setAgentes]       = useState(AGENTES_INIT);
  const [tipoEsfera, setTipoEsfera] = useState('rings');
  const [voiceState, setVoiceState] = useState('normal');
  const [voces, setVoces]           = useState([]);
  const [vozSel, setVozSel]         = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hablando, setHablando]     = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const tema = TEMAS[temaId];

  useEffect(() => {
    function cargar() {
      if (typeof window==='undefined'||!window.speechSynthesis) return;
      const vs = window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith('es'));
      if (vs.length) { setVoces(vs); if (!vozSel) setVozSel(vs[0].name); }
    }
    cargar();
    window.speechSynthesis?.addEventListener('voiceschanged', cargar);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', cargar);
  }, []);

  if (!usuario) return <Login onLogin={u=>{setUsuario(u);setSeccion('dashboard');}} tema={tema}/>;

  const NAV = {
    ADMIN:          [{id:'dashboard',label:'Dashboard',icon:BarChart3},{id:'chami',label:'Chami IA',icon:Brain},{id:'tickets',label:'Tickets',icon:Ticket},{id:'docs',label:'Documentos',icon:FileText},{id:'agentes',label:'Agentes',icon:Zap},{id:'config',label:'Config',icon:Settings}],
    ADMINISTRACION: [{id:'dashboard',label:'Dashboard',icon:BarChart3},{id:'chami',label:'Chami IA',icon:Brain},{id:'tickets',label:'Tickets',icon:Ticket},{id:'docs',label:'Documentos',icon:FileText},{id:'config',label:'Config',icon:Settings}],
    TECNICO:        [{id:'chami',label:'Chami IA',icon:Brain},{id:'tickets',label:'Mis Órdenes',icon:Ticket}],
  };
  const nav = NAV[usuario.rol]||NAV.TECNICO;

  function renderContenido() {
    switch(seccion) {
      case 'dashboard': return <Dashboard tema={tema} tickets={tickets}/>;
      case 'chami':     return <ChamiAssistant tema={tema} usuario={usuario.nombre} rol={usuario.rol}
                                 tickets={tickets} agentes={agentes} setAgentes={setAgentes} setTickets={setTickets}
                                 tipoEsfera={tipoEsfera} setTipoEsfera={setTipoEsfera}
                                 voiceState={voiceState} setVoiceState={setVoiceState}
                                 voces={voces} vozSel={vozSel} setVozSel={setVozSel}/>;
      case 'tickets':   return <Ticketera tema={tema} rol={usuario.rol} tickets={tickets} setTickets={setTickets}/>;
      case 'docs':      return <Documentos tema={tema}/>;
      case 'agentes':   return <AgentesManager tema={tema} agentes={agentes} setAgentes={setAgentes}/>;
      case 'config':    return <Configuracion tema={tema} setTemaId={setTemaId} voces={voces} vozSel={vozSel}
                                 setVozSel={setVozSel} voiceState={voiceState} setVoiceState={setVoiceState}/>;
      default:          return null;
    }
  }

  return (
    <div className="min-h-screen flex" style={{background:tema.bg,color:'#fff'}}>
      <div style={{...gridBg(tema),position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:0.35}}/>
      <div className="fixed inset-0 pointer-events-none"
        style={{background:`radial-gradient(ellipse at 15% 50%, ${tema.s}33 0%, transparent 60%)`,zIndex:0}}/>

      {/* Esfera flotante siempre visible */}
      <FloatingSphere tema={tema} hablando={hablando} escuchando={escuchando}
        tipoEsfera={tipoEsfera} onAbrirChat={()=>setSeccion('chami')}/>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{background:'rgba(0,0,0,0.75)'}}
          onClick={()=>setSidebarOpen(false)}/>
      )}

      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-10 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}
        style={{width:220,background:'rgba(3,6,14,0.98)',borderRight:`1px solid ${tema.border}`,
          boxShadow:`6px 0 40px ${tema.s}33`}}>
        <div className="p-4 border-b" style={{borderColor:tema.border}}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{background:`radial-gradient(circle,${tema.s},#000)`,border:`1px solid ${tema.p}`,boxShadow:tema.glow}}>
              <Shield style={{width:18,height:18,color:tema.p}}/>
            </div>
            <div>
              <div className="font-bold font-mono text-sm" style={{color:tema.p}}>INFRATEC</div>
              <div className="text-xs opacity-30 font-mono" style={{color:tema.p}}>CRM v2.0</div>
            </div>
          </div>
          <div className="mt-3 text-xs font-mono opacity-40" style={{color:tema.p}}>
            {usuario.nombre} · {usuario.rol}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(n=>(
            <button key={n.id} onClick={()=>{setSeccion(n.id);setSidebarOpen(false);}}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-all"
              style={{background:seccion===n.id?tema.p+'1a':'transparent',
                color:seccion===n.id?tema.p:'rgba(255,255,255,0.5)',
                border:`1px solid ${seccion===n.id?tema.border:'transparent'}`,
                boxShadow:seccion===n.id?tema.glow:'none'}}>
              <n.icon style={{width:16,height:16}}/>
              {n.label}
              {seccion===n.id && <ChevronRight style={{width:12,height:12,marginLeft:'auto'}}/>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{borderColor:tema.border}}>
          <button onClick={()=>setUsuario(null)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-mono"
            style={{color:'rgba(255,100,100,0.8)',background:'rgba(255,64,64,0.06)',border:'1px solid rgba(255,64,64,0.18)'}}>
            <LogOut style={{width:14,height:14}}/> Salir
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="flex items-center gap-3 px-4 py-3 border-b lg:hidden"
          style={{background:'rgba(3,6,14,0.97)',borderColor:tema.border}}>
          <button onClick={()=>setSidebarOpen(true)} className="p-2 rounded-xl"
            style={{border:`1px solid ${tema.border}`}}>
            <Activity style={{width:18,height:18,color:tema.p}}/>
          </button>
          <span className="font-bold font-mono" style={{color:tema.p}}>INFRATEC CRM</span>
          <span className="ml-auto text-xs opacity-40 font-mono">{usuario.nombre}</span>
        </header>
        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b"
          style={{background:'rgba(3,6,14,0.85)',borderColor:tema.border}}>
          <span className="font-bold font-mono" style={{color:tema.p}}>
            {nav.find(n=>n.id===seccion)?.label?.toUpperCase()||'DASHBOARD'}
          </span>
          <div className="text-xs opacity-30 font-mono" style={{color:tema.p}}>
            {new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto" style={{paddingRight:'200px'}}>
          {renderContenido()}
        </main>
      </div>
    </div>
  );
}
