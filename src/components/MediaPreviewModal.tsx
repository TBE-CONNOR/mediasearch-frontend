import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, FileText } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  contentType: string;
  mediaUrl?: string;
  fileName: string;
}

export function MediaPreviewModal({
  open,
  onClose,
  contentType,
  mediaUrl,
  fileName,
}: MediaPreviewModalProps) {
  const reducedMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Lock body scroll when open; save & restore focus trigger
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      // Restore focus to the element that opened the modal
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open]);

  // Focus the close button on open
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // ESC key handler
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Tab trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !overlayRef.current) return;
    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), video, audio',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const isImage = contentType.startsWith('image/');
  const isVideo = contentType.startsWith('video/');
  const isAudio = contentType.startsWith('audio/');

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${fileName}`}
          onKeyDown={handleKeyDown}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Media content */}
          <motion.div
            className="relative max-h-[90vh] max-w-[90vw]"
            initial={reducedMotion ? false : { scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {isImage && mediaUrl && (
              <img
                src={mediaUrl}
                alt={fileName}
                className="max-h-[85vh] max-w-full rounded-lg object-contain"
              />
            )}

            {isVideo && mediaUrl && (
              // eslint-disable-next-line jsx-a11y/media-has-caption -- user-uploaded media, no caption tracks
              <video
                src={mediaUrl}
                controls
                autoPlay
                aria-label={`Video: ${fileName}`}
                className="max-h-[85vh] max-w-full rounded-lg"
              />
            )}

            {isAudio && mediaUrl && (
              <div className="flex w-80 flex-col items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
                <Music className="h-16 w-16 text-zinc-500" />
                <p className="max-w-full truncate text-base font-medium text-white">
                  {fileName}
                </p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption -- user-uploaded media */}
                <audio
                  controls
                  autoPlay
                  src={mediaUrl}
                  aria-label={`Audio: ${fileName}`}
                  className="w-full"
                />
              </div>
            )}

            {!isImage && !isVideo && !isAudio && (
              <div className="flex w-64 flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
                <FileText className="h-16 w-16 text-zinc-500" />
                <p className="max-w-full truncate text-base text-zinc-400">
                  {fileName}
                </p>
                <p className="text-sm text-zinc-600">Preview not available</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
