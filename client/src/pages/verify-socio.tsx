import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useCallback, useState } from "react";

interface GyroState {
  beta: number;
  gamma: number;
  alpha: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  permitted: boolean;
}

function useDeviceMotion() {
  const [gyro, setGyro] = useState<GyroState>({
    beta: 0, gamma: 0, alpha: 0,
    accelX: 0, accelY: 0, accelZ: 0,
    permitted: false,
  });
  const smoothed = useRef({ beta: 0, gamma: 0, alpha: 0, accelX: 0, accelY: 0, accelZ: 0 });
  const rafId = useRef<number>(0);
  const raw = useRef({ beta: 0, gamma: 0, alpha: 0, accelX: 0, accelY: 0, accelZ: 0 });

  useEffect(() => {
    let active = true;
    const lerp = 0.12;

    const onOrientation = (e: DeviceOrientationEvent) => {
      raw.current.beta = e.beta ?? 0;
      raw.current.gamma = e.gamma ?? 0;
      raw.current.alpha = e.alpha ?? 0;
    };

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (a) {
        raw.current.accelX = a.x ?? 0;
        raw.current.accelY = a.y ?? 0;
        raw.current.accelZ = a.z ?? 0;
      }
    };

    const tick = () => {
      if (!active) return;
      const s = smoothed.current;
      const r = raw.current;
      s.beta += (r.beta - s.beta) * lerp;
      s.gamma += (r.gamma - s.gamma) * lerp;
      s.alpha += (r.alpha - s.alpha) * lerp;
      s.accelX += (r.accelX - s.accelX) * lerp;
      s.accelY += (r.accelY - s.accelY) * lerp;
      s.accelZ += (r.accelZ - s.accelZ) * lerp;
      setGyro({
        beta: s.beta, gamma: s.gamma, alpha: s.alpha,
        accelX: s.accelX, accelY: s.accelY, accelZ: s.accelZ,
        permitted: true,
      });
      rafId.current = requestAnimationFrame(tick);
    };

    const setup = () => {
      window.addEventListener("deviceorientation", onOrientation);
      window.addEventListener("devicemotion", onMotion);
      rafId.current = requestAnimationFrame(tick);
    };

    const doeType = typeof (DeviceOrientationEvent as any).requestPermission;
    if (doeType === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((state: string) => { if (state === "granted") setup(); })
        .catch(() => {});
    } else if ("DeviceOrientationEvent" in window) {
      setup();
    }

    return () => {
      active = false;
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("devicemotion", onMotion);
    };
  }, []);

  return gyro;
}

function CosmicBackground({ gyro }: { gyro: GyroState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; baseX: number; baseY: number; r: number; phase: number; speed: number; dy: number; layer: number }[] = [];
    const nebulae: { x: number; y: number; r: number; color: string; phaseX: number; phaseY: number; speedX: number; speedY: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      const bx = Math.random() * canvas.width;
      const by = Math.random() * canvas.height;
      stars.push({
        x: bx, y: by,
        baseX: bx, baseY: by,
        r: Math.random() * 1.8 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.7,
        dy: 0.05 + Math.random() * 0.15,
        layer: Math.random() < 0.3 ? 2 : Math.random() < 0.6 ? 1 : 0,
      });
    }

    const nebulaColors = [
      "rgba(0, 210, 255, 0.06)",
      "rgba(255, 200, 50, 0.05)",
      "rgba(16, 185, 129, 0.05)",
    ];
    for (let i = 0; i < 3; i++) {
      nebulae.push({
        x: canvas.width * (0.2 + i * 0.3),
        y: canvas.height * (0.3 + i * 0.15),
        r: 180 + i * 60,
        color: nebulaColors[i],
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        speedX: 0.0003 + Math.random() * 0.0004,
        speedY: 0.0002 + Math.random() * 0.0003,
      });
    }

    const gyroRef = { gamma: 0, beta: 0 };

    const draw = (time: number) => {
      ctx.fillStyle = "#050a18";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gx = gyroRef.gamma;
      const gy = gyroRef.beta;

      for (const n of nebulae) {
        const nx = n.x + Math.sin(time * n.speedX + n.phaseX) * 80 + gx * 1.5;
        const ny = n.y + Math.cos(time * n.speedY + n.phaseY) * 60 + gy * 1.2;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(nx - n.r, ny - n.r, n.r * 2, n.r * 2);
      }

      for (const s of stars) {
        const parallax = (s.layer + 1) * 0.5;
        const alpha = 0.3 + 0.7 * ((Math.sin(time * 0.001 * s.speed + s.phase) + 1) / 2);
        const sx = s.x + gx * parallax;
        const sy = s.y + gy * parallax * 0.7;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
        s.y -= s.dy;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
      }

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    const interval = setInterval(() => {
      gyroRef.gamma = (window as any).__nftGyroGamma || 0;
      gyroRef.beta = (window as any).__nftGyroBeta || 0;
    }, 16);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    (window as any).__nftGyroGamma = gyro.gamma * 0.6;
    (window as any).__nftGyroBeta = (gyro.beta - 45) * 0.4;
  }, [gyro.gamma, gyro.beta]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}

