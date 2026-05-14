import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Clipboard, Package, MapPin, DollarSign, 
  Settings, Bot, Bell, Search, Menu, X, Mic, MicOff, Volume2, 
  Plus, Edit, Trash2, Eye, Phone, Mail, Calendar, Clock, 
  CheckCircle, AlertTriangle, TrendingUp, TrendingDown, 
  Navigation, Zap, FileText, Upload, Brain, Send, Filter,
  ChevronDown, Star, Target, Award, Activity
} from 'lucide-react';

// ============================================================================
// COMPONENTE CHAMI FLOTANTE PERSISTENTE
// ============================================================================
function FloatingChamiAssistant({ onToggle, isMinimized }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Inicializar Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleVoiceCommand(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const speak = (text) => {
    if (synthRef.current && !isMuted) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const handleVoiceCommand = (command) => {
    console.log('Comando de voz:', command);
    const response = `Entendido: ${command}. Procesando solicitud...`;
    speak(response);
    setTranscript('');
  };

  const handleQuickMessage = () => {
    if (quickMessage.trim()) {
      handleVoiceCommand(quickMessage);
      setQuickMessage('');
    }
  };

  if (isMinimized) {
    return (
      <div 
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300 z-50 animate-pulse"
        style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.6)' }}
      >
        <Brain className="w-10 h-10 text-white" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-purple-500/50 shadow-2xl z-50 overflow-hidden"
         style={{ boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-purple-500'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Chami</h3>
              <p className="text-xs text-purple-100">Agente Maestro IA</p>
            </div>
          </div>
          <button onClick={onToggle} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Visualización de Onda de Voz */}
      <div className="relative h-32 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        {/* Partículas de fondo */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Onda de voz SVG */}
        <svg width="200" height="100" viewBox="0 0 200 100" className="relative z-10">
          {[...Array(7)].map((_, i) => {
            const height = isListening ? 60 + Math.random() * 40 : 
                          isSpeaking ? 50 + Math.random() * 30 : 20;
            const color = isListening ? '#ef4444' : 
                         isSpeaking ? '#10b981' : '#a855f7';
            return (
              <rect
                key={i}
                x={20 + i * 25}
                y={50 - height / 2}
                width="10"
                height={height}
                rx="5"
                fill={color}
                opacity="0.8"
                className={isListening || isSpeaking ? 'animate-voice-wave' : ''}
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  filter: `drop-shadow(0 0 8px ${color})`
                }}
              />
            );
          })}
        </svg>

        {/* Estado */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isListening ? 'bg-red-500/20 text-red-300 animate-pulse' :
            isSpeaking ? 'bg-green-500/20 text-green-300 animate-pulse' :
            'bg-purple-500/20 text-purple-300'
          }`}>
            {isListening ? '🎤 ESCUCHANDO' : isSpeaking ? '🔊 HABLANDO' : '💤 REPOSO'}
          </span>
        </div>
      </div>

      {/* Transcripción en tiempo real */}
      {transcript && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/30">
          <p className="text-sm text-red-300 italic">"{transcript}"</p>
        </div>
      )}

      {/* Controles */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleQuickMessage()}
            placeholder="Escribe tu consulta..."
            className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleQuickMessage}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleListening}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            <Mic className="w-5 h-5" />
            {isListening ? 'Detener' : 'Hablar'}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-lg transition-colors ${
              isMuted 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700/50">
          {[
            { label: 'Estado general', icon: Activity },
            { label: 'Tareas pendientes', icon: CheckCircle },
            { label: 'Alertas', icon: AlertTriangle },
            { label: 'Reportes', icon: FileText }
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => handleVoiceCommand(action.label)}
                className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-xs text-gray-300 flex items-center gap-2 transition-colors"
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL DEL CRM
// ============================================================================
export default function InfratecCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chamiMinimized, setChamiMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simular login
  useEffect(() => {
    const user = {
      name: 'Juan Martín',
      role: 'admin',
      email: 'admin@infratec.com',
      avatar: 'JM'
    };
    setCurrentUser(user);
  }, []);

  // Datos simulados
  const dashboardStats = [
    { label: 'Clientes Activos', value: '248', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Órdenes Hoy', value: '18', change: '+5', icon: Clipboard, color: 'green' },
    { label: 'Técnicos en Campo', value: '12', change: '100%', icon: Navigation, color: 'purple' },
    { label: 'Facturación Mes', value: '$425K', change: '+18%', icon: DollarSign, color: 'amber' }
  ];

  const recentOrders = [
    { id: '1245', client: 'Hotel Marriott', service: 'Instalación CCTV', tech: 'Carlos P.', status: 'En Progreso', priority: 'Alta' },
    { id: '1244', client: 'Banco Galicia', service: 'Mantenimiento Alarma', tech: 'Juan M.', status: 'Completada', priority: 'Media' },
    { id: '1243', client: 'Supermercado Carrefour', service: 'Cableado Red', tech: 'Pedro R.', status: 'Pendiente', priority: 'Alta' },
    { id: '1242', client: 'Oficina Central', service: 'Sistema Telefónico', tech: 'Ana L.', status: 'En Progreso', priority: 'Baja' }
  ];

  const [clients, setClients] = useState([
    { id: 1, name: 'Hotel Marriott', contact: 'Roberto Sánchez', phone: '+54 11 4555-1234', email: 'rsanchez@marriott.com', address: 'Av. Corrientes 1234, CABA', status: 'Activo', orders: 15 },
    { id: 2, name: 'Banco Galicia', contact: 'María González', phone: '+54 11 4555-5678', email: 'mgonzalez@galicia.com.ar', address: 'Av. Santa Fe 2500, CABA', status: 'Activo', orders: 23 },
    { id: 3, name: 'Supermercado Carrefour', contact: 'Luis Martínez', phone: '+54 11 4555-9012', email: 'lmartinez@carrefour.com', address: 'Av. Rivadavia 3500, CABA', status: 'Activo', orders: 8 }
  ]);

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'orders', name: 'Órdenes', icon: Clipboard },
    { id: 'technicians', name: 'Técnicos', icon: Navigation },
    { id: 'inventory', name: 'Inventario', icon: Package },
    { id: 'gps', name: 'GPS Tracking', icon: MapPin },
    { id: 'finance', name: 'Finanzas', icon: DollarSign },
    { id: 'chami', name: 'Config Chami', icon: Bot }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Activo': 'bg-green-500/20 text-green-400 border-green-500/50',
      'En Progreso': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Completada': 'bg-green-500/20 text-green-400 border-green-500/50',
      'Pendiente': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'Cancelada': 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Alta': 'bg-red-500/20 text-red-400 border-red-500/50',
      'Media': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'Baja': 'bg-green-500/20 text-green-400 border-green-500/50'
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  // Renderizar contenido según módulo activo
  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, i) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-600 to-cyan-600',
                  green: 'from-green-600 to-emerald-600',
                  purple: 'from-purple-600 to-pink-600',
                  amber: 'from-amber-600 to-orange-600'
                };
                return (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-xl blur-xl" 
                         style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
                    <div className={`relative bg-gradient-to-br ${colorClasses[stat.color]} p-6 rounded-xl shadow-xl border border-white/10 hover:scale-105 transition-transform`}>
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

            {/* Órdenes Recientes */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Clipboard className="w-7 h-7 text-blue-400" />
                  Órdenes Recientes
                </h2>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Nueva Orden
                </button>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-700/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-400">#{order.id}</span>
                          <span className="text-lg font-semibold text-white">{order.client}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            {order.service}
                          </span>
                          <span className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />
                            {order.tech}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button className="p-2 hover:bg-gray-600/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                Gestión de Clientes
              </h2>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg text-white font-bold transition-all flex items-center gap-2 shadow-lg hover:scale-105">
                <Plus className="w-5 h-5" />
                Nuevo Cliente
              </button>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-gray-300 font-semibold transition-colors flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </button>
              </div>
            </div>

            {/* Lista de Clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {clients.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.contact.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((client) => (
                <div key={client.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{client.name}</h3>
                        <p className="text-sm text-gray-400">{client.contact}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="w-4 h-4 text-blue-400" />
                      {client.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="w-4 h-4 text-green-400" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      {client.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <span className="text-sm text-gray-400">
                      {client.orders} órdenes completadas
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                      <button className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-green-400" />
                      </button>
                      <button className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Módulo en Desarrollo</h3>
              <p className="text-gray-400">Este módulo estará disponible próximamente</p>
            </div>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Chami Flotante Persistente */}
      <FloatingChamiAssistant 
        isMinimized={chamiMinimized}
        onToggle={() => setChamiMinimized(!chamiMinimized)}
      />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700/50 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">
              IT
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white">INFRATEC</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
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
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-semibold">{module.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700/50 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {modules.find(m => m.id === activeModule)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-400">Bienvenido, {currentUser.name}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.avatar}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {renderModuleContent()}
        </main>
      </div>

      {/* Estilos globales */}
      <style jsx>{`
        @keyframes voice-wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-voice-wave {
          animation: voice-wave 0.6s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
