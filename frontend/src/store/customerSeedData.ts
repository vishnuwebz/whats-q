// ============================================================================
// Multi-Branch Customer Directory Dataset Generator
// Dynamically provides realistic customer directories for ANY registered branches
// (including Chennai Branch, kashmir, Hyderabad Branch, demo, Delhi Branch,
//  calicut, Head Office, Kochi Branch, Bangalore, Mumbai, etc.)
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
  [key: string]: any;
}

interface CityCatalog {
  areas: string[];
  companies: string[];
  people: string[];
  phonePrefix: string;
}

const CITY_CATALOGS: Record<string, CityCatalog> = {
  delhi: {
    phonePrefix: '98100',
    areas: [
      'Connaught Place Inner Circle', 'Nehru Place IT Complex', 'South Extension Part 2',
      'Karol Bagh Arya Samaj Road', 'Saket District Centre', 'Vasant Kunj Promenade',
      'Okhla Industrial Phase 3', 'Barakhamba Road Commercial', 'Noida Sector 62 IT Hub',
      'Gurugram Cyber Hub Gateway', 'Lajpat Nagar Central Market', 'Hauz Khas Village Road',
      'Dwarka Sector 12 Hub', 'Janakpuri District Centre', 'Pitampura Netaji Subhash Place'
    ],
    companies: [
      'Connaught Place Consulting', 'Nehru Place Hardware Nexus', 'South Ex Diagnostic Care',
      'Karol Bagh Electronics Hub', 'Saket Select Retailers', 'Okhla Fabrication Works',
      'Barakhamba Capital Associates', 'Cyber Hub Digital Media', 'Noida Tech Systems',
      'Lajpat Commercial Consortium', 'Hauz Khas Hospitality Works', 'Dwarka Infrastructure Labs',
      'Janakpuri Trade Center', 'Netaji Subhash Commercials', 'Vasant Kunj Luxury Retainers'
    ],
    people: [
      'Amitabh Sen', 'Rajiv Khanna', 'Simran Kaur', 'Harpreet Singh',
      'Pooja Chadha', 'Vikas Bhasin', 'Gurpreet Malhotra', 'Sunita Anand',
      'Deepak Grover', 'Manish Bansal', 'Rohit Aggarwal', 'Neha Singhal',
      'Tanvi Batra', 'Amanpreet Singh', 'Sanjay Kapoor'
    ]
  },
  kashmir: {
    phonePrefix: '99060',
    areas: [
      'Lal Chowk Business Hub', 'Residency Road Commercials', 'Rajbagh Riverview',
      'Dal Gate Waterfront', 'Karan Nagar Healthcare Zone', 'Sanat Nagar Industrial Hub',
      'Hyderpora Bypass', 'Bemina Trade Center', 'Leh Main Bazaar', 'Kargil Market Road',
      'Anantnag Town Centre', 'Baramulla River Road'
    ],
    companies: [
      'Kashmir Valley Crafts & Silks', 'Dal Lake Hospitality Suites', 'Lal Chowk Commercial Depot',
      'Rajbagh Modern Residency', 'Himalayan Cold Storage Works', 'Zabarwan Tea & Spices Corp',
      'Chinar Woodcraft Exports', 'Gulmarg Winter Sports Lodge', 'Pahalgam Eco Tourism Desk',
      'Kashmir Agro Logistics', 'Ladakh Solar Power Labs', 'Kargil Transit Services'
    ],
    people: [
      'Bashir Ahmed', 'Farooq Dar', 'Tariq Mir', 'Zahoor Lone',
      'Shabir Wani', 'Dr. Sajad Bhat', 'Muzaffar Shah', 'Irfan Yasin',
      'Bilal Rather', 'Nuzhat Parveen', 'Amina Begum', 'Mohammad Iqbal'
    ]
  },
  chennai: {
    phonePrefix: '98400',
    areas: [
      'OMR IT Corridor', 'T. Nagar Ranganathan St', 'Anna Salai Mount Road',
      'Guindy Industrial Estate', 'Adyar LB Road', 'Velachery Main Road',
      'Nungambakkam High Road', 'Mylapore Tank', 'Alwarpet TTK Road',
      'ECR Thiruvanmiyur', 'Porur DLF IT Park', 'Ambattur Industrial Hub',
      'Kotturpuram Riverview', 'Kilpauk Garden Road', 'Perungudi Express Highway'
    ],
    companies: [
      'OMR Cyber Towers', 'T Nagar Silk Retainers', 'Anna Salai Motors & Spares',
      'Guindy Precision Engineering', 'Adyar Wellness Clinic', 'Velachery Grand Mall Ops',
      'Nungambakkam Trade Consulates', 'Mylapore Heritage Stays', 'DLF Chennai Tech Hub',
      'Porur Medical Diagnostic Center', 'Ambattur Manufacturing Works', 'ECR Coastal Resorts'
    ],
    people: [
      'Kavitha Raman', 'R. Sundaram', 'Karthik Subramanian', 'Meenakshi Sundaram',
      'Anand Rajagopal', 'Geetha Balaji', 'S. Chandrasekhar', 'Vijayalakshmi N',
      'Muthukumar S', 'Praveen Venkatesan', 'Radhika Swaminathan', 'Suresh Kumar'
    ]
  },
  hyderabad: {
    phonePrefix: '98490',
    areas: [
      'HITEC City Cyber Towers', 'Gachibowli Financial Dist', 'Madhapur Inorbit Road',
      'Banjara Hills Road No 12', 'Jubilee Hills Road No 36', 'Kondapur Botanical Garden',
      'Secunderabad Station Road', 'Begumpet Airport Plaza', 'Kukatpally Housing Board',
      'Financial District WaveRock', 'Somajiguda Circle', 'Manikonda Outer Ring'
    ],
    companies: [
      'HITEC City Cloud Hub', 'Gachibowli Bio Park Labs', 'Madhapur Digital Networks',
      'Banjara Hills Diagnostics', 'Jubilee Hills Lifestyle Club', 'Secunderabad Rail Freight',
      'Kondapur Tech Park', 'Kukatpally Mega Retail', 'WaveRock Global Services',
      'Cyber Gateway Facilities', 'Telangana Pharma Hub', 'Deccan Logistics Hub'
    ],
    people: [
      'Aneesh Reddy', 'Sravanthi Rao', 'Venkat Prabhu', 'Sireesha Devi',
      'Prashanth Naidu', 'Lakshmi Prasanna', 'Harsha Vardhan', 'Kavita Challa',
      'Ravi Teja V', 'Madhavi Latha', 'Srinivas Murthy', 'Chaitanya Varma'
    ]
  },
  kochi: {
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
  calicut: {
    phonePrefix: '98460',
    areas: [
      'Beach Road', 'Mavoor Road', 'CyberPark Phase 2', 'Hilite City', 'Mananchira',
      'Koyilandy Market', 'Vadakara Town', 'Feroke Industrial', 'Thondayad Junction',
      'Nadakkavu', 'Medical College Road', 'West Hill', 'Ramanattukara', 'Beypore Harbor'
    ],
    companies: [
      'Malabar Gold & Diamonds HQ', 'CyberPark Tech Hub', 'Hilite Mall Retail Ops',
      'Calicut Beach Residency', 'Mavoor Road Wholesale Traders', 'Baby Memorial Healthcare Unit',
      'Koyilandy Marine Coldstore', 'Feroke Modern Timber Works', 'Mananchira Commercials',
      'Thondayad Logistics Center', 'Aster MIMS Facilities', 'Kallai Exporters Association'
    ],
    people: [
      'Amit Verma', 'Anita Singh', 'Vikram Mehta', 'Sneha Joshi', 'Rahul Singh',
      'Deepak Patel', 'Neha Patel', 'Kiran Kumar', 'Faisal Rahman', 'Shabeer Ali',
      'Jamsheer K', 'Sujith Nambiar', 'Anoop Krishnan', 'Haridas K', 'Reshma V'
    ]
  },
  bangalore: {
    phonePrefix: '98450',
    areas: [
      'Indiranagar 100ft Road', 'Koramangala 4th Block', 'Whitefield IT Export Zone',
      'Electronic City Phase 1', 'HSR Layout Sector 3', 'MG Road Commercial',
      'Jayanagar 4th Block', 'BTM Layout 2nd Stage', 'Bellandur EcoSpace',
      'Manyata Tech Park', 'Hebbal Flyover Junction', 'Malleshwaram Sampige Road'
    ],
    companies: [
      'Apex Logistics Bangalore', 'Infosys Tech Park Services', 'Prestige Meridian Solutions',
      'Koramangala Tech Suites', 'Whitefield Global Enterprises', 'Electronic City DataHub',
      'Manyata Cyber Systems', 'Brigade Gateway Commercials', 'UB City Luxury Retail',
      'Jayanagar Health Diagnostics', 'BTM Fitness & Wellness', 'Malleshwaram Silks Corp'
    ],
    people: [
      'Siddharth Rao', 'Divya Venkatesh', 'Arvind Swamy', 'Nithya Menon',
      'Rohan Hegde', 'Pooja Hegde', 'Aditya Kamath', 'Deepak Shenoy',
      'Ananya Gowda', 'Vinay Murthy', 'Swathi Raghavan', 'Gautam Pai'
    ]
  },
  mumbai: {
    phonePrefix: '98200',
    areas: [
      'Bandra Kurla Complex (BKC)', 'Andheri East MIDC', 'Nariman Point',
      'Lower Parel Phoenix Mills', 'Powai Hiranandani', 'Bandra West Linking Road',
      'Worli Sea Face', 'Thane West Ghodbunder', 'Juhu Tara Road', 'Colaba Causeway'
    ],
    companies: [
      'BKC Capital Advisory', 'Andheri Media Works', 'Nariman Point Legal Chambers',
      'Bandra Coastal Retreat', 'Powai Tech Incubator', 'Lower Parel Creative Mills',
      'Thane Logistics Warehouse', 'Worli Horizon Towers', 'Juhu Beach Hospitality'
    ],
    people: [
      'Faizal Khan', 'Rohit Deshmukh', 'Pooja Sawant', 'Tanmay Joshi',
      'Meera Kulkarni', 'Aditi Shah', 'Sunil Gavaskar', 'Rupesh Jadhav'
    ]
  },
  default: {
    phonePrefix: '98950',
    areas: [
      'City Center Main Road', 'Commercial Market Circle', 'Industrial Estate Zone 1',
      'High Street Shopping Plaza', 'Tech Innovation Park', 'Civil Station Square',
      'Railway Station Road', 'Highway Bypass Junction', 'Metro Terminal Hub'
    ],
    companies: [
      'Regional Enterprises HQ', 'Commercial Logistics Services', 'Metro Trade & Engineering',
      'Downtown Retail Solutions', 'Integrated Services Group', 'Pioneer Industrial Works',
      'Horizon Healthcare Retainer', 'Apex Digital Networks', 'Vanguard Commercial Facilities'
    ],
    people: [
      'Sanjay Sharma', 'Priya Menon', 'Arun Kumar', 'Deepa Nair',
      'Ramesh Babu', 'Sunita Rao', 'Karthik V', 'Anjali Gupta',
      'Manoj Pillai', 'Geetha Nambiar', 'Vinod Thomas', 'Lakshmi S'
    ]
  }
};

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
  'Oct 02, 2026',
  'Oct 01, 2026',
  'Sep 30, 2026'
];

