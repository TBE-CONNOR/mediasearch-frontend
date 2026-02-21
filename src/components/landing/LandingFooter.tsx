import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Mail, Phone } from 'lucide-react';
import {
  TextHoverEffect,
  FooterBackgroundGradient,
} from '@/components/ui/hover-footer';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from './data';

export function LandingFooter() {
  const reducedMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden rounded-t-3xl bg-[#0F0F11]/10">
      {/* Giant MEDIASEARCH text — desktop only */}
      <div className="relative hidden h-[20rem] lg:flex items-center justify-center">
        {/* Per-letter bounce entrance overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[52] flex items-center justify-center"
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 0 }}
          viewport={{ once: false }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 1.6 }}
        >
          {'MEDIASEARCH'.split('').map((letter, i) => (
            <motion.span
              key={`${letter}-${i}`}
              className="inline-block text-[8vw] font-bold leading-none font-[helvetica,sans-serif] [-webkit-text-stroke:1.5px_#3b82f6] text-transparent"
              initial={reducedMotion ? false : { opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={reducedMotion ? { duration: 0 } : {
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: i * 0.07,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
        {/* SVG with hover gradient reveal */}
        <TextHoverEffect text="MediaSearch" className="z-50" />
      </div>

      {/* Footer info grid */}
      <div className="relative z-40 mx-auto max-w-7xl px-14 pb-14 pt-8 lg:pt-0">
        <motion.div
          className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-16"
          initial={reducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
        >
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <span className="text-3xl font-bold text-white">MediaSearch</span>
            <p className="text-sm leading-relaxed text-zinc-400">
              Multimodal semantic search powered by AI. Upload anything, find
              everything.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Product</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  to="/sign-up"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/legal#privacy"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal#terms"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal#refund"
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-6 text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-400" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-400" />
                <a
                  href={CONTACT_PHONE_HREF}
                  className="text-zinc-400 transition-colors hover:text-blue-400"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="relative z-40 pb-8 pt-4">
        <p className="text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} MediaSearch. All rights reserved.
        </p>
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
