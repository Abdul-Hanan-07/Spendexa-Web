import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';

/**
 * Counts up from 0 to `value` over `duration` seconds on mount (and re-animates
 * from the previous value whenever `value` changes), rendering each frame
 * through `format`. Honors the user's reduced-motion preference.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.6,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? value : 0);
  const text = useTransform(count, (latest) => format(latest));

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, duration, reduceMotion, count]);

  return <motion.span>{text}</motion.span>;
}
