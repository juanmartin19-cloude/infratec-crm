'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, Users, Clipboard, Package, MapPin, DollarSign, 
  Settings, Bot, Bell, Search, Menu, X, Mic, MicOff, Volume2, VolumeX,
  Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, TrendingDown, 
  Navigation, Zap, FileText, Upload, Brain, Send, Filter,
  ChevronDown, Star, Target, Award, Activity, MessageSquare,
  UserPlus, Briefcase, TrendingUp as Marketing, Users as HR,
  ShoppingCart, FileSpreadsheet, Palette, Sliders
} from 'lucide-react';

// ============================================================================
// CONFIGURACIÓN DE TEMAS
// ============================================================================
const THEMES = {
  cyberpunk: {
    name: 'Cyberpunk',
    primary: 'from-cyan-500 to-blue-500',
    secondary: 'from-purple-500 to-pink-500',
    accent: 'cyan',
    bg: 'from-gray-900 via-blue-900/20 to-gray-900',
    card: 'from-gray-800/50 to-gray-900/50',
    glow: 'rgba(6, 182, 212, 0.5)'
  },
  neon: {
    name: 'Neon Purple',
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-blue-500 to-cyan-500',
    accent: 'purple',
    bg: 'from-gray-900 via-purple-900/20 to-gray-900',
    card: 'from-gray-800/50 to-gray-900/50',
    glow: 'rgba(168, 85, 247, 0.5)'
  },
  matrix: {
    name: 'Matrix Green',
    primary: 'from-green-500 to-emerald-500',
    secondary: 'from-lime-500 to-green-500',
    accent: 'green',
    bg: 'from-gray-900 via-green-900/20 to-gray-900',
    card: 'from-gray-800/50 to-gray-900/50',
    glow: 'rgba(34, 197, 94, 0.5)'
  }
};

// ============================================================================
// ESFERA 3D DE CHAMI (SOLO CLIENT-SIDE)
// ============================================================================
function ChamiSphere3DClient({ isListening, isSpeaking, theme }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Crear partículas
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 40 + Math.random() * 40,
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
      opacity: Math.random()
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Dibujar esfera principal
      const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 60);
      if (isListening) {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (isSpeaking) {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Animar partículas
      particlesRef.current.forEach(particle => {
        particle.angle += particle.speed;
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        
        ctx.fillStyle = isListening ? `rgba(239, 68, 68, ${particle.opacity})` :
                       isSpeaking ? `rgba(34, 197, 94, ${particle.opacity})` :
                       `rgba(6, 182, 212, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ondas de voz
      if (isListening || isSpeaking) {
        for (let i = 0; i < 3; i++) {
          const radius = 60 + (Date.now() % 2000) / 10 + i * 15;
          ctx.strokeStyle = isListening ? `rgba(239, 68, 68, ${0.3 - i * 0.1})` :
                           `rgba(34, 197, 94, ${0.3 - i * 0.1})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, isListening, isSpeaking]);

  if (!mounted) {
    return <div className="w-full h-64 flex items-center justify-center bg-gray-800/30 rounded-xl" />;
  }

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-gray-900/50" />
    </div>
  );
}

