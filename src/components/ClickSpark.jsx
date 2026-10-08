'use client';

import { useRef, useEffect, useCallback } from 'react';

// Local changes vs React Bits:
// - `global`: sparks fire on clicks anywhere on the page through a fixed,
//   click-through canvas instead of wrapping children
// - the draw loop only runs while sparks are alive (no idle full-screen clears)
// - `sparkColors` cycles colours per spark
const ClickSpark = ({
  sparkColor = '#fff',
  sparkColors,
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  global = false,
  children
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = global ? null : canvas.parentElement;
    let resizeTimeout;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = parent
        ? parent.getBoundingClientRect()
        : { width: window.innerWidth, height: window.innerHeight };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    let ro;
    if (parent) {
      ro = new ResizeObserver(handleResize);
      ro.observe(parent);
    } else {
      window.addEventListener('resize', handleResize);
    }

    resizeCanvas();

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [global]);

  const easeFunc = useCallback(
    t => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  const draw = useCallback(
    timestamp => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        if (elapsed < 0) return true;

        const eased = easeFunc(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        ctx.strokeStyle = spark.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(spark.x + distance * Math.cos(spark.angle), spark.y + distance * Math.sin(spark.angle));
        ctx.lineTo(
          spark.x + (distance + lineLength) * Math.cos(spark.angle),
          spark.y + (distance + lineLength) * Math.sin(spark.angle)
        );
        ctx.stroke();
        return true;
      });

      rafRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : null;
    },
    [duration, easeFunc, extraScale, sparkRadius, sparkSize]
  );

  const spawn = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const now = performance.now();
      const palette = sparkColors?.length ? sparkColors : [sparkColor];
      sparksRef.current.push(
        ...Array.from({ length: sparkCount }, (_, i) => ({
          x,
          y,
          angle: (2 * Math.PI * i) / sparkCount,
          color: palette[i % palette.length],
          startTime: now
        }))
      );
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    },
    [draw, sparkColor, sparkColors, sparkCount]
  );

  useEffect(() => {
    if (!global) return;
    const onClick = e => spawn(e.clientX, e.clientY);
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [global, spawn]);

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

  if (global) {
    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 150,
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
      onClick={e => spawn(e.clientX, e.clientY)}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          userSelect: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
