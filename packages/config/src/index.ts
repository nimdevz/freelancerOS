import { CurrencyCode } from '@freelanceros/types';

export const APP_CONFIG = {
  name: 'FreelancerOS',
  tagline: 'Your freelance business, in one place.',
  version: '1.0.0',
  defaultCurrency: 'USD' as CurrencyCode,
  supportedCurrencies: [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  ] as const,
};

export const LIFETIME_STUDIO_EMAILS = [
  'nimishvwork@gmail.com',
  'nimdevzzz@gmail.com',
] as const;

export function resolveUserTier(email?: string | null): 'studio' | 'free' {
  if (!email) return 'free';
  const clean = email.toLowerCase().trim();
  return LIFETIME_STUDIO_EMAILS.includes(clean as any) ? 'studio' : 'free';
}

export function getTierLimits(plan?: string | null) {
  if (plan === 'studio') {
    return {
      activeClients: Infinity,
      activeProjects: Infinity,
      teamMembers: 10,
      name: 'Studio (Lifetime)',
    };
  }
  return {
    activeClients: 3,
    activeProjects: 3,
    teamMembers: 1,
    name: 'Starter (Free)',
  };
}

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Starter',
    priceINR: 0,
    priceUSD: 0,
    period: 'forever',
    description: 'Perfect for new solo freelancers getting organized.',
    features: [
      'Up to 3 active clients',
      'Up to 3 active projects',
      'Basic invoicing & quotes',
      'Simple time tracking',
      'Standard dashboard & attention queue',
    ],
    limits: {
      activeClients: 3,
      activeProjects: 3,
      teamMembers: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    priceINR: 1499,
    priceUSD: 19,
    period: 'monthly',
    popular: true,
    description: 'For established freelancers handling multiple regular clients.',
    features: [
      'Unlimited clients & projects',
      'Full proposal & contract generator',
      'Deliverable review & approval links',
      'Revision scope tracking & alerts',
      'Business intelligence & profitability',
      'Receipt & expense tracking',
    ],
    limits: {
      activeClients: Infinity,
      activeProjects: Infinity,
      teamMembers: 1,
    },
  },
  {
    id: 'studio',
    name: 'Studio',
    priceINR: 3999,
    priceUSD: 49,
    period: 'monthly',
    description: 'For boutique agencies and multi-creator creative teams.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared workspace & permissions',
      'Retainer hours & renewal tracking',
      'Custom branding & white-label portal',
      'Priority BullMQ background exports',
    ],
    limits: {
      activeClients: Infinity,
      activeProjects: Infinity,
      teamMembers: 10,
    },
  },
];

export const FREELANCER_TYPES = [
  { id: 'video_editor', label: 'Video Editor / Colorist' },
  { id: 'designer', label: 'Product / UI / Brand Designer' },
  { id: 'developer', label: 'Fullstack / Mobile Developer' },
  { id: 'photographer', label: 'Photographer / Cinematographer' },
  { id: 'writer', label: 'Copywriter / Content Strategist' },
  { id: 'marketer', label: 'Growth Marketer / Performance Ad Specialist' },
  { id: 'consultant', label: 'Consultant / Business Advisor' },
  { id: 'social_media', label: 'Social Media Manager' },
  { id: 'agency', label: 'Creative Studio / Boutique Agency' },
];

export const NAVIGATION_SECTIONS = [
  {
    title: 'Work',
    items: [
      { name: 'Leads', href: '/leads', icon: 'Target', shortcut: 'G L' },
      { name: 'Clients', href: '/clients', icon: 'Users', shortcut: 'G C' },
      { name: 'Projects', href: '/projects', icon: 'FolderKanban', shortcut: 'G P' },
      { name: 'Tasks', href: '/tasks', icon: 'CheckSquare', shortcut: 'G T' },
    ],
  },
  {
    title: 'Sales',
    items: [
      { name: 'Proposals', href: '/proposals', icon: 'FileText' },
      { name: 'Quotes', href: '/quotes', icon: 'ReceiptText' },
      { name: 'Contracts', href: '/contracts', icon: 'ScrollText' },
    ],
  },
  {
    title: 'Money',
    items: [
      { name: 'Invoices', href: '/invoices', icon: 'FileCheck2', shortcut: 'G I' },
      { name: 'Payments', href: '/payments', icon: 'CreditCard' },
      { name: 'Expenses', href: '/expenses', icon: 'Receipt' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Time Tracking', href: '/time', icon: 'Timer' },
      { name: 'Deliverables', href: '/deliverables', icon: 'PackageCheck' },
      { name: 'Approvals', href: '/approvals', icon: 'Stamp' },
      { name: 'Retainers', href: '/retainers', icon: 'Repeat' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { name: 'Reports', href: '/reports', icon: 'BarChart3' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Workspace', href: '/settings', icon: 'Settings' },
      { name: 'Billing', href: '/settings/billing', icon: 'ShieldCheck' },
    ],
  },
];
