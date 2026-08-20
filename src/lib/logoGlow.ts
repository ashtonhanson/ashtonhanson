type Pulse = {
  t: number;
  speed: number;
  amp: number;
  phase: number;
  freq: number;
  blur: number;
};

export type LogoGlowState = {
  pulses: Pulse[];
  hx: number;
  hy: number;
  hover: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointOnRoundedRect(
  t: number,
  w: number,
  h: number,
  radius: number,
): { x: number; y: number; nx: number; ny: number } {
  const r = clamp(radius, 0, Math.min(w, h) / 2);
  const horiz = Math.max(0, w - 2 * r);
  const vert = Math.max(0, h - 2 * r);
  const arc = Math.PI * 0.5 * r;
  const perim = 2 * horiz + 2 * vert + 4 * arc;
  let d = (((t % 1) + 1) % 1) * Math.max(perim, 0.0001);

  if (d <= horiz) {
    const u = horiz === 0 ? 0 : d / horiz;
    return { x: r + horiz * u, y: 0, nx: 0, ny: -1 };
  }
  d -= horiz;
  if (d <= arc) {
    const a = -Math.PI / 2 + (arc === 0 ? 0 : (d / arc) * (Math.PI / 2));
    return {
      x: w - r + Math.cos(a) * r,
      y: r + Math.sin(a) * r,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= arc;
  if (d <= vert) {
    const u = vert === 0 ? 0 : d / vert;
    return { x: w, y: r + vert * u, nx: 1, ny: 0 };
  }
  d -= vert;
  if (d <= arc) {
    const a = arc === 0 ? 0 : (d / arc) * (Math.PI / 2);
    return {
      x: w - r + Math.cos(a) * r,
      y: h - r + Math.sin(a) * r,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= arc;
  if (d <= horiz) {
    const u = horiz === 0 ? 0 : d / horiz;
    return { x: w - r - horiz * u, y: h, nx: 0, ny: 1 };
  }
  d -= horiz;
  if (d <= arc) {
    const a = Math.PI / 2 + (arc === 0 ? 0 : (d / arc) * (Math.PI / 2));
    return {
      x: r + Math.cos(a) * r,
      y: h - r + Math.sin(a) * r,
      nx: Math.cos(a),
      ny: Math.sin(a),
    };
  }
  d -= arc;
  if (d <= vert) {
    const u = vert === 0 ? 0 : d / vert;
    return { x: 0, y: h - r - vert * u, nx: -1, ny: 0 };
  }
  d -= vert;
  const a = Math.PI + (arc === 0 ? 0 : (d / Math.max(arc, 0.0001)) * (Math.PI / 2));
  return {
    x: r + Math.cos(a) * r,
    y: r + Math.sin(a) * r,
    nx: Math.cos(a),
    ny: Math.sin(a),
  };
}

function nearestPerimeterT(nx: number, ny: number, w: number, h: number, radius: number) {
  const x = clamp(nx, 0, 1) * w;
  const y = clamp(ny, 0, 1) * h;
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i < 48; i += 1) {
    const t = i / 48;
    const p = pointOnRoundedRect(t, w, h, radius);
    const d = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}

export function createLogoGlowState(seed = Math.random() * 0xffffffff): LogoGlowState {
  const rand = mulberry32(seed >>> 0);
  return {
    pulses: Array.from({ length: 5 }, () => ({
      t: rand(),
      speed: (0.005 + rand() * 0.008) * (rand() < 0.5 ? -1 : 1),
      amp: 0.22 + rand() * 0.18,
      phase: rand() * Math.PI * 2,
      freq: 0.08 + rand() * 0.12,
      blur: 14 + rand() * 12,
    })),
    hx: 0.5,
    hy: 0.5,
    hover: 0,
  };
}

export function stepLogoGlow(
  state: LogoGlowState,
  now: number,
  dt: number,
  opts: {
    plateW: number;
    plateH: number;
    radius: number;
    pointerX: number | null;
    pointerY: number | null;
    hovering: boolean;
  },
) {
  const { plateW, plateH, radius, pointerX, pointerY, hovering } = opts;
  const seconds = dt / 1000;
  const follow = 1 - Math.exp(-dt / 90);
  state.hover = lerp(state.hover, hovering ? 1 : 0, 1 - Math.exp(-dt / (hovering ? 120 : 240)));

  if (pointerX != null && pointerY != null) {
    state.hx = lerp(state.hx, pointerX, follow);
    state.hy = lerp(state.hy, pointerY, follow);
  } else {
    state.hx = lerp(state.hx, 0.5, 1 - Math.exp(-dt / 280));
    state.hy = lerp(state.hy, 0.5, 1 - Math.exp(-dt / 280));
  }

  const hoverX = state.hx * plateW;
  const hoverY = state.hy * plateH;
  const hoverT = nearestPerimeterT(state.hx, state.hy, plateW, plateH, radius);
  const rim = pointOnRoundedRect(hoverT, plateW, plateH, radius);

  const layers = [
    "0 0 10px 0px rgba(232, 223, 196, 0.05)",
  ];

  for (const pulse of state.pulses) {
    pulse.t = (pulse.t + pulse.speed * seconds + 1) % 1;
    const breathe =
      0.5 + 0.5 * Math.sin(now * 0.001 * pulse.freq * Math.PI * 2 + pulse.phase);
    const p = pointOnRoundedRect(pulse.t, plateW, plateH, radius);
    const dx = p.x - hoverX;
    const dy = p.y - hoverY;
    const near = Math.exp(-(dx * dx + dy * dy) / Math.max(plateW * plateH * 0.22, 1));
    const glow = pulse.amp * breathe * (0.55 + state.hover * near * 0.45);
    const dist = 4 + glow * 8;
    layers.push(
      `${(p.nx * dist).toFixed(1)}px ${(p.ny * dist).toFixed(1)}px ${(pulse.blur + glow * 10).toFixed(1)}px 0px rgba(232, 223, 196, ${(0.03 + glow * 0.14).toFixed(3)})`,
    );
  }

  if (state.hover > 0.04) {
    const boost = 4 + state.hover * 8;
    layers.push(
      `${(rim.nx * boost).toFixed(1)}px ${(rim.ny * boost).toFixed(1)}px ${(12 + state.hover * 10).toFixed(1)}px 0px rgba(255, 255, 255, ${(0.06 + state.hover * 0.12).toFixed(3)})`,
    );
  }

  return {
    hx: state.hx,
    hy: state.hy,
    hover: state.hover,
    boxShadow: layers.join(", "),
  };
}
