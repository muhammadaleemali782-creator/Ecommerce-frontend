import React, { useEffect, useRef } from "react";

export default function ElementalEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let isVisible = true;

    // Reduce particles on mobile to save GPU
    const isMobile = window.innerWidth < 768;
    const NUM_PARTICLES = isMobile ? 28 : 55;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pause animation when canvas is off-screen (saves battery + GPU)
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const particles = [];

    function resetParticle(p) {
      const type = Math.floor(Math.random() * 5);
      p.type = type;
      p.life = 0;
      p.maxLife = 40 + Math.random() * 50;
      p.size = 1.5 + Math.random() * 3;

      if (type === 0) {
        p.baseX = 0.65; p.baseY = 0.28;
        p.vx = (Math.random() - 0.5) * 0.7;
        p.vy = -(1.2 + Math.random() * 1.5);
        p.r = 255; p.g = 100; p.b = 20;
      } else if (type === 1) {
        p.baseX = 0.32; p.baseY = 0.28;
        p.vx = (Math.random() - 0.5) * 1.1;
        p.vy = -(0.7 + Math.random() * 1.1);
        p.r = 180; p.g = 220; p.b = 255;
      } else if (type === 2) {
        p.baseX = 0.48; p.baseY = 0.28;
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 18;
        p.ox = Math.cos(angle) * dist;
        p.oy = Math.sin(angle) * dist;
        p.vx = -Math.sin(angle) * 0.6;
        p.vy = Math.cos(angle) * 0.6;
        p.r = 100; p.g = 220; p.b = 255;
      } else if (type === 3) {
        p.baseX = 0.80; p.baseY = 0.50;
        p.vx = (Math.random() - 0.4) * 0.8;
        p.vy = -(0.4 + Math.random() * 0.8);
        p.r = 120; p.g = 240; p.b = 100;
      } else {
        p.baseX = 0.16; p.baseY = 0.48;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = -(0.3 + Math.random() * 0.5);
        p.r = 255; p.g = 170; p.b = 40;
      }

      p.x = p.baseX * canvas.width + (p.ox || (Math.random() - 0.5) * 14);
      p.y = p.baseY * canvas.height + (p.oy || (Math.random() - 0.5) * 14);
      return p;
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p = resetParticle({});
      p.life = Math.floor(Math.random() * p.maxLife);
      particles.push(p);
    }

    // shadowBlur set ONCE globally (per-particle setting is very expensive)
    ctx.shadowBlur = isMobile ? 0 : 6;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 1) {
          p.x += Math.sin(p.life * 0.1) * 0.8;
        }

        const alpha = Math.max(0, (1 - p.life / p.maxLife) * 0.75);
        const size = Math.max(0.1, p.size * (1 - p.life / (p.maxLife * 1.5)));

        ctx.shadowColor = `rgba(${p.r},${p.g},${p.b},1)`;
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) resetParticle(p);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
