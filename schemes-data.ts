import {
  ageBetween,
  custom,
  incomeAtMost,
  occupationIn,
  requiresVerification,
} from './criteria'
import type { Scheme } from './types'

/**
 * Demonstration dataset. Summaries are simplified from publicly known central
 * government schemes and have NOT been verified against current official
 * guidelines. Replace with a verified scheme database before production use.
 */
export const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    shortName: 'PM-KISAN',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    needs: ['agriculture', 'financial'],
    description:
      'Direct income support for landholding farmer families, paid into their bank account in instalments through the year.',
    benefits: [
      'Income support of ₹6,000 per year per eligible farmer family',
      'Paid in three equal instalments directly to the bank account',
    ],
    eligibility: [
      'Farmer family that owns cultivable land in its name',
      'Families with income tax payers, institutional landholders, and certain professionals or government employees are excluded',
      'Bank account linked with Aadhaar and e-KYC completed',
    ],
    criteria: [
      occupationIn(['farmer'], 'Works as a farmer'),
      custom('Owns cultivable land', (p) =>
        p.ownsFarmland === 'yes' ? 'met' : p.ownsFarmland === 'no' ? 'not-met' : 'unknown',
      ),
      requiresVerification('Not an income tax payer or in an excluded category'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'land-records', name: 'Land ownership records', note: 'Khatauni / RoR / 7-12 extract' },
      { id: 'bank-passbook', name: 'Bank account passbook', note: 'Account linked with Aadhaar' },
      { id: 'mobile', name: 'Mobile number linked with Aadhaar', note: 'For e-KYC OTP' },
    ],
    applicationSteps: [
      'Visit the official PM-KISAN portal and choose "New Farmer Registration".',
      'Enter your Aadhaar number, mobile number, and state.',
      'Fill in land details exactly as they appear in your land records.',
      'Complete e-KYC using Aadhaar OTP, or at a Common Service Centre (CSC).',
      'Your application is verified by the state/district agriculture office. Track status on the portal.',
    ],
    officialUrl: 'https://pmkisan.gov.in',
    faqs: [
      {
        question: 'Can I apply if the land is in my father’s name?',
        answer:
          'Generally, the land must be recorded in the applicant’s name. Check with your local agriculture office for rules on inherited or jointly held land.',
      },
      {
        question: 'Where can I get help with e-KYC?',
        answer:
          'You can complete e-KYC at a nearby Common Service Centre (CSC) or through the OTP option on the official portal.',
      },
    ],
    contact: { note: 'Use the helpline listed on the official PM-KISAN portal, or visit your district agriculture office.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'ab-pmjay',
    name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)',
    shortName: 'Ayushman Bharat PM-JAY',
    ministry: 'National Health Authority, Ministry of Health & Family Welfare',
    needs: ['healthcare', 'financial'],
    description:
      'Health cover for hospital treatment at empanelled public and private hospitals, for eligible poor and vulnerable families and senior citizens.',
    benefits: [
      'Health cover of up to ₹5 lakh per family per year for secondary and tertiary hospital care',
      'Cashless treatment at empanelled hospitals',
      'Covers pre-existing conditions from day one',
    ],
    eligibility: [
      'Families identified through SECC 2011 deprivation criteria or state-specific lists',
      'Senior citizens aged 70 and above are covered regardless of income, as per recent expansion',
      'Final eligibility is checked against official beneficiary lists',
    ],
    criteria: [
      custom('Listed in the official beneficiary database, or aged 70+', (p) =>
        p.ageGroup === '70-plus' ? 'met' : 'unknown',
      ),
      incomeAtMost(250000, 'Belongs to a low-income household (indicative)'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'ration-card', name: 'Ration card', note: 'Helps identify your family in beneficiary lists' },
      { id: 'mobile', name: 'Mobile number', note: 'For OTP verification' },
    ],
    applicationSteps: [
      'Check whether your family is listed using the official beneficiary portal.',
      'If listed, visit an empanelled hospital, CSC, or use the Ayushman app to create your Ayushman card.',
      'Complete Aadhaar-based e-KYC.',
      'Show your Ayushman card at the hospital help desk (Arogya Mitra) when seeking treatment.',
    ],
    officialUrl: 'https://pmjay.gov.in',
    faqs: [
      {
        question: 'Do I have to pay to get the Ayushman card?',
        answer:
          'Check the official portal for current rules. Be cautious of anyone asking for payment to “guarantee” enrolment.',
      },
      {
        question: 'Which hospitals can I use?',
        answer: 'Only empanelled hospitals. You can search for them on the official PM-JAY website.',
      },
    ],
    contact: { helpline: '14555', note: 'National PM-JAY helpline (verify on the official website).' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pmay-g',
    name: 'Pradhan Mantri Awaas Yojana – Gramin (PMAY-G)',
    shortName: 'PMAY-Gramin',
    ministry: 'Ministry of Rural Development',
    needs: ['housing'],
    description:
      'Financial assistance to houseless families and those living in kutcha or dilapidated houses in rural areas to build a pucca house.',
    benefits: [
      'Financial assistance for house construction (amount differs for plain and hilly/difficult areas)',
      'Possible convergence with other schemes for toilets, electricity, and wage support',
    ],
    eligibility: [
      'Rural household that is houseless or lives in a kutcha / dilapidated house',
      'Selected using SECC / Awaas+ survey data and verified by the Gram Sabha',
      'Households that already own a pucca house are not eligible',
    ],
    criteria: [
      custom('Lives in a rural area', (p) => (p.residence === 'rural' ? 'met' : 'not-met')),
      custom('Houseless or living in a kutcha house', (p) =>
        p.housing === 'no-house' || p.housing === 'owns-kutcha'
          ? 'met'
          : p.housing === 'owns-pucca'
            ? 'not-met'
            : 'unknown',
      ),
      requiresVerification('Included in the Awaas+ / SECC beneficiary list'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'bank-passbook', name: 'Bank account passbook' },
      { id: 'job-card', name: 'MGNREGA job card', note: 'If available' },
      { id: 'consent', name: 'Consent form for Aadhaar use', note: 'Provided by Gram Panchayat' },
    ],
    applicationSteps: [
      'Contact your Gram Panchayat or Block Development Office to check whether your household is in the beneficiary list.',
      'Submit the required documents and bank details to the Panchayat.',
      'The list is verified in a Gram Sabha meeting.',
      'Once sanctioned, assistance is released in instalments as construction progresses.',
    ],
    officialUrl: 'https://pmayg.nic.in',
    faqs: [
      {
        question: 'Can I apply online myself?',
        answer:
          'Beneficiaries are usually identified from survey data. Your Gram Panchayat or Block office is the best place to start.',
      },
    ],
    contact: { note: 'Contact your Gram Panchayat or Block Development Office.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pmay-u',
    name: 'Pradhan Mantri Awas Yojana – Urban 2.0 (PMAY-U 2.0)',
    shortName: 'PMAY-Urban 2.0',
    ministry: 'Ministry of Housing & Urban Affairs',
    needs: ['housing', 'financial'],
    description:
      'Support for urban families from economically weaker and lower-income groups to build, buy, or rent an affordable house.',
    benefits: [
      'Central assistance for building or buying a house under different scheme components',
      'Interest subsidy on eligible home loans for certain income groups',
    ],
    eligibility: [
      'Urban family from EWS, LIG, or MIG income groups as defined in the guidelines',
      'Family should not own a pucca house anywhere in India',
    ],
    criteria: [
      custom('Lives in a town or city', (p) => (p.residence === 'urban' ? 'met' : 'not-met')),
      incomeAtMost(900000, 'Annual household income within EWS / LIG / MIG limits'),
      custom('Does not own a pucca house', (p) => (p.housing === 'owns-pucca' ? 'not-met' : 'met')),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card (all family members)' },
      { id: 'income-certificate', name: 'Income certificate' },
      { id: 'bank-passbook', name: 'Bank account details' },
      { id: 'no-house-affidavit', name: 'Self-declaration of not owning a pucca house' },
    ],
    applicationSteps: [
      'Visit the official PMAY-Urban portal and choose the relevant scheme component.',
      'Fill in the online application with Aadhaar and family details.',
      'Submit income and residence documents to your Urban Local Body when asked.',
      'Track application status on the portal.',
    ],
    officialUrl: 'https://pmay-urban.gov.in',
    faqs: [
      {
        question: 'Can I get help if I already have a home loan?',
        answer: 'Rules depend on the component and loan date. Check the official guidelines or ask your lending bank.',
      },
    ],
    contact: { note: 'Contact your Urban Local Body (municipality) or see the official portal.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'post-matric-sc',
    name: 'Post Matric Scholarship for Scheduled Caste Students',
    shortName: 'Post Matric Scholarship (SC)',
    ministry: 'Ministry of Social Justice & Empowerment',
    needs: ['education', 'financial'],
    description:
      'Scholarship that helps SC students studying after Class 10 pay for fees and study-related expenses.',
    benefits: [
      'Reimbursement of compulsory non-refundable fees',
      'Academic allowance for study-related costs',
    ],
    eligibility: [
      'Student belonging to a Scheduled Caste',
      'Studying in Class 11 or above at a recognised institution',
      'Parental annual income within the limit set by the guidelines',
    ],
    criteria: [
      occupationIn(['student'], 'Currently a student'),
      custom('Belongs to a Scheduled Caste', (p) =>
        p.socialCategory === 'sc' ? 'met' : !p.socialCategory || p.socialCategory === 'prefer-not' ? 'unknown' : 'not-met',
      ),
      incomeAtMost(250000, 'Parental income up to ₹2.5 lakh per year'),
      requiresVerification('Enrolled in Class 11 or higher'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'caste-certificate', name: 'Caste certificate' },
      { id: 'income-certificate', name: 'Parental income certificate' },
      { id: 'marksheet', name: 'Previous class marksheet' },
      { id: 'fee-receipt', name: 'Fee receipt / admission proof' },
      { id: 'bank-passbook', name: 'Bank account in the student’s name' },
    ],
    applicationSteps: [
      'Register on the National Scholarship Portal (NSP) or your state scholarship portal.',
      'Fill in academic, income, and bank details.',
      'Upload the required certificates.',
      'Your institution verifies the application, followed by district and state verification.',
    ],
    officialUrl: 'https://scholarships.gov.in',
    faqs: [
      {
        question: 'Which portal should I use — national or state?',
        answer: 'Many states run this scholarship on their own portal. Check with your institution’s scholarship desk.',
      },
    ],
    contact: { note: 'Contact your institution’s scholarship nodal officer or the NSP helpdesk listed on the portal.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pmmy',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    shortName: 'MUDRA Loan',
    ministry: 'Department of Financial Services, Ministry of Finance',
    needs: ['financial', 'employment'],
    description:
      'Collateral-free loans through banks and financial institutions for starting or growing small non-farm businesses.',
    benefits: [
      'Loans in categories such as Shishu, Kishore, and Tarun based on business stage',
      'No collateral required for eligible loans',
    ],
    eligibility: [
      'Individual or small business engaged in manufacturing, trading, or services',
      'Business plan acceptable to the lending institution',
      'Approval depends on the bank’s credit assessment',
    ],
    criteria: [
      occupationIn(['self-employed', 'artisan', 'unemployed'], 'Runs or wants to start a small business'),
      ageBetween(18, 120, 'Adult applicant (18+)'),
      requiresVerification('Lender approves the business plan and credit assessment'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'pan', name: 'PAN card' },
      { id: 'business-plan', name: 'Business plan or quotation of items to buy' },
      { id: 'address-proof', name: 'Proof of business address' },
      { id: 'bank-statement', name: 'Bank statement (last 6 months)', note: 'If available' },
    ],
    applicationSteps: [
      'Prepare a simple business plan describing what you will do and how the loan will be used.',
      'Visit a bank branch, NBFC, or apply via the official portal.',
      'Submit the application with KYC and business documents.',
      'The lender assesses your application and decides the loan amount.',
    ],
    officialUrl: 'https://www.mudra.org.in',
    faqs: [
      {
        question: 'Is MUDRA a free grant?',
        answer: 'No. MUDRA is a loan and must be repaid with interest as agreed with the bank.',
      },
    ],
    contact: { note: 'Contact your nearest bank branch or see contact details on the official MUDRA website.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pmuy',
    name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    shortName: 'Ujjwala Yojana',
    ministry: 'Ministry of Petroleum & Natural Gas',
    needs: ['women-child', 'healthcare'],
    description:
      'Deposit-free LPG connections for adult women from poor households to replace unsafe cooking fuels.',
    benefits: ['Deposit-free LPG connection', 'First refill and stove support as per current guidelines'],
    eligibility: [
      'Adult woman (18+) from a poor household',
      'No existing LPG connection in the same household',
      'Belongs to an eligible category listed in the guidelines',
    ],
    criteria: [
      custom('Applicant is a woman', (p) =>
        p.gender === 'female' ? 'met' : !p.gender || p.gender === 'prefer-not' ? 'unknown' : 'not-met',
      ),
      ageBetween(18, 120, 'Aged 18 or above'),
      incomeAtMost(250000, 'From a low-income household (indicative)'),
      requiresVerification('No LPG connection already in the household'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'ration-card', name: 'Ration card' },
      { id: 'bank-passbook', name: 'Bank account details' },
      { id: 'kyc-form', name: 'KYC application form' },
    ],
    applicationSteps: [
      'Apply online through the official PMUY portal or visit a nearby LPG distributor.',
      'Submit the KYC form with Aadhaar and ration card.',
      'The distributor verifies details and issues the connection after approval.',
    ],
    officialUrl: 'https://www.pmuy.gov.in',
    faqs: [
      {
        question: 'Can a man apply on behalf of the family?',
        answer: 'The connection is issued in the name of an adult woman of the household.',
      },
    ],
    contact: { note: 'Contact your nearest LPG distributor or see the official PMUY website.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana (APY)',
    shortName: 'Atal Pension Yojana',
    ministry: 'Department of Financial Services, Ministry of Finance (administered by PFRDA)',
    needs: ['pension', 'financial'],
    description:
      'A voluntary pension scheme where you contribute regularly and receive a fixed monthly pension after age 60.',
    benefits: [
      'Guaranteed monthly pension after age 60, based on your chosen pension amount and contributions',
      'Pension continues to spouse after the subscriber’s death, as per scheme rules',
    ],
    eligibility: [
      'Indian citizen aged 18 to 40 years',
      'Has a savings bank or post office account',
      'Income tax payers are not eligible to join (as per recent rules)',
    ],
    criteria: [
      ageBetween(18, 40),
      requiresVerification('Not an income tax payer'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'bank-passbook', name: 'Savings bank account' },
      { id: 'mobile', name: 'Mobile number' },
    ],
    applicationSteps: [
      'Visit the bank or post office where you have a savings account.',
      'Fill in the APY registration form and choose your pension amount.',
      'Allow auto-debit of the monthly contribution from your account.',
    ],
    officialUrl: 'https://www.pfrda.org.in',
    faqs: [
      {
        question: 'Can I change the pension amount later?',
        answer: 'Scheme rules allow changes at specified times. Ask your bank for the current process.',
      },
    ],
    contact: { note: 'Contact your bank branch or post office.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pmjjby',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    shortName: 'Jeevan Jyoti Bima',
    ministry: 'Department of Financial Services, Ministry of Finance',
    needs: ['financial'],
    description:
      'Low-cost, one-year renewable life insurance available through your bank or post office account.',
    benefits: ['Life cover of ₹2 lakh in case of death due to any cause', 'Low annual premium, auto-debited'],
    eligibility: ['Aged 18 to 50 years', 'Has a bank or post office savings account', 'Gives consent for auto-debit'],
    criteria: [ageBetween(18, 50)],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'bank-passbook', name: 'Savings bank account' },
    ],
    applicationSteps: [
      'Visit your bank branch or use net banking / mobile banking.',
      'Fill in the PMJJBY enrolment form and nominate a family member.',
      'Allow auto-debit of the annual premium.',
    ],
    officialUrl: 'https://www.jansuraksha.gov.in',
    faqs: [
      {
        question: 'Do I need a medical test?',
        answer: 'Usually no medical test is required. Your bank can confirm current requirements.',
      },
    ],
    contact: { note: 'Contact your bank branch.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'mgnrega',
    name: 'Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)',
    shortName: 'MGNREGA',
    ministry: 'Ministry of Rural Development',
    needs: ['employment'],
    description:
      'Guaranteed wage employment for rural households whose adult members volunteer to do unskilled manual work.',
    benefits: [
      'Up to 100 days of wage employment per household per financial year',
      'Wages paid directly to the bank or post office account',
    ],
    eligibility: [
      'Rural household',
      'Adult members willing to do unskilled manual work',
      'Household must register and obtain a job card',
    ],
    criteria: [
      custom('Lives in a rural area', (p) => (p.residence === 'rural' ? 'met' : 'not-met')),
      ageBetween(18, 120, 'Adult household member (18+)'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'photo', name: 'Passport-size photographs' },
      { id: 'bank-passbook', name: 'Bank or post office account' },
    ],
    applicationSteps: [
      'Apply to your Gram Panchayat for registration and a job card.',
      'Once you have a job card, submit a written application for work.',
      'Work should be provided within the time limit set by law.',
    ],
    officialUrl: 'https://nrega.nic.in',
    faqs: [
      {
        question: 'Is there a fee for the job card?',
        answer: 'The job card is meant to be issued free of cost. Contact your Panchayat or Block office if asked to pay.',
      },
    ],
    contact: { note: 'Contact your Gram Panchayat or Block Programme Officer.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'pm-vishwakarma',
    name: 'PM Vishwakarma',
    shortName: 'PM Vishwakarma',
    ministry: 'Ministry of Micro, Small & Medium Enterprises',
    needs: ['employment', 'financial'],
    description:
      'Support for traditional artisans and craftspeople through recognition, skill training, toolkits, and collateral-free credit.',
    benefits: [
      'PM Vishwakarma certificate and ID card',
      'Skill training with a stipend',
      'Toolkit incentive and collateral-free credit in stages',
    ],
    eligibility: [
      'Artisan or craftsperson working with hands and tools in one of the listed trades',
      'Aged 18 or above',
      'Registration verified at Gram Panchayat / ULB and district level',
    ],
    criteria: [
      occupationIn(['artisan'], 'Works in a traditional trade or craft'),
      ageBetween(18, 120, 'Aged 18 or above'),
      requiresVerification('Trade is in the official list of eligible trades'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'mobile', name: 'Mobile number linked with Aadhaar' },
      { id: 'bank-passbook', name: 'Bank account details' },
      { id: 'ration-card', name: 'Ration card', note: 'If available' },
    ],
    applicationSteps: [
      'Visit a Common Service Centre (CSC) for registration on the official portal.',
      'Complete Aadhaar-based biometric verification.',
      'Your registration is verified at the Gram Panchayat / ULB and district level.',
    ],
    officialUrl: 'https://pmvishwakarma.gov.in',
    faqs: [
      {
        question: 'Which trades are covered?',
        answer: 'The official portal lists the eligible trades, such as carpenters, potters, tailors, and blacksmiths.',
      },
    ],
    contact: { note: 'See the helpdesk details on the official PM Vishwakarma portal.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'nsap-ignoaps',
    name: 'Indira Gandhi National Old Age Pension Scheme (NSAP)',
    shortName: 'Old Age Pension (NSAP)',
    ministry: 'Ministry of Rural Development',
    needs: ['pension'],
    description:
      'Monthly pension for elderly persons from below-poverty-line households, often topped up by the state government.',
    benefits: ['Monthly pension paid to the bank or post office account', 'Many states add their own contribution'],
    eligibility: ['Aged 60 or above', 'Belongs to a below-poverty-line (BPL) household'],
    criteria: [
      ageBetween(60, 120, 'Aged 60 or above'),
      incomeAtMost(100000, 'Belongs to a BPL household (indicative)'),
      requiresVerification('Listed as a BPL household'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'age-proof', name: 'Age proof' },
      { id: 'bpl-card', name: 'BPL card / ration card' },
      { id: 'bank-passbook', name: 'Bank or post office account' },
    ],
    applicationSteps: [
      'Collect the pension application form from your Gram Panchayat, Block office, or municipal office.',
      'Submit it with age proof, BPL proof, and bank details.',
      'The application is verified and sanctioned by the competent authority.',
    ],
    officialUrl: 'https://nsap.nic.in',
    faqs: [
      {
        question: 'Can I apply online?',
        answer: 'Some states offer online applications. Check your state social welfare department website.',
      },
    ],
    contact: { note: 'Contact your state social welfare department or Block office.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'nsap-igndps',
    name: 'Indira Gandhi National Disability Pension Scheme (NSAP)',
    shortName: 'Disability Pension (NSAP)',
    ministry: 'Ministry of Rural Development',
    needs: ['pension', 'healthcare'],
    description:
      'Monthly pension for persons with severe or multiple disabilities from below-poverty-line households.',
    benefits: ['Monthly pension paid to the bank or post office account', 'Many states add their own contribution'],
    eligibility: [
      'Aged 18 to 79 years',
      'Severe or multiple disability (80% or above) as per guidelines',
      'Belongs to a BPL household',
    ],
    criteria: [
      ageBetween(18, 79),
      custom('Disability of 80% or more', (p) =>
        p.disability === '80-plus'
          ? 'met'
          : !p.disability || p.disability === 'prefer-not'
            ? 'unknown'
            : 'not-met',
      ),
      incomeAtMost(100000, 'Belongs to a BPL household (indicative)'),
    ],
    documents: [
      { id: 'aadhaar', name: 'Aadhaar card' },
      { id: 'disability-certificate', name: 'Disability certificate / UDID card' },
      { id: 'bpl-card', name: 'BPL card / ration card' },
      { id: 'bank-passbook', name: 'Bank or post office account' },
    ],
    applicationSteps: [
      'Get a disability certificate or UDID card from the authorised medical authority if you do not have one.',
      'Submit the pension form at your Gram Panchayat, Block, or municipal office.',
      'The application is verified and sanctioned by the competent authority.',
    ],
    officialUrl: 'https://nsap.nic.in',
    faqs: [
      {
        question: 'What is a UDID card?',
        answer: 'A Unique Disability ID card issued by the government. You can apply on the official Swavlamban portal.',
      },
    ],
    contact: { note: 'Contact your state social welfare department or Block office.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    shortName: 'Sukanya Samriddhi',
    ministry: 'Ministry of Finance',
    needs: ['women-child', 'education', 'financial'],
    description:
      'A small savings account for a girl child that offers a government-set interest rate and tax benefits, to support her education and future.',
    benefits: ['Interest rate set by the government each quarter', 'Partial withdrawal allowed for higher education'],
    eligibility: [
      'Account opened by a parent or guardian for a girl child below 10 years of age',
      'Limits apply on the number of accounts per family',
    ],
    criteria: [
      requiresVerification('Has a daughter below 10 years of age'),
      custom('Family has children', (p) => (p.familySize === '1-2' ? 'unknown' : 'met')),
    ],
    documents: [
      { id: 'birth-certificate', name: 'Birth certificate of the girl child' },
      { id: 'guardian-aadhaar', name: 'Parent / guardian Aadhaar card' },
      { id: 'guardian-pan', name: 'Parent / guardian PAN card' },
      { id: 'photo', name: 'Photographs' },
    ],
    applicationSteps: [
      'Visit a post office or authorised bank branch.',
      'Fill in the SSY account opening form.',
      'Submit documents and make the initial deposit.',
    ],
    officialUrl: 'https://www.indiapost.gov.in',
    faqs: [
      {
        question: 'Is this a grant?',
        answer: 'No. It is a savings scheme — you deposit money and earn interest.',
      },
    ],
    contact: { note: 'Contact your nearest post office or authorised bank.' },
    lastVerified: null,
    dataStatus: 'demo',
  },
]

export function getSchemeById(id: string) {
  return SCHEMES.find((s) => s.id === id)
}
