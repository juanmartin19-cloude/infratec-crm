'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Clipboard, Package, MapPin, DollarSign, 
  Settings, Bot, Bell, Menu, X, Mic, Volume2, VolumeX,
  Activity, Zap, Radio, Cpu, Database, Terminal, Server,
  Eye, Palette, Save, RotateCcw
} from 'lucide-react';

// ============================================================================
// PALETAS DE COLORES NEÓN
// ============================================================================
const NEON_PALETTES = {
  cyan: { name: 'Cyan Eléctrico', primary: '#00ffff', secondary: '#0088ff', glow: 'rgba(0, 255, 255, 0.6)' },
  amber: { name: 'Ámbar Radiante', primary: '#ffaa00', secondary: '#ff6600', glow: 'rgba(255, 170, 0, 0.6)' },
  purple: { name: 'Púrpura Neón', primary: '#aa00ff', secondary: '#ff00ff', glow: 'rgba(170, 0, 255, 0.6)' },
  lime: { name: 'Lima Brillante', primary: '#00ff00', secondary: '#88ff00', glow: 'rgba(0, 255, 0, 0.6)' },
  magenta: { name: 'Rosa Magenta', primary: '#ff0088', secondary: '#ff00ff', glow: 'rgba(255, 0, 136, 0.6)' },
  cobalt: { name: 'Azul Cobalto', primary: '#0066ff', secondary: '#0033ff', glow: 'rgba(0, 102, 255, 0.6)' },
  matrix: { name: 'Verde Matrix', primary: '#00ff88', secondary: '#00ffaa', glow: 'rgba(0, 255, 136, 0.6)' },
  crimson: { name: 'Rojo Carmesí', primary: '#ff0000', secondary: '#ff0044', glow: 'rgba(255, 0, 0, 0.6)' },
  fire: { name: 'Naranja Fuego', primary: '#ff4400', secondary: '#ff8800', glow: 'rgba(255, 68, 0, 0.6)' },
  violet: { name: 'Violeta Plasma', primary: '#8800ff', secondary: '#aa44ff', glow: 'rgba(136, 0, 255, 0.6)' }
};

// ============================================================================
// 5 TIPOS DE ESFERAS 3D
// ============================================================================

