import { WhatsAppTemplateItem, WhatsAppTemplateButton, KeywordRule } from '@/types';
import { FlowGroup, GroupItem } from '../components/views/automation/WorkflowBuilderView';

export interface TemplateAnalysis {
  detectedCategory: string;
  detectedIntent: 'booking' | 'payment' | 'marketing' | 'support' | 'auth' | 'general';
  intentLabel: string;
  variableNames: string[];
  variableMap: Record<string, string>;
  buttonLabels: string[];
  quickReplyCount: number;
  hasPaymentIntent: boolean;
  estimatedAmount?: number;
  suggestedKeywords: string[];
  suggestedTitle: string;
}

export interface WorkflowGenerationResult {
  title: string;
  description: string;
  groups: FlowGroup[];
  keywordRules: KeywordRule[];
  analysis: TemplateAnalysis;
}

/**
 * Intelligently analyzes WhatsApp template data to extract variables,
 * infer business intent, and detect financial or scheduling workflows.
 */
export function analyzeTemplateData(template: Partial<WhatsAppTemplateItem>): TemplateAnalysis {
  const name = (template.name || 'custom_template').toLowerCase();
  const body = (template.body_text || template.body || '').toLowerCase();
  const category = (template.meta_category || template.category || '').toUpperCase();
  const buttons = template.buttons || [];

  // Extract variables like {{1}}, {{name}}, {service}, etc.
  const rawVars = (template.body_text || template.body || '').match(/\{\{?([a-zA-Z0-9_-]+)\}?\}/g) || [];
  const variableNames = Array.from(new Set(rawVars.map((v) => v.replace(/[{}]/g, '').trim())));
  const variableMap: Record<string, string> = template.body_variables || {};

  // Extract button texts
  const buttonLabels = buttons.map((b) => b.text || 'Action');
  const quickReplies = buttons.filter((b) => b.type === 'QUICK_REPLY');

  // Detect payment / invoice amount
  let hasPaymentIntent = false;
  let estimatedAmount: number | undefined = undefined;

  const currencyMatch = (template.body_text || template.body || '').match(/(?:₹|rs\.?|inr|\$|usd)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
  if (currencyMatch && currencyMatch[1]) {
    const parsed = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      hasPaymentIntent = true;
      estimatedAmount = parsed;
    }
  }

  // Check keywords for payment intent
  const paymentKeywords = ['payment', 'pay', 'invoice', 'amount', 'total', 'bill', 'fee', 'charge', 'due', 'token'];
  if (paymentKeywords.some((k) => name.includes(k) || body.includes(k))) {
    hasPaymentIntent = true;
    if (!estimatedAmount) estimatedAmount = 499;
  }

  // Detect primary intent
  let detectedIntent: TemplateAnalysis['detectedIntent'] = 'general';
  let intentLabel = 'General Notification & Inquiry';

  const bookingKeywords = ['booking', 'appointment', 'slot', 'schedule', 'reschedule', 'technician', 'service', 'visit', 'order_status'];
  const marketingKeywords = ['offer', 'discount', 'coupon', 'fest', 'voucher', 'sale', 'save', 'special', 'promo', 'deal'];
  const authKeywords = ['otp', 'verification', 'code', 'security', 'auth', 'login', 'reset', 'password'];
  const supportKeywords = ['support', 'help', 'assist', 'query', 'issue', 'complaint', 'counselor', 'agent', 'contact'];

  if (authKeywords.some((k) => name.includes(k) || body.includes(k)) || category === 'AUTHENTICATION') {
    detectedIntent = 'auth';
    intentLabel = 'Authentication & OTP Verification';
  } else if (hasPaymentIntent && (name.includes('pay') || name.includes('invoice') || body.includes('invoice'))) {
    detectedIntent = 'payment';
    intentLabel = 'Payment Collection & Invoice Checkout';
  } else if (bookingKeywords.some((k) => name.includes(k) || body.includes(k))) {
    detectedIntent = 'booking';
    intentLabel = 'Service Booking & Appointment Scheduling';
  } else if (marketingKeywords.some((k) => name.includes(k) || body.includes(k)) || category === 'MARKETING') {
    detectedIntent = 'marketing';
    intentLabel = 'Promotional Offer & Lead Conversion';
  } else if (supportKeywords.some((k) => name.includes(k) || body.includes(k))) {
    detectedIntent = 'support';
    intentLabel = 'Customer Support & Live Agent Assistance';
  }

  // Suggest friendly title
  const cleanName = name
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const suggestedTitle = `${cleanName} Bot Flow`;

  // Suggest keywords for trigger rules
  const wordsFromName = name.split(/[_-]/).filter((w) => w.length > 2);
  const wordsFromBody = body
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['hello', 'your', 'have', 'been', 'with', 'from', 'this', 'that'].includes(w))
    .slice(0, 4);

  const suggestedKeywords = Array.from(new Set([...wordsFromName, ...wordsFromBody]));

  return {
    detectedCategory: category || 'UTILITY',
    detectedIntent,
    intentLabel,
    variableNames,
    variableMap,
    buttonLabels,
    quickReplyCount: quickReplies.length,
    hasPaymentIntent,
    estimatedAmount,
    suggestedKeywords,
    suggestedTitle
  };
}

