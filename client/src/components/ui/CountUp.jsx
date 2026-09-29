import { useEffect, useRef, useState } from 'react';

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/** Counts from 0 to `value` when scrolled into view. Renders tabular figures. */
export default function CountUp({ value, duration = 1400, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !Number.isFinite(Number(value))) {
      setDisplay(Number(value) || 0);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / duration, 1);
          setDisplay(Math.round(easeOut(p) * Number(value)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {display.toLocaleString('en-US')}
    </span>
  );
}
