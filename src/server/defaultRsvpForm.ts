import { randomUUID } from 'node:crypto'

export type RsvpFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'select'
  | 'textarea'

export type RsvpStep = 'personal' | 'professional' | 'final'

export type RsvpQuestionInput = {
  id: string
  step: RsvpStep
  ord: number
  key: string
  label: string
  fieldType: RsvpFieldType
  required: boolean
  options?: string[]
  placeholder?: string
}

/**
 * Default RSVP questions requested by you.
 *
 * The admin can add more questions per event via `/admin`, but these serve as a
 * sensible baseline for most webinars.
 */
export function buildDefaultRsvpQuestions(): RsvpQuestionInput[] {
  return [
    // Step 1: Personal details
    {
      id: randomUUID(),
      step: 'personal',
      ord: 10,
      key: 'full_name',
      label: 'Full name',
      fieldType: 'text',
      required: true,
      placeholder: 'Your name',
    },
    {
      id: randomUUID(),
      step: 'personal',
      ord: 20,
      key: 'email',
      label: 'Email address',
      fieldType: 'email',
      required: true,
      placeholder: 'you@example.com',
    },
    {
      id: randomUUID(),
      step: 'personal',
      ord: 30,
      key: 'whatsapp',
      label: 'WhatsApp number',
      fieldType: 'tel',
      required: true,
      placeholder: '+91…',
    },

    // Step 2: Professional details
    {
      id: randomUUID(),
      step: 'professional',
      ord: 10,
      key: 'role',
      label: 'Current role',
      fieldType: 'select',
      required: true,
      options: [
        'Student',
        'Developer',
        'Designer',
        'Founder',
        'Product',
        'Marketing',
        'Research',
        'Other',
      ],
    },
    {
      id: randomUUID(),
      step: 'professional',
      ord: 20,
      key: 'org',
      label: 'Affiliated org / university',
      fieldType: 'text',
      required: true,
      placeholder: 'Company or university',
    },
    {
      id: randomUUID(),
      step: 'professional',
      ord: 30,
      key: 'country',
      label: 'Country',
      fieldType: 'text',
      required: true,
      placeholder: 'India',
    },
    {
      id: randomUUID(),
      step: 'professional',
      ord: 40,
      key: 'city',
      label: 'City',
      fieldType: 'text',
      required: true,
      placeholder: 'Bengaluru',
    },

    // Step 3: Final details
    {
      id: randomUUID(),
      step: 'final',
      ord: 10,
      key: 'heard_from',
      label: 'How did you hear about us?',
      fieldType: 'select',
      required: true,
      options: [
        'Instagram',
        'LinkedIn',
        'WhatsApp group',
        'Friend / referral',
        'Community',
        'Search',
        'Other',
      ],
    },
    {
      id: randomUUID(),
      step: 'final',
      ord: 20,
      key: 'hope_to_learn',
      label: 'What do you hope to learn?',
      fieldType: 'textarea',
      required: true,
      placeholder: 'Tell us what you want to get out of this webinar…',
    },
  ]
}
