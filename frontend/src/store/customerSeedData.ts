// ============================================================================
// Multi-Branch Customer Directory Dataset Generator
// Provides realistic customer directories for all Qiyam Ventures Branches:
// - Head Office (Kozhikode): 1,245 contacts
// - Kochi Branch: 654 contacts
// - Bangalore Branch: 447 contacts
// - Mumbai Branch: 395 contacts
// - Chennai Branch: 280 contacts
// - Hyderabad Branch: 215 contacts
// - Delhi Branch: 120 contacts
// Total: 3,356 active CRM customer accounts
// ============================================================================

export interface MultiBranchCustomer {
  id: string | number;
  name: string;
  contact_name: string;
  phone: string;
  phone_number: string;
  email: string;
  company?: string;
  location: string;
  address: string;
  branch: string;
  branch_code: string;
  city: string;
  category: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor';
  status: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor';
  tags: string[];
  total_spent: number;
  total_spend?: number;
  jobs_count: number;
  orders_count?: number;
  avatar: string;
  first_seen: string;
  last_contact_date: string;
  segment: 'Enterprise VIP' | 'Premium Retainer' | 'Commercial' | 'Retail Client';
}

interface BranchMeta {
  name: string;
  city: string;
  state: string;
  code: string;
  count: number;
  areas: string[];
  companies: string[];
  people: string[];
  phonePrefix: string;
}

