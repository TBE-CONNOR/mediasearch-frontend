import {
  Search,
  Upload,
  Brain,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from '@/config/constants';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Tailwind grid column span (1 or 2) */
  colSpan: 1 | 2;
  /** Visual accent color class */
  accent: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Search,
    title: 'Search your way',
    description:
      'Stop scrolling through thousands of photos. Just describe what you\'re looking for — "that sunset photo from last summer" or "the video where he falls off the chair" — and we\'ll find it.',
    colSpan: 2,
    accent: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    icon: Upload,
    title: 'Upload anything',
    description:
      'Photos, videos, voice memos, screen recordings, documents — just drag and drop. We handle the rest.',
    colSpan: 1,
    accent: 'from-violet-500/20 to-fuchsia-500/10',
  },
  {
    icon: Brain,
    title: 'AI gets context',
    description:
      'Finds what you mean, not just what you type. Search by vibes, not keywords.',
    colSpan: 1,
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: Clock,
    title: 'Instant answers',
    description:
      'Ask a question about your content and get the exact moment — with timestamps and confidence scores.',
    colSpan: 2,
    accent: 'from-emerald-500/20 to-teal-500/10',
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
    description:
      'Drop your photos, videos, screen recordings — whatever you\'ve got.',
    step: 1,
  },
  {
    icon: Brain,
    title: 'Understand',
    description:
      'We watch, listen to, and read everything so you don\'t have to.',
    step: 2,
  },
  {
    icon: Search,
    title: 'Search',
    description:
      'Describe what you\'re looking for. We\'ll find the exact moment.',
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
