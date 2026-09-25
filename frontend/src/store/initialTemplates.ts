import { WhatsAppTemplateItem } from '@/types';

// Real templates are dynamically fetched directly from Meta WhatsApp Cloud API
// via GET /api/conversations/templates/ (35 live verified templates).
// No hardcoded fake mock templates.
export const INITIAL_TEMPLATES: WhatsAppTemplateItem[] = [];
