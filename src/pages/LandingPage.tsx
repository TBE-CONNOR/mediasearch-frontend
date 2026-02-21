import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore } from '@/store/authStore';
import { TIERS } from '@/config/pricing';
import { HeroSection } from '@/components/ui/hero-section';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import AnimatedBackground from '@/components/ui/animated-background';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import { PricingSection } from '@/components/ui/pricing-section';
import { StickyNav } from '@/components/landing/StickyNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FEATURES, HOW_IT_WORKS, TESTIMONIALS } from '@/components/landing/data';

export function LandingPage() {
  const idToken = useAuthStore((s) => s.idToken);
  const authReady = useAuthStore((s) => s.authReady);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (authReady && idToken) {
      void navigate('/dashboard', { replace: true });
    }
  }, [authReady, idToken, navigate]);

  if (!authReady) return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <Loader2 className="h-8 w-8 motion-safe:animate-spin text-blue-500" />
    </div>
  );
  if (idToken) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <StickyNav />

      {/* ── Hero ── */}
      <section className="pt-16">
        <HeroSection
          title="Search your media with AI"
          subtitle={{
            regular: 'Upload videos, images, audio, and documents.',
            gradient: 'Upload anything, find everything.',
          }}
          description="Ask anything. Get answers from your own content."
          primaryCta={{ label: 'Start for free →', href: '/sign-up' }}
          secondaryCta={{ label: 'View pricing', href: '#pricing' }}
        />
      </section>

      {/* ── Scroll Demo ── */}
      <section className="bg-[#09090b] pt-12">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
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
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80"
                alt="MediaSearch dashboard mockup"
                loading="lazy"
                className="mx-auto h-full w-full rounded-2xl object-cover object-left-top"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-end justify-center rounded-2xl bg-gradient-to-t from-black/70 to-transparent p-8">
                <p className="text-2xl font-semibold text-white md:text-3xl">
                  Semantic search across all your media
                </p>
              </div>
            </div>
          </ContainerScroll>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            Everything you need to search your world
          </motion.h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, index) => {
              const col = index % 3;
              const initial =
                col === 0
                  ? { opacity: 0, x: -80 }
                  : col === 2
                    ? { opacity: 0, x: 80 }
                    : { opacity: 0, y: 30 };
              const visible =
                col === 0
                  ? { opacity: 1, x: 0 }
                  : col === 2
                    ? { opacity: 1, x: 0 }
                    : { opacity: 1, y: 0 };
              const row = index < 3 ? 0 : 1;
              const delay = row * 0.15 + col * 0.08;

              return (
                <motion.div
                  key={f.title}
                  className="flex flex-col items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
                  initial={reducedMotion ? false : initial}
                  whileInView={visible}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : delay, ease: 'easeOut' }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
                    <f.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {f.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="text-center text-3xl font-bold text-white"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
          >
            Up and running in minutes
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
      <section className="px-4 py-20">
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
      <section id="pricing" className="px-4 py-20">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
        >
          <PricingSection tiers={TIERS} />
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <LandingFooter />
    </div>
  );
}
