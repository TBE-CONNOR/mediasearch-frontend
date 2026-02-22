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
  /** CSS object-position override for non-square photos */
  objectPosition?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Kept downloading videos from TikTok and could never find them for the groupchat when I needed to! I save way too many things to search for something I saved a month ago lol.',
    name: 'Brandon Ginn',
    designation: 'Computer Scientist',
    src: '/testimonials/Brandon_Ginn.jpg',
    objectPosition: 'center 85%',
  },
  {
    quote:
      "I've tried to make similar solutions for finding specific pictures in my camera roll, but nothing compares to this site. Great work.",
    name: 'Carter Perez',
    designation: 'Cybersecurity Student @ UMGC',
    src: '/testimonials/Carter_Perez.jpg',
  },
  {
    quote:
      "I can't get over how I can literally just search what I remember of a video from long ago and I can find it on demand.",
    name: 'Ethan Shorts',
    designation: 'Marketing Specialist',
    src: '/testimonials/Ethan_Shorts.jpg',
  },
  {
    quote:
      'I love this because I can find my reaction images quickly that I respond to people with in my texts!',
    name: 'Izzy Lee',
    designation: 'Phlebotomist',
    src: '/testimonials/Izzy_Lee.jpg',
    objectPosition: 'center 15%',
  },
  {
    quote:
      'I have 100+ videos of my favorite influencers talking scattered throughout my camera roll. I always only remember one phrase, and I love how that is all it takes to find a specific video.',
    name: 'Ryan Billings',
    designation: 'College Dropout, Founder of cyberexamprep.com',
    src: '/testimonials/Ryan_Billings.jpeg',
  },
];