const BRANCH_CONFIGS: BranchMeta[] = [
  {
    name: 'Head Office',
    city: 'Kozhikode',
    state: 'Kerala',
    code: 'HO',
    count: 1245,
    phonePrefix: '98460',
    areas: [
      'Beach Road', 'Mavoor Road', 'CyberPark Phase 2', 'Hilite City', 'Mananchira',
      'Koyilandy Market', 'Vadakara Town', 'Feroke Industrial', 'Thondayad Junction',
      'Nadakkavu', 'Medical College Road', 'West Hill', 'Ramanattukara', 'Beypore Harbor',
      'Pantheeramkavu', 'Cheruvannur', 'Kallai Road', 'Eranhipalam', 'Karanthur'
    ],
    companies: [
      'Malabar Gold & Diamonds HQ', 'CyberPark Tech Hub', 'Hilite Mall Retail Ops',
      'Calicut Beach Residency', 'Mavoor Road Wholesale Traders', 'Baby Memorial Healthcare Unit',
      'Koyilandy Marine Coldstore', 'Feroke Modern Timber Works', 'Mananchira Commercials',
      'Thondayad Logistics Center', 'Aster MIMS Facilities', 'Kallai Exporters Association',
      'Zamorin Heritage Suites', 'North Malabar Agro Products', 'Wayanad Green Spices Depot'
    ],
    people: [
      'Amit Verma', 'Anita Singh', 'Vikram Mehta', 'Sneha Joshi', 'Rahul Singh',
      'Deepak Patel', 'Neha Patel', 'Kiran Kumar', 'Faisal Rahman', 'Shabeer Ali',
      'Jamsheer K', 'Sujith Nambiar', 'Anoop Krishnan', 'Haridas K', 'Reshma V'
    ]
  },
  {
    name: 'Kochi Branch',
    city: 'Kochi',
    state: 'Kerala',
    code: 'KC',
    count: 654,
    phonePrefix: '98471',
    areas: [
      'Kakkanad Infopark', 'Marine Drive', 'Panampilly Nagar', 'Edappally Toll',
      'Vyttila Mobility Hub', 'Aluva Highway', 'Kaloor Stadium Road', 'Fort Kochi Heritage',
      'MG Road Kochi', 'Palarivattom', 'Ravipuram', 'Kalamassery Tech Zone',
      'Thripunithura Heritage', 'Thevara Ferry', 'Kadavanthra Junction'
    ],
    companies: [
      'Infopark Phase 1 Operations', 'Marine Drive Waterfront Suites', 'Kakkanad Commercial Hub',
      'Lulu Mall Retail Logistics', 'Edappally Advanced Diagnostics', 'Fort Kochi Boutique Stays',
      'Panampilly Nagar Design Studios', 'Vyttila Express Hub', 'Cochin Shipyard Vendor Annex',
      'SmartCity Kochi Media Lab', 'Willingdon Island Port Logistics', 'Kochi Metro Transit Retail'
    ],
    people: [
      'Dr. Tariq Rahman', 'Pooja Iyer', 'Dr. Joseph Kurian', 'Deepa Menon',
      'Arun Pillai', 'Kavitha Nair', 'Suresh Babu', 'Biju Varghese',
      'Mathew Thomas', 'Anjali George', 'Gopakumar K', 'Roshni Kurup'
    ]
  },
  {
    name: 'Bangalore Branch',
    city: 'Bangalore',
    state: 'Karnataka',
    code: 'BR-003',
    count: 447,
    phonePrefix: '98450',
    areas: [
      'Indiranagar 100ft Road', 'Koramangala 4th Block', 'Whitefield IT Export Zone',
      'Electronic City Phase 1', 'HSR Layout Sector 3', 'MG Road Commercial',
      'Jayanagar 4th Block', 'BTM Layout 2nd Stage', 'Bellandur EcoSpace',
      'Manyata Tech Park', 'Hebbal Flyover Junction', 'Malleshwaram Sampige Road',
      'Domlur Ring Road', 'Bannerghatta Road', 'Sarjapur Main Road', 'Richmond Town',
      'Yelahanka New Town', 'Frazer Town Mosque Road', 'Marathahalli Bridge', 'Cunningham Road'
    ],
    companies: [
      'Apex Logistics Bangalore', 'Infosys Tech Park Services', 'Prestige Meridian Solutions',
      'Koramangala Tech Suites', 'Whitefield Global Enterprises', 'Electronic City DataHub',
      'Manyata Cyber Systems', 'Brigade Gateway Commercials', 'UB City Luxury Retail',
      'Jayanagar Health Diagnostics', 'BTM Fitness & Wellness', 'Malleshwaram Silks Corp',
      'Indiranagar Co-work Collective', 'HSR Cyber Solutions', 'Bellandur EcoSpace Labs',
      'Domlur Media Studio', 'Marathahalli Retail Mart', 'Kalyan Nagar Health Center',
      'Sarjapur Living Tech Hub', 'Rajajinagar Trade Complex'
    ],
    people: [
      'Siddharth Rao', 'Divya Venkatesh', 'Arvind Swamy', 'Nithya Menon',
      'Rohan Hegde', 'Pooja Hegde', 'Aditya Kamath', 'Deepak Shenoy',
      'Ananya Gowda', 'Vinay Murthy', 'Swathi Raghavan', 'Gautam Pai',
      'Harish Nambiar', 'Meera Subramanian', 'Pranav Kulkarni', 'Sangeetha Rao',
      'Vishal Deshpande', 'Kavya S', 'Naveen Kumar', 'Rashmi Iyer'
    ]
  },
  {
    name: 'Mumbai Branch',
    city: 'Mumbai',
    state: 'Maharashtra',
    code: 'BR-004',
    count: 395,
    phonePrefix: '98200',
    areas: [
      'Bandra Kurla Complex (BKC)', 'Andheri East MIDC', 'Nariman Point',
      'Lower Parel Phoenix Mills', 'Powai Hiranandani', 'Bandra West Linking Road',
      'Worli Sea Face', 'Thane West Ghodbunder', 'Juhu Tara Road', 'Colaba Causeway',
      'Vikhroli West IT Park', 'Malad Mindspace', 'Fort Heritage District', 'Navi Mumbai Vashi'
    ],
    companies: [
      'BKC Capital Advisory', 'Andheri Media Works', 'Nariman Point Legal Chambers',
      'Bandra Coastal Retreat', 'Powai Tech Incubator', 'Lower Parel Creative Mills',
      'Thane Logistics Warehouse', 'Worli Horizon Towers', 'Juhu Beach Hospitality',
      'Colaba International Exports', 'Mindspace BPO Towers', 'Vashi Agricultural Exchange'
    ],
    people: [
      'Faizal Khan', 'Rohit Deshmukh', 'Pooja Sawant', 'Tanmay Joshi',
      'Meera Kulkarni', 'Aditi Shah', 'Sunil Gavaskar', 'Rupesh Jadhav',
      'Sanjay Singhania', 'Natasha Mehta', 'Varun Merchant', 'Shalini Patil'
    ]
  },
  {
    name: 'Chennai Branch',
    city: 'Chennai',
    state: 'Tamil Nadu',
    code: 'BR-006',
    count: 280,
    phonePrefix: '98400',
    areas: [
      'OMR IT Corridor', 'T. Nagar Ranganathan St', 'Anna Salai Mount Road',
      'Guindy Industrial Estate', 'Adyar LB Road', 'Velachery Main Road',
      'Nungambakkam High Road', 'Mylapore Tank', 'Alwarpet TTK Road',
      'ECR Thiruvanmiyur', 'Porur DLF IT Park', 'Ambattur Industrial Hub'
    ],
    companies: [
      'OMR Cyber Towers', 'T Nagar Silk Retainers', 'Anna Salai Motors & Spares',
      'Guindy Precision Engineering', 'Adyar Wellness Clinic', 'Velachery Grand Mall Ops',
      'Nungambakkam Trade Consulates', 'Mylapore Heritage Stays', 'DLF Chennai Tech Hub',
      'Porur Medical Diagnostic Center', 'Ambattur Manufacturing Works'
    ],
    people: [
      'Kavitha Raman', 'R. Sundaram', 'Karthik Subramanian', 'Meenakshi Sundaram',
      'Anand Rajagopal', 'Geetha Balaji', 'S. Chandrasekhar', 'Vijayalakshmi N',
      'Muthukumar S', 'Praveen Venkatesan', 'Radhika Swaminathan'
    ]
  },
  {
    name: 'Hyderabad Branch',
    city: 'Hyderabad',
    state: 'Telangana',
    code: 'BR-007',
    count: 215,
    phonePrefix: '98490',
    areas: [
      'HITEC City Cyber Towers', 'Gachibowli Financial Dist', 'Madhapur Inorbit Road',
      'Banjara Hills Road No 12', 'Jubilee Hills Road No 36', 'Kondapur Botanical Garden',
      'Secunderabad Station Road', 'Begumpet Airport Plaza', 'Kukatpally Housing Board',
      'Financial District WaveRock', 'Somajiguda Circle'
    ],
    companies: [
      'HITEC City Cloud Hub', 'Gachibowli Bio Park Labs', 'Madhapur Digital Networks',
      'Banjara Hills Diagnostics', 'Jubilee Hills Lifestyle Club', 'Secunderabad Rail Freight',
      'Kondapur Tech Park', 'Kukatpally Mega Retail', 'WaveRock Global Services',
      'Cyber Gateway Facilities', 'Telangana Pharma Hub'
    ],
    people: [
      'Aneesh Reddy', 'Sravanthi Rao', 'Venkat Prabhu', 'Sireesha Devi',
      'Prashanth Naidu', 'Lakshmi Prasanna', 'Harsha Vardhan', 'Kavita Challa',
      'Ravi Teja V', 'Madhavi Latha', 'Srinivas Murthy'
    ]
  },
  {
    name: 'Delhi Branch',
    city: 'New Delhi',
    state: 'Delhi',
    code: 'BR-005',
    count: 120,
    phonePrefix: '98100',
    areas: [
      'Connaught Place Inner Circle', 'Nehru Place IT Complex', 'South Extension Part 2',
      'Karol Bagh Arya Samaj Road', 'Saket District Centre', 'Vasant Kunj Promenade',
      'Okhla Industrial Phase 3', 'Barakhamba Road Commercial', 'Noida Sector 62 IT Hub',
      'Gurugram Cyber Hub Gateway'
    ],
    companies: [
      'Connaught Place Consulting', 'Nehru Place Hardware Nexus', 'South Ex Diagnostic Care',
      'Karol Bagh Electronics Hub', 'Saket Select Retailers', 'Okhla Fabrication Works',
      'Barakhamba Capital Associates', 'Cyber Hub Digital Media', 'Noida Tech Systems'
    ],
    people: [
      'Amitabh Sen', 'Rajiv Khanna', 'Simran Kaur', 'Harpreet Singh',
      'Pooja Chadha', 'Vikas Bhasin', 'Gurpreet Malhotra', 'Sunita Anand',
      'Deepak Grover', 'Manish Bansal'
    ]
  }
];

