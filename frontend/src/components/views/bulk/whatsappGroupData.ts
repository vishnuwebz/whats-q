import { WhatsAppGroup } from '../../../types';

/**
 * Empty by default so zero simulated/fake groups or numbers ever pollute the user's account.
 * Only genuine groups extracted via Group Link Inspector, WhatsApp Web Grabber,
 * or Chat Export are saved here.
 */
export const initialMockWhatsAppGroups: WhatsAppGroup[] = [];