// ============================================================================
// PANEL DE CHAMI FLOTANTE
// ============================================================================
function FloatingChamiPanelClient({ onToggle, isMinimized, theme, config }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy Chami, tu asistente personal con IA. Tengo 4 conocimientos master en Administración, Marketing, Negocios Digitales y Community Management. ¿En qué puedo ayudarte?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar Speech APIs solo en cliente
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    synthRef.current = window.speechSynthesis;

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (event.results[i].isFinal) {
            if (transcript.includes('chami')) {
              const command = transcript.replace('chami', '').trim();
              if (command) {
                handleVoiceCommand(command);
              }
            }
          } else {
            interimTranscript = transcript;
          }
        }
        setTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [mounted]);

  const speak = (text) => {
    if (!mounted || typeof window === 'undefined') return;
    if (synthRef.current && !config.muted) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = config.voiceSpeed || 1.0;
      utterance.pitch = config.voicePitch || 1.0;
      
      const voices = synthRef.current.getVoices();
      const selectedVoice = voices.find(v => 
        config.voiceGender === 'female' ? v.name.includes('female') || v.name.includes('mujer') :
        v.name.includes('male') || v.name.includes('hombre')
      );
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleVoiceCommand = (command) => {
    const userMsg = { role: 'user', content: command };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const responses = [
        `Dale, entiendo que querés ${command}. Déjame revisar eso para vos...`,
        `Che, perfecto. Sobre ${command}, te cuento que según lo que vengo analizando...`,
        `Mirá, con respecto a ${command}, tengo algunos insights interesantes para compartirte.`,
        `Uh, buena pregunta sobre ${command}. Basándome en mi formación en administración y marketing...`
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      const assistantMsg = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
      speak(response);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      handleVoiceCommand(inputMessage);
      setInputMessage('');
    }
  };

  if (!mounted) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={onToggle}
        className={`fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br ${theme.primary} rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300 z-50 animate-pulse-slow`}
        style={{ boxShadow: `0 0 60px ${theme.glow}` }}
      >
        <Brain className="w-10 h-10 text-white" />
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-6 right-6 w-[420px] bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 shadow-2xl z-50 overflow-hidden"
      style={{ borderColor: theme.glow, boxShadow: `0 0 60px ${theme.glow}` }}
    >
      <div className={`bg-gradient-to-r ${theme.primary} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Brain className={`w-7 h-7 text-cyan-600`} />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                isSpeaking ? 'bg-green-500 animate-pulse' : 
                isListening ? 'bg-red-500 animate-pulse' : 
                'bg-cyan-500'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Chami IA</h3>
              <p className="text-xs text-white/80">Agente Maestro • 4 Masters</p>
            </div>
          </div>
          <button onClick={onToggle} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <ChamiSphere3DClient isListening={isListening} isSpeaking={isSpeaking} theme={theme} />

      <div className="px-4 pb-2 text-center">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          isListening ? 'bg-red-500/20 text-red-300 animate-pulse' :
          isSpeaking ? 'bg-green-500/20 text-green-300 animate-pulse' :
          'bg-cyan-500/20 text-cyan-300'
        }`}>
          {isListening ? '🎤 ESCUCHANDO - Di "Chami" para activar' : 
           isSpeaking ? '🔊 HABLANDO' : 
           '💤 EN REPOSO - Siempre escuchando'}
        </span>
      </div>

      <div className="h-64 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-3 ${
              msg.role === 'user' 
                ? `bg-gradient-to-r ${theme.primary} text-white` 
                : 'bg-gray-800/50 text-gray-200 border border-gray-700'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50 space-y-2">
        {transcript && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-300 italic">"{transcript}"</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder='Escribe o di "Chami [tu consulta]"...'
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleSendMessage}
            className={`p-2 bg-gradient-to-r ${theme.primary} rounded-lg hover:opacity-80 transition-opacity`}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        <button
          onClick={toggleListening}
          className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : `bg-gradient-to-r ${theme.primary} hover:opacity-80 text-white`
          }`}
        >
          <Mic className="w-4 h-4" />
          {isListening ? 'Detener' : 'Activar Escucha'}
        </button>
      </div>
    </div>
  );
}

// Dynamic import con SSR disabled
const FloatingChamiPanel = dynamic(
  () => Promise.resolve(FloatingChamiPanelClient),
  { ssr: false }
);

// ============================================================================
// OTROS COMPONENTES (Sin cambios necesarios)
// ============================================================================
function TicketsPanel({ isOpen, onClose, theme }) {
  const [tickets] = useState([
    { id: 1, title: 'Instalación CCTV Hotel', priority: 'Alta', status: 'En Progreso', client: 'Hotel Marriott' },
    { id: 2, title: 'Mantenimiento Alarma', priority: 'Media', status: 'Pendiente', client: 'Banco Galicia' },
    { id: 3, title: 'Cableado Red Completo', priority: 'Alta', status: 'Completado', client: 'Carrefour' }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl z-40">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clipboard className="w-6 h-6 text-cyan-400" />
            Tickets
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <button className={`w-full py-3 bg-gradient-to-r ${theme.primary} rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-80`}>
          <Plus className="w-5 h-5" />
          Nuevo Ticket
        </button>

        <div className="space-y-3">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-white">{ticket.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  ticket.priority === 'Alta' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'Media' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{ticket.client}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                ticket.status === 'Completado' ? 'bg-green-500/20 text-green-400' :
                ticket.status === 'En Progreso' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfigModal({ isOpen, onClose, config, setConfig, currentTheme, onThemeChange }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl border border-cyan-500/30 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              Configuración
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Tema Visual
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(THEMES).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => onThemeChange(theme)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentTheme.name === theme.name 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`h-12 rounded bg-gradient-to-r ${theme.primary} mb-2`} />
                  <p className="text-sm text-white font-semibold">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Configuración de Voz
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Género de Voz</label>
                <select
                  value={config.voiceGender}
                  onChange={(e) => setConfig({...config, voiceGender: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="female">Femenina</option>
                  <option value="male">Masculina</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Velocidad: {config.voiceSpeed}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.voiceSpeed}
                  onChange={(e) => setConfig({...config, voiceSpeed: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Tono: {config.voicePitch}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.voicePitch}
                  onChange={(e) => setConfig({...config, voicePitch: parseFloat(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white">Silenciar Chami</span>
                <button
                  onClick={() => setConfig({...config, muted: !config.muted})}
                  className={`px-4 py-2 rounded-lg ${
                    config.muted ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {config.muted ? 'Silenciado' : 'Activo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function InfratecCRMFuturistic() {
  const [currentTheme, setCurrentTheme] = useState(THEMES.cyberpunk);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chamiMinimized, setChamiMinimized] = useState(false);
  const [ticketsPanelOpen, setTicketsPanelOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chamiConfig, setChamiConfig] = useState({
    voiceGender: 'female',
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    muted: false
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const [usersOnline] = useState([
    { name: 'Juan Martín', role: 'Admin', status: 'online', dept: 'Administración' },
    { name: 'Carlos Pérez', role: 'Técnico', status: 'online', dept: 'Técnico' },
    { name: 'Ana López', role: 'Vendedor', status: 'busy', dept: 'Ventas' },
    { name: 'María González', role: 'Marketing', status: 'online', dept: 'Marketing' }
  ]);

  const departments = [
    { id: 'marketing', name: 'Marketing', icon: Marketing, color: 'from-pink-500 to-rose-500', stats: { active: 5, pending: 12 } },
    { id: 'hr', name: 'RRHH', icon: HR, color: 'from-purple-500 to-indigo-500', stats: { active: 8, pending: 3 } },
    { id: 'sales', name: 'Ventas', icon: ShoppingCart, color: 'from-green-500 to-emerald-500', stats: { active: 15, pending: 8 } },
    { id: 'admin', name: 'Administración', icon: FileSpreadsheet, color: 'from-blue-500 to-cyan-500', stats: { active: 12, pending: 5 } }
  ];

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'departments', name: 'Departamentos', icon: Briefcase },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'team', name: 'Equipo', icon: UserPlus },
    { id: 'gps', name: 'GPS', icon: MapPin },
    { id: 'finance', name: 'Finanzas', icon: DollarSign }
  ];

  const dashboardStats = [
    { label: 'Clientes Activos', value: '248', change: '+12%', icon: Users, color: currentTheme.primary },
    { label: 'Órdenes Hoy', value: '18', change: '+5', icon: Clipboard, color: 'from-green-500 to-emerald-500' },
    { label: 'Técnicos Campo', value: '12/15', change: '80%', icon: Navigation, color: 'from-purple-500 to-pink-500' },
    { label: 'Ingresos Mes', value: '$425K', change: '+18%', icon: DollarSign, color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg}`}>
      {mounted && (
        <FloatingChamiPanel
          isMinimized={chamiMinimized}
          onToggle={() => setChamiMinimized(!chamiMinimized)}
          theme={currentTheme}
          config={chamiConfig}
        />
      )}

      <TicketsPanel
        isOpen={ticketsPanelOpen}
        onClose={() => setTicketsPanelOpen(false)}
        theme={currentTheme}
      />

      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        config={chamiConfig}
        setConfig={setChamiConfig}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-xl border-r border-cyan-500/30 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.primary} rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg`}>
              IT
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">INFRATEC</h1>
                <p className="text-xs text-cyan-400">Futuristic CRM</p>
              </div>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${currentTheme.primary} text-white shadow-lg`
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-semibold">{module.name}</span>}
              </button>
            );
          })}

          <button
            onClick={() => setConfigModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all mt-4"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-semibold">Configuración</span>}
          </button>
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700/50"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} ${ticketsPanelOpen ? 'mr-96' : ''}`}>
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {modules.find(m => m.id === activeModule)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-cyan-400">Sistema Futurista INFRATEC</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTicketsPanelOpen(!ticketsPanelOpen)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  ticketsPanelOpen 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Clipboard className="w-5 h-5" />
                Tickets
              </button>

              <button className="relative p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.primary} rounded-full flex items-center justify-center text-white font-bold`}>
                  JM
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Juan Martín</p>
                  <p className="text-xs text-cyan-400">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-xl blur-xl" />
                      <div className={`relative bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-xl border border-white/10 hover:scale-105 transition-transform`}>
                        <div className="flex items-start justify-between mb-4">
                          <Icon className="w-8 h-8 text-white/90" />
                          <span className="text-sm font-bold text-white/80">{stat.change}</span>
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-sm text-white/70 font-medium">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {departments.map(dept => {
                  const Icon = dept.icon;
                  return (
                    <div key={dept.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 hover:border-cyan-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${dept.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                            <p className="text-sm text-gray-400">{dept.stats.active} activos</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm font-semibold transition-colors">
                          Ver Más
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tareas Pendientes</span>
                          <span className="text-white font-semibold">{dept.stats.pending}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className={`bg-gradient-to-r ${dept.color} h-2 rounded-full`} style={{ width: `${(dept.stats.active / (dept.stats.active + dept.stats.pending)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-cyan-400" />
                  Equipo Conectado ({usersOnline.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {usersOnline.map((user, i) => (
                    <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 bg-gradient-to-br ${currentTheme.primary} rounded-full flex items-center justify-center text-white font-bold`}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                            user.status === 'online' ? 'bg-green-500' :
                            user.status === 'busy' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.dept}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModule !== 'dashboard' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className={`w-24 h-24 bg-gradient-to-br ${currentTheme.primary} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Módulo en Desarrollo</h3>
                <p className="text-gray-400">Este módulo estará disponible próximamente</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