function resolveCatalogForBranch(branchName: string, cityName: string): CityCatalog {
  const combined = `${branchName || ''} ${cityName || ''}`.toLowerCase();
  if (combined.includes('delhi') || combined.includes('noida') || combined.includes('gurugram')) return CITY_CATALOGS.delhi;
  if (combined.includes('kashmir') || combined.includes('ladakh') || combined.includes('leh')) return CITY_CATALOGS.kashmir;
  if (combined.includes('chennai') || combined.includes('madras')) return CITY_CATALOGS.chennai;
  if (combined.includes('hyderabad') || combined.includes('secunderabad')) return CITY_CATALOGS.hyderabad;
  if (combined.includes('kochi') || combined.includes('cochin') || combined.includes('ernakulam') || combined.includes('kakkanad')) return CITY_CATALOGS.kochi;
  if (combined.includes('calicut') || combined.includes('kozhikode') || combined.includes('head office') || combined.includes('koyilandy')) return CITY_CATALOGS.calicut;
  if (combined.includes('bangalore') || combined.includes('bengaluru')) return CITY_CATALOGS.bangalore;
  if (combined.includes('mumbai') || combined.includes('bombay') || combined.includes('bkc')) return CITY_CATALOGS.mumbai;
  return CITY_CATALOGS.default;
}

