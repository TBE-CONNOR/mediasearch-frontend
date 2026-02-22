import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Deterministic pseudo-random rotations to avoid impure render calls
const ROTATE_VALUES = [
  -8, 5, -3, 10, -6, 7, -2, 9, -4, 1, 6, -10, 3, -7, 8, -5, 2, -1, 4, -9,
];

interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
  objectPosition?: string;
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, [testimonials.length]);

  const isActive = (index: number) => index === active;

  useEffect(() => {
    if (autoplay && !reducedMotion) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, reducedMotion, handleNext]);

  const rotations = useMemo(
    () =>
      testimonials.map(
        (_, i) => ROTATE_VALUES[i % ROTATE_VALUES.length],
      ),
    [testimonials],
  );

  return (
    <div
      className={cn(
        'mx-auto max-w-sm px-4 py-20 md:max-w-4xl md:px-8 lg:px-12',
        className,
      )}
    >
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={reducedMotion ? false : {
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: rotations[index],
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : rotations[index],
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) && !reducedMotion ? [0, -80, 0] : 0,
                  }}
                  exit={reducedMotion ? undefined : {
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: rotations[index],
                  }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.4,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover"
                    style={{ objectPosition: testimonial.objectPosition ?? 'center' }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-4" aria-live="polite">
          <span className="sr-only">
            Testimonial {active + 1} of {testimonials.length}
          </span>
          <motion.div
            key={active}
            initial={reducedMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? undefined : { y: -20, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeInOut' }}
          >
            <h3 className="text-2xl font-bold text-white">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-zinc-400">
              {testimonials[active].designation}
            </p>
            <p className="mt-8 text-lg text-zinc-300">
              {reducedMotion
                ? testimonials[active].quote
                : testimonials[active].quote.split(' ').map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: 'easeInOut',
                        delay: 0.02 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
            </p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="group/button flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800"
            >
              <ArrowLeft className="h-5 w-5 text-white motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/button:rotate-12" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="group/button flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800"
            >
              <ArrowRight className="h-5 w-5 text-white motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/button:-rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
