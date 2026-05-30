import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Brain,
  Coins,
  Cpu,
  Dumbbell,
  Leaf,
  Palette,
  Sparkles,
  Utensils,
} from 'lucide-react'

/**
 * Home page demo content
 *
 * This file is intentionally "static":
 * - It keeps the homepage fast and predictable during early iteration.
 * - Teams can swap these lists with real data later without touching UI layout.
 */

export type Category = {
  key: string
  title: string
  icon: LucideIcon
  discoverTag?: string
}

export const categories: Category[] = [
  { key: 'tech', title: 'Tech', icon: Cpu, discoverTag: 'webinar' },
  { key: 'food', title: 'Food & Drink', icon: Utensils, discoverTag: 'meetup' },
  { key: 'ai', title: 'AI', icon: Brain, discoverTag: 'product' },
  { key: 'arts', title: 'Arts & Culture', icon: Palette, discoverTag: 'community' },
  { key: 'climate', title: 'Climate', icon: Leaf, discoverTag: 'community' },
  { key: 'fitness', title: 'Fitness', icon: Dumbbell, discoverTag: 'meetup' },
  { key: 'wellness', title: 'Wellness', icon: Activity, discoverTag: 'community' },
  { key: 'crypto', title: 'Crypto', icon: Coins, discoverTag: 'webinar' },
  { key: 'community', title: 'Community', icon: Sparkles, discoverTag: 'community' },
]

export type FeaturedCalendar = {
  key: string
  title: string
  description: string
  badge?: string
}

export const featuredCalendars: FeaturedCalendar[] = [
  {
    key: 'tiesverse-meetups',
    title: 'Tiesverse Meetups',
    description: 'Community-led meetups across timezones and interests.',
    badge: 'Weekly',
  },
  {
    key: 'product-sessions',
    title: 'Product Sessions',
    description: 'Launches, demos, and office hours with the team.',
    badge: 'Live',
  },
  {
    key: 'builders-club',
    title: 'Builders Club',
    description: 'Hands-on building sessions, prompts, and mini-hackathons.',
    badge: 'Hands-on',
  },
  {
    key: 'design-buddies',
    title: 'Design Buddies',
    description: 'Critique circles, portfolio reviews, and creative workshops.',
  },
  {
    key: 'research-reading',
    title: 'Research Reading Room',
    description: 'A friendly reading party for papers and posts.',
  },
  {
    key: 'career-lab',
    title: 'Career Lab',
    description: 'Resume reviews, mock interviews, and career Q&A.',
  },
]

export type FeaturedEvent = {
  key: string
  title: string
  description: string
  posterUrl?: string
  badge?: string
  time: string
  date: string
  organizer: string
  venueType?: 'ONLINE' | 'IN_PERSON' | 'HYBRID'
  locationText?: string
}

export const featuredEvents: FeaturedEvent[] = [
  {
    key: 'tiesverse-ai-summit',
    title: 'Tiesverse AI Summit 2025',
    description: 'A full day of talks and workshops on the frontier of AI.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    badge: 'Live',
    time: '10:00 AM IST',
    date: '12 Jun',
    organizer: 'Tiesverse',
    venueType: 'ONLINE',
    locationText: 'Online session',
  },
  {
    key: 'product-demo-day',
    title: 'Product Demo Day - Season 3',
    description: 'Launches, demos, and office hours with the core team.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    badge: 'Featured',
    time: '6:00 PM IST',
    date: '18 Jun',
    organizer: 'Product Sessions',
    venueType: 'ONLINE',
    locationText: 'Livestream',
  },
  {
    key: 'builders-hackathon',
    title: 'Builders Hackathon: Build in 24h',
    description: 'Hands-on building sessions and mini-hackathons.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    badge: 'Hands-on',
    time: '9:00 AM IST',
    date: '22 Jun',
    organizer: 'Builders Club',
    venueType: 'HYBRID',
    locationText: 'In-person + online',
  },
  {
    key: 'design-critique-circle',
    title: 'Design Critique Circle - Vol. 8',
    description: 'Portfolio reviews and collaborative creative workshops.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    time: '3:00 PM IST',
    date: '25 Jun',
    organizer: 'Design Buddies',
    venueType: 'ONLINE',
    locationText: 'Figma FigJam',
  },
  {
    key: 'research-agents-edition',
    title: 'Research Reading Room: Agents Edition',
    description: 'A friendly reading party for the latest papers on agents.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    time: '5:00 PM IST',
    date: '28 Jun',
    organizer: 'Reading Room',
    venueType: 'ONLINE',
    locationText: 'Live audio room',
  },
  {
    key: 'career-lab-q3',
    title: 'Career Lab Q3: Mock Interviews',
    description: 'Resume reviews, mock interviews, and career Q&A.',
    posterUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNINWMeTnXggEasf0fwENTtE6QN4mYeD3Ga-lqmqHbtHhTzB26iZZyc3p93b-GmzWET5bPJHp9Zijy3mKYhaumUXBuDaIpBSXkNUuE5boOYl-Kn1DqUCjoZSFWfQQ-b5tqHwznkZ3vMa8pTeuDcGQJNEi6xo4vbLF90StX21T98iBr6BXt593923r2csrBTo4evSnrHG32kLVvlZ0xXAIIllLDLl1KjO9lrnqsbb1rjlFeLCcK0uYFBRp3lJJPu-mW7zEDzLWZ7eCJ',
    badge: 'Free',
    time: '11:00 AM IST',
    date: '2 Jul',
    organizer: 'Career Lab',
    venueType: 'ONLINE',
    locationText: 'Online call',
  },
]

export type City = {
  name: string
}

export type Region = {
  key: string
  label: string
  cities: City[]
}

export const regions: Region[] = [
  {
    key: 'apac',
    label: 'Asia & Pacific',
    cities: [
      { name: 'Auckland' },
      { name: 'Bangkok' },
      { name: 'Bengaluru' },
      { name: 'Brisbane' },
      { name: 'Dubai' },
      { name: 'Ho Chi Minh City' },
      { name: 'Hong Kong' },
      { name: 'Honolulu' },
      { name: 'Jakarta' },
      { name: 'Kuala Lumpur' },
      { name: 'Manila' },
      { name: 'Melbourne' },
      { name: 'Mumbai' },
      { name: 'New Delhi' },
      { name: 'Seoul' },
      { name: 'Singapore' },
      { name: 'Sydney' },
      { name: 'Taipei' },
      { name: 'Tokyo' },
    ],
  },
  {
    key: 'europe',
    label: 'Europe',
    cities: [
      { name: 'Amsterdam' },
      { name: 'Berlin' },
      { name: 'Copenhagen' },
      { name: 'Dublin' },
      { name: 'Lisbon' },
      { name: 'London' },
      { name: 'Madrid' },
      { name: 'Paris' },
      { name: 'Prague' },
      { name: 'Stockholm' },
    ],
  },
  {
    key: 'na',
    label: 'North America',
    cities: [
      { name: 'Austin' },
      { name: 'Boston' },
      { name: 'Chicago' },
      { name: 'Los Angeles' },
      { name: 'New York' },
      { name: 'San Francisco' },
      { name: 'Seattle' },
      { name: 'Toronto' },
      { name: 'Vancouver' },
    ],
  },
]
