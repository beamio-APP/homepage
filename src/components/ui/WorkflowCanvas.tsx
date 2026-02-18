import React, { useEffect, useRef } from 'react';

const WorkflowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const packets: Array<{
      progress: number;
      speed: number;
      type: 'voucher' | 'usdc';
      reset: () => void;
      update: () => void;
      draw: () => void;
    }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const createPacket = () => {
      return {
        progress: 0,
        speed: 0.006 + Math.random() * 0.002,
        type: (Math.random() > 0.5 ? 'voucher' : 'usdc') as 'voucher' | 'usdc',
        reset() {
          this.progress = 0;
          this.speed = 0.006 + Math.random() * 0.002;
          this.type = (Math.random() > 0.5 ? 'voucher' : 'usdc') as 'voucher' | 'usdc';
        },
        update() {
          this.progress += this.speed;
          if (this.progress >= 1) this.reset();
        },
        draw() {
          const p1 = { x: width * 0.15, y: height / 2 };
          const p2 = { x: width * 0.5, y: height / 2 };
          const p3 = { x: width * 0.85, y: height / 2 };

          if (this.progress < 0.5) {
            const t = this.progress * 2;
            const curX = p1.x + (p2.x - p1.x) * t;
            const curY = p1.y - Math.sin(t * Math.PI) * 30;
            ctx.fillStyle = this.type === 'voucher' ? '#7c3aed' : '#1562f0';
            ctx.beginPath();
            ctx.arc(curX, curY, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            const t = (this.progress - 0.5) * 2;
            const curX = p2.x + (p3.x - p2.x) * t;
            const curY = p2.y;
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(curX, curY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(curX - 10, curY);
            ctx.lineTo(curX, curY);
            ctx.stroke();
          }
        },
      };
    };

    const drawNodes = () => {
      const y = height / 2;
      const x1 = width * 0.15;
      const x2 = width * 0.5;
      const x3 = width * 0.85;

      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2, y);
      ctx.lineTo(x3, y);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(x1, y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('EXPRESS PAY', x1, y + 45);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x1 - 8, y - 6, 16, 12);

      const pulse = 40 + Math.sin(Date.now() * 0.003) * 5;
      ctx.fillStyle = 'rgba(124, 58, 237, 0.2)';
      ctx.beginPath();
      ctx.arc(x2, y, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x2, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#7c3aed';
      ctx.font = 'bold 11px Inter';
      ctx.fillText('SMART ROUTING', x2, y + 45);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter';
      ctx.fillText('Priority 1 -> 2', x2, y + 60);

      ctx.fillStyle = '#1e293b';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(x3, y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter';
      ctx.fillText('MERCHANT', x3, y + 45);
      ctx.beginPath();
      ctx.moveTo(x3 - 6, y);
      ctx.lineTo(x3 - 2, y + 4);
      ctx.lineTo(x3 + 6, y - 4);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    let animId: number;
    const animate = () => {
      if (!canvas || !ctx || width === 0) return;
      ctx.clearRect(0, 0, width, height);
      drawNodes();
      packets.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };

    resize();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => packets.push(createPacket()), i * 500);
    }

    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full h-[320px] bg-slate-900 border-t border-b border-slate-200 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <div className="inline-flex items-center gap-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 shadow-lg">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">
              Priority 1: Voucher
            </span>
          </div>
          <div className="text-slate-500">→</div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">
              Priority 2: USDC
            </span>
          </div>
          <div className="text-slate-500">→</div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-[10px] font-bold text-slate-300 uppercase">
              Settlement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
