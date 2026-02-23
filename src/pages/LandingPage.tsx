import { Navigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/store/authStore';
import { TIERS } from '@/config/pricing';
import { HeroSection } from '@/components/ui/hero-section';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { PricingSection } from '@/components/ui/pricing-section';
import { StickyNav } from '@/components/landing/StickyNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FEATURES, HOW_IT_WORKS, TESTIMONIALS } from '@/components/landing/data';

export function LandingPage() {
  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!authReady) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
    </div>
  );
  if (idToken) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-white">
      <StickyNav />

      <main>
      {/* ── Hero ── */}
      <section className="pt-16">
        <HeroSection
          title="Search your media with AI"
          subtitle={{
            regular: 'Upload videos, images, audio, and documents.',
            gradient: 'Upload anything, find everything.',
          }}
          description="Describe it. We'll find it."
          primaryCta={{ label: 'Start for free →', href: '/sign-up' }}
          secondaryCta={{ label: 'View pricing', href: '#pricing' }}
        />
      </section>

      {/* ── Scroll Demo ── */}
      <section className="bg-background pt-20 md:pt-12">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, ...(isMobile ? { y: 40 } : { x: 100 }) }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
        >
          <ContainerScroll
            titleComponent={
              <motion.h2
                className="text-4xl font-semibold text-white"
                initial={reducedMotion ? false : { opacity: 0, y: 30, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false }}
                transition={{ duration: reducedMotion ? 0 : 0.6 }}
              >
                Search your camera roll{'\u00A0'}
                <span className="text-3xl font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 md:text-[3.5rem]" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  with ease
                </span>
              </motion.h2>
            }
          >
            <div className="relative h-full w-full">
              <video
                src="/hero-demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="mx-auto h-full w-full rounded-2xl object-cover object-center md:object-left-top"
              />
            </div>
          </ContainerScroll>
        </motion.div>
      </section>

      {/* ── Features Bento ── */}
      <section id="features" className="px-4 pb-14 pt-20 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            Stop scrolling. Start searching.
          </motion.h2>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FEATURES.map((f, index) => (
              <motion.div
                key={f.title}
                className={`group relative overflow-hidden rounded-2xl border border-zinc-800 p-6 ${
                  f.colSpan === 2 ? 'sm:col-span-2' : ''
                }`}
                initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.5,
                  delay: reducedMotion ? 0 : index * 0.1,
                  ease: 'easeOut',
                }}
              >
                {/* Gradient background — different per card */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="absolute inset-0 bg-zinc-950/40" />

                <div className="relative z-10 flex flex-col gap-3">
                  <f.icon className="h-7 w-7 text-zinc-300" />
                  <h3 className="text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 pt-14 pb-20 md:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            How it works
          </motion.h2>
          <motion.div
            className="mt-12"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3">
              <AnimatedBackground
                className="rounded-lg bg-zinc-800"
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.6,
                }}
                enableHover
              >
                {HOW_IT_WORKS.map((step, index) => (
                  <motion.div
                    key={step.step}
                    data-id={`step-${step.step}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.3 + index * 0.15 }}
                  >
                    <div className="flex select-none flex-col space-y-3 p-6">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-400">
                          {step.step}
                        </span>
                        <step.icon className="h-5 w-5 text-zinc-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatedBackground>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-0 px-4 pb-10 pt-20 md:py-20">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={reducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: reducedMotion ? 0 : 0.6 }}
        >
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            Loved by creators, researchers, and teams
          </motion.h2>
          <AnimatedTestimonials
            testimonials={TESTIMONIALS}
            autoplay={true}
          />
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-4 pt-10 pb-20 md:py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <PricingSection tiers={TIERS} />
        </motion.div>
      </section>

      </main>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