function ParticleField({ gyro }: { gyro: GyroState }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const colors = ["#00d2ff", "#ffc832", "#10b981"];
    const timers: ReturnType<typeof setTimeout>[] = [];

    const interval = setInterval(() => {
      const p = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      const left = Math.random() * 100;
      const dur = 6 + Math.random() * 8;
      const drift = (gyro.gamma || 0) * 0.8;
      Object.assign(p.style, {
        position: "absolute",
        bottom: "-10px",
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        opacity: "0",
        animation: `nft-particle-rise ${dur}s ease-out forwards`,
        pointerEvents: "none",
        "--drift": `${drift}px`,
      } as any);
      container.appendChild(p);
      const t = setTimeout(() => p.remove(), dur * 1000);
      timers.push(t);
    }, 400);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [gyro.gamma]);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}
    />
  );
}

const statusLabels: Record<string, string> = {
  activo: "Activo",
  suspendido: "Suspendido",
  separado: "Separado",
  excluido: "Excluido",
};

const typeLabels: Record<string, string> = {
  consumo: "Socio de Consumo",
  produccion: "Socio de Producción",
  instructor: "Instructor Cooperativista",
};

function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const chars = "0123456789abcdef";
  let h = "0x";
  let seed = Math.abs(hash);
  for (let i = 0; i < 40; i++) {
    seed = (seed * 16807 + 12345) & 0x7fffffff;
    h += chars[seed % 16];
  }
  return h;
}

