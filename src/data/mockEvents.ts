export type VenueType = 'ONLINE' | 'IN_PERSON' | 'HYBRID'

export type Organizer = {
  handle: string
  name: string
  bio?: string
  website?: string
}

export type Ticket = {
  id: string
  name: string
  /** Price in smallest currency unit (paise). 0 = free. */
  priceInPaise: number
  description?: string
}

export type Event = {
  slug: string
  title: string
  summary: string
  descriptionMd: string
  coverImageUrl?: string | null
  tags: string[]
  startAt: Date
  endAt?: Date | null
  timezone: string
  venueType: VenueType
  locationText?: string | null
  meetingUrl?: string | null
  published: boolean
  organizer: Organizer
  tickets: Ticket[]
}

/**
 * Local-only mock data.
 *
 * This is intentionally the "source of truth" until a real database is added.
 * Keep it human-editable and boring: plain objects, no generators.
 */
export const mockEvents: Event[] = [
  {
    slug: 'tiesverse-product-webinar-june-2026',
    title: 'Tiesverse Product Webinar (June 2026)',
    summary: 'What we shipped, what we learned, and what’s next.',
    descriptionMd:
      'Join the team for a fast tour of recent releases, demos, and Q&A.\n\n## Agenda\n\n- Product updates\n- Live demo\n- Q&A',
    coverImageUrl: null,
    tags: ['webinar', 'product', 'qa'],
    startAt: new Date('2026-06-05T11:30:00.000+05:30'),
    endAt: new Date('2026-06-05T12:30:00.000+05:30'),
    timezone: 'Asia/Kolkata',
    venueType: 'IN_PERSON',
    locationText: 'WeWork Galaxy, 43 Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025',
    meetingUrl: null,
    published: true,
    organizer: {
      handle: 'tiesverse',
      name: 'Tiesverse',
      bio: 'Webinars, meetups, and live learning for the Tiesverse community.',
      website: 'https://tiesverse.com',
    },
    tickets: [
      {
        id: 'general',
        name: 'General Admission',
        priceInPaise: 0,
        description: 'Access to all sessions + networking lunch',
      },
      {
        id: 'vip',
        name: 'VIP Pass',
        priceInPaise: 99900,
        description: 'Front-row seating + speaker dinner + swag bag',
      },
    ],
  },
  {
    slug: 'fireside-chat-community-growth',
    title: 'Fireside Chat: Growing Communities That Last',
    summary: 'A candid conversation with organizers on sustainable growth.',
    descriptionMd:
      'We’ll talk about what works (and what doesn’t) when building communities.\n\n## Topics\n\n- Onboarding\n- Programming cadence\n- Retention loops',
    coverImageUrl: null,
    tags: ['community', 'growth', 'meetup'],
    startAt: new Date('2026-06-12T14:00:00.000+05:30'),
    endAt: new Date('2026-06-12T15:00:00.000+05:30'),
    timezone: 'Asia/Kolkata',
    venueType: 'IN_PERSON',
    locationText: 'Taj MG Road, 41/3 MG Road, Craig Park Layout, Ashok Nagar, Bengaluru, Karnataka 560001',
    meetingUrl: null,
    published: true,
    organizer: {
      handle: 'tiesverse',
      name: 'Tiesverse',
      bio: 'Webinars, meetups, and live learning for the Tiesverse community.',
      website: 'https://tiesverse.com',
    },
    tickets: [
      {
        id: 'general',
        name: 'General (without paddle)',
        priceInPaise: 27300,
        description: 'Drinks on us (non-alcoholic)',
      },
      {
        id: 'general-paddle',
        name: 'General (with paddle)',
        priceInPaise: 42300,
        description: 'Drinks on us (non-alcoholic)',
      },
    ],
  },
  {
    slug: 'tiesverse-meetup-bangalore-2026',
    title: 'Tiesverse Meetup: Bangalore',
    summary: 'An in-person meetup with lightning talks and networking.',
    descriptionMd:
      'Bring your stories, your questions, and your curiosity.\n\n## Schedule\n\n- Welcome\n- Lightning talks\n- Networking',
    coverImageUrl: null,
    tags: ['meetup', 'networking', 'community'],
    startAt: new Date('2026-06-20T10:00:00.000+05:30'),
    endAt: new Date('2026-06-20T13:00:00.000+05:30'),
    timezone: 'Asia/Kolkata',
    venueType: 'IN_PERSON',
    locationText: 'Indian Institute of Management Bangalore, Bannerghatta Road, Bilekahalli, Bengaluru, Karnataka 560076',
    meetingUrl: null,
    published: true,
    organizer: {
      handle: 'tiesverse',
      name: 'Tiesverse',
      bio: 'Webinars, meetups, and live learning for the Tiesverse community.',
      website: 'https://tiesverse.com',
    },
    tickets: [
      {
        id: 'general',
        name: 'General Admission',
        priceInPaise: 0,
        description: 'Lightning talks + open networking',
      },
      {
        id: 'workshop',
        name: 'Workshop Add-on',
        priceInPaise: 49900,
        description: 'Includes hands-on afternoon workshop session',
      },
    ],
  },
]