// ESFERA 1: HOLOGRÁFICA CON PARTÍCULAS
function SphereHolographic({ isListening, isSpeaking, color }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    particlesRef.current = Array.from({ length: 80 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 50 + Math.random() * 50,
      speed: 0.001 + Math.random() * 0.003,
      size: 1 + Math.random() * 3,
      opacity: Math.random()
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 80);
      const currentColor = isListening ? '#ff0000' : isSpeaking ? '#00ff00' : color;
      gradient.addColorStop(0, `${currentColor}aa`);
      gradient.addColorStop(0.5, `${currentColor}44`);
      gradient.addColorStop(1, `${currentColor}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fill();

      particlesRef.current.forEach(particle => {
        particle.angle += particle.speed;
        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius;
        
        ctx.fillStyle = `${currentColor}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [mounted, isListening, isSpeaking, color]);

  if (!mounted) return <div className="w-full h-full bg-black/20" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ESFERA 2: ENERGÍA CON RAYOS
function SphereEnergy({ isListening, isSpeaking, color }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentColor = isListening ? '#ff0000' : isSpeaking ? '#00ff00' : color;

      // Esfera central
      const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 60);
      gradient.addColorStop(0, currentColor);
      gradient.addColorStop(1, `${currentColor}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Rayos eléctricos
      for (let i = 0; i < 8; i++) {
        const angle = (Date.now() / 1000 + i * Math.PI / 4) % (Math.PI * 2);
        const endX = centerX + Math.cos(angle) * 100;
        const endY = centerY + Math.sin(angle) * 100;
        
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = currentColor;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [mounted, isListening, isSpeaking, color]);

  if (!mounted) return <div className="w-full h-full bg-black/20" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ESFERA 3: CRISTALINA GEOMÉTRICA
function SphereCrystal({ isListening, isSpeaking, color }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentColor = isListening ? '#ff0000' : isSpeaking ? '#00ff00' : color;
      const rotation = Date.now() / 1000;

      // Polígonos rotando
      for (let layer = 0; layer < 3; layer++) {
        const sides = 6 + layer * 2;
        const radius = 40 + layer * 20;
        
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = currentColor;
        ctx.beginPath();
        
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + rotation * (layer % 2 ? 1 : -1);
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [mounted, isListening, isSpeaking, color]);

  if (!mounted) return <div className="w-full h-full bg-black/20" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ESFERA 4: DATOS (Código y números)
function SphereData({ isListening, isSpeaking, color }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    const chars = '01ABCDEF<>{}[]';
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      char: chars[Math.floor(Math.random() * chars.length)],
      speed: 0.5 + Math.random()
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const currentColor = isListening ? '#ff0000' : isSpeaking ? '#00ff00' : color;

      ctx.font = '14px "Courier New"';
      ctx.fillStyle = currentColor;
      ctx.shadowBlur = 5;
      ctx.shadowColor = currentColor;

      particles.forEach(p => {
        ctx.fillText(p.char, p.x, p.y);
        p.y += p.speed;
        if (p.y > 300) {
          p.y = 0;
          p.x = Math.random() * 300;
          p.char = chars[Math.floor(Math.random() * chars.length)];
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [mounted, isListening, isSpeaking, color]);

  if (!mounted) return <div className="w-full h-full bg-black/20" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ESFERA 5: ORGÁNICA (Fluido)
function SphereOrganic({ isListening, isSpeaking, color }) {
  const canvasRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const currentColor = isListening ? '#ff0000' : isSpeaking ? '#00ff00' : color;
      const time = Date.now() / 1000;

      // Forma orgánica con curvas Bézier
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = currentColor;
      ctx.beginPath();

      const points = 8;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave = Math.sin(time * 2 + i) * 20;
        const radius = 60 + wave;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevAngle = ((i - 1) / points) * Math.PI * 2;
          const cpx = centerX + Math.cos(prevAngle + Math.PI / points) * (radius + 10);
          const cpy = centerY + Math.sin(prevAngle + Math.PI / points) * (radius + 10);
          ctx.quadraticCurveTo(cpx, cpy, x, y);
        }
      }
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    animate();
  }, [mounted, isListening, isSpeaking, color]);

  if (!mounted) return <div className="w-full h-full bg-black/20" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// ============================================================================
// CHAMI ORB DRAGGABLE/RESIZABLE (Con Framer Motion dinámico)
// ============================================================================
function ChamiOrbClient({ sphereType, palette, isListening, isSpeaking, onToggleListening }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [motion, setMotion] = useState(null);

  // Cargar Framer Motion dinámicamente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    import('framer-motion').then(mod => setMotion(mod));
  }, []);

  if (!motion) return null;

  const { motion: Motion } = motion;

  const SphereComponents = {
    holographic: SphereHolographic,
    energy: SphereEnergy,
    crystal: SphereCrystal,
    data: SphereData,
    organic: SphereOrganic
  };

  const SphereComponent = SphereComponents[sphereType] || SphereHolographic;

  return (
    <Motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        setPosition({ x: info.point.x, y: info.point.y });
      }}
      className="fixed z-50 cursor-move"
      style={{
        width: size,
        height: size,
        right: 20,
        bottom: 20,
        filter: `drop-shadow(0 0 30px ${palette.glow})`
      }}
    >
      <div 
        className="relative w-full h-full rounded-full border-2 overflow-hidden"
        style={{ borderColor: palette.primary, boxShadow: `0 0 40px ${palette.glow}` }}
      >
        <SphereComponent 
          isListening={isListening}
          isSpeaking={isSpeaking}
          color={palette.primary}
        />
        
        {/* Controles */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            onClick={onToggleListening}
            className="p-2 rounded-full backdrop-blur-sm transition-colors"
            style={{ 
              backgroundColor: isListening ? '#ff0000aa' : `${palette.primary}44`,
              border: `1px solid ${palette.primary}`
            }}
          >
            <Mic className="w-4 h-4" style={{ color: palette.primary }} />
          </button>
          
          <button
            onClick={() => setSize(s => Math.max(200, s - 50))}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${palette.primary}44`, border: `1px solid ${palette.primary}` }}
          >
            <span style={{ color: palette.primary }}>-</span>
          </button>
          
          <button
            onClick={() => setSize(s => Math.min(500, s + 50))}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${palette.primary}44`, border: `1px solid ${palette.primary}` }}
          >
            <span style={{ color: palette.primary }}>+</span>
          </button>
        </div>

        {/* Estado */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <span 
            className="text-xs font-mono px-2 py-1 rounded backdrop-blur-sm"
            style={{ 
              backgroundColor: `${palette.primary}22`,
              border: `1px solid ${palette.primary}`,
              color: palette.primary
            }}
          >
            {isListening ? 'LISTENING' : isSpeaking ? 'SPEAKING' : 'IDLE'}
          </span>
        </div>
      </div>
    </Motion.div>
  );
}

// ============================================================================
// PANEL DE PERSONALIZACIÓN
// ============================================================================
function CustomizationPanel({ isOpen, onClose, currentPalette, onPaletteChange, sphereType, onSphereChange, customColors, onCustomColorsChange }) {
  const [customMode, setCustomMode] = useState(false);

  if (!isOpen) return null;

  const handleCustomBlend = () => {
    if (customColors.color1 && customColors.color2) {
      const customPalette = {
        name: 'Custom Blend',
        primary: customColors.color1,
        secondary: customColors.color2,
        glow: `${customColors.color1}99`
      };
      onPaletteChange(customPalette);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
      <div 
        className="bg-black/90 rounded-lg p-6 w-[700px] max-h-[90vh] overflow-y-auto border-2"
        style={{ borderColor: currentPalette.primary, boxShadow: `0 0 40px ${currentPalette.glow}` }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: currentPalette.primary }}>
            &gt; CUSTOMIZATION_PANEL
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
            <X className="w-6 h-6" style={{ color: currentPalette.primary }} />
          </button>
        </div>

        {/* Selector de Esfera */}
        <div className="mb-6">
          <h3 className="text-lg mb-3" style={{ color: currentPalette.primary }}>&gt; SPHERE_TYPE:</h3>
          <div className="grid grid-cols-5 gap-3">
            {['holographic', 'energy', 'crystal', 'data', 'organic'].map(type => (
              <button
                key={type}
                onClick={() => onSphereChange(type)}
                className="p-3 rounded border-2 transition-all hover:scale-105"
                style={{
                  borderColor: sphereType === type ? currentPalette.primary : '#333',
                  backgroundColor: sphereType === type ? `${currentPalette.primary}22` : '#111',
                  color: currentPalette.primary
                }}
              >
                <div className="text-xs font-bold uppercase">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Paletas Predefinidas */}
        <div className="mb-6">
          <h3 className="text-lg mb-3" style={{ color: currentPalette.primary }}>&gt; NEON_PALETTES:</h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(NEON_PALETTES).map(([key, palette]) => (
              <button
                key={key}
                onClick={() => onPaletteChange(palette)}
                className="p-4 rounded border-2 transition-all hover:scale-105 relative overflow-hidden"
                style={{
                  borderColor: currentPalette.name === palette.name ? palette.primary : '#333',
                  backgroundColor: '#111'
                }}
              >
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${palette.primary}44, ${palette.secondary}44)`
                  }}
                />
                <div className="relative text-xs font-bold" style={{ color: palette.primary }}>
                  {palette.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Blend */}
        <div className="border-2 p-4 rounded" style={{ borderColor: currentPalette.primary }}>
          <h3 className="text-lg mb-3" style={{ color: currentPalette.primary }}>&gt; CUSTOM_BLEND:</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: currentPalette.primary }}>COLOR_1:</label>
              <input
                type="color"
                value={customColors.color1}
                onChange={(e) => onCustomColorsChange({ ...customColors, color1: e.target.value })}
                className="w-full h-12 rounded border-2 cursor-pointer"
                style={{ borderColor: currentPalette.primary }}
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: currentPalette.primary }}>COLOR_2:</label>
              <input
                type="color"
                value={customColors.color2}
                onChange={(e) => onCustomColorsChange({ ...customColors, color2: e.target.value })}
                className="w-full h-12 rounded border-2 cursor-pointer"
                style={{ borderColor: currentPalette.primary }}
              />
            </div>
          </div>
          <button
            onClick={handleCustomBlend}
            className="w-full py-3 rounded font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: `${currentPalette.primary}44`,
              border: `2px solid ${currentPalette.primary}`,
              color: currentPalette.primary
            }}
          >
            &gt; APPLY_CUSTOM_BLEND
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function InfratecHUDCRM() {
  const [mounted, setMounted] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(NEON_PALETTES.cyan);
  const [sphereType, setSphereType] = useState('holographic');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [customColors, setCustomColors] = useState({ color1: '#00ffff', color2: '#0088ff' });
  const [glitchEffect, setGlitchEffect] = useState(false);

  useEffect(() => setMounted(true), []);

  const modules = [
    { id: 'dashboard', name: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'ops', name: 'OPERATIONS', icon: Activity },
    { id: 'intel', name: 'INTEL', icon: Database },
    { id: 'comms', name: 'COMMS', icon: Radio },
    { id: 'assets', name: 'ASSETS', icon: Package },
    { id: 'config', name: 'CONFIG', icon: Settings }
  ];

  const stats = [
    { label: 'ACTIVE_AGENTS', value: '248', icon: Users, trend: '+12%' },
    { label: 'MISSIONS_TODAY', value: '18', icon: Zap, trend: '+5' },
    { label: 'FIELD_OPS', value: '12/15', icon: Radio, trend: '80%' },
    { label: 'SYS_STATUS', value: 'OPTIMAL', icon: Cpu, trend: '100%' }
  ];

  const handleModuleChange = (moduleId) => {
    setGlitchEffect(true);
    setTimeout(() => {
      setActiveModule(moduleId);
      setGlitchEffect(false);
    }, 200);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      {/* Grid de fondo animado */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${currentPalette.primary} 1px, transparent 1px),
            linear-gradient(90deg, ${currentPalette.primary} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridScroll 20s linear infinite'
        }}
      />

      {/* Líneas de escaneo */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            ${currentPalette.primary} 0px,
            transparent 2px,
            transparent 4px
          )`,
          animation: 'scan 3s linear infinite'
        }}
      />

      {/* Orbe flotante draggable */}
      {mounted && (
        <ChamiOrbClient
          sphereType={sphereType}
          palette={currentPalette}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleListening={() => setIsListening(!isListening)}
        />
      )}

      {/* Panel de personalización */}
      <CustomizationPanel
        isOpen={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        currentPalette={currentPalette}
        onPaletteChange={setCurrentPalette}
        sphereType={sphereType}
        onSphereChange={setSphereType}
        customColors={customColors}
        onCustomColorsChange={setCustomColors}
      />

      {/* Header HUD */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 border-b-2 backdrop-blur-md"
        style={{ 
          borderColor: currentPalette.primary,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          boxShadow: `0 0 20px ${currentPalette.glow}`
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="text-2xl font-bold tracking-wider"
              style={{ 
                color: currentPalette.primary,
                textShadow: `0 0 10px ${currentPalette.glow}`
              }}
            >
              &gt; INFRATEC_HUD
            </div>
            <div className="text-sm opacity-70" style={{ color: currentPalette.primary }}>
              SYS_v2.5.1 | ONLINE
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCustomizationOpen(true)}
              className="px-4 py-2 rounded border-2 transition-all hover:scale-105"
              style={{
                borderColor: currentPalette.primary,
                backgroundColor: `${currentPalette.primary}22`,
                color: currentPalette.primary
              }}
            >
              <Palette className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded border-2"
              style={{ borderColor: currentPalette.primary, backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <div 
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: currentPalette.primary }}
              />
              <span style={{ color: currentPalette.primary }}>ADMIN_USER</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside 
        className="fixed left-0 top-16 bottom-0 w-48 border-r-2 backdrop-blur-md z-30"
        style={{ 
          borderColor: currentPalette.primary,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      >
        <nav className="p-4 space-y-2">
          {modules.map(module => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleChange(module.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded transition-all hover:scale-105"
                style={{
                  backgroundColor: isActive ? `${currentPalette.primary}33` : 'transparent',
                  border: `2px solid ${isActive ? currentPalette.primary : 'transparent'}`,
                  color: currentPalette.primary,
                  boxShadow: isActive ? `0 0 15px ${currentPalette.glow}` : 'none'
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-bold">{module.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-48 mt-16 p-8">
        <div className={glitchEffect ? 'animate-glitch' : ''}>
          {/* Stats HUD */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="relative p-6 rounded border-2 backdrop-blur-sm group hover:scale-105 transition-all"
                  style={{
                    borderColor: currentPalette.primary,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    boxShadow: `0 0 20px ${currentPalette.glow}`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8" style={{ color: currentPalette.primary }} />
                    <span 
                      className="text-sm font-bold px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: `${currentPalette.primary}33`,
                        color: currentPalette.primary
                      }}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: currentPalette.primary }}>
                    {stat.value}
                  </div>
                  <div className="text-sm opacity-70" style={{ color: currentPalette.primary }}>
                    {stat.label}
                  </div>

                  {/* Barra de escaneo */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 animate-scan-bar"
                    style={{ backgroundColor: currentPalette.primary }}
                  />
                </div>
              );
            })}
          </div>

          {/* Terminal Output Simulado */}
          <div 
            className="border-2 rounded p-6 backdrop-blur-sm"
            style={{
              borderColor: currentPalette.primary,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              boxShadow: `0 0 20px ${currentPalette.glow}`
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5" style={{ color: currentPalette.primary }} />
              <span style={{ color: currentPalette.primary }}>&gt; SYSTEM_LOG</span>
            </div>
            <div className="space-y-2 text-sm font-mono" style={{ color: currentPalette.primary }}>
              <div className="opacity-70">[12:45:32] SYSTEM_INIT_COMPLETE</div>
              <div className="opacity-70">[12:45:33] LOADING_MODULES... OK</div>
              <div className="opacity-70">[12:45:34] AI_CORE_ONLINE</div>
              <div className="animate-pulse">[12:45:35] &gt; AWAITING_COMMANDS_</div>
            </div>
          </div>
        </div>
      </main>

      {/* Estilos globales */}
      <style jsx>{`
        @keyframes gridScroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes scan-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-scan-bar {
          animation: scan-bar 2s ease-in-out infinite;
        }
        .animate-glitch {
          animation: glitch 0.2s;
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
        }
      `}</style>
    </div>
  );
}
