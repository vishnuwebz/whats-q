export interface GuideStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  directLink?: { label: string; url: string };
  tip?: string;
}

export interface ApiScopeItem {
  name: string;
  description: string;
  level: 'Required' | 'Recommended' | 'Optional';
}

export interface IntegrationGuide {
  id: string;
  name: string;
  portalName: string;
  portalUrl: string;
  badge: string;
  overview: string;
  prerequisites: string[];
  steps: GuideStep[];
  scopes: ApiScopeItem[];
  webhookInfo?: {
    endpointPath: string;
    events: string[];
    secretName: string;
    instructions: string;
  };
  troubleshooting: { issue: string; solution: string }[];
}

export const INTEGRATION_GUIDES: Record<string, IntegrationGuide> = {
  google: {
    id: 'google',
    name: 'Google Workspace',
    portalName: 'Google Cloud Console',
    portalUrl: 'https://console.cloud.google.com/apis/dashboard',
    badge: 'OAuth 2.0 & Service Account',
    overview:
      'Connect WhatsQ directly to Google Workspace to automatically sync technician appointments to Google Calendar, send email summaries via Gmail API, and back up invoices and PDF media directly to Google Drive.',
    prerequisites: [
      'A Google Account or Google Workspace Admin Account',
      'Access to Google Cloud Console with Project Creation permissions',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Create or Select a Google Cloud Project',
        description:
          'Open Google Cloud Console, click the Project dropdown in the top header, and click "New Project". Give it a descriptive name like "WhatsQ Business Automation" and click Create.',
        directLink: { label: 'Open Google Cloud Console', url: 'https://console.cloud.google.com/projectcreate' },
        tip: 'If using Google Workspace, ensure you select your organization so internal permissions are granted automatically.',
      },
      {
        stepNumber: 2,
        title: 'Enable Required Google APIs',
        description:
          'In the Google Cloud Console sidebar, go to "APIs & Services" > "Library". Search and enable the following APIs: 1) Google Calendar API, 2) Gmail API, and 3) Google Drive API.',
        directLink: { label: 'Browse API Library', url: 'https://console.cloud.google.com/apis/library' },
        tip: 'Enabling all 3 allows automatic appointment scheduling, customer email notifications, and cloud document archival.',
      },
      {
        stepNumber: 3,
        title: 'Configure OAuth Consent Screen',
        description:
          'Navigate to "APIs & Services" > "OAuth consent screen". Choose "Internal" (if using Google Workspace) or "External". Enter "WhatsQ" as the App Name, provide your support email, and save.',
        directLink: { label: 'OAuth Consent Screen', url: 'https://console.cloud.google.com/apis/credentials/consent' },
      },
      {
        stepNumber: 4,
        title: 'Create OAuth 2.0 Web Application Credentials',
        description:
          'Go to "APIs & Services" > "Credentials" > click "+ CREATE CREDENTIALS" > choose "OAuth client ID". Select "Web application". Under "Authorized redirect URIs", paste the WhatsQ callback URL shown below.',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/integrations/google/callback/',
        tip: 'For headless server background automation, you can also create a "Service Account" and download its JSON key.',
      },
      {
        stepNumber: 5,
        title: 'Copy Client ID & Client Secret into WhatsQ',
        description:
          'Copy your Client ID (ends with .apps.googleusercontent.com) and Client Secret. Switch to the "Credentials & Keys" tab in this modal, paste both values, and click "Test Connection".',
      },
    ],
    scopes: [
      { name: 'https://www.googleapis.com/auth/calendar.events', description: 'Create, update, and sync technician job appointments', level: 'Required' },
      { name: 'https://www.googleapis.com/auth/gmail.send', description: 'Send transactional appointment confirmations and receipts', level: 'Recommended' },
      { name: 'https://www.googleapis.com/auth/drive.file', description: 'Store generated PDF invoices and job completion photos', level: 'Recommended' },
    ],
    troubleshooting: [
      {
        issue: 'Error: redirect_uri_mismatch (Error 400)',
        solution: 'Verify that the exact Redirect URI in Google Cloud Console matches the WhatsQ domain with trailing slash.',
      },
      {
        issue: 'Access blocked: Authorization Error',
        solution: 'If your app is in "Testing" mode on the OAuth consent screen, add your email to the "Test users" list in Google Cloud Console.',
      },
    ],
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    portalName: 'Slack API Apps Dashboard',
    portalUrl: 'https://api.slack.com/apps',
    badge: 'Bot Token & Incoming Webhooks',
    overview:
      'Connect WhatsQ with your team Slack workspace to instantly broadcast high-value customer inquiries, field job escalations, technician check-in alerts, and daily sales summaries directly into dedicated channels.',
    prerequisites: [
      'A Slack Workspace where you have permissions to install apps',
      'A Slack channel created for alerts (e.g. #whatsq-alerts, #leads)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Create a Slack App',
        description:
          'Go to the Slack API portal and click "Create New App". Choose "From scratch", name the app "WhatsQ Dispatcher", and pick your target team workspace.',
        directLink: { label: 'Create Slack App', url: 'https://api.slack.com/apps?new_app=1' },
      },
      {
        stepNumber: 2,
        title: 'Configure Bot Token Scopes',
        description:
          'In the left navigation, click "OAuth & Permissions". Scroll down to "Scopes" > "Bot Token Scopes" and add the following 4 scopes: chat:write, channels:read, incoming-webhook, chat:write.public.',
        tip: 'Adding chat:write.public allows the bot to post directly to any public channel without needing to manually invite it first.',
      },
      {
        stepNumber: 3,
        title: 'Install App to Workspace & Copy Bot Token',
        description:
          'Scroll back up on the "OAuth & Permissions" page and click "Install to Workspace". Grant permissions, then copy the "Bot User OAuth Token" (starts with xoxb-).',
      },
      {
        stepNumber: 4,
        title: 'Retrieve App Signing Secret',
        description:
          'Click "Basic Information" in the left sidebar. Scroll down to "App Credentials" and click Show on "Signing Secret". Copy this key for webhook validation.',
        directLink: { label: 'Slack App Basic Info', url: 'https://api.slack.com/apps' },
      },
      {
        stepNumber: 5,
        title: 'Paste Credentials & Test Channel Dispatch',
        description:
          'Paste the Bot Token (xoxb-...) and default alert channel name (e.g. #whatsq-alerts) into WhatsQ. Click "Test Connection" to trigger a live Slack notification.',
      },
    ],
    scopes: [
      { name: 'chat:write', description: 'Send messages and interactive job cards as WhatsQ Bot', level: 'Required' },
      { name: 'chat:write.public', description: 'Post to any public channel without being explicitly invited', level: 'Recommended' },
      { name: 'incoming-webhook', description: 'Post messages to a specific channel via incoming webhook', level: 'Recommended' },
      { name: 'channels:read', description: 'List available public channels for dropdown selection', level: 'Optional' },
    ],
    webhookInfo: {
      endpointPath: '/api/integrations/slack/events/',
      events: ['app_mention', 'message.channels'],
      secretName: 'Signing Secret',
      instructions: 'Enable Event Subscriptions in your Slack App settings and paste the Request URL to receive interactive button responses.',
    },
    troubleshooting: [
      {
        issue: 'Error: channel_not_found',
        solution: 'Ensure the channel name begins with "#" (e.g. #whatsq-alerts) or invite @WhatsQ directly to private channels with /invite @WhatsQ.',
      },
      {
        issue: 'Error: invalid_auth',
        solution: 'Confirm the bot token starts with "xoxb-" and that the app has not been uninstalled or revoked in your workspace.',
      },
    ],
  },

  zoho: {
    id: 'zoho',
    name: 'Zoho CRM',
    portalName: 'Zoho Developer Console',
    portalUrl: 'https://api-console.zoho.com',
    badge: 'OAuth 2.0 & REST API',
    overview:
      'Establish a real-time bidirectional bridge between WhatsQ and Zoho CRM. Automatically create Zoho Leads whenever new customers message on WhatsApp, update Deal stages, and sync customer conversation transcripts.',
    prerequisites: [
      'A Zoho CRM Account with Administrator access',
      'Knowledge of your Zoho Data Center domain (.com, .in, .eu, etc.)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Open Zoho Developer API Console',
        description:
          'Log in to the Zoho Developer Console. Click "Add Client" and select "Server-based Applications" as the client type.',
        directLink: { label: 'Open Zoho API Console', url: 'https://api-console.zoho.com' },
        tip: 'For accounts in India, access https://api-console.zoho.in. For Europe, access https://api-console.zoho.eu.',
      },
      {
        stepNumber: 2,
        title: 'Register WhatsQ as a Server Client',
        description:
          'Set Client Name to "WhatsQ Automation Bridge". Set Homepage URL to your domain, and set "Authorized Redirect URIs" to the WhatsQ callback endpoint below.',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/integrations/zoho/callback/',
      },
      {
        stepNumber: 3,
        title: 'Copy Client ID & Client Secret',
        description:
          'Upon saving, Zoho will display your Client ID and Client Secret. Copy both strings into the Credentials tab of this modal.',
      },
      {
        stepNumber: 4,
        title: 'Generate Zoho Grant Code (Self-Client)',
        description:
          'In Zoho API Console, click "Generate Code". In the Scope field enter: ZohoCRM.modules.ALL,ZohoCRM.settings.ALL. Choose Scope Duration: 10 minutes, enter any description, and click CREATE.',
        codeSnippet: 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL',
        tip: 'This code is exchanged once by WhatsQ for a permanent Refresh Token that never expires.',
      },
      {
        stepNumber: 5,
        title: 'Save & Verify Two-Way Sync',
        description:
          'Paste the generated Grant Code into the Authorization Code field and click "Test Connection" to complete authentication.',
      },
    ],
    scopes: [
      { name: 'ZohoCRM.modules.ALL', description: 'Full access to Leads, Contacts, Deals, Accounts and Notes', level: 'Required' },
      { name: 'ZohoCRM.settings.ALL', description: 'Access custom field mappings and pipeline stages', level: 'Recommended' },
      { name: 'ZohoCRM.users.READ', description: 'Fetch sales representative ownership for automatic lead assignment', level: 'Optional' },
    ],
    troubleshooting: [
      {
        issue: 'Error: invalid_code or code_expired',
        solution: 'Zoho Grant Codes expire after 10 minutes. If expired, generate a fresh code in Zoho Developer Console and paste immediately.',
      },
      {
        issue: 'Wrong Data Center / Region',
        solution: 'Ensure the Data Center selector in WhatsQ matches your Zoho region (.in for India, .com for US, .eu for Europe).',
      },
    ],
  },

  quickbooks: {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    portalName: 'Intuit Developer Portal',
    portalUrl: 'https://developer.intuit.com/app/developer/dashboard',
    badge: 'Intuit OAuth 2.0 Ledger',
    overview:
      'Synchronize WhatsQ invoices, technician payments, and service items automatically with QuickBooks Online ledger. Keep books balanced without manual data entry.',
    prerequisites: [
      'Intuit Developer Account',
      'QuickBooks Online Company (Sandbox or Production)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Create an App in Intuit Developer Portal',
        description:
          'Go to developer.intuit.com and sign in. Click "Dashboard" > "Create an app" > Select "QuickBooks Online and Payments".',
        directLink: { label: 'Intuit Developer Dashboard', url: 'https://developer.intuit.com/app/developer/dashboard' },
      },
      {
        stepNumber: 2,
        title: 'Retrieve OAuth Keys',
        description:
          'Click on your newly created app. In the sidebar under "Development Settings" (or "Production Settings"), click "Keys & OAuth". Copy Client ID and Client Secret.',
      },
      {
        stepNumber: 3,
        title: 'Configure Redirect URI',
        description:
          'Under the "Redirect URIs" section in Intuit Dashboard, click "Add URI" and paste the WhatsQ QuickBooks callback URL.',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/integrations/quickbooks/callback/',
      },
      {
        stepNumber: 4,
        title: 'Find your Company ID (Realm ID)',
        description:
          'Log in to your QuickBooks Online account. Open the Gear icon (Settings) in the top right > click "Account and Settings". Your Company ID is displayed on the Company tab (or press Ctrl + Alt + ? on any page).',
      },
      {
        stepNumber: 5,
        title: 'Enter Credentials & Test Sync',
        description:
          'Select Environment (Sandbox or Production), paste your Realm ID, Client ID, and Secret, then click "Test Connection".',
      },
    ],
    scopes: [
      { name: 'com.intuit.quickbooks.accounting', description: 'Read and write customer invoices, payments, and accounts', level: 'Required' },
      { name: 'com.intuit.quickbooks.payment', description: 'Process payment records and bank deposits', level: 'Optional' },
    ],
    troubleshooting: [
      {
        issue: 'Error: invalid_client or unauthorized',
        solution: 'Verify whether you are using Sandbox keys with a Sandbox company or Production keys with a Production company.',
      },
      {
        issue: 'Realm ID Mismatch',
        solution: 'Ensure the Company ID is numeric (typically 12-16 digits) without spaces or hyphens.',
      },
    ],
  },

  shopify: {
    id: 'shopify',
    name: 'Shopify',
    portalName: 'Shopify Admin / Partner Console',
    portalUrl: 'https://admin.shopify.com',
    badge: 'Admin API & Webhooks',
    overview:
      'Empower your e-commerce store with automated WhatsApp order confirmations, instant shipment tracking alerts, and automated abandoned cart recovery messages with discount codes.',
    prerequisites: [
      'Shopify Store Administrator access',
      'Store domain name (e.g. your-store.myshopify.com)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Navigate to App Development in Shopify Admin',
        description:
          'In your Shopify Store Admin, navigate to Settings > Apps and sales channels > click "Develop apps" in the top bar. Click "Create an app" and title it "WhatsQ WhatsApp Automation".',
        directLink: { label: 'Shopify Apps Admin', url: 'https://admin.shopify.com/settings/apps' },
        tip: 'If App Development is not yet enabled on your store, click "Allow custom app development".',
      },
      {
        stepNumber: 2,
        title: 'Configure Admin API Scopes',
        description:
          'Under the "Configuration" tab of your new app, click "Configure" next to Admin API integration. Check the following scopes: read_orders, write_orders, read_checkouts, read_customers, read_products.',
      },
      {
        stepNumber: 3,
        title: 'Install App & Reveal API Access Token',
        description:
          'Click "Install app" in the top right. Once installed, Shopify will display your "Admin API access token" (starts with shpat_). Copy this token immediately as it can only be viewed once.',
        tip: 'Store this token safely. If misplaced, you can revoke and generate a new token anytime in Shopify Admin.',
      },
      {
        stepNumber: 4,
        title: 'Setup Webhook Subscriptions',
        description:
          'In Shopify Admin, go to Settings > Notifications > scroll to "Webhooks" > click "Create webhook". Add "Order creation" (JSON) pointing to WhatsQ webhook URL.',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/integrations/shopify/webhook/',
      },
      {
        stepNumber: 5,
        title: 'Test Store Connection in WhatsQ',
        description:
          'Enter your store domain (e.g. my-brand.myshopify.com) and the Admin API token into WhatsQ. Click "Test Connection" to fetch store catalog status.',
      },
    ],
    scopes: [
      { name: 'read_orders, write_orders', description: 'Detect new orders and update fulfillment tracking', level: 'Required' },
      { name: 'read_checkouts', description: 'Monitor abandoned carts for WhatsApp recovery messages', level: 'Required' },
      { name: 'read_customers', description: 'Sync customer WhatsApp phone numbers and tags', level: 'Recommended' },
      { name: 'read_products', description: 'Browse and share product links via WhatsApp chat', level: 'Optional' },
    ],
    webhookInfo: {
      endpointPath: '/api/integrations/shopify/webhook/',
      events: ['orders/create', 'orders/fulfilled', 'checkouts/create', 'checkouts/update'],
      secretName: 'Webhook Signing Secret',
      instructions: 'Copy the Webhook Secret key shown at the bottom of the Shopify Notifications settings page.',
    },
    troubleshooting: [
      {
        issue: 'Error: Invalid myshopify domain',
        solution: 'Enter the original myshopify subdomain (e.g. storename.myshopify.com), not your custom primary domain.',
      },
      {
        issue: 'Error 401 Unauthorized',
        solution: 'Verify the Admin API Access token begins with "shpat_" and has been installed to your store.',
      },
    ],
  },

  razorpay: {
    id: 'razorpay',
    name: 'Razorpay',
    portalName: 'Razorpay Dashboard',
    portalUrl: 'https://dashboard.razorpay.com',
    badge: 'Payments & UPI Webhooks',
    overview:
      'Seamlessly collect payments across India and the GCC. Generate instant UPI / Card payment links inside WhatsApp chats, send automated payment reminders before due dates, and deliver instant PDF receipts.',
    prerequisites: [
      'Activated Razorpay Merchant Account',
      'Access to Razorpay Dashboard Settings',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Open Razorpay Dashboard & Select Mode',
        description:
          'Log in to the Razorpay Dashboard. Toggle the top-header switch between "Test Mode" (for risk-free testing) or "Live Mode" (for accepting real customer payments).',
        directLink: { label: 'Open Razorpay Dashboard', url: 'https://dashboard.razorpay.com' },
      },
      {
        stepNumber: 2,
        title: 'Generate API Keys',
        description:
          'In the left sidebar, navigate to Account & Settings > under "API Keys" section click "API Keys". Click "Generate Key" (or "Regenerate Key").',
        directLink: { label: 'Razorpay API Keys', url: 'https://dashboard.razorpay.com/#/app/keys' },
        tip: 'Test keys begin with "rzp_test_" while live production keys begin with "rzp_live_".',
      },
      {
        stepNumber: 3,
        title: 'Copy Key ID & Key Secret',
        description:
          'Razorpay will display your Key ID and Key Secret. Copy both values. Keep Key Secret confidential as it authorizes payment operations.',
      },
      {
        stepNumber: 4,
        title: 'Configure Razorpay Webhook',
        description:
          'Go to Account & Settings > "Webhooks" > click "+ Add New Webhook". In the Webhook URL field, paste the WhatsQ payments webhook endpoint below. Enter a secure Secret (e.g. whatsq_whsec_2026).',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/finance/payments/webhook/',
      },
      {
        stepNumber: 5,
        title: 'Select Active Webhook Events',
        description:
          'Check the following events: payment.captured, payment.failed, order.paid, invoice.paid. Click "Save" in Razorpay, then paste the Key ID, Secret, and Webhook Secret into WhatsQ.',
      },
    ],
    scopes: [
      { name: 'payment.links.create', description: 'Generate instant dynamic UPI payment links for WhatsApp invoices', level: 'Required' },
      { name: 'payment.fetch', description: 'Query payment status and transaction reference numbers', level: 'Required' },
      { name: 'refund.create', description: 'Process customer cancellation refunds directly from WhatsQ', level: 'Optional' },
    ],
    webhookInfo: {
      endpointPath: '/api/finance/payments/webhook/',
      events: ['payment.captured', 'payment.failed', 'order.paid', 'invoice.paid'],
      secretName: 'Webhook Secret',
      instructions: 'Ensures WhatsQ verifies the cryptographic HMAC signature of incoming payment confirmation pings.',
    },
    troubleshooting: [
      {
        issue: 'Error: BAD_REQUEST_ERROR - Key not found',
        solution: 'Make sure your Key ID matches your active mode. Test keys (rzp_test_) will fail if the transaction is submitted in Live Mode.',
      },
      {
        issue: 'Webhook Signature Verification Failed',
        solution: 'Ensure the Webhook Secret string in WhatsQ matches the secret you entered in Razorpay Webhooks dashboard.',
      },
    ],
  },
  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    portalName: 'WordPress Admin & WooCommerce',
    portalUrl: 'https://woocommerce.com',
    badge: 'REST API v3 & Webhooks',
    overview:
      'Connect your WordPress WooCommerce store to WhatsQ to automate order confirmation notifications on WhatsApp, dispatch live shipment tracking updates, recover abandoned checkouts, and synchronize customer orders directly into CRM Leads.',
    prerequisites: [
      'A WordPress website with the WooCommerce plugin activated (version 3.5+)',
      'Administrator privileges on WordPress Admin dashboard',
      'Pretty Permalinks enabled in WordPress (Settings > Permalinks - anything other than Plain)',
      'HTTPS / SSL enabled on your domain (required by WooCommerce for REST API authentication)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Verify WordPress Permalinks',
        description:
          'In your WordPress admin dashboard, navigate to Settings > Permalinks. Ensure permalinks are set to "Post name" or any custom structure. WooCommerce REST API does not function when set to "Plain" (?p=123).',
        directLink: { label: 'WooCommerce Documentation', url: 'https://woocommerce.com/document/woocommerce-rest-api/' },
        tip: 'If you just changed permalinks, click "Save Changes" to flush your site rewrite rules.',
      },
      {
        stepNumber: 2,
        title: 'Navigate to WooCommerce REST API Settings',
        description:
          'From the WordPress admin sidebar, go to WooCommerce > Settings > click the "Advanced" tab at the top > click "REST API".',
        directLink: { label: 'WooCommerce Settings', url: 'https://woocommerce.com' },
      },
      {
        stepNumber: 3,
        title: 'Generate API Keys (Consumer Key & Consumer Secret)',
        description:
          'Click the "Add key" or "Create an API Key" button. Enter Description: "WhatsQ WhatsApp Automation". Set User to your Administrator user. Set Permissions to "Read/Write". Click "Generate API key".',
        tip: 'Important: Copy the Consumer Key (ck_...) and Consumer Secret (cs_...) immediately! WooCommerce permanently masks the secret once you leave or refresh the page.',
      },
      {
        stepNumber: 4,
        title: 'Create Order Notification Webhooks',
        description:
          'In WooCommerce > Settings > Advanced > click the "Webhooks" sub-tab > click "Add webhook". Set Name to "WhatsQ Order Confirmation", Status to "Active", Topic to "Order created". In Delivery URL, paste the WhatsQ Webhook URL below.',
        codeSnippet: 'https://whatsq.qiyambusinesssolutions.com/api/core/integrations/woocommerce/webhook/',
      },
      {
        stepNumber: 5,
        title: 'Set Webhook Secret & Test Connection in WhatsQ',
        description:
          'In the Webhook "Secret" field, enter a secure secret string (e.g. wc_whsec_qiyam_2026). Set API Version to "WP REST API Integration v3". Click "Save webhook". Then paste your Store URL, Consumer Key, Consumer Secret, and Webhook Secret in WhatsQ and click "Test Connection".',
      },
    ],
    scopes: [
      { name: 'orders.read_write', description: 'Read order details and update order metadata / status notes', level: 'Required' },
      { name: 'customers.read', description: 'Access customer shipping phone, name, and email for WhatsApp messaging', level: 'Required' },
      { name: 'products.read', description: 'Access item titles, images, and inventory levels for stock alerts', level: 'Recommended' },
      { name: 'webhooks.read_write', description: 'Manage and test real-time event webhooks for orders and cart events', level: 'Optional' },
    ],
    webhookInfo: {
      endpointPath: '/api/core/integrations/woocommerce/webhook/',
      events: ['order.created', 'order.updated', 'customer.created', 'order.deleted'],
      secretName: 'Webhook Secret',
      instructions: 'WooCommerce signs every webhook payload with HMAC-SHA256 in the X-WC-Webhook-Signature HTTP header.',
    },
    troubleshooting: [
      {
        issue: 'Error: woocommerce_rest_cannot_view (401 Unauthorized)',
        solution: 'Ensure the Consumer Key and Consumer Secret are entered accurately without extra spaces, and that the API key was granted "Read/Write" permissions in WooCommerce.',
      },
      {
        issue: 'Error: Cannot route request / 404 on Webhook URL',
        solution: 'Make sure your WordPress site has Permalinks configured (Settings > Permalinks > Post name) and your server allows inbound POST requests from your store domain.',
      },
      {
        issue: 'Webhook Signature verification mismatch',
        solution: 'Verify that the Webhook Secret string in WooCommerce Settings > Advanced > Webhooks exactly matches the secret entered in WhatsQ.',
      },
    ],
  },
};