/**
 * Auto-synthesizes a complete multi-step FlowGroup[] graph based on template parameters.
 */
export function generateWorkflowFromTemplate(
  template: Partial<WhatsAppTemplateItem>,
  options: {
    customTitle?: string;
    includePayment?: boolean;
    includeAgentHandoff?: boolean;
    triggerMode?: 'template_send' | 'inbound_message' | 'keyword';
  } = {}
): WorkflowGenerationResult {
  const analysis = analyzeTemplateData(template);
  const title = options.customTitle?.trim() || analysis.suggestedTitle;
  const shouldIncludePayment = options.includePayment !== undefined ? options.includePayment : analysis.hasPaymentIntent;
  const shouldIncludeAgent = options.includeAgentHandoff !== undefined ? options.includeAgentHandoff : true;

  const buttons = template.buttons || [];
  const quickReplies = buttons.filter((b) => b.type === 'QUICK_REPLY');
  const urlButtons = buttons.filter((b) => b.type === 'URL');
  const phoneButtons = buttons.filter((b) => b.type === 'PHONE_NUMBER');

  // Format body text for initial message
  let formattedBody = template.body_text || template.body || 'Welcome! How can we help you today?';
  // If variables are present, ensure sample replacement preview
  if (template.body_variables && typeof template.body_variables === 'object') {
    Object.entries(template.body_variables).forEach(([k, val]) => {
      formattedBody = formattedBody.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), `{${val || k}}`);
    });
  }

  // -------------------------------------------------------------
  // GROUP 1: Initial Trigger & Template Message Dispatch
  // -------------------------------------------------------------
  const group1Items: GroupItem[] = [];

  // Header element if present
  if (template.header_type && template.header_type !== 'NONE') {
    if (template.header_type === 'IMAGE') {
      group1Items.push({
        id: 'item-1-hdr',
        type: 'message',
        content: `🖼️ [Header Image Attachment]\n${template.header_url || 'Sample Header Image'}`
      });
    } else if (template.header_type === 'VIDEO') {
      group1Items.push({
        id: 'item-1-hdr',
        type: 'message',
        content: `🎥 [Header Video Attachment]\n${template.header_url || 'Sample Header Video'}`
      });
    } else if (template.header_type === 'DOCUMENT') {
      group1Items.push({
        id: 'item-1-hdr',
        type: 'message',
        content: `📄 [Header PDF Document Attachment]`
      });
    } else if (template.header_type === 'TEXT' && template.header_text) {
      group1Items.push({
        id: 'item-1-hdr',
        type: 'message',
        content: `📌 *${template.header_text}*`
      });
    }
  }

  // Main Template Body
  let mainBodyContent = formattedBody;
  if (template.footer_text) {
    mainBodyContent += `\n\n_${template.footer_text}_`;
  }
  group1Items.push({
    id: 'item-1-body',
    type: 'message',
    content: mainBodyContent
  });

  // Action / Choice Element in Group 1
  let choiceOptions: { label: string; targetGroup?: string }[] = [];

  if (quickReplies.length > 0) {
    // Map template quick reply buttons to target groups
    choiceOptions = quickReplies.map((btn, idx) => ({
      label: btn.text || `Option ${idx + 1}`,
      targetGroup: `group-${idx + 2}`
    }));
  } else {
    // Generate context-aware choices based on intent
    if (analysis.detectedIntent === 'booking') {
      choiceOptions = [
        { label: 'Confirm Booking Details', targetGroup: 'group-2' },
        { label: 'Reschedule Appointment', targetGroup: 'group-3' },
        { label: 'Speak to Support Desk', targetGroup: 'group-4' }
      ];
    } else if (analysis.detectedIntent === 'payment') {
      choiceOptions = [
        { label: `Pay ₹${analysis.estimatedAmount || 499} Now`, targetGroup: 'group-2' },
        { label: 'View Detailed Breakdown', targetGroup: 'group-3' },
        { label: 'Billing Inquiry', targetGroup: 'group-4' }
      ];
    } else if (analysis.detectedIntent === 'marketing') {
      choiceOptions = [
        { label: 'Claim Offer Now', targetGroup: 'group-2' },
        { label: 'Explore Service Catalog', targetGroup: 'group-3' },
        { label: 'Talk to Sales Advisor', targetGroup: 'group-4' }
      ];
    } else if (analysis.detectedIntent === 'auth') {
      choiceOptions = [
        { label: 'Verify Security Code', targetGroup: 'group-2' },
        { label: 'Resend Verification Code', targetGroup: 'group-3' },
        { label: 'Report Unauthorized Login', targetGroup: 'group-4' }
      ];
    } else {
      choiceOptions = [
        { label: 'Yes, Proceed', targetGroup: 'group-2' },
        { label: 'Need More Information', targetGroup: 'group-3' },
        { label: 'Speak with Agent', targetGroup: 'group-4' }
      ];
    }
  }

  // Always append a fallback option
  choiceOptions.push({
    label: 'Other / Need Assistance',
    targetGroup: 'group-fallback'
  });

  group1Items.push({
    id: 'item-1-choice',
    type: 'choice',
    question: 'Please select an option below:',
    options: choiceOptions
  });

  const groups: FlowGroup[] = [
    {
      id: 'group-1',
      title: 'Group #1: Template Dispatch',
      x: 40,
      y: 40,
      items: group1Items
    }
  ];

  // -------------------------------------------------------------
  // GROUP 2: Primary Positive Branch (Confirm / Pay / Proceed)
  // -------------------------------------------------------------
  const group2Items: GroupItem[] = [
    {
      id: 'item-2-msg',
      type: 'message',
      content:
        analysis.detectedIntent === 'booking'
          ? '🎉 Wonderful! Your booking has been acknowledged. Let us know if you have any specific requirements for our technician:'
          : analysis.detectedIntent === 'payment'
          ? '💳 Great! We are preparing your payment link.'
          : analysis.detectedIntent === 'marketing'
          ? '🎁 Fantastic! Your discount offer has been unlocked. Let us know what service you are looking for:'
          : '✅ Thank you for your response! Let us gather a few quick details to proceed:'
    },
    {
      id: 'item-2-collect',
      type: 'collect',
      varName:
        analysis.detectedIntent === 'booking'
          ? 'service_notes'
          : analysis.detectedIntent === 'marketing'
          ? 'interested_service'
          : 'customer_preference'
    }
  ];

  if (shouldIncludePayment) {
    group2Items.push({
      id: 'item-2-payment',
      type: 'payment',
      content: `${title} - Instant Checkout`,
      provider: 'UPI',
      currency: 'INR',
      amount: analysis.estimatedAmount || 499,
      quantity: 1,
      varName: 'payment_status',
      buttonLabel: `Pay ₹${analysis.estimatedAmount || 499} via UPI`,
      successTarget: 'group-pay-success',
      failedTarget: 'group-pay-failed'
    });
  } else {
    group2Items.push({
      id: 'item-2-confirm',
      type: 'message',
      content:
        'Thank you! Your information has been securely recorded. Our team will contact you with the next update.'
    });
  }

  groups.push({
    id: 'group-2',
    title: `Group #2: ${choiceOptions[0]?.label || 'Confirmation'}`,
    x: 440,
    y: 40,
    items: group2Items
  });

  // -------------------------------------------------------------
  // GROUP 3: Secondary Branch (Reschedule / Catalog / Details)
  // -------------------------------------------------------------
  const group3Items: GroupItem[] = [
    {
      id: 'item-3-msg',
      type: 'message',
      content:
        analysis.detectedIntent === 'booking'
          ? '📅 No problem! We are glad to reschedule your appointment. What date and time works best for you?'
          : analysis.detectedIntent === 'marketing'
          ? '📂 Here is our comprehensive service catalog and current seasonal offers. What would you like to explore?'
          : '📝 Please let us know your preferred change or what details you would like more information on:'
    },
    {
      id: 'item-3-collect',
      type: 'collect',
      varName: analysis.detectedIntent === 'booking' ? 'preferred_reschedule_slot' : 'requested_information'
    },
    {
      id: 'item-3-ack',
      type: 'message',
      content: 'Got it! We have updated your preference in our records. You will receive a confirmation shortly.'
    }
  ];

  // If there is a URL button in the template, include a helpful link card in Group 3
  if (urlButtons.length > 0) {
    group3Items.push({
      id: 'item-3-url',
      type: 'message',
      content: `🔗 You can also track details online here:\n${urlButtons[0].url || 'https://qiyam.ventures'}`
    });
  }

  groups.push({
    id: 'group-3',
    title: `Group #3: ${choiceOptions[1]?.label || 'Reschedule / Modify'}`,
    x: 840,
    y: 40,
    items: group3Items
  });

  // -------------------------------------------------------------
  // GROUP 4: Escalation / Live Agent Handoff Branch
  // -------------------------------------------------------------
  const group4Items: GroupItem[] = [
    {
      id: 'item-4-msg',
      type: 'message',
      content:
        '👨‍💼 Connecting you with our support specialist. A human agent from our team will join this conversation shortly.'
    }
  ];

  if (phoneButtons.length > 0) {
    group4Items.push({
      id: 'item-4-phone',
      type: 'message',
      content: `📞 For immediate hotline assistance, call our desk directly at: ${phoneButtons[0].phone_number || '+919876543210'}`
    });
  }

  group4Items.push(
    {
      id: 'item-4-collect',
      type: 'collect',
      varName: 'escalation_issue_summary'
    },
    {
      id: 'item-4-assigned',
      type: 'message',
      content:
        'Ticket #QYM-SP has been created and assigned to Ramesh Kumar (Customer Support Lead). Average response time: < 3 minutes.'
    }
  );

  groups.push({
    id: 'group-4',
    title: `Group #4: ${choiceOptions[2]?.label || 'Agent Handoff'}`,
    x: 1240,
    y: 40,
    items: group4Items
  });

  // -------------------------------------------------------------
  // GROUP FALLBACK: Unrecognized input loop
  // -------------------------------------------------------------
  groups.push({
    id: 'group-fallback',
    title: 'Group #5: Fallback Router',
    x: 440,
    y: 460,
    items: [
      {
        id: 'item-fb-msg',
        type: 'message',
        content:
          '⚠️ I did not recognize that response. Please select one of the quick options or reply "HELP" to reach our team.'
      },
      {
        id: 'item-fb-jump',
        type: 'jump',
        targetGroup: 'group-1'
      }
    ]
  });

  // -------------------------------------------------------------
  // Optional Payment Success & Failure groups
  // -------------------------------------------------------------
  if (shouldIncludePayment) {
    groups.push(
      {
        id: 'group-pay-success',
        title: 'Group #6: Payment Success',
        x: 840,
        y: 460,
        items: [
          {
            id: 'item-ps-1',
            type: 'message',
            content: `🎉 Payment of ₹${analysis.estimatedAmount || 499} received successfully via UPI! Your transaction ID is #TXN-${Date.now().toString().slice(-6)}. A confirmation receipt has been issued.`
          }
        ]
      },
      {
        id: 'group-pay-failed',
        title: 'Group #7: Payment Retry',
        x: 1240,
        y: 460,
        items: [
          {
            id: 'item-pf-1',
            type: 'message',
            content:
              '⚠️ Payment was not completed or was cancelled. Would you like to try again or pay later upon completion?'
          },
          {
            id: 'item-pf-jump',
            type: 'jump',
            targetGroup: 'group-2'
          }
        ]
      }
    );
  }

  // -------------------------------------------------------------
  // Generated Companion Keyword Rule
  // -------------------------------------------------------------
  const keywordRules: KeywordRule[] = [
    {
      id: `rule-${Date.now()}`,
      title: `${title} Trigger Rule`,
      triggered_count: 0,
      active: true,
      keywords: analysis.suggestedKeywords,
      reply: formattedBody,
      attachment: template.header_url || undefined
    }
  ];

  return {
    title,
    description: `Automated interactive WhatsApp flowchart synthesized from template "${template.name}". Includes ${groups.length} node groups with ${analysis.intentLabel.toLowerCase()} logic.`,
    groups,
    keywordRules,
    analysis
  };
}
