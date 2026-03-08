ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_ai_category_check;

ALTER TABLE submissions ADD CONSTRAINT submissions_ai_category_check CHECK (ai_category IN (
  -- Tech
  'Automation',
  'Website',
  'AI Integration',
  'SEO',
  'Custom Software',
  'Mobile App',
  'API Development',
  'UI/UX Design',
  'DevOps & CI/CD',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Blockchain & Web3',

  -- Design & Creative
  'Logo & Branding',
  'Graphic Design',
  'Video Production',
  'Photography',
  'Motion Graphics',
  'Illustration',
  'Presentation Design',

  -- Marketing
  'Social Media Marketing',
  'Paid Ads / PPC',
  'Email Marketing',
  'Influencer Marketing',
  'Content Marketing',
  'Affiliate Marketing',

  -- Writing & Content
  'Copywriting',
  'Blog Writing',
  'Translation',
  'Proofreading & Editing',
  'Technical Writing',
  'Scriptwriting',

  -- Business & Finance
  'Business Consulting',
  'Financial Planning',
  'Accounting & Bookkeeping',
  'Tax Advisory',
  'Market Research',
  'Business Plan Writing',
  'Fundraising & Pitch Decks',

  -- Legal
  'Contract Drafting',
  'Legal Consulting',
  'Trademark & IP',
  'Compliance Advisory',

  -- Education & Training
  'Online Tutoring',
  'Corporate Training',
  'Course Creation',
  'Language Teaching',
  'Career Coaching',

  -- Health & Wellness
  'Nutrition & Dietetics',
  'Mental Health Coaching',
  'Personal Training',
  'Medical Consulting',

  -- Real Estate
  'Property Management',
  'Real Estate Consulting',
  'Interior Design',
  'Architecture',

  -- Home & Local Services
  'Cleaning',
  'Repairs & Maintenance',
  'Landscaping',
  'Moving & Logistics',
  'Event Planning',
  'Catering',

  -- Other
  'Other'
));