function generateNftSeed(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededColor(seed: number, offset: number): string {
  const s = ((seed * 16807 + offset * 12345) & 0x7fffffff) % 360;
  return `hsl(${s}, 80%, 60%)`;
}

export default function VerifySocioPage() {
  const params = useParams<{ numero: string }>();
  const numero = params.numero || "";
  const cardRef = useRef<HTMLDivElement>(null);
  const hash = generateHash(numero);
  const nftSeed = generateNftSeed(numero);
  const gyro = useDeviceMotion();

  const accent1 = seededColor(nftSeed, 0);
  const accent2 = seededColor(nftSeed, 1);
  const accent3 = seededColor(nftSeed, 2);

  const { data, isLoading, error } = useQuery<{
    valid: boolean;
    membershipNumber?: string;
    fullName?: string;
    status?: string;
    membershipType?: string;
    acceptedAt?: string;
    certificateIssuedAt?: string;
    message?: string;
  }>({
    queryKey: ["/api/verify/socio", numero],
    queryFn: async () => {
      const res = await fetch(`/api/verify/socio/${numero}`);
      if (!res.ok && res.status !== 404) {
        throw new Error(`Error del servidor (${res.status})`);
      }
      return res.json();
    },
    enabled: !!numero,
    retry: false,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || gyro.permitted) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
  }, [gyro.permitted]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card || gyro.permitted) return;
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
  }, [gyro.permitted]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !gyro.permitted) return;
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const rotY = clamp(gyro.gamma * 0.5, -20, 20);
    const rotX = clamp(-(gyro.beta - 45) * 0.4, -20, 20);
    card.style.transform = `perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
  }, [gyro.gamma, gyro.beta, gyro.permitted]);

  const holoAngleOffset = gyro.permitted
    ? Math.round(gyro.alpha % 360)
    : 0;

  const isValid = data?.valid === true;
  const isNotFound = !isLoading && !error && data?.valid === false;
  const isNetworkError = !isLoading && !!error;
  const isErrorState = isNotFound || isNetworkError;
  const isActive = data?.status === "activo";

  const fields = data ? [
    { label: "Número de Socio", value: data.membershipNumber || "", isCyan: true },
    { label: "Nombre Completo", value: data.fullName || "", isBold: true },
    { label: "Tipo de Membresía", value: typeLabels[data.membershipType || "consumo"] || data.membershipType || "" },
    { label: "Estado", value: statusLabels[data.status || "activo"] || data.status || "", isBadge: true, isActive },
    {
      label: "Miembro desde",
      value: data.acceptedAt
        ? new Date(data.acceptedAt).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
        : "—",
    },
  ] : [];

  const patternType = nftSeed % 4;

  return (
    <>
      <style>{`
        @property --holo-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes nft-holo-spin {
          to { --holo-angle: 360deg; }
        }

        @keyframes nft-particle-rise {
          0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
          15% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-100vh) translateX(var(--drift, 0px)) scale(0.2); }
        }

        @keyframes nft-card-enter {
          0% { opacity: 0; transform: perspective(800px) translateY(80px) rotateX(15deg) scale(0.92); }
          100% { opacity: 1; transform: perspective(800px) translateY(0) rotateX(0) scale(1); }
        }

        @keyframes nft-scan-lines {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }

        @keyframes nft-light-sweep {
          0% { transform: translateX(-100%) rotate(-45deg); }
          100% { transform: translateX(200%) rotate(-45deg); }
        }

        @keyframes nft-icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes nft-ring-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes nft-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes nft-fade-in-left {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes nft-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        @keyframes nft-glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.4), 0 0 20px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 12px rgba(16,185,129,0.6), 0 0 30px rgba(16,185,129,0.3); }
        }

        @keyframes nft-deblur {
          0% { filter: blur(8px); opacity: 0; }
          100% { filter: blur(0); opacity: 1; }
        }

        @keyframes nft-skeleton-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes nft-helix-node {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes nft-pattern-drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
          100% { transform: translate(0, 0); }
        }

        .nft-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .nft-card-wrapper {
          position: relative;
          z-index: 2;
          width: 480px;
          animation: nft-card-enter 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: transform 0.15s ease-out;
        }

        .nft-holo-border {
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: conic-gradient(from var(--holo-angle), ${accent1}, ${accent2}, ${accent3}, ${accent1});
          animation: nft-holo-spin 4s linear infinite;
          z-index: -1;
        }

        .nft-holo-border.error-border {
          background: conic-gradient(from var(--holo-angle), #ef4444, #f97316, #ef4444, #dc2626, #ef4444);
        }

        .nft-card {
          position: relative;
          background: linear-gradient(165deg, rgba(10,15,30,0.97), rgba(15,20,40,0.99));
          border-radius: 20px;
          overflow: hidden;
          padding: 32px 28px;
        }

        .nft-gen-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          pointer-events: none;
          z-index: 0;
          animation: nft-pattern-drift 20s ease-in-out infinite;
        }

        .nft-scan-lines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.015) 2px,
            rgba(255,255,255,0.015) 4px
          );
          animation: nft-scan-lines 0.3s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        .nft-light-sweep {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 2;
        }

        .nft-light-sweep::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 40%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.04),
            transparent
          );
          animation: nft-light-sweep 6s ease-in-out infinite;
        }

        .nft-card-content {
          position: relative;
          z-index: 3;
        }

        .nft-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .nft-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .nft-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nft-logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, ${accent1}, ${accent2});
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          animation: nft-icon-pulse 3s ease-in-out infinite;
        }

        .nft-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.3px;
        }

        .nft-logo-text em {
          color: ${accent1};
          font-style: normal;
        }

        .nft-badge-chain {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 20px;
          padding: 4px 12px 4px 8px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #10b981;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nft-chain-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: nft-dot-pulse 2s ease-in-out infinite;
        }

        .nft-emblem {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 16px;
        }

        .nft-emblem-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(from 0deg, ${accent1}, ${accent2}, ${accent3}, ${accent1});
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
          animation: nft-ring-spin 6s linear infinite;
        }

        .nft-emblem-inner {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,210,255,0.15), rgba(10,15,30,0.9));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nft-emblem-check {
          font-size: 28px;
          filter: drop-shadow(0 0 8px rgba(16,185,129,0.6));
        }

        .nft-emblem-x {
          font-size: 28px;
          filter: drop-shadow(0 0 8px rgba(239,68,68,0.6));
        }

        .nft-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(90deg, ${accent2}, ${accent1}, ${accent2});
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: nft-shimmer 3s linear infinite;
          margin-bottom: 4px;
        }

        .nft-subtitle {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.5px;
          animation: nft-fade-in-left 1s ease-out 1.2s both;
        }

        .nft-helix {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin: 14px 0 20px;
        }

        .nft-helix-node {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: nft-helix-node 2s ease-in-out infinite;
        }

        .nft-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, ${accent1}4d, transparent);
          margin: 0 0 20px;
        }

        .nft-fields {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .nft-field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 8px;
          transition: background 0.2s;
          animation: nft-fade-in-left 0.6s ease-out both;
        }

        .nft-field-row:hover {
          background: rgba(255,255,255,0.03);
        }

        .nft-field-label {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .nft-field-value {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          color: rgba(255,255,255,0.9);
          text-align: right;
        }

        .nft-field-value.cyan {
          color: ${accent1};
          text-shadow: 0 0 10px ${accent1}66;
        }

        .nft-field-value.bold {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 15px;
        }

        .nft-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 12px;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .nft-status-badge.active {
          background: rgba(16,185,129,0.15);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.3);
          animation: nft-glow-pulse 2s ease-in-out infinite;
        }

        .nft-status-badge.inactive {
          background: rgba(239,68,68,0.15);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.3);
        }

        .nft-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: nft-dot-pulse 1.5s ease-in-out infinite;
        }

        .nft-status-dot.green { background: #10b981; }
        .nft-status-dot.red { background: #ef4444; }

        .nft-footer {
          margin-top: 24px;
          text-align: center;
        }

        .nft-footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          margin-bottom: 16px;
        }

        .nft-hash {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          word-break: break-all;
          animation: nft-deblur 1.5s ease-out 2s both;
          margin-bottom: 10px;
        }

        .nft-legal {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          line-height: 1.5;
          animation: nft-fade-in-left 0.8s ease-out 2.4s both;
        }

        .nft-law {
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          margin-top: 6px;
          animation: nft-fade-in-left 0.8s ease-out 2.8s both;
        }

        .nft-skeleton {
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          animation: nft-skeleton-pulse 1.5s ease-in-out infinite;
        }

        .nft-gyro-indicator {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 10;
          background: rgba(10,15,30,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          backdrop-filter: blur(8px);
        }

        .nft-gyro-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: ${accent1};
          animation: nft-dot-pulse 2s ease-in-out infinite;
        }

        @media (max-width: 520px) {
          .nft-card-wrapper {
            width: 92vw;
          }
          .nft-card {
            padding: 24px 18px;
          }
          .nft-title {
            font-size: 18px;
          }
          .nft-field-label {
            font-size: 10px;
          }
          .nft-field-value {
            font-size: 12px;
          }
          .nft-field-value.bold {
            font-size: 13px;
          }
          .nft-emblem {
            width: 64px;
            height: 64px;
          }
          .nft-emblem-check, .nft-emblem-x {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="nft-page">
        <CosmicBackground gyro={gyro} />
        <ParticleField gyro={gyro} />

        <div
          className="nft-card-wrapper"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-testid="card-nft-certificate"
        >
          <div
            className={`nft-holo-border ${isErrorState ? "error-border" : ""}`}
            style={gyro.permitted ? {
              filter: `hue-rotate(${holoAngleOffset}deg)`,
            } : undefined}
          />
          <div className="nft-card">
            <GenerativePattern seed={nftSeed} accent1={accent1} accent2={accent2} accent3={accent3} type={patternType} />
            <div className="nft-scan-lines" />
            <div className="nft-light-sweep" />
            <div className="nft-card-content">

              <div className="nft-header">
                <div className="nft-header-top">
                  <div className="nft-logo">
                    <div className="nft-logo-icon">C</div>
                    <span className="nft-logo-text">Cedu<em>verse</em></span>
                  </div>
                  <div className="nft-badge-chain" data-testid="badge-on-chain">
                    <div className="nft-chain-dot" />
                    ON-CHAIN
                  </div>
                </div>

                <div className="nft-emblem">
                  <div className="nft-emblem-ring" />
                  <div className="nft-emblem-inner">
                    {isLoading ? (
                      <div className="nft-skeleton" style={{ width: 24, height: 24, borderRadius: "50%" }} />
                    ) : isErrorState ? (
                      <span className="nft-emblem-x">✕</span>
                    ) : (
                      <span className="nft-emblem-check">✓</span>
                    )}
                  </div>
                </div>

                <div className="nft-title" data-testid="text-verify-title">
                  {isLoading ? "Verificando..." : isNetworkError ? "Error de Conexión" : isNotFound ? "Membresía No Encontrada" : "Membresía Verificada"}
                </div>
                <div className="nft-subtitle">
                  {isLoading
                    ? "Consultando blockchain..."
                    : isNetworkError
                      ? "No se pudo verificar en este momento"
                      : isNotFound
                        ? `${numero} no registrado`
                        : "Certificado Digital de Socio Cooperativista"}
                </div>

                <div className="nft-helix">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const colors = [accent1, accent2, accent3];
                    return (
                      <div
                        key={i}
                        className="nft-helix-node"
                        style={{
                          animationDelay: `${i * 0.11}s`,
                          background: colors[i % 3],
                          transform: `translateY(${Math.sin(i * 0.7) * 4}px)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="nft-divider" />

              <div className="nft-fields">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div className="nft-field-row" key={i} style={{ animationDelay: `${0.8 + i * 0.12}s` }}>
                      <div className="nft-skeleton" style={{ width: 90, height: 12 }} />
                      <div className="nft-skeleton" style={{ width: 120 + i * 10, height: 14 }} />
                    </div>
                  ))
                ) : isValid && fields.map((f, i) => (
                  <div
                    className="nft-field-row"
                    key={i}
                    style={{ animationDelay: `${0.8 + i * 0.15}s` }}
                    data-testid={`field-row-${i}`}
                  >
                    <span className="nft-field-label">{f.label}</span>
                    {f.isBadge ? (
                      <span className={`nft-status-badge ${f.isActive ? "active" : "inactive"}`} data-testid="badge-status">
                        <span className={`nft-status-dot ${f.isActive ? "green" : "red"}`} />
                        {f.value}
                      </span>
                    ) : (
                      <span
                        className={`nft-field-value ${f.isCyan ? "cyan" : ""} ${f.isBold ? "bold" : ""}`}
                        data-testid={i === 0 ? "text-membership-number" : i === 1 ? "text-member-name" : undefined}
                      >
                        {f.value}
                      </span>
                    )}
                  </div>
                ))}

                {isNotFound && (
                  <div className="nft-field-row" style={{ justifyContent: "center", animationDelay: "0.8s" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                      El número <span style={{ color: "#ef4444", fontWeight: 700 }}>{numero}</span> no corresponde a un socio registrado.
                    </span>
                  </div>
                )}

                {isNetworkError && (
                  <div className="nft-field-row" style={{ justifyContent: "center", animationDelay: "0.8s" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
                      Ocurrió un error al verificar. Intenta nuevamente más tarde.
                    </span>
                  </div>
                )}
              </div>

              <div className="nft-footer">
                <div className="nft-footer-divider" />
                <div className="nft-hash" data-testid="text-hash">{hash}</div>
                <div className="nft-legal">
                  Verificado por Ceduverse S.C. de C. de R.L. de C.V.
                </div>
                <div className="nft-law">
                  Ref. Ley General de Sociedades Cooperativas, Art. 2, 11 y 12
                </div>
              </div>

            </div>
          </div>
        </div>

        {gyro.permitted && (
          <div className="nft-gyro-indicator" data-testid="indicator-gyro">
            <div className="nft-gyro-dot" />
            MOTION ACTIVE
          </div>
        )}
      </div>
    </>
  );
}

function GenerativePattern({ seed, accent1, accent2, accent3, type }: { seed: number; accent1: string; accent2: string; accent3: string; type: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 480;
    canvas.height = 700;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    let s = seed;
    const rng = () => { s = (s * 16807 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const colors = [accent1, accent2, accent3];

    if (type === 0) {
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(rng() * 480, rng() * 700, 20 + rng() * 80, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i % 3];
        ctx.lineWidth = 0.5 + rng();
        ctx.stroke();
      }
    } else if (type === 1) {
      for (let i = 0; i < 25; i++) {
        const x = rng() * 480;
        const y = rng() * 700;
        const size = 10 + rng() * 60;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng() * Math.PI);
        ctx.beginPath();
        const sides = 3 + Math.floor(rng() * 4);
        for (let j = 0; j <= sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const px = Math.cos(angle) * size;
          const py = Math.sin(angle) * size;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = colors[i % 3];
        ctx.lineWidth = 0.5 + rng() * 0.8;
        ctx.stroke();
        ctx.restore();
      }
    } else if (type === 2) {
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        const startX = rng() * 480;
        const startY = rng() * 700;
        ctx.moveTo(startX, startY);
        for (let j = 0; j < 6; j++) {
          ctx.quadraticCurveTo(
            rng() * 480, rng() * 700,
            rng() * 480, rng() * 700
          );
        }
        ctx.strokeStyle = colors[i % 3];
        ctx.lineWidth = 0.4 + rng() * 0.6;
        ctx.stroke();
      }
    } else {
      for (let i = 0; i < 60; i++) {
        const x = rng() * 480;
        const y = rng() * 700;
        const r = 1 + rng() * 4;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % 3];
        ctx.fill();
      }
      for (let i = 0; i < 12; i++) {
        const x1 = rng() * 480;
        const y1 = rng() * 700;
        const x2 = rng() * 480;
        const y2 = rng() * 700;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = colors[i % 3];
        ctx.lineWidth = 0.3 + rng() * 0.5;
        ctx.stroke();
      }
    }
  }, [seed, accent1, accent2, accent3, type]);

  return (
    <canvas
      ref={canvasRef}
      className="nft-gen-pattern"
      width={480}
      height={700}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