// Reusable avatar pool
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
];

const LAST_SEEN_OPTIONS = [
  '12 mins ago',
  '25 mins ago',
  '45 mins ago',
  '1 hour ago',
  '2 hours ago',
  '4 hours ago',
  'Yesterday 05:20 PM',
  'Yesterday 02:15 PM',
  'May 30, 2024',
  'May 29, 2024',
  'May 28, 2024'
];

/**
 * Generates the full multi-branch customer dataset matching exact branch quotas.
 */
export function generateMultiBranchCustomers(): MultiBranchCustomer[] {
  const result: MultiBranchCustomer[] = [];

  for (const b of BRANCH_CONFIGS) {
    const isHO = b.code === 'HO';
    for (let i = 0; i < b.count; i++) {
      const isCorporate = i % 3 === 0;
      const area = b.areas[i % b.areas.length];
      const cycleIndex = Math.floor(i / (isCorporate ? b.companies.length : b.people.length)) + 1;
      
      const rawBaseName = isCorporate
        ? b.companies[i % b.companies.length]
        : b.people[i % b.people.length];
      
      const displayName = cycleIndex > 1
        ? `${rawBaseName} (Unit ${cycleIndex})`
        : rawBaseName;

      // Realistic category distribution: 80% Customer, 10% Lead, 6% Hot Lead, 4% Vendor
      const catMod = i % 100;
      let category: 'Customer' | 'Lead' | 'Hot Lead' | 'Vendor' = 'Customer';
      if (catMod >= 80 && catMod < 90) category = 'Lead';
      else if (catMod >= 90 && catMod < 96) category = 'Hot Lead';
      else if (catMod >= 96) category = 'Vendor';

      // Segment distribution
      let segment: 'Enterprise VIP' | 'Premium Retainer' | 'Commercial' | 'Retail Client' = 'Commercial';
      if (category === 'Customer') {
        if (i % 10 === 0) segment = 'Enterprise VIP';
        else if (i % 4 === 0) segment = 'Premium Retainer';
        else if (i % 2 === 0) segment = 'Commercial';
        else segment = 'Retail Client';
      }

      // Financials
      let totalSpent = 0;
      let jobsCount = 1;
      if (category === 'Customer') {
        if (segment === 'Enterprise VIP') {
          totalSpent = 75000 + ((i * 1370) % 180000);
          jobsCount = 6 + (i % 20);
        } else if (segment === 'Premium Retainer') {
          totalSpent = 35000 + ((i * 920) % 55000);
          jobsCount = 4 + (i % 12);
        } else if (segment === 'Commercial') {
          totalSpent = 12000 + ((i * 610) % 25000);
          jobsCount = 2 + (i % 8);
        } else {
          totalSpent = 2800 + ((i * 350) % 8000);
          jobsCount = 1 + (i % 4);
        }
      } else if (category === 'Vendor') {
        totalSpent = 45000 + ((i * 1150) % 95000);
        jobsCount = 5 + (i % 15);
      } else {
        totalSpent = 0;
        jobsCount = 0;
      }

      // Deterministic, valid 10-digit Indian phone
      // e.g. +91 98450 XXXXX
      const numSuffix = String(10000 + (i % 89999)).padStart(5, '0');
      const phone = `+91 ${b.phonePrefix} ${numSuffix}`;

      // Email
      const cleanSlug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18);
      const email = `${cleanSlug}@${b.city.toLowerCase().replace(/\s+/g, '')}-qiyam.in`;

      const id = `${b.code.toLowerCase()}_cust_${i + 1}`;
      const location = `${area}, ${b.city}, ${b.state}`;
      const avatar = AVATARS[i % AVATARS.length];
      const lastActive = LAST_SEEN_OPTIONS[i % LAST_SEEN_OPTIONS.length];

      result.push({
        id,
        name: displayName,
        contact_name: displayName,
        phone,
        phone_number: phone,
        email,
        company: isCorporate ? displayName : `${displayName} Services`,
        location,
        address: location,
        branch: b.name,
        branch_code: b.code,
        city: b.city,
        category,
        status: category,
        tags: [b.name, category, segment],
        total_spent: totalSpent,
        total_spend: totalSpent,
        jobs_count: jobsCount,
        orders_count: jobsCount,
        avatar,
        first_seen: 'May 1, 2024',
        last_contact_date: lastActive,
        segment
      });
    }
  }

  return result;
}

// Pre-generated singleton instance
export const INITIAL_MULTI_BRANCH_CUSTOMERS = generateMultiBranchCustomers();
