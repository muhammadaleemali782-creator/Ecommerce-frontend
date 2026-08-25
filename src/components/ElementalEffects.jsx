import React, { useEffect, useRef } from "react";

export default function ElementalEffects() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle systems anchored near relative percentage positions:
    // Thumb/Prithvi (Tree & floating glowing spores/leaves): x: ~80%, y: ~52%
    // Index/Agni (Dancing Fire flames & embers): x: ~65%, y: ~28%
    // Middle/Akasha (Cosmic Earth orb glow & rotating stardust): x: ~48%, y: ~28%
    // Ring/Vayu (Rising swirling mist/air smoke): x: ~32%, y: ~28%
    // Pinky/Jala-Prithvi (Amber glowing core & crystal particles): x: ~16%, y: ~48%

    const particles = [];
    const NUM_PARTICLES = 70;

    function resetParticle(p) {
      const type = Math.floor(Math.random() * 5); // 0: Fire, 1: Smoke/Air, 2: Cosmos/Globe, 3: Spore/Leaf, 4: Amber/Water
      p.type = type;
      p.life = 0;
      p.maxLife = 40 + Math.random() * 50;
      p.size = 1.5 + Math.random() * 3;

      if (type === 0) {
        // Fire on Ring finger tip (Agni)
        p.baseX = 0.65;
        p.baseY = 0.28;
        p.vx = (Math.random() - 0.5) * 0.7;
        p.vy = -(1.2 + Math.random() * 1.5);
        p.color = Math.random() > 0.4 ? "rgba(255, 100, 20," : "rgba(255, 210, 50,";
      } else if (type === 1) {
        // Swirling Smoke / Air (Vayu)
        p.baseX = 0.32;
        p.baseY = 0.28;
        p.vx = (Math.random() - 0.5) * 1.1;
        p.vy = -(0.7 + Math.random() * 1.1);
        p.color = "rgba(180, 220, 255,";
      } else if (type === 2) {
        // Cosmic stardust around Earth orb (Akasha)
        p.baseX = 0.48;
        p.baseY = 0.28;
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 18;
        p.ox = Math.cos(angle) * dist;
        p.oy = Math.sin(angle) * dist;
        p.vx = -Math.sin(angle) * 0.6;
        p.vy = Math.cos(angle) * 0.6;
        p.color = "rgba(100, 220, 255,";
      } else if (type === 3) {
        // Tree / Spores / Floating leaves (Prithvi)
        p.baseX = 0.80;
        p.baseY = 0.50;
        p.vx = (Math.random() - 0.4) * 0.8;
        p.vy = -(0.4 + Math.random() * 0.8);
        p.color = Math.random() > 0.5 ? "rgba(120, 240, 100," : "rgba(230, 210, 80,";
      } else {
        // Amber orb on pinky (Jala)
        p.baseX = 0.16;
        p.baseY = 0.48;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = -(0.3 + Math.random() * 0.5);
        p.color = "rgba(255, 170, 40,";
      }

      p.x = p.baseX * canvas.width + (p.ox || (Math.random() - 0.5) * 14);
      p.y = p.baseY * canvas.height + (p.oy || (Math.random() - 0.5) * 14);
      return p;
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push(resetParticle({}));
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 1) {
          // Swirling wave motion for air
          p.x += Math.sin(p.life * 0.1) * 0.8;
        }

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / (p.maxLife * 1.5)), 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha * 0.75 + ")";
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color + "1)";
        ctx.fill();

        if (p.life >= p.maxLife) {
          resetParticle(p);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