/**
 * Synchronizes and ensures every registered branch has its complete quota of customer accounts.
 * If backend customers exist, they are preserved; remaining quota is filled deterministically.
 */
export function syncCustomersWithBranches(
  backendCustomers: any[] = [],
  branches: any[] = []
): MultiBranchCustomer[] {
  const result: MultiBranchCustomer[] = [];
  const registeredPhones = new Set<string>();

  // Determine active branch list
  const activeBranches = Array.isArray(branches) && branches.length > 0
    ? branches
    : [
        { name: 'Head Office', city: 'Kozhikode', state: 'Kerala', code: 'HO', customers_count: 25 },
        { name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu', code: 'CHN', customers_count: 450 },
        { name: 'kashmir', city: 'ladakh', state: 'kashmir', code: 'KSH', customers_count: 150 },
        { name: 'Hyderabad Branch', city: 'Hyderabad', state: 'Telangana', code: 'HYD', customers_count: 450 },
        { name: 'demo', city: 'Kochi', state: 'Kerala', code: 'DMO', customers_count: 450 },
        { name: 'Delhi Branch', city: 'New Delhi', state: 'Delhi', code: 'DEL', customers_count: 450 },
        { name: 'calicut', city: 'calicut', state: 'Kerala', code: 'CLT', customers_count: 2 },
        { name: 'Kochi Branch', city: 'Kochi', state: 'Kerala', code: 'KOC', customers_count: 450 },
        { name: 'Bangalore Branch', city: 'Bangalore', state: 'Karnataka', code: 'BLR', customers_count: 447 },
        { name: 'Mumbai Branch', city: 'Mumbai', state: 'Maharashtra', code: 'BOM', customers_count: 395 },
      ];

  // Map backend customers by phone
  const backendByBranch = new Map<string, any[]>();
  (backendCustomers || []).forEach((c) => {
    const rawPhone = String(c.phone || c.phone_number || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone) registeredPhones.add(cleanPhone);

    const bName = c.branch ||
      (Array.isArray(c.tags) && c.tags.find((t: string) => t.includes('Branch') || t === 'Head Office' || t === 'calicut' || t === 'demo' || t === 'kashmir')) ||
      '';
    if (bName) {
      if (!backendByBranch.has(bName)) backendByBranch.set(bName, []);
      backendByBranch.get(bName)!.push(c);
    }
  });

  // For each branch, guarantee its customer quota is fully populated
  activeBranches.forEach((b: any) => {
    const bName = b.name;
    const bCity = b.city || 'Territory';
    const bState = b.state || 'India';
    const bCode = b.code || bName.slice(0, 3).toUpperCase();
    const targetQuota = Math.max(1, Number(b.customers_count) || 450);

    const existingInBranch = backendByBranch.get(bName) || [];
    let branchGeneratedCount = 0;

    // 1. Include existing backend customers for this branch
    existingInBranch.forEach((bc, idx) => {
      const p = String(bc.phone || bc.phone_number || '').trim();
      const cat = bc.category || (Array.isArray(bc.tags) && bc.tags[0]) || 'Customer';
      result.push({
        id: bc.id || `${bCode.toLowerCase()}_real_${idx + 1}`,
        name: bc.name || bc.contact_name || 'Customer Account',
        contact_name: bc.name || bc.contact_name || 'Customer Account',
        phone: p,
        phone_number: p,
        email: bc.email || '',
        company: bc.company || `${bc.name || 'Account'} Co.`,
        location: bc.address || bc.location || `${bCity}, ${bState} [${bName}]`,
        address: bc.address || bc.location || `${bCity}, ${bState} [${bName}]`,
        branch: bName,
        branch_code: bCode,
        city: bCity,
        category: cat,
        status: cat,
        tags: Array.isArray(bc.tags) && bc.tags.length > 0 ? bc.tags : [bName, cat, 'Commercial'],
        total_spent: Number(bc.total_spent || bc.total_spend || 8500),
        total_spend: Number(bc.total_spent || bc.total_spend || 8500),
        jobs_count: Number(bc.jobs_count || bc.orders_count || 1),
        orders_count: Number(bc.jobs_count || bc.orders_count || 1),
        avatar: bc.avatar || AVATARS[idx % AVATARS.length],
        first_seen: bc.first_seen || 'Oct 01, 2026',
        last_contact_date: bc.last_contact_date || 'Recent',
        segment: 'Commercial'
      });
      branchGeneratedCount++;
    });

    // 2. Supplement remaining quota deterministically
    const needed = Math.max(0, targetQuota - branchGeneratedCount);
    const catalog = resolveCatalogForBranch(bName, bCity);

    for (let i = 0; i < needed; i++) {
      const isCorporate = i % 3 === 0;
      const area = catalog.areas[i % catalog.areas.length];
      const cycleIndex = Math.floor(i / (isCorporate ? catalog.companies.length : catalog.people.length)) + 1;
      
      const rawBaseName = isCorporate
        ? catalog.companies[i % catalog.companies.length]
        : catalog.people[i % catalog.people.length];
      
      const displayName = cycleIndex > 1
        ? `${rawBaseName} (Unit ${cycleIndex})`
        : rawBaseName;

      // Realistic category distribution
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

      // Unique phone generation
      const cleanSlug = bCode.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3) || 'brn';
      const numSuffix = String(10000 + (i % 89999)).padStart(5, '0');
      let phone = `+91 ${catalog.phonePrefix} ${numSuffix}`;
      
      const emailDomain = bCity.toLowerCase().replace(/[^a-z0-9]/g, '') || 'qiyam';
      const emailSlug = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
      const email = `${emailSlug}@${emailDomain}-qiyam.in`;

      const id = `${cleanSlug}_cust_${i + 1}`;
      const location = `${area}, ${bCity}, ${bState} [${bName}]`;
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
        branch: bName,
        branch_code: bCode,
        city: bCity,
        category,
        status: category,
        tags: [bName, category, segment],
        total_spent: totalSpent,
        total_spend: totalSpent,
        jobs_count: jobsCount,
        orders_count: jobsCount,
        avatar,
        first_seen: 'Oct 01, 2026',
        last_contact_date: lastActive,
        segment
      });
    }
  });

  return result;
}

// Pre-generated fallback instance
export const INITIAL_MULTI_BRANCH_CUSTOMERS = syncCustomersWithBranches([], []);
