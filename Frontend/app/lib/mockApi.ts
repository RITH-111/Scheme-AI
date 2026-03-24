import { Persona } from '@/app/context/UserContext'

export interface Scheme {
  id: string
  name: string
  description: string
  eligibility: string[]
  benefits: string[]
  category: 'education' | 'health' | 'employment' | 'welfare' | 'agricultural' | 'infrastructure'
  matchPercentage?: number
}

export interface EligibilityQuestion {
  id: string
  question: string
  type: 'yes-no' | 'multiple-choice' | 'text'
  options?: string[]
}

export interface GuidanceStep {
  id: string
  title: string
  description: string
  action: string
  resources?: string[]
}

// Mock schemes database
const mockSchemes: Scheme[] = [
  {
    id: 'scheme-1',
    name: 'Higher Education Scholarship',
    description: 'Financial aid for higher education pursuits',
    eligibility: ['Annual income < 8 LPA', 'Minimum 60% in 12th', 'Indian citizen'],
    benefits: ['Tuition fee coverage', '₹50,000 annual stipend', 'Merit bonus up to ₹1 lakh'],
    category: 'education',
  },
  {
    id: 'scheme-2',
    name: 'Startup India Fund',
    description: 'Subsidized loans and grants for new businesses',
    eligibility: ['Business < 5 years old', 'Indian citizen', 'Minimum ₹50,000 investment'],
    benefits: ['₹10 lakh to ₹1 crore loans at 5% interest', 'GST registration support', 'Market access help'],
    category: 'employment',
  },
  {
    id: 'scheme-3',
    name: 'Senior Citizen Health Insurance',
    description: 'Comprehensive health coverage for seniors (60+)',
    eligibility: ['Age 60 or above', 'Indian resident', 'No age limit for enrollment'],
    benefits: ['₹5 lakh annual coverage', 'Cashless hospitalization', 'Critical illness coverage'],
    category: 'health',
  },
  {
    id: 'scheme-4',
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Income support program for farmers',
    eligibility: ['Farmer with landholding ≤ 2 hectares', 'Indian citizen', 'Age > 18'],
    benefits: ['₹6,000 annual support', 'Paid in 3 installments', 'Direct bank transfer'],
    category: 'agricultural',
  },
  {
    id: 'scheme-5',
    name: 'Disability Allowance Scheme',
    description: 'Financial assistance for persons with disabilities',
    eligibility: ['Disability of 40% or more', 'Indian citizen', 'Below poverty line'],
    benefits: ['₹1,000-₹2,000 monthly', 'Medical care reimbursement', 'Accessibility aids support'],
    category: 'welfare',
  },
  {
    id: 'scheme-6',
    name: 'PMAY - Affordable Housing',
    description: 'Housing loans at subsidized rates',
    eligibility: ['First-time homebuyer', 'Annual income < 12 LPA', 'Indian citizen'],
    benefits: ['Reduced interest rates 3.5-4%', 'Credit-linked subsidy up to ₹2.67 lakh', 'Easy EMI options'],
    category: 'infrastructure',
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function fetchSchemesByPersona(persona: Persona): Promise<Scheme[]> {
  await delay(500)

  const personaSchemeMap: Record<Persona, Scheme[]> = {
    student: [mockSchemes[0], mockSchemes[2]],
    entrepreneur: [mockSchemes[1]],
    'senior-citizen': [mockSchemes[2], mockSchemes[4]],
    farmer: [mockSchemes[3]],
    unemployed: [mockSchemes[1], mockSchemes[5]],
    disabled: [mockSchemes[4], mockSchemes[5]],
  }

  return (personaSchemeMap[persona] || []).map(scheme => ({
    ...scheme,
    matchPercentage: 70 + Math.random() * 30, // 70-100% match
  }))
}

export async function fetchAllSchemes(): Promise<Scheme[]> {
  await delay(300)
  return mockSchemes
}

export async function fetchSchemeById(id: string): Promise<Scheme | null> {
  await delay(200)
  return mockSchemes.find(s => s.id === id) || null
}

export async function fetchEligibilityQuestions(schemeId: string): Promise<EligibilityQuestion[]> {
  await delay(400)

  const questionSets: Record<string, EligibilityQuestion[]> = {
    'scheme-1': [
      {
        id: 'q1',
        question: 'What is your annual family income?',
        type: 'text',
      },
      {
        id: 'q2',
        question: 'What was your percentage in 12th grade?',
        type: 'text',
      },
      {
        id: 'q3',
        question: 'Are you an Indian citizen?',
        type: 'yes-no',
      },
    ],
    'scheme-2': [
      {
        id: 'q1',
        question: 'How long has your business been operating?',
        type: 'text',
      },
      {
        id: 'q2',
        question: 'What is your initial investment amount?',
        type: 'text',
      },
      {
        id: 'q3',
        question: 'Is your business registered?',
        type: 'yes-no',
      },
    ],
    'scheme-4': [
      {
        id: 'q1',
        question: 'What is your landholding size (in hectares)?',
        type: 'text',
      },
      {
        id: 'q2',
        question: 'Do you have land ownership documents?',
        type: 'yes-no',
      },
    ],
  }

  return questionSets[schemeId] || []
}

export async function fetchGuidanceSteps(schemeId: string): Promise<GuidanceStep[]> {
  await delay(400)

  const guidanceMap: Record<string, GuidanceStep[]> = {
    'scheme-1': [
      {
        id: 'step1',
        title: 'Check Eligibility',
        description: 'Verify your educational background and income criteria',
        action: 'Visit official website and check eligibility calculator',
        resources: ['Eligibility Checker', 'Income Certificate'],
      },
      {
        id: 'step2',
        title: 'Prepare Documents',
        description: 'Gather required certificates and income proof',
        action: 'Collect 12th mark sheet, income certificate, and identity proof',
        resources: ['Document Checklist', 'Sample Income Certificate'],
      },
      {
        id: 'step3',
        title: 'Submit Application',
        description: 'Fill and submit the application form online',
        action: 'Register on portal and upload documents',
        resources: ['Application Form', 'Portal Link'],
      },
      {
        id: 'step4',
        title: 'Track Status',
        description: 'Monitor your application progress',
        action: 'Use application ID to check status regularly',
        resources: ['Status Tracker', 'Contact Support'],
      },
    ],
    'scheme-4': [
      {
        id: 'step1',
        title: 'Get Land Certificate',
        description: 'Obtain official land ownership documents',
        action: 'Visit tahsil office and get land certificate',
        resources: ['Land Certificate Form'],
      },
      {
        id: 'step2',
        title: 'Register on Portal',
        description: 'Create account on PM Kisan portal',
        action: 'Visit pmkisan.gov.in and register with Aadhar',
        resources: ['Portal Link', 'Registration Guide'],
      },
      {
        id: 'step3',
        title: 'Verify Details',
        description: 'Confirm your information with local authorities',
        action: 'Visit local agricultural office for verification',
        resources: ['Verification Form'],
      },
      {
        id: 'step4',
        title: 'Receive Benefits',
        description: 'Amount transferred to your bank account',
        action: 'Check bank account for quarterly transfers',
        resources: ['Bank Details Update Form'],
      },
    ],
  }

  return guidanceMap[schemeId] || []
}

export async function searchSchemes(query: string): Promise<Scheme[]> {
  await delay(300)

  const lowerQuery = query.toLowerCase()
  return mockSchemes.filter(
    scheme =>
      scheme.name.toLowerCase().includes(lowerQuery) ||
      scheme.description.toLowerCase().includes(lowerQuery) ||
      scheme.category.toLowerCase().includes(lowerQuery)
  )
}

export async function getSchemeCategories(): Promise<string[]> {
  await delay(200)
  const categories = [...new Set(mockSchemes.map(s => s.category))]
  return categories
}

export async function generateAIResponse(message: string, context: { persona?: string; schemes?: Scheme[] }): Promise<string> {
  await delay(1000) // Simulate AI processing

  const responses: string[] = [
    `Based on your profile, I found several eligible schemes for you. Let me help you explore the best options that match your needs.`,
    `I can see you're interested in ${context.persona || 'your situation'}. Here are the key schemes that might benefit you. Would you like more details about any of them?`,
    `Great question! I've analyzed available schemes for you. The top recommendations are based on your eligibility criteria and potential benefits.`,
    `I understand your requirement. These schemes could help you. Would you like me to explain the application process or eligibility criteria for any of them?`,
    `Based on the latest government programs, here are the schemes that align with your profile. Let me guide you through the benefits and application steps.`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
