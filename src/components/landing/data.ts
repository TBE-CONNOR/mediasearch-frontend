import {
  Search,
  Sparkles,
  Brain,
  Zap,
  Shield,
  BarChart,
  Upload,
  Cpu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CONTACT_EMAIL = 'boetigsolutions@gmail.com';
export const CONTACT_PHONE = '(443) 333-0998';
export const CONTACT_PHONE_HREF = 'tel:+14433330998';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Search,
    title: 'Multimodal Search',
    description: 'Video, audio, images, docs',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Answers',
    description: 'Synthesized answers with citations',
  },
  {
    icon: Brain,
    title: 'Semantic Understanding',
    description: 'Finds meaning, not just keywords',
  },
  {
    icon: Zap,
    title: 'Async by Design',
    description: 'Processing runs in the background so you never have to sit and wait',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'JWT auth, per-user isolation',
  },
  {
    icon: BarChart,
    title: 'Usage Quotas',
    description: 'Free tier to enterprise scale',
  },
];

export interface HowItWorksStep {
  icon: LucideIcon;
  title: string;
  description: string;
  step: number;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    icon: Upload,
    title: 'Upload',
    description: 'Drag and drop any file type. We handle the rest.',
    step: 1,
  },
  {
    icon: Cpu,
    title: 'Process',
    description: 'AWS Bedrock analyzes every second of your content.',
    step: 2,
  },
  {
    icon: Search,
    title: 'Search',
    description: 'Ask anything. Get exact answers with source citations.',
    step: 3,
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Finally found a tool that lets me search my entire podcast archive by topic. Game changer.',
    name: 'Jordan K.',
    designation: 'Content Creator',
    src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500',
  },
  {
    quote:
      'We upload all our client call recordings and search them by decision point. Saves hours every week.',
    name: 'Priya M.',
    designation: 'Startup Founder',
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500',
  },
  {
    quote:
      "The semantic search is incredible — finds things I couldn't even describe exactly.",
    name: 'David R.',
    designation: 'Research Analyst',
    src: 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?w=500',
  },
  {
    quote:
      'Searched 3 years of lecture recordings in seconds. My students love it.',
    name: 'Amara L.',
    designation: 'University Professor',
    src: 'https://images.unsplash.com/photo-1636041293178-808a6762ab39?w=500',
  },
  {
    quote:
      "Finally an AI tool that actually understands what I'm looking for in my video library.",
    name: 'Marcus T.',
    designation: 'Video Producer',
    src: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=500',
  },
];
