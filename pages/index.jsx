'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Activity, Zap, Radio, Server, Terminal, 
  Palette, X, Mic, Cpu, Database, Package, Settings
} from 'lucide-react';

const NEON_PALETTES = {
  cyan: { name: 'Cyan Eléctrico', primary: '#00ffff', glow: 'rgba(0, 255, 255, 0.6)' },
  amber: { name: 'Ámbar Radiante', primary: '#ffaa00', glow: 'rgba(255, 170, 0, 0.6)' },
  purple: { name: 'Púrpura Neón', primary: '#aa00ff', glow: 'rgba(170, 0, 255, 0.6)' },
  matrix: { name: 'Verde Matrix', primary: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)' },
  crimson: { name: 'Rojo Carmesí', primary: '#ff0000', glow: 'rgba(255, 0, 0, 0.6)' }
};

function SphereHolographic({ isListening, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 300; canvas.height = 300;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = 150; const centerY = 150;
      const currentColor = isListening ? '#ff0000' : color;
      const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, 80);
      gradient.addColorStop(0, `${currentColor}aa`);
      gradient.addColorStop(1, `${currentColor}00`);
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(centerX, centerY, 80, 0, Math.PI * 2); ctx.fill();
      requestAnimationFrame(animate);
    };
    animate();
  }, [isListening, color]);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function InfratecHUD() {
  const [mounted, setMounted] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(NEON_PALETTES.cyan);
  const [isListening, setIsListening] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden">
      {/* Grid de fondo */}
      <div className="fixed inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(${currentPalette.primary} 1px, transparent 1px), linear-gradient(90deg, ${currentPalette.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      {/* Orbe Draggable */}
      <motion.div drag dragMomentum={false} className="fixed z-50 cursor-move" style={{ width: 220, height: 220, right: 30, bottom: 30 }}>
        <div className="relative w-full h-full rounded-full border-2 bg-black/40 backdrop-blur-md"
             style={{ borderColor: currentPalette.primary, boxShadow: `0 0 30px ${currentPalette.glow}` }}>
          <SphereHolographic isListening={isListening} color={currentPalette.primary} />
          <button onClick={() => setIsListening(!isListening)} 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-full border"
                  style={{ borderColor: currentPalette.primary, backgroundColor: isListening ? '#ff0000aa' : 'transparent' }}>
            <Mic size={16} style={{ color: currentPalette.primary }} />
          </button>
        </div>
      </motion.div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 border-b-2 bg-black/80 backdrop-blur-md z-40 px-8 flex items-center justify-between" style={{ borderColor: currentPalette.primary }}>
        <h1 className="text-xl font-black" style={{ color: currentPalette.primary }}>INFRATEC_HUD_v2</h1>
        <button onClick={() => setConfigOpen(true)} className="p-2 border-2 rounded" style={{ borderColor: currentPalette.primary }}>
          <Palette size={20} style={{ color: currentPalette.primary }} />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-8 grid grid-cols-4 gap-6">
        {[
          { label: 'SYS_LOAD', value: '24%', icon: Zap },
          { label: 'NODES', value: 'OK', icon: Server },
          { label: 'SIGNAL', value: 'STABLE', icon: Radio },
          { label: 'USER', value: 'MARTIN', icon: Activity }
        ].map((s, i) => (
          <div key={i} className="p-6 border-2 bg-black/60" style={{ borderColor: currentPalette.primary }}>
            <s.icon className="mb-2" size={20} style={{ color: currentPalette.primary }} />
            <div className="text-2xl font-bold" style={{ color: currentPalette.primary }}>{s.value}</div>
            <div className="text-[10px] opacity-50 uppercase">{s.label}</div>
          </div>
        ))}

        <div className="col-span-4 border-2 p-6 mt-4 bg-black/40 min-h-[200px]" style={{ borderColor: currentPalette.primary }}>
          <div className="flex items-center gap-2 mb-4 border-b pb-2" style={{ borderColor: `${currentPalette.primary}44` }}>
            <Terminal size={14} style={{ color: currentPalette.primary }} />
            <span className="text-[10px]" style={{ color: currentPalette.primary }}>CONSOLE_OUTPUT</span>
          </div>
          <div className="text-[12px] space-y-1" style={{ color: currentPalette.primary }}>
            <p className="opacity-40">[01:15:02] INITIALIZING_CORE...</p>
            <p className="opacity-70">[01:15:05] NEON_UI_LOADED_SUCCESSFULLY</p>
            <p className="animate-pulse">&gt; READY_FOR_COMMANDS_</p>
          </div>
        </div>
      </main>

      {/* Panel Config */}
      {configOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6">
          <div className="border-2 p-8 max-w-md w-full" style={{ borderColor: currentPalette.primary }}>
            <div className="flex justify-between mb-8">
              <h2 style={{ color: currentPalette.primary }}>UI_COLOR_PALETTE</h2>
              <button onClick={() => setConfigOpen(false)}><X style={{ color: currentPalette.primary }} /></button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(NEON_PALETTES).map(([key, p]) => (
                <button key={key} onClick={() => setCurrentPalette(p)} className="w-full aspect-square border-2" style={{ backgroundColor: p.primary, borderColor: currentPalette.name === p.name ? 'white' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
