import { cn } from '@/lib/utils';
import {
  AnimatePresence,
  motion,
  type Transition,
} from 'motion/react';
import {
  Children,
  cloneElement,
  type ReactElement,
  useState,
  useId,
} from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedBackgroundProps {
  children:
    | ReactElement<{ 'data-id': string }>[]
    | ReactElement<{ 'data-id': string }>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(
    defaultValue ?? null,
  );
  const uniqueId = useId();
  const reducedMotion = useReducedMotion();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    if (onValueChange) {
      onValueChange(id);
    }
  };

  return Children.map(children, (child, index) => {
    const id = (child as ReactElement<{ 'data-id': string }>).props['data-id'];

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      key: id ?? index,
      className: cn(
        'relative inline-flex',
        (child as ReactElement<{ className?: string }>).props.className,
      ),
      'data-active': activeId === id ? 'true' : 'false',
      ...interactionProps,
      children: (
        <>
          <AnimatePresence initial={false}>
            {activeId === id && (
              <motion.div
                layoutId={`background-${uniqueId}`}
                className={cn('absolute inset-0', className)}
                transition={reducedMotion ? { duration: 0 } : transition}
                initial={{ opacity: defaultValue ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          <span className="z-10">
            {(child as ReactElement<{ children?: React.ReactNode }>).props.children}
          </span>
        </>
      ),
    });
  });
}
