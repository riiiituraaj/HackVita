"use client";

import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, RenderTarget, Texture, Triangle } from "ogl";
import { useMotion } from "@/lib/motion";
import { media } from "@/content/hackvita";
import vertex from "@/shaders/quad.vert";
import heroFrag from "@/shaders/hero.frag";
import trailFrag from "@/shaders/trail.frag";

const MAX_DPR = 1.75;
const TRAIL_SCALE = 1 / 8;
const DECAY = 0.965;

/**
 * Full-bleed WebGL canvas behind the hero.
 * Pass 1 (trail): ping-pong render target at 1/8 res, stamped at the mouse.
 * Pass 2 (image): duotone + Bayer dither + scanlines, pixelated by the trail.
 * Falls back to a CSS-dithered static image when WebGL is unavailable.
 */
export function HeroShader() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, finePointer, booted } = useMotion();
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!booted) return; // initialise lazily, after the preloader
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
      });
      if (!renderer.gl) throw new Error("no gl");
    } catch {
      setFallback(true);
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0.0196, 0, 0.0235, 1);
    const dpr = renderer.dpr;
    const geometry = new Triangle(gl);

    const rtOpts = {
      width: 8,
      height: 8,
      depth: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    };
    let rtA = new RenderTarget(gl, rtOpts);
    let rtB = new RenderTarget(gl, rtOpts);

    const trailProgram = new Program(gl, {
      vertex,
      fragment: trailFrag,
      uniforms: {
        uPrev: { value: rtA.texture },
        uMouse: { value: [0.5, 0.5] },
        uPrevMouse: { value: [0.5, 0.5] },
        uStrength: { value: 0 },
        uRadius: { value: 0.2 },
        uAspect: { value: 1 },
        uDecay: { value: DECAY },
      },
      depthTest: false,
      depthWrite: false,
    });
    const trailMesh = new Mesh(gl, { geometry, program: trailProgram });

    const image = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });
    const heroProgram = new Program(gl, {
      vertex,
      fragment: heroFrag,
      uniforms: {
        uImage: { value: image },
        uTrail: { value: rtB.texture },
        uRes: { value: [1, 1] },
        uImgSize: { value: [1600, 900] },
        uDpr: { value: dpr },
        uTime: { value: 0 },
        uHasImage: { value: 0 },
        uMotion: { value: reduced ? 0 : 1 },
      },
      depthTest: false,
      depthWrite: false,
    });
    const heroMesh = new Mesh(gl, { geometry, program: heroProgram });

    let w = 1;
    let h = 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h);
      const tw = Math.max(8, Math.ceil(w * TRAIL_SCALE));
      const th = Math.max(8, Math.ceil(h * TRAIL_SCALE));
      rtA.setSize(tw, th);
      rtB.setSize(tw, th);
      heroProgram.uniforms.uRes.value = [w * dpr, h * dpr];
      trailProgram.uniforms.uAspect.value = w / h;
      trailProgram.uniforms.uRadius.value = 110 / h;
      if (!running) renderOnce();
    };

    // Pointer → canvas UV (GL orientation).
    let px = -1;
    let py = -1;
    let hasPointer = false;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      hasPointer = true;
    };
    const onLeave = () => {
      hasPointer = false;
    };

    let mouse = [0.5, 0.5];
    let prevMouse = [0.5, 0.5];
    let strength = 0;
    let lastPx = -1;
    let lastPy = -1;
    const t0 = performance.now();
    const useGhost = !finePointer;

    const step = (now: number) => {
      const t = (now - t0) / 1000;
      heroProgram.uniforms.uTime.value = t;
      let target = 0;
      if (!reduced) {
        if (useGhost) {
          // Touch devices: a slow automatic "ghost cursor" keeps the mosaic visible.
          const gx = 0.5 + 0.34 * Math.sin(t * 0.37) + 0.08 * Math.sin(t * 1.3);
          const gy = 0.5 + 0.26 * Math.sin(t * 0.53 + 1.0);
          prevMouse = mouse;
          mouse = [gx, gy];
          target = 0.75;
        } else if (hasPointer) {
          const r = canvas.getBoundingClientRect();
          const inside = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
          const speed = lastPx < 0 ? 0 : Math.hypot(px - lastPx, py - lastPy);
          lastPx = px;
          lastPy = py;
          prevMouse = mouse;
          mouse = [(px - r.left) / r.width, 1 - (py - r.top) / r.height];
          target = inside ? Math.min(1, speed / 28) : 0;
          if (!inside) prevMouse = mouse;
        }
      }
      strength += (target - strength) * (target > strength ? 0.5 : 0.2);

      // Pass 1: trail ping-pong.
      trailProgram.uniforms.uPrev.value = rtA.texture;
      trailProgram.uniforms.uMouse.value = mouse;
      trailProgram.uniforms.uPrevMouse.value = prevMouse;
      trailProgram.uniforms.uStrength.value = strength;
      renderer.render({ scene: trailMesh, target: rtB });
      const tmp = rtA;
      rtA = rtB;
      rtB = tmp;

      // Pass 2: image.
      heroProgram.uniforms.uTrail.value = rtA.texture;
      renderer.render({ scene: heroMesh });
    };

    const renderOnce = () => step(performance.now());

    let raf = 0;
    let running = false;
    let visible = true;
    const loop = (now: number) => {
      step(now);
      raf = requestAnimationFrame(loop);
    };
    const update = () => {
      const should = visible && !document.hidden && !reduced;
      if (should && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      image.image = img;
      heroProgram.uniforms.uImgSize.value = [img.naturalWidth, img.naturalHeight];
      heroProgram.uniforms.uHasImage.value = 1;
      if (!running) renderOnce();
      setReady(true);
    };
    img.onerror = () => {
      heroProgram.uniforms.uHasImage.value = 0;
      setReady(true);
    };
    img.src = media.hero;

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      update();
    });
    io.observe(wrap);
    const onVis = () => update();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    update();
    if (reduced) renderOnce();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [booted, reduced, finePointer]);

  return (
    <div className={`hero-gl ${ready ? "is-ready" : ""}`} ref={wrapRef} aria-hidden="true">
      {fallback ? (
        <div className="hero-gl__fallback" style={{ backgroundImage: `url(${media.hero})` }} />
      ) : (
        <canvas ref={canvasRef} key={`${reduced}-${finePointer}`} className="hero-gl__canvas" />
      )}
    </div>
  );
}
