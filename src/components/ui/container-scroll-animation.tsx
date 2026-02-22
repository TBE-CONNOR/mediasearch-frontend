import { useRef, useSyncExternalStore } from 'react';
import {
  useScroll,
  useTransform,
  motion,
  type MotionValue,
} from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const MD_QUERY = '(max-width: 768px)';
const mq = typeof window !== 'undefined' ? window.matchMedia(MD_QUERY) : null;

function subscribe(callback: () => void) {
  mq?.addEventListener('change', callback);
  return () => mq?.removeEventListener('change', callback);
}

function getSnapshot() {
  return mq?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

function useMobileBreakpoint(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const isMobile = useMobileBreakpoint();
  const reducedMotion = useReducedMotion();

  const scaleDimensions = isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], reducedMotion ? [scaleDimensions[1], scaleDimensions[1]] : scaleDimensions);
  const translate = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [0, -100]);

  return (
    <div
      className="flex h-[35rem] items-center justify-center relative p-2 md:h-[50rem] md:p-20"
      ref={containerRef}
    >
      <div
        className="relative w-full py-10 md:py-40"
        style={{ perspective: '1000px' }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Header({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {titleComponent}
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className="-mt-12 mx-auto h-[30rem] max-w-5xl w-full rounded-[30px] border-4 border-neutral-500 bg-neutral-800 p-2 shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
}
