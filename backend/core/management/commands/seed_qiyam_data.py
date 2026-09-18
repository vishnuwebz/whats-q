from django.core.management.base import BaseCommand
from core.models import Workspace, Branch, Integration
from conversations.models import Conversation, Message, WhatsAppTemplate
from crm.models import Lead, Deal, FollowUp, Customer
from operations.models import Job, Appointment, Employee, ScheduleShift, AttendanceRecord, Task, Route, InventoryItem
from finance.models import Transaction, Invoice, Expense, PaymentAccount, Quotation
from automation.models import Workflow, WorkflowTemplate, AutomationLog, Approval
from ai_assistant.models import KnowledgeArticle, AISettings
from analytics.models import ChannelMetric, IntentMetric, DailyMetric

class Command(BaseCommand):
    help = 'Seeds complete Qiyam Business OS database matching reference dashboards'

    def handle(self, *args, **options):
        self.stdout.write("Starting Qiyam database seeding...")

        # 1. Workspace
        Workspace.objects.all().delete()
        Workspace.objects.create(
            workspace_id='WS-10324',
            name='Qiyam Business OS',
            workspace_url='qiyam-business-os.qiyamapp.com',
            default_language='English (US)',
            date_format='May 31, 2024 (MMM DD, YYYY)',
            time_zone='(GMT+05:30) Asia/Kolkata',
            week_starts_on='Monday',
            enable_ai_assistant=True,
            enable_desktop_notifications=True,
            allow_file_uploads=True,
            auto_save=True,
            show_onboarding_tips=True,
            compact_view=False,
            created_by='Faris Usman',
            plan='Professional',
            status='Active',
            members_count=18,
            storage_used_gb=24.6,
            storage_limit_gb=100.0
        )

        # 2. Branches
        Branch.objects.all().delete()
        branches_data = [
            {
                'name': 'Head Office',
                'code': 'HO-001',
                'branch_type': 'Head Office',
                'city': 'Kozhikode',
                'state': 'Kerala',
                'pincode': '673001',
                'manager_name': 'Rahul Mehta',
                'manager_role': 'Regional Director',
                'employees_count': 12,
                'customers_count': 1245,
                'is_main': True,
                'status': 'Active',
                'automations_count': 32,
                'tasks_automated': 256,
                'last_activity': 'May 31, 2024 10:30 AM',
                'phone': '+91 495 276 5400',
                'email': 'headoffice@qiyamventures.com',
                'address': 'Qiyam Corporate Center, Beach Road, Kozhikode, Kerala - 673001',
                'image': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Kochi Branch',
                'code': 'BR-002',
                'branch_type': 'Regional Office',
                'city': 'Kochi',
                'state': 'Kerala',
                'pincode': '682016',
                'manager_name': 'Suresh S',
                'manager_role': 'Senior Branch Manager',
                'employees_count': 8,
                'customers_count': 654,
                'is_main': False,
                'status': 'Active',
                'automations_count': 24,
                'tasks_automated': 210,
                'last_activity': 'May 31, 2024 09:15 AM',
                'phone': '+91 484 290 8120',
                'email': 'kochi@qiyamventures.com',
                'address': 'Infopark Phase 1, Kakkanad, Kochi, Kerala - 682016',
                'image': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Bangalore Branch',
                'code': 'BR-003',
                'branch_type': 'Regional Hub',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'pincode': '560001',
                'manager_name': 'Priya Sharma',
                'manager_role': 'Regional Operations Lead',
                'employees_count': 7,
                'customers_count': 447,
                'is_main': False,
                'status': 'Active',
                'automations_count': 18,
                'tasks_automated': 178,
                'last_activity': 'May 31, 2024 08:45 AM',
                'phone': '+91 80 4120 7890',
                'email': 'bangalore@qiyamventures.com',
                'address': 'Prestige Meridian, MG Road, Bengaluru, Karnataka - 560001',
                'image': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Mumbai Branch',
                'code': 'BR-004',
                'branch_type': 'Commercial Center',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400051',
                'manager_name': 'Faizal K',
                'manager_role': 'Enterprise Branch Manager',
                'employees_count': 6,
                'customers_count': 395,
                'is_main': False,
                'status': 'Active',
                'automations_count': 20,
                'tasks_automated': 192,
                'last_activity': 'May 31, 2024 08:20 AM',
                'phone': '+91 22 6670 9900',
                'email': 'mumbai@qiyamventures.com',
                'address': 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra - 400051',
                'image': 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Delhi Branch',
                'code': 'BR-005',
                'branch_type': 'Regional Hub',
                'city': 'New Delhi',
                'state': 'Delhi',
                'pincode': '110001',
                'manager_name': 'Amitabh Sen',
                'manager_role': 'Territory Manager',
                'employees_count': 3,
                'customers_count': 120,
                'is_main': False,
                'status': 'Inactive',
                'automations_count': 10,
                'tasks_automated': 68,
                'last_activity': 'May 28, 2024 04:10 PM',
                'phone': '+91 11 2334 5678',
                'email': 'delhi@qiyamventures.com',
                'address': 'Connaught Place, Central Circle, New Delhi, Delhi - 110001',
                'image': 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Chennai Branch',
                'code': 'BR-006',
                'branch_type': 'Service Center',
                'city': 'Chennai',
                'state': 'Tamil Nadu',
                'pincode': '600002',
                'manager_name': 'Kavitha Raman',
                'manager_role': 'Branch Supervisor',
                'employees_count': 5,
                'customers_count': 280,
                'is_main': False,
                'status': 'Active',
                'automations_count': 14,
                'tasks_automated': 112,
                'last_activity': 'May 31, 2024 07:40 AM',
                'phone': '+91 44 2852 3410',
                'email': 'chennai@qiyamventures.com',
                'address': 'Mount Road, Anna Salai, Chennai, Tamil Nadu - 600002',
                'image': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=80',
            },
            {
                'name': 'Hyderabad Branch',
                'code': 'BR-007',
                'branch_type': 'Tech Operations Hub',
                'city': 'Hyderabad',
                'state': 'Telangana',
                'pincode': '500081',
                'manager_name': 'Aneesh P',
                'manager_role': 'Hub Operations Manager',
                'employees_count': 4,
                'customers_count': 215,
                'is_main': False,
                'status': 'Active',
                'automations_count': 12,
                'tasks_automated': 96,
                'last_activity': 'May 31, 2024 07:05 AM',
                'phone': '+91 40 4012 3344',
                'email': 'hyderabad@qiyamventures.com',
                'address': 'Cyber Gateway, Hitec City, Hyderabad, Telangana - 500081',
                'image': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80',
            },
        ]
        for b in branches_data:
            Branch.objects.create(**b)

        # 3. Integrations
        Integration.objects.all().delete()
        integrations_data = [
            {
                'name': 'WhatsApp Cloud API',
                'category': 'Communication',
                'description': 'Official Meta WhatsApp Business API for automated broadcasts and inbox messaging',
                'status': 'connected',
                'connected_on': 'May 28, 2024',
                'automations_enabled': 12,
                'icon_slug': 'whatsapp',
                'config': {
                    'phone_number_id': '109823485721982',
                    'waba_id': '891238472918234',
                    'api_version': 'v21.0',
                    'business_name': 'CoolFix Services',
                    'business_phone_display': '+91 98765 43210',
                    'auto_reply_enabled': True,
                    'dual_mode_enabled': True,
                }
            },
            {
                'name': 'Google Workspace',
                'category': 'Productivity',
                'description': 'Gmail, Google Drive, Calendar sync and document automation',
                'status': 'connected',
                'connected_on': 'May 28, 2024',
                'automations_enabled': 4,
                'icon_slug': 'google',
                'config': {
                    'client_id': '489128391823-qiyam823.apps.googleusercontent.com',
                    'service_account_email': 'whatsq-sync@coolfix-qiyam.iam.gserviceaccount.com',
                    'calendar_id': 'primary',
                    'sync_calendar_appointments': True,
                    'backup_invoices_drive': True,
                    'sync_gmail_leads': True,
                }
            },
            {
                'name': 'Slack',
                'category': 'Communication',
                'description': 'Internal team notifications, job completion alerts, and escalation channels',
                'status': 'connected',
                'connected_on': 'May 24, 2024',
                'automations_enabled': 3,
                'icon_slug': 'slack',
                'config': {
                    'bot_token': 'xoxb-demo-workspace-token',
                    'default_channel': '#whatsq-alerts',
                    'escalation_channel': '#urgent-escalations',
                    'notify_inbound_whatsapp': True,
                    'notify_job_complete': True,
                    'notify_deal_won': True,
                }
            },
            {
                'name': 'Zoho CRM',
                'category': 'CRM',
                'description': 'Bidirectional contact, deal and lead synchronization',
                'status': 'connected',
                'connected_on': 'May 20, 2024',
                'automations_enabled': 2,
                'icon_slug': 'zoho',
                'config': {
                    'datacenter': 'zoho.in',
                    'client_id': '1000.QIYAM891238491823ZOHOIN',
                    'client_secret': '••••••••••••••••••••••••',
                    'sync_leads': True,
                    'sync_deals': True,
                    'auto_create_whatsapp_contact': True,
                }
            },
            {
                'name': 'QuickBooks Online',
                'category': 'Accounting & Finance',
                'description': 'Automated ledger synchronization and invoice tax tracking',
                'status': 'partially_connected',
                'connected_on': 'May 18, 2024',
                'automations_enabled': 1,
                'icon_slug': 'quickbooks',
                'config': {
                    'environment': 'sandbox',
                    'realm_id': '46208163653198234',
                    'client_id': 'ABQIYAM89123891238Intuit',
                    'sync_invoices_ledger': True,
                    'auto_record_payments': False,
                }
            },
            {
                'name': 'Shopify',
                'category': 'E-Commerce',
                'description': 'E-commerce store orders, cart abandonment notifications, and catalog sync',
                'status': 'partially_connected',
                'connected_on': 'May 10, 2024',
                'automations_enabled': 2,
                'icon_slug': 'shopify',
                'config': {
                    'store_domain': 'coolfix-parts.myshopify.com',
                    'access_token': 'shpat_8912389182391823ab98',
                    'order_confirmation_whatsapp': True,
                    'abandoned_cart_recovery': True,
                    'cart_recovery_delay_mins': 30,
                }
            },
            {
                'name': 'Razorpay',
                'category': 'Payments',
                'description': 'Instant UPI payment links, QR codes and payment confirmation webhooks',
                'status': 'connected',
                'connected_on': 'May 15, 2024',
                'automations_enabled': 3,
                'icon_slug': 'razorpay',
                'config': {
                    'mode': 'live',
                    'key_id': 'rzp_live_QIYAM891238491',
                    'key_secret': '••••••••••••••••••••••••',
                    'webhook_secret': 'rzp_whsec_qiyam_2026',
                    'auto_upi_links_invoice': True,
                    'instant_pdf_receipt_whatsapp': True,
                    'payment_reminder_whatsapp': True,
                }
            },
            {
                'name': 'WooCommerce',
                'category': 'E-Commerce',
                'description': 'WordPress WooCommerce store order alerts, status tracking, cart recovery and catalog sync',
                'status': 'partially_connected',
                'connected_on': 'May 12, 2024',
                'automations_enabled': 3,
                'icon_slug': 'woocommerce',
                'config': {
                    'store_url': 'https://coolfix-store.com',
                    'consumer_key': 'ck_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
                    'consumer_secret': 'cs_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                    'webhook_secret': 'wc_whsec_qiyam_2026',
                    'api_version': 'wc/v3',
                    'verify_ssl': True,
                    'order_confirmation_whatsapp': True,
                    'order_status_tracking': True,
                    'abandoned_cart_recovery': True,
                    'auto_sync_customer_lead': True,
                    'low_stock_staff_alert': False,
                }
            },
        ]
        for i in integrations_data:
            Integration.objects.create(**i)

        # 4. Conversations & Messages
        Conversation.objects.all().delete()
        Message.objects.all().delete()

        c1 = Conversation.objects.create(
            contact_name='Amit Verma',
            phone_number='+91 98765 43210',
            avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            category='Lead',
            status='in_progress',
            unread_count=2,
            lead_owner='Ramesh Kumar',
            lead_stage='New Lead',
            source='WhatsApp',
            first_contact_date='May 12, 2024 10:30 AM',
            last_contact_date='May 12, 2024 10:32 AM',
            location='Koyilandy, Kerala',
            language='English',
            tags=['AC Service', 'High Value'],
            notes='Customer wants service tomorrow morning. Prefers 10 AM - 12 PM slot.',
            service_needed='AC Repair',
            estimated_value=2800.0,
            active_workflow='Service Booking Flow'
        )
        Message.objects.create(conversation=c1, sender='customer', text='I need AC service tomorrow.', timestamp='10:30 AM', status='read')
        Message.objects.create(conversation=c1, sender='bot', sender_name='Qiyam AI Assistant', text='Sure! I can help you with that. Please share your location so I can check service availability.', timestamp='10:30 AM', status='read')
        Message.objects.create(conversation=c1, sender='customer', text='45, Park Street, Koyilandy', timestamp='10:31 AM', status='read')
        Message.objects.create(conversation=c1, sender='bot', sender_name='Qiyam AI Assistant', text='Great! We are available at your location. The charges will be ₹2,800. Shall I book it for you?', timestamp='10:31 AM', status='read')
        Message.objects.create(conversation=c1, sender='customer', text='Yes, please.', timestamp='10:32 AM', status='read')
        Message.objects.create(conversation=c1, sender='bot', sender_name='Qiyam AI Assistant', text='Booking confirmed for tomorrow between 10:00 AM - 12:00 PM. You will receive a reminder. Booking ID: #B4821', timestamp='10:32 AM', status='delivered', rich_card={
            'type': 'booking',
            'title': 'Booking Confirmed',
            'date': 'May 13, 2024 (Mon)',
            'time': '10:00 AM - 12:00 PM',
            'service': 'AC Repair',
            'amount': 2800,
            'bookingId': '#B4821',
            'actionText': 'View Details'
        })

        convs_data = [
            {'name': 'Priya Sharma', 'phone': '+91 89213 56789', 'category': 'Customer', 'status': 'open', 'unread': 1, 'text': 'Can I get the quotation?', 'time': '10:24 AM', 'loc': 'Kozhikode, Kerala', 'service': 'Home Cleaning', 'val': 1200.0, 'tags': ['Cleaning']},
            {'name': 'Rahul Singh', 'phone': '+91 98764 11122', 'category': 'Lead', 'status': 'in_progress', 'unread': 2, 'text': 'I want to book an appointment', 'time': 'Yesterday', 'loc': 'Koyilandy, Kerala', 'service': 'Electrical Work', 'val': 3500.0, 'tags': ['Electrical']},
            {'name': 'Neha Patel', 'phone': '+91 96789 11223', 'category': 'Customer', 'status': 'waiting', 'unread': 1, 'text': 'Payment issue on invoice INV-0182', 'time': 'Yesterday', 'loc': 'Kozhikode, Kerala', 'service': 'Plumbing', 'val': 2200.0, 'tags': ['Support']},
            {'name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'category': 'Hot Lead', 'status': 'in_progress', 'unread': 0, 'text': 'When will the job be done?', 'time': 'May 10', 'loc': 'Calicut, Kerala', 'service': 'AC Installation', 'val': 12000.0, 'tags': ['AC Service', 'VIP']},
            {'name': 'Sneha Joshi', 'phone': '+91 96789 66771', 'category': 'Customer', 'status': 'resolved', 'unread': 0, 'text': 'Thanks for the service!', 'time': 'May 10', 'loc': 'Koyilandy, Kerala', 'service': 'Pest Control', 'val': 2000.0, 'tags': ['Feedback']},
            {'name': 'Arjun Nair', 'phone': '+91 85471 22330', 'category': 'Hot Lead', 'status': 'open', 'unread': 0, 'text': 'Location not covered?', 'time': 'May 9', 'loc': 'Calicut, Kerala', 'service': 'Washing Machine Repair', 'val': 1800.0, 'tags': ['Appliance']},
        ]
        for item in convs_data:
            c = Conversation.objects.create(
                contact_name=item['name'],
                phone_number=item['phone'],
                avatar='https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                category=item['category'],
                status=item['status'],
                unread_count=item['unread'],
                lead_owner='Ramesh Kumar',
                lead_stage='Contacted' if item['status'] == 'in_progress' else 'New Lead',
                source='WhatsApp',
                first_contact_date=item['time'],
                last_contact_date=item['time'],
                location=item['loc'],
                language='English',
                tags=item['tags'],
                notes=f"Customer enquiry for {item['service']}",
                service_needed=item['service'],
                estimated_value=item['val']
            )
            Message.objects.create(conversation=c, sender='customer', text=item['text'], timestamp=item['time'], status='read')
            Message.objects.create(conversation=c, sender='agent', sender_name='Rahul Mehta', text="Hello! We are looking into this right away.", timestamp=item['time'], status='delivered')

        # 5. WhatsApp Templates
        WhatsAppTemplate.objects.all().delete()
        templates_data = [
            {'name': 'Welcome New User', 'category': 'Welcome & Onboarding', 'status': 'Active', 'usage_count': 542, 'last_updated': 'May 28, 2024', 'author': 'Ayesha K.', 'body': 'Hello {{customer.name}}, welcome to CoolFix Services! We are thrilled to assist you with {{service.name}}.'},
            {'name': 'Password Reset Instructions', 'category': 'Support & Helpdesk', 'status': 'Active', 'usage_count': 412, 'last_updated': 'May 26, 2024', 'author': 'Tech Team', 'body': 'Dear {{customer.name}}, use this secure link to reset your account password: {{reset.url}}.'},
            {'name': 'Product Demo Follow-up', 'category': 'Sales & Marketing', 'status': 'Active', 'usage_count': 318, 'last_updated': 'May 25, 2024', 'author': 'Faris Usman', 'body': 'Hi {{customer.name}}, thanks for checking out our services. Do you have any questions about {{service.name}}?'},
            {'name': 'Payment Reminder', 'category': 'Notifications & Alerts', 'status': 'Active', 'usage_count': 298, 'last_updated': 'May 24, 2024', 'author': 'Sneha Pillai', 'body': 'Reminder: Payment of ₹{{invoice.amount}} for invoice {{invoice.id}} is pending. Pay via UPI link: {{payment.link}}.'},
            {'name': 'Support Ticket Acknowledgement', 'category': 'Support & Helpdesk', 'status': 'Active', 'usage_count': 256, 'last_updated': 'May 23, 2024', 'author': 'Rohan Mehta', 'body': 'Your ticket #{{ticket.id}} has been received. Our team will resolve it within 2 hours.'},
            {'name': 'Weekly Report Summary', 'category': 'Reports & Updates', 'status': 'Scheduled', 'usage_count': 194, 'last_updated': 'May 22, 2024', 'author': 'Tech Team', 'body': 'Here is your weekly summary: {{report.metrics}}.'},
        ]
        for t in templates_data:
            WhatsAppTemplate.objects.create(**t)

        # 6. CRM Leads & Deals & Follow-ups
        Lead.objects.all().delete()
        leads_data = [
            {'name': 'Amit Verma', 'phone': '+91 98765 43210', 'service': 'AC Repair', 'location': 'Koyilandy, Kerala', 'value': 2800.0, 'stage': 'new', 'owner': 'Ramesh Kumar', 'notes': 'Customer needs AC repair tomorrow morning. Prefers 10 AM - 12 PM slot.', 'tags': ['AC Service', 'Urgent']},
            {'name': 'Priya Sharma', 'phone': '+91 89213 56789', 'service': 'Home Cleaning', 'location': 'Kozhikode, Kerala', 'value': 1200.0, 'stage': 'new', 'owner': 'Ramesh Kumar', 'notes': 'Requested quotation for 3 BHK flat.', 'tags': ['Cleaning']},
            {'name': 'Rahul Singh', 'phone': '+91 98764 11122', 'service': 'Electrical Work', 'location': 'Koyilandy, Kerala', 'value': 3500.0, 'stage': 'new', 'owner': 'Ramesh Kumar', 'notes': 'Full house wiring check.', 'tags': ['Electrical']},
            {'name': 'Neha Patel', 'phone': '+91 96789 11223', 'service': 'Plumbing', 'location': 'Kozhikode, Kerala', 'value': 2200.0, 'stage': 'new', 'owner': 'Ramesh Kumar', 'notes': 'Bathroom pipe leakage.', 'tags': ['Plumbing']},
            {'name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'service': 'AC Installation', 'location': 'Calicut, Kerala', 'value': 4500.0, 'stage': 'contacted', 'owner': 'Priya Sharma', 'notes': 'Discussed installation quote.', 'tags': ['AC Service']},
            {'name': 'Sneha Joshi', 'phone': '+91 96789 66771', 'service': 'Pest Control', 'location': 'Koyilandy, Kerala', 'value': 2000.0, 'stage': 'contacted', 'owner': 'Priya Sharma', 'notes': 'Follow up scheduled for tomorrow.', 'tags': ['Pest Control']},
            {'name': 'Anita Singh', 'phone': '+91 98765 11199', 'service': 'AC Repair (Split Unit)', 'location': 'Koyilandy, Kerala', 'value': 2800.0, 'stage': 'qualified', 'owner': 'Anita Singh', 'notes': 'Gas refill verified.', 'tags': ['AC Service']},
            {'name': 'Deepak Patel', 'phone': '+91 85471 22330', 'service': 'AC Servicing (3 Units)', 'location': 'Calicut, Kerala', 'value': 5600.0, 'stage': 'proposal_sent', 'owner': 'Ramesh Kumar', 'notes': 'Proposal sent with 10% AMC discount.', 'tags': ['AC Service', 'AMC']},
            {'name': 'Kiran Kumar', 'phone': '+91 81234 55667', 'service': 'AC Installation + Ducting', 'location': 'Kozhikode, Kerala', 'value': 12000.0, 'stage': 'negotiation', 'owner': 'Rahul Mehta', 'notes': 'Commercial site quotation under review.', 'tags': ['Commercial', 'High Value']},
        ]
        for l in leads_data:
            Lead.objects.create(**l)

        # 4b. WhatsApp Approved Templates
        WhatsAppTemplate.objects.all().delete()
        templates_seed = [
            {
                'name': 'service_booking_confirmed',
                'category': 'Service Appointments',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'TEXT',
                'header_text': 'Booking Confirmed: {{1}}',
                'header_sample': 'AC Repair',
                'body': 'Hello {{1}},\nYour appointment for {{2}} is confirmed for {{3}}.\nAssigned Specialist: {{4}} ({{5}}).\n\nReply RESCHEDULE if you need to pick a different date.',
                'body_text': 'Hello {{1}},\nYour appointment for {{2}} is confirmed for {{3}}.\nAssigned Specialist: {{4}} ({{5}}).\n\nReply RESCHEDULE if you need to pick a different date.',
                'body_variables': {'1': 'Customer', '2': 'AC Comprehensive Service', '3': 'Tomorrow at 10:30 AM', '4': 'Rahul Mehta', '5': '+91 98471 23456'},
                'footer_text': 'CoolFix Quick Dispatch • 1800-QIYAM',
                'buttons': [
                    {'id': 'btn_confirm', 'type': 'QUICK_REPLY', 'text': 'Confirm Slot'},
                    {'id': 'btn_reschedule', 'type': 'QUICK_REPLY', 'text': 'Reschedule Date'},
                    {'id': 'btn_call', 'type': 'PHONE_NUMBER', 'text': 'Call Specialist', 'phone_number': '+919847123456'}
                ],
                'usage_count': 142
            },
            {
                'name': 'technician_en_route',
                'category': 'Operations',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'IMAGE',
                'header_url': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
                'body': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://coolfix.in/track/{{5}}',
                'body_text': 'Hi {{1}},\nSpecialist {{2}} is en route for your service booking {{3}}.\nEstimated arrival: {{4}} (within 15-20 mins).\n\nTrack technician live on map:\nhttps://coolfix.in/track/{{5}}',
                'body_variables': {'1': 'Customer', '2': 'Rahul Mehta', '3': '#B4821', '4': '10:30 AM', '5': 'B4821'},
                'footer_text': 'CoolFix Operations Support',
                'buttons': [
                    {'id': 'btn_available', 'type': 'QUICK_REPLY', 'text': 'I am Available'},
                    {'id': 'btn_delay', 'type': 'QUICK_REPLY', 'text': 'Delay by 30 mins'}
                ],
                'usage_count': 98
            },
            {
                'name': 'official_quotation_share',
                'category': 'Quotations & Sales',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'DOCUMENT',
                'header_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'body': 'Hello {{1}},\nHere is the official quotation for {{2}}: ₹{{3}}.\n\nSummary:\n• Service: {{2}}\n• Inspection & Diagnostics: Included\n• Total Estimated Price: ₹{{3}}\n\nTo accept and lock this price, tap Approve below.',
                'body_text': 'Hello {{1}},\nHere is the official quotation for {{2}}: ₹{{3}}.\n\nSummary:\n• Service: {{2}}\n• Inspection & Diagnostics: Included\n• Total Estimated Price: ₹{{3}}\n\nTo accept and lock this price, tap Approve below.',
                'body_variables': {'1': 'Customer', '2': 'Home Cleaning', '3': '1200'},
                'footer_text': 'CoolFix Commercial Proposals',
                'buttons': [
                    {'id': 'btn_approve_quote', 'type': 'QUICK_REPLY', 'text': 'Approve Quotation'},
                    {'id': 'btn_revise_quote', 'type': 'QUICK_REPLY', 'text': 'Request Revision'},
                    {'id': 'btn_sales_call', 'type': 'PHONE_NUMBER', 'text': 'Talk to Sales', 'phone_number': '+919876543210'}
                ],
                'usage_count': 76
            },
            {
                'name': 'invoice_payment_reminder',
                'category': 'Billing & Accounts',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'NONE',
                'body': 'Dear {{1}},\nThis is a friendly reminder that invoice #{{2}} for ₹{{3}} is pending. Due date: {{4}}.\n\nTap below to pay securely via UPI, Card, or Net Banking.',
                'body_text': 'Dear {{1}},\nThis is a friendly reminder that invoice #{{2}} for ₹{{3}} is pending. Due date: {{4}}.\n\nTap below to pay securely via UPI, Card, or Net Banking.',
                'body_variables': {'1': 'Customer', '2': 'INV-2024-001', '3': '2800', '4': 'Today'},
                'footer_text': 'Accounts Dept • CoolFix Services',
                'buttons': [
                    {'id': 'btn_pay_now', 'type': 'URL', 'text': 'Pay Now Securely', 'url': 'https://coolfix.in/pay/{{1}}', 'url_sample': 'INV001'},
                    {'id': 'btn_already_paid', 'type': 'QUICK_REPLY', 'text': 'Already Paid'}
                ],
                'usage_count': 63
            },
            {
                'name': 'festival_discount_offer',
                'category': 'Marketing',
                'meta_category': 'MARKETING',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'IMAGE',
                'header_url': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
                'body': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all AC maintenance and home appliance repairs this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
                'body_text': 'Special festive offer for you, {{1}}!\nGet up to 40% OFF on all AC maintenance and home appliance repairs this week.\nUse promo code {{2}} at checkout.\n\nTap Claim Offer below to reserve your booking discount.',
                'body_variables': {'1': 'Customer', '2': 'FESTIVE40'},
                'footer_text': 'Limited Time Offer • Terms Apply',
                'buttons': [
                    {'id': 'btn_claim', 'type': 'QUICK_REPLY', 'text': 'Claim Offer'},
                    {'id': 'btn_code', 'type': 'COPY_CODE', 'text': 'Copy Code', 'code': 'FESTIVE40'},
                    {'id': 'btn_stop_promo', 'type': 'QUICK_REPLY', 'text': 'Stop Promotions'}
                ],
                'usage_count': 210
            },
            {
                'name': 'customer_satisfaction_survey',
                'category': 'Customer Support',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'NONE',
                'body': 'Hi {{1}},\nThank you for choosing CoolFix Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                'body_text': 'Hi {{1}},\nThank you for choosing CoolFix Services today! How satisfied were you with technician {{2}}?\n\nPlease reply with a score from 1 (Poor) to 5 (Outstanding) to help us improve.',
                'body_variables': {'1': 'Customer', '2': 'Rahul Mehta'},
                'footer_text': 'Your feedback helps us serve you better',
                'buttons': [
                    {'id': 'btn_rate_5', 'type': 'QUICK_REPLY', 'text': '⭐⭐⭐⭐⭐ Excellent'},
                    {'id': 'btn_rate_3', 'type': 'QUICK_REPLY', 'text': '⭐⭐⭐ Average'},
                    {'id': 'btn_rate_1', 'type': 'QUICK_REPLY', 'text': '⭐ Need Help'}
                ],
                'usage_count': 88
            },
            {
                'name': 'welcome_onboarding',
                'category': 'Welcome & Onboarding',
                'meta_category': 'UTILITY',
                'status': 'Active',
                'meta_status': 'APPROVED',
                'language': 'en_US',
                'header_type': 'NONE',
                'body': 'Welcome to CoolFix Services, {{1}}!\nWe provide top-rated HVAC, electrical, plumbing, and appliance care across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                'body_text': 'Welcome to CoolFix Services, {{1}}!\nWe provide top-rated HVAC, electrical, plumbing, and appliance care across Kerala.\nSave this number to your WhatsApp contacts for instant 24/7 service booking.\n\nHow can we help you today?',
                'body_variables': {'1': 'Customer'},
                'footer_text': 'CoolFix Business Solutions',
                'buttons': [
                    {'id': 'btn_book_srv', 'type': 'QUICK_REPLY', 'text': 'Book Service'},
                    {'id': 'btn_pricing', 'type': 'QUICK_REPLY', 'text': 'View Pricing'},
                    {'id': 'btn_support_call', 'type': 'PHONE_NUMBER', 'text': 'Call Helpline', 'phone_number': '+919876543210'}
                ],
                'usage_count': 175
            }
        ]
        for tmpl in templates_seed:
            WhatsAppTemplate.objects.create(**tmpl)

        Deal.objects.all().delete()
        deals_data = [
            {'deal_name': 'AC Installation - Vikram Mehta', 'customer_name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'amount': 12000.0, 'stage': 'proposal_sent', 'probability': 60, 'deal_owner': 'Ramesh Kumar', 'tags': ['AC Service', 'High Value'], 'notes': 'Customer interested in 1.5 ton inverter AC installation. Shared quotation.'},
            {'deal_name': 'AC Repair AMC - Pooja Iyer', 'customer_name': 'Pooja Iyer', 'phone': '+91 96789 12345', 'amount': 18000.0, 'stage': 'proposal_sent', 'probability': 75, 'deal_owner': 'Priya Sharma', 'tags': ['AMC', 'VIP'], 'notes': 'Annual maintenance contract for 5 AC units.'},
            {'deal_name': 'Full Home Cleaning - Anil Gupta', 'customer_name': 'Anil Gupta', 'phone': '+91 98765 22334', 'amount': 15000.0, 'stage': 'negotiation', 'probability': 85, 'deal_owner': 'Ramesh Kumar', 'tags': ['Cleaning'], 'notes': 'Deep cleaning prior to house warming.'},
            {'deal_name': 'AC Duct Cleaning - Kiran Kumar', 'customer_name': 'Kiran Kumar', 'phone': '+91 81234 55667', 'amount': 7200.0, 'stage': 'negotiation', 'probability': 80, 'deal_owner': 'Rahul Mehta', 'tags': ['AC Service'], 'notes': 'Commercial office ducting.'},
            {'deal_name': 'AC Repair - Deepak Patel', 'customer_name': 'Deepak Patel', 'phone': '+91 85471 22330', 'amount': 2800.0, 'stage': 'won', 'probability': 100, 'deal_owner': 'Ramesh Kumar', 'tags': ['AC Service'], 'notes': 'Service completed and invoice paid.'},
        ]
        for d in deals_data:
            Deal.objects.create(**d)

        FollowUp.objects.all().delete()
        followups_data = [
            {'title': 'Confirm AC Installation', 'related_to': 'AC Installation - Vikram Mehta DEAL-1024', 'customer_name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'follow_up_type': 'call', 'assigned_to': 'Amit Sharma', 'due_date': 'May 12, 2024', 'due_time': '10:30 AM', 'status': 'due_today', 'priority': 'high', 'notes': 'Confirm installation slot & address.'},
            {'title': 'Share Quotation', 'related_to': 'AC Repair - Amit Verma DEAL-1023', 'customer_name': 'Amit Verma', 'phone': '+91 98765 43210', 'follow_up_type': 'whatsapp', 'assigned_to': 'Priya Sharma', 'due_date': 'May 12, 2024', 'due_time': '12:00 PM', 'status': 'due_today', 'priority': 'high', 'notes': 'Share quote breakdown.'},
            {'title': 'Payment Reminder', 'related_to': 'Home Cleaning - Priya Sharma DEAL-1018', 'customer_name': 'Priya Sharma', 'phone': '+91 89213 56789', 'follow_up_type': 'whatsapp', 'assigned_to': 'Neha Patel', 'due_date': 'May 13, 2024', 'due_time': '09:00 AM', 'status': 'scheduled', 'priority': 'medium', 'notes': 'Send payment link for advance balance.'},
            {'title': 'Follow-up on Quote', 'related_to': 'Deep Cleaning - Sneha Joshi DEAL-1014', 'customer_name': 'Sneha Joshi', 'phone': '+91 96789 11223', 'follow_up_type': 'call', 'assigned_to': 'Priya Sharma', 'due_date': 'May 10, 2024', 'due_time': '02:00 PM', 'status': 'overdue', 'priority': 'high', 'notes': 'Check if quotation was approved.'},
        ]
        for f in followups_data:
            FollowUp.objects.create(**f)

        # 7. Operations: Jobs & Appointments & Employees
        Job.objects.all().delete()
        jobs_data = [
            {'job_id_str': 'JOB-1024', 'customer_name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'service': 'AC Installation - 1.5 Ton Inverter AC', 'date_str': 'May 12, 2024', 'time_str': '10:30 AM', 'assigned_to': 'Amit Sharma', 'status': 'in_progress', 'priority': 'high', 'location': 'Kozhikode, Kerala', 'amount': 1200.0, 'advance_paid': 360.0, 'payment_status': 'partially_paid', 'timeline': [
                {'title': 'Job Created', 'timestamp': 'May 10, 10:15 AM', 'by': 'System', 'completed': True},
                {'title': 'Assigned to Amit Sharma', 'timestamp': 'May 10, 10:20 AM', 'by': 'System', 'completed': True},
                {'title': 'Customer Confirmed', 'timestamp': 'May 10, 11:05 AM', 'by': 'Customer', 'completed': True},
                {'title': 'Job Started', 'timestamp': 'May 12, 10:35 AM', 'by': 'Amit Sharma', 'completed': True},
                {'title': 'Job Completed', 'timestamp': 'Pending', 'by': 'Technician', 'completed': False},
            ]},
            {'job_id_str': 'JOB-1023', 'customer_name': 'Amit Verma', 'phone': '+91 98765 43210', 'service': 'AC Repair (Gas Leakage)', 'date_str': 'May 12, 2024', 'time_str': '12:00 PM', 'assigned_to': 'Priya Sharma', 'status': 'scheduled', 'priority': 'high', 'location': 'Kozhikode, Kerala', 'amount': 2800.0, 'advance_paid': 840.0, 'payment_status': 'advance_paid'},
            {'job_id_str': 'JOB-1022', 'customer_name': 'Priya Sharma', 'phone': '+91 89213 56789', 'service': 'Deep Cleaning (Full Home)', 'date_str': 'May 13, 2024', 'time_str': '09:00 AM', 'assigned_to': 'Neha Patel', 'status': 'scheduled', 'priority': 'medium', 'location': 'Ramanattukara, Kerala', 'amount': 4500.0, 'advance_paid': 1350.0, 'payment_status': 'advance_paid'},
            {'job_id_str': 'JOB-1020', 'customer_name': 'Sneha Joshi', 'phone': '+91 96789 66771', 'service': 'AC Maintenance (General Service)', 'date_str': 'May 13, 2024', 'time_str': '04:00 PM', 'assigned_to': 'Arjun Nair', 'status': 'completed', 'priority': 'low', 'location': 'Vadakara, Kerala', 'amount': 1500.0, 'advance_paid': 1500.0, 'payment_status': 'paid'},
            {'job_id_str': 'JOB-1019', 'customer_name': 'Sunil Joseph', 'phone': '+91 90321 45000', 'service': 'Electrical Work (Wiring & Switches)', 'date_str': 'May 14, 2024', 'time_str': '10:00 AM', 'assigned_to': 'Amit Sharma', 'status': 'cancelled', 'priority': 'low', 'location': 'Kozhikode, Kerala', 'amount': 1800.0, 'advance_paid': 0.0, 'payment_status': 'pending'},
        ]
        for j in jobs_data:
            Job.objects.create(**j)

        Appointment.objects.all().delete()
        appointments_data = [
            {'apt_id_str': 'APT-1024', 'customer_name': 'Vikram Mehta', 'phone': '+91 90000 11123', 'service': 'AC Installation (1.5 Ton Inverter AC)', 'employee': 'Amit Sharma', 'date_str': 'May 12, 2024', 'time_str': '10:30 AM', 'status': 'confirmed', 'duration': '2h 00m', 'location': 'Kozhikode, Kerala', 'amount': 1200.0, 'advance': 360.0, 'payment_status': 'advance_paid', 'notes': 'Customer requested morning slot.'},
            {'apt_id_str': 'APT-1023', 'customer_name': 'Amit Verma', 'phone': '+91 98765 43210', 'service': 'AC Repair (Gas Leakage)', 'employee': 'Priya Sharma', 'date_str': 'May 12, 2024', 'time_str': '12:00 PM', 'status': 'upcoming', 'duration': '1h 30m', 'location': 'Kozhikode, Kerala', 'amount': 2800.0, 'advance': 0.0, 'payment_status': 'pending'},
            {'apt_id_str': 'APT-1022', 'customer_name': 'Priya Sharma', 'phone': '+91 89213 56789', 'service': 'Deep Cleaning (Full Home)', 'employee': 'Neha Patel', 'date_str': 'May 13, 2024', 'time_str': '09:00 AM', 'status': 'confirmed', 'duration': '3h 00m', 'location': 'Ramanattukara, Kerala', 'amount': 4500.0, 'advance': 450.0, 'payment_status': 'advance_paid'},
        ]
        for a in appointments_data:
            Appointment.objects.create(**a)

        Employee.objects.all().delete()
        employees_data = [
            {'name': 'Amit Sharma', 'employee_id_str': 'EMP-001', 'role': 'Field Technician', 'department': 'AC Services', 'phone': '+91 90000 11123', 'email': 'amit.sharma@qiyam.com', 'status': 'on_duty', 'location': 'Kozhikode, Kerala', 'rating': 4.8, 'jobs_completed_month': 28, 'on_time_percent': 96, 'today_schedule': [
                {'time': '10:30 AM', 'task': 'AC Installation', 'location': 'Kozhikode', 'status': 'in_progress'},
                {'time': '02:00 PM', 'task': 'AC Repair', 'location': 'Ramanattukara', 'status': 'upcoming'},
                {'time': '04:30 PM', 'task': 'Maintenance', 'location': 'Vadakara', 'status': 'upcoming'},
            ]},
            {'name': 'Priya Sharma', 'employee_id_str': 'EMP-002', 'role': 'Customer Support', 'department': 'Support', 'phone': '+91 89213 56789', 'email': 'priya.sharma@qiyam.com', 'status': 'active', 'location': 'Kozhikode Office', 'rating': 4.6, 'jobs_completed_month': 120, 'on_time_percent': 98},
            {'name': 'Rahul Singh', 'employee_id_str': 'EMP-003', 'role': 'Plumbing Technician', 'department': 'Plumbing', 'phone': '+91 98764 11122', 'email': 'rahul.singh@qiyam.com', 'status': 'on_duty', 'location': 'Vadakara, Kerala', 'rating': 4.7, 'jobs_completed_month': 22, 'on_time_percent': 94},
            {'name': 'Neha Patel', 'employee_id_str': 'EMP-004', 'role': 'Housekeeper Lead', 'department': 'Cleaning', 'phone': '+91 96789 11223', 'email': 'neha.patel@qiyam.com', 'status': 'on_leave', 'location': 'Kozhikode, Kerala', 'rating': 4.5, 'jobs_completed_month': 18, 'on_time_percent': 90},
            {'name': 'Arjun Nair', 'employee_id_str': 'EMP-005', 'role': 'Electrician', 'department': 'Electrical', 'phone': '+91 85471 22330', 'email': 'arjun.nair@qiyam.com', 'status': 'on_duty', 'location': 'Ramanattukara, Kerala', 'rating': 4.6, 'jobs_completed_month': 31, 'on_time_percent': 95},
            {'name': 'Sneha Joshi', 'employee_id_str': 'EMP-006', 'role': 'Team Lead', 'department': 'AC Services', 'phone': '+91 96789 66771', 'email': 'sneha.joshi@qiyam.com', 'status': 'active', 'location': 'Kozhikode Office', 'rating': 4.9, 'jobs_completed_month': 56, 'on_time_percent': 99},
        ]
        for e in employees_data:
            Employee.objects.create(**e)

        AttendanceRecord.objects.all().delete()
        attendance_data = [
            {'employee_id_str': 'EMP-001', 'employee_name': 'Amit Sharma', 'department': 'AC Services', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:58 AM', 'check_out': None, 'work_hours': '8h 58m', 'status': 'present', 'location': 'Kozhikode, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-002', 'employee_name': 'Priya Sharma', 'department': 'Customer Support', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:02 AM', 'check_out': None, 'work_hours': '8h 54m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'WhatsApp Web (Chrome)'},
            {'employee_id_str': 'EMP-003', 'employee_name': 'Rahul Singh', 'department': 'Plumbing Services', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:50 AM', 'check_out': None, 'work_hours': '9h 05m', 'status': 'present', 'location': 'Vadakara, Kerala', 'device': 'WhatsApp Geo-Punch (iOS)'},
            {'employee_id_str': 'EMP-004', 'employee_name': 'Neha Patel', 'department': 'Housekeeping Lead', 'shift': '9:00 AM - 6:00 PM', 'check_in': '-', 'check_out': None, 'work_hours': '0h 00m', 'status': 'absent', 'location': 'Kozhikode, Kerala', 'device': 'Leave Portal (Approved)'},
            {'employee_id_str': 'EMP-005', 'employee_name': 'Arjun Nair', 'department': 'Electrical Services', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:00 AM', 'check_out': None, 'work_hours': '8h 56m', 'status': 'present', 'location': 'Ramanattukara, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-006', 'employee_name': 'Sneha Joshi', 'department': 'Operations Lead', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:45 AM', 'check_out': None, 'work_hours': '9h 10m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'Desktop Punch (MacOS)'},
            {'employee_id_str': 'EMP-007', 'employee_name': 'Vikram Mehta', 'department': 'HVAC Field Tech', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:18 AM', 'check_out': None, 'work_hours': '8h 38m', 'status': 'late', 'location': 'Kozhikode, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-008', 'employee_name': 'Mohammed Farooq', 'department': 'Fleet Logistics', 'shift': '8:30 AM - 5:30 PM', 'check_in': '8:28 AM', 'check_out': None, 'work_hours': '9h 02m', 'status': 'present', 'location': 'Feroke Hub', 'device': 'GPS Biometric Terminal'},
            {'employee_id_str': 'EMP-009', 'employee_name': 'Ananya Sen', 'department': 'Client Success', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:59 AM', 'check_out': None, 'work_hours': '8h 57m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'WhatsApp Web (Windows)'},
            {'employee_id_str': 'EMP-010', 'employee_name': 'Rohan Kulkarni', 'department': 'AC Field Tech', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:22 AM', 'check_out': None, 'work_hours': '8h 34m', 'status': 'late', 'location': 'Pantheeramkavu, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-011', 'department': 'Dispatch Coordination', 'employee_name': 'Divya Krishnan', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:55 AM', 'check_out': None, 'work_hours': '9h 01m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'Desktop App (Chrome)'},
            {'employee_id_str': 'EMP-012', 'employee_name': 'Faizan Ali', 'department': 'Inventory & Parts', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:50 AM', 'check_out': None, 'work_hours': '9h 06m', 'status': 'present', 'location': 'Central Warehouse', 'device': 'Barcode Scanner Terminal'},
            {'employee_id_str': 'EMP-013', 'employee_name': 'Shilpa Menon', 'department': 'Finance & Billing', 'shift': '9:30 AM - 6:30 PM', 'check_in': '9:28 AM', 'check_out': None, 'work_hours': '8h 52m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'WhatsApp Web (Windows)'},
            {'employee_id_str': 'EMP-014', 'employee_name': 'Harish Varma', 'department': 'Plumbing Services', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:01 AM', 'check_out': None, 'work_hours': '8h 55m', 'status': 'present', 'location': 'Mavoor Road', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-015', 'employee_name': 'Kavita Nair', 'department': 'QA & Compliance', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:54 AM', 'check_out': None, 'work_hours': '9h 02m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'WhatsApp Geo-Punch (iOS)'},
            {'employee_id_str': 'EMP-016', 'employee_name': 'Karthik Ram', 'department': 'Electrical Field Tech', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:57 AM', 'check_out': None, 'work_hours': '8h 59m', 'status': 'present', 'location': 'Palazhi, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-017', 'employee_name': 'Manju Swamy', 'department': 'Appliance Repair', 'shift': '9:00 AM - 6:00 PM', 'check_in': '9:03 AM', 'check_out': None, 'work_hours': '8h 53m', 'status': 'present', 'location': 'Beypore, Kerala', 'device': 'WhatsApp Geo-Punch (Android)'},
            {'employee_id_str': 'EMP-018', 'employee_name': 'Zoya Khan', 'department': 'Customer Support', 'shift': '9:00 AM - 6:00 PM', 'check_in': '8:56 AM', 'check_out': None, 'work_hours': '9h 00m', 'status': 'present', 'location': 'Kozhikode Office', 'device': 'WhatsApp Web (Chrome)'},
        ]
        for att in attendance_data:
            AttendanceRecord.objects.create(**att)

        # 8. Finance: Transactions, Invoices, Expenses, Accounts
        Transaction.objects.all().delete()
        transactions_data = [
            {'date_str': 'May 31, 2024', 'tx_type': 'income', 'description': 'Payment from AC Services', 'category': 'AC Services', 'party': 'Amit Sharma', 'account': 'HDFC Bank - 1234', 'amount': 12500.0, 'payment_mode': 'UPI', 'reference_id': 'INV-2024-0521', 'status': 'completed'},
            {'date_str': 'May 30, 2024', 'tx_type': 'expense', 'description': 'Salary - May 2024', 'category': 'Salaries & Wages', 'party': 'Payroll', 'account': 'ICICI Bank - 5678', 'amount': 265000.0, 'payment_mode': 'Bank Transfer', 'reference_id': 'EXP-2024-0311', 'status': 'completed'},
            {'date_str': 'May 29, 2024', 'tx_type': 'income', 'description': 'Digital Marketing Project', 'category': 'Marketing', 'party': 'Digital Ads', 'account': 'HDFC Bank - 1234', 'amount': 18750.0, 'payment_mode': 'UPI', 'reference_id': 'INV-2024-0518', 'status': 'completed'},
            {'date_str': 'May 28, 2024', 'tx_type': 'expense', 'description': 'Office Rent - May', 'category': 'Rent & Utilities', 'party': 'Landlord', 'account': 'Axis Bank - 9012', 'amount': 55000.0, 'payment_mode': 'NEFT', 'reference_id': 'EXP-2024-0308', 'status': 'completed'},
            {'date_str': 'May 27, 2024', 'tx_type': 'income', 'description': 'Website Development', 'category': 'Web Services', 'party': 'Rahul Singh', 'account': 'HDFC Bank - 1234', 'amount': 75000.0, 'payment_mode': 'Bank Transfer', 'reference_id': 'INV-2024-0512', 'status': 'completed'},
        ]
        for t in transactions_data:
            Transaction.objects.create(**t)

        Invoice.objects.all().delete()
        invoices_data = [
            {'invoice_number': 'INV-2024-0186', 'customer_name': 'AC Services', 'customer_email': 'acservices@gmail.com', 'invoice_date': 'May 31, 2024', 'due_date': 'Jun 14, 2024', 'amount': 12500.0, 'status': 'paid', 'paid_amount': 12500.0, 'payment_method': 'UPI', 'payment_date': 'May 31, 2024', 'items': [{'description': 'AC Repair & Gas Refill', 'qty': 2, 'unitPrice': 6250, 'amount': 12500}]},
            {'invoice_number': 'INV-2024-0185', 'customer_name': 'Digital Ads Pvt. Ltd.', 'customer_email': 'info@digitalads.com', 'invoice_date': 'May 30, 2024', 'due_date': 'Jun 13, 2024', 'amount': 18750.0, 'status': 'paid', 'paid_amount': 18750.0, 'payment_method': 'Bank Transfer', 'payment_date': 'May 30, 2024'},
            {'invoice_number': 'INV-2024-0184', 'customer_name': 'Zoho Corp', 'customer_email': 'accounts@zohocorp.com', 'invoice_date': 'May 29, 2024', 'due_date': 'Jun 12, 2024', 'amount': 4200.0, 'status': 'partial_paid', 'paid_amount': 2100.0, 'payment_method': 'Card'},
            {'invoice_number': 'INV-2024-0183', 'customer_name': 'Priya Sharma', 'customer_email': 'priya.sharma@gmail.com', 'invoice_date': 'May 28, 2024', 'due_date': 'Jun 11, 2024', 'amount': 32000.0, 'status': 'overdue', 'paid_amount': 0.0},
            {'invoice_number': 'INV-2024-0182', 'customer_name': 'Rahul Singh', 'customer_email': 'rahulsingh@gmail.com', 'invoice_date': 'May 27, 2024', 'due_date': 'Jun 10, 2024', 'amount': 7600.0, 'status': 'sent', 'paid_amount': 0.0},
        ]
        for inv in invoices_data:
            Invoice.objects.create(**inv)

        Quotation.objects.all().delete()
        quotations_data = [
            {
                'quotation_number': 'QUO-2024-0042',
                'customer_name': 'Dr. Tariq Rahman (Aster Clinic)',
                'customer_email': 'dr.tariq@asterclinic.com',
                'customer_phone': '+91 98470 12345',
                'quotation_date': 'May 30, 2024',
                'valid_until': 'Jun 15, 2024',
                'amount': 28500.0,
                'subtotal': 25000.0,
                'tax_amount': 4500.0,
                'discount_amount': 1000.0,
                'status': 'accepted',
                'converted_invoice_id': '',
                'terms': 'Validity: 15 days. 50% advance payment required upon acceptance. 1-year on-site compressor warranty included.',
                'notes': 'Quotation for Daikin Inverter Multi-Split system servicing & duct sanitization.',
                'items': [
                    {'description': 'Daikin VRV System Multi-Split Deep Cleaning', 'qty': 4, 'unitPrice': 3500, 'taxRate': 18, 'amount': 14000},
                    {'description': 'Eco-Friendly Antibacterial Duct Sanitization', 'qty': 2, 'unitPrice': 4000, 'taxRate': 18, 'amount': 8000},
                    {'description': 'Comprehensive 1-Year AMC Maintenance Plan', 'qty': 1, 'unitPrice': 3000, 'taxRate': 18, 'amount': 3000}
                ]
            },
            {
                'quotation_number': 'QUO-2024-0041',
                'customer_name': 'Malabar Gold & Diamonds',
                'customer_email': 'procurement@malabargold.com',
                'customer_phone': '+91 97456 78901',
                'quotation_date': 'May 28, 2024',
                'valid_until': 'Jun 12, 2024',
                'amount': 64000.0,
                'subtotal': 60000.0,
                'tax_amount': 10800.0,
                'discount_amount': 6800.0,
                'status': 'sent',
                'converted_invoice_id': '',
                'terms': 'Commercial showroom HVAC overhaul. Work to be completed during non-business hours.',
                'notes': 'Presented directly to facility manager Mr. Najeeb. Awaiting final board sign-off.',
                'items': [
                    {'description': 'Commercial Ceiling Cassette AC Overhaul (3 Ton)', 'qty': 6, 'unitPrice': 8000, 'taxRate': 18, 'amount': 48000},
                    {'description': 'Refrigerant R32 Top-up & Gas Leak Hydro-Testing', 'qty': 6, 'unitPrice': 2000, 'taxRate': 18, 'amount': 12000}
                ]
            },
            {
                'quotation_number': 'QUO-2024-0040',
                'customer_name': 'Pooja Iyer (Kakkanad Villa)',
                'customer_email': 'pooja.iyer@gmail.com',
                'customer_phone': '+91 96789 12345',
                'quotation_date': 'May 26, 2024',
                'valid_until': 'Jun 10, 2024',
                'amount': 18000.0,
                'subtotal': 16000.0,
                'tax_amount': 2880.0,
                'discount_amount': 880.0,
                'status': 'converted',
                'converted_invoice_id': 'INV-2024-0186',
                'terms': 'Payment converted to Invoice INV-2024-0186. Standard villa maintenance terms apply.',
                'notes': 'Customer accepted quote via WhatsApp and invoice was generated.',
                'items': [
                    {'description': 'Annual Maintenance Contract - 5 Residential AC Units', 'qty': 1, 'unitPrice': 16000, 'taxRate': 18, 'amount': 16000}
                ]
            },
            {
                'quotation_number': 'QUO-2024-0039',
                'customer_name': 'CyberPark Tech Space',
                'customer_email': 'admin@cyberpark.kerala.gov.in',
                'customer_phone': '+91 89432 10987',
                'quotation_date': 'May 20, 2024',
                'valid_until': 'Jun 04, 2024',
                'amount': 115000.0,
                'subtotal': 105000.0,
                'tax_amount': 18900.0,
                'discount_amount': 8900.0,
                'status': 'viewed',
                'converted_invoice_id': '',
                'terms': 'Quotation viewed by client procurement portal. Valid for government procurement rules.',
                'notes': 'Server room precision AC maintenance & backup condenser installation.',
                'items': [
                    {'description': 'Precision Air Conditioner (PAC) Emergency Maintenance', 'qty': 3, 'unitPrice': 25000, 'taxRate': 18, 'amount': 75000},
                    {'description': 'Thermal Imaging & Energy Efficiency Audit', 'qty': 1, 'unitPrice': 30000, 'taxRate': 18, 'amount': 30000}
                ]
            },
            {
                'quotation_number': 'QUO-2024-0038',
                'customer_name': 'Hilite Residency Flat Owners',
                'customer_email': 'residents@hiliteresidency.com',
                'customer_phone': '+91 94470 54321',
                'quotation_date': 'May 10, 2024',
                'valid_until': 'May 25, 2024',
                'amount': 42000.0,
                'subtotal': 38000.0,
                'tax_amount': 6840.0,
                'discount_amount': 2840.0,
                'status': 'expired',
                'converted_invoice_id': '',
                'terms': 'Special bulk resident discount was valid until May 25, 2024.',
                'notes': 'Quotation expired. Needs requoting if client requests renewed pricing.',
                'items': [
                    {'description': 'Bulk Pre-Monsoon AC Servicing Package (12 Apartments)', 'qty': 12, 'unitPrice': 3166.66, 'taxRate': 18, 'amount': 38000}
                ]
            },
            {
                'quotation_number': 'QUO-2024-0037',
                'customer_name': 'Zayan Malik',
                'customer_email': 'zayan@coolfix-store.com',
                'customer_phone': '+91 98460 99887',
                'quotation_date': 'May 05, 2024',
                'valid_until': 'May 20, 2024',
                'amount': 9500.0,
                'subtotal': 8500.0,
                'tax_amount': 1530.0,
                'discount_amount': 530.0,
                'status': 'draft',
                'converted_invoice_id': '',
                'terms': 'Draft proposal for sensor board replacement and general check-up.',
                'notes': 'Pending review before dispatching to client.',
                'items': [
                    {'description': 'Inverter AC Sensor Board & PCB Testing', 'qty': 1, 'unitPrice': 5500, 'taxRate': 18, 'amount': 5500},
                    {'description': 'Full System Labor & Outdoor Unit Cleaning', 'qty': 1, 'unitPrice': 3000, 'taxRate': 18, 'amount': 3000}
                ]
            }
        ]
        for q in quotations_data:
            Quotation.objects.create(**q)

        PaymentAccount.objects.all().delete()
        accounts_data = [
            {'name': 'Qiyam Business Current A/c', 'account_number': '50200012345678', 'account_type': 'Bank Account', 'provider': 'Federal Bank', 'current_balance': 2478350.0, 'status': 'Active'},
            {'name': 'HDFC Business Account', 'account_number': '50100234567890', 'account_type': 'Bank Account', 'provider': 'HDFC Bank', 'current_balance': 1245600.0, 'status': 'Active'},
            {'name': 'Axis Current Account', 'account_number': '917020123456789', 'account_type': 'Bank Account', 'provider': 'Axis Bank', 'current_balance': 838400.0, 'status': 'Active'},
            {'name': 'Razorpay Online Payments', 'account_number': 'rzp_a1b2c3d4e5f6', 'account_type': 'Payment Gateway', 'provider': 'Razorpay', 'current_balance': 350000.0, 'status': 'Active'},
            {'name': 'PayPal Business', 'account_number': 'paypal.me/qiyambs', 'account_type': 'Payment Gateway', 'provider': 'PayPal', 'current_balance': 525200.0, 'status': 'Active'},
            {'name': 'Head Office Cash', 'account_number': None, 'account_type': 'Cash Account', 'provider': 'Cash in Hand', 'current_balance': 125600.0, 'status': 'Active'},
        ]
        for acc in accounts_data:
            PaymentAccount.objects.create(**acc)

        # 9. Automation Workflows & Logs
        Workflow.objects.all().delete()
        Workflow.objects.create(
            name='Service Booking Flow',
            category='CRM',
            business_function='Operations & Booking',
            trigger_type='New WhatsApp Message',
            description='Automated inbound WhatsApp intent parsing, lead creation, service availability check, payment request, and technician assignment.',
            status='active',
            runs_this_month=156,
            success_rate=98.7,
            last_modified='May 31, 2024 10:30 AM',
            nodes=[
                {'id': '1', 'type': 'trigger', 'title': 'New WhatsApp Message', 'subtitle': 'When a new message is received', 'category': 'TRIGGERS', 'iconName': 'MessageSquare', 'color': 'emerald', 'config': {}, 'position': {'x': 400, 'y': 50}},
                {'id': '2', 'type': 'ai_agent', 'title': 'Understand Intent (AI Agent)', 'subtitle': 'Extract intent, service, location, customer details', 'category': 'AI', 'iconName': 'Bot', 'color': 'purple', 'config': {}, 'position': {'x': 400, 'y': 150}},
                {'id': '3', 'type': 'action', 'title': 'Create / Update Lead', 'subtitle': 'Create new lead or update existing lead in CRM', 'category': 'ACTIONS', 'iconName': 'UserCheck', 'color': 'blue', 'config': {}, 'position': {'x': 400, 'y': 250}},
                {'id': '4', 'type': 'condition', 'title': 'Service Available?', 'subtitle': 'Check if service is available in customer location', 'category': 'CONDITIONS', 'iconName': 'Filter', 'color': 'amber', 'config': {}, 'position': {'x': 400, 'y': 350}},
                {'id': '5', 'type': 'action', 'title': 'Send Availability Message', 'subtitle': 'Share service availability and ask for confirmation', 'category': 'ACTIONS', 'iconName': 'Send', 'color': 'emerald', 'config': {}, 'position': {'x': 250, 'y': 480}},
                {'id': '6', 'type': 'action', 'title': 'Create Appointment', 'subtitle': 'Create appointment based on customer preference', 'category': 'ACTIONS', 'iconName': 'Calendar', 'color': 'purple', 'config': {}, 'position': {'x': 250, 'y': 580}},
                {'id': '7', 'type': 'action', 'title': 'Request Payment (30% Advance)', 'subtitle': 'Request advance payment to confirm booking', 'category': 'ACTIONS', 'iconName': 'CreditCard', 'color': 'emerald', 'config': {}, 'position': {'x': 250, 'y': 680}},
                {'id': '8', 'type': 'action', 'title': 'Assign Nearest Employee', 'subtitle': 'Assign nearest available technician (Ramesh Kumar)', 'category': 'ACTIONS', 'iconName': 'Users', 'color': 'purple', 'config': {}, 'position': {'x': 600, 'y': 480}},
            ]
        )

        AutomationLog.objects.all().delete()
        logs_data = [
            {'time_str': 'May 31, 2024 10:30:45 AM', 'workflow_action': 'Invoice Generation (Create Invoice)', 'branch': 'Kochi Branch', 'status': 'success', 'log_level': 'Info', 'message': 'Invoice INV-2024-1056 generated successfully.', 'triggered_by': 'System', 'duration': '1.23s'},
            {'time_str': 'May 31, 2024 10:25:18 AM', 'workflow_action': 'Payment Reminder (Send Reminder Email)', 'branch': 'Head Office', 'status': 'success', 'log_level': 'Info', 'message': 'Payment reminder sent to customer (3 accounts).', 'triggered_by': 'Schedule', 'duration': '2.15s'},
            {'time_str': 'May 31, 2024 10:22:09 AM', 'workflow_action': 'Lead Follow-up (Assign Lead)', 'branch': 'Mumbai Branch', 'status': 'success', 'log_level': 'Info', 'message': 'Lead assigned to sales team successfully.', 'triggered_by': 'User', 'duration': '0.89s'},
            {'time_str': 'May 31, 2024 10:18:34 AM', 'workflow_action': 'Employee Onboarding (Create Account)', 'branch': 'Bangalore Branch', 'status': 'warning', 'log_level': 'Warning', 'message': 'Employee document missing: PAN Card.', 'triggered_by': 'System', 'duration': '1.45s'},
        ]
        for lg in logs_data:
            AutomationLog.objects.create(**lg)

        Approval.objects.all().delete()
        approvals_data = [
            {'request_id_str': 'APR-1024', 'title': 'Purchase Order ₹25,000', 'approval_type': 'Purchase', 'department': 'Operations', 'requested_by': 'Aneesh K', 'submitted_on': 'May 31, 2024 10:24 AM', 'status': 'Pending', 'amount': 25000.0},
            {'request_id_str': 'APR-1023', 'title': 'Leave Application 3 Days', 'approval_type': 'Leave', 'department': 'HR', 'requested_by': 'Sneha P', 'submitted_on': 'May 31, 2024 09:48 AM', 'status': 'Approved'},
            {'request_id_str': 'APR-1022', 'title': 'Budget Release Marketing Campaign', 'approval_type': 'Finance', 'department': 'Marketing', 'requested_by': 'Rahul T', 'submitted_on': 'May 30, 2024 04:12 PM', 'status': 'Pending', 'amount': 50000.0},
        ]
        for ap in approvals_data:
            Approval.objects.create(**ap)

        # 10. AI Assistant & Knowledge Base
        KnowledgeArticle.objects.all().delete()
        kb_data = [
            {'title': 'Welcome to Qiyam Business OS', 'category': 'Getting Started', 'content': 'Overview of the platform, WhatsApp shared inbox, and automated workflows.', 'status': 'published', 'last_updated': 'May 28, 2024', 'author': 'Faris Usman', 'views': 1245, 'helpful_percent': 96},
            {'title': 'How to Set Up WhatsApp Cloud API', 'category': 'Getting Started', 'content': 'Step-by-step guide to connect your Meta Business account and phone number ID.', 'status': 'published', 'last_updated': 'May 26, 2024', 'author': 'Ayesha K.', 'views': 2134, 'helpful_percent': 94},
            {'title': 'Navigating the Executive Dashboard', 'category': 'Getting Started', 'content': 'Understand real-time business metrics, AI alerts, revenue trends and staff capacity.', 'status': 'published', 'last_updated': 'May 24, 2024', 'author': 'Tech Team', 'views': 1876, 'helpful_percent': 95},
        ]
        for kb in kb_data:
            KnowledgeArticle.objects.create(**kb)

        AISettings.objects.all().delete()
        AISettings.objects.create(
            assistant_name='Qiyam AI Assistant',
            default_language='English (US)',
            time_zone='(GMT+05:30) Asia/Kolkata',
            response_length='Balanced',
            enable_ai_assistant=True,
            suggest_follow_up_questions=True,
            use_knowledge_base_first=True,
            user_roles='All Roles (8)',
            data_access='Organization Data',
            conversation_visibility='Admins Only'
        )

        # 11. Operations: Route & Inventory
        Route.objects.all().delete()
        Route.objects.create(
            route_id_str='RTE-001',
            driver_name='Rahul Mehta',
            phone='+91 98765 43210',
            vehicle='KL 11 AB 1234',
            status='in_progress',
            stops_count=12,
            distance_km=65.4,
            duration='3h 15m',
            estimated_end='12:15 PM',
            fuel_cost=1120.0,
            completed_stops=9,
            stops=[
                {'id': 1, 'address': 'Main Hub, Kozhikode', 'customerName': 'Head Office', 'timeWindow': '09:00 AM', 'type': 'start'},
                {'id': 2, 'address': '45 Park Street, Koyilandy', 'customerName': 'Amit Verma', 'timeWindow': '09:30 AM', 'type': 'stop', 'isCompleted': True},
                {'id': 3, 'address': '12 Beach Road, Calicut', 'customerName': 'Vikram Mehta', 'timeWindow': '10:15 AM', 'type': 'stop', 'isCompleted': True},
                {'id': 6, 'address': '88 Highway Junction, Vadakara', 'customerName': 'Sneha Joshi', 'timeWindow': '11:00 AM', 'type': 'priority', 'isPriority': True, 'isCompleted': True},
                {'id': 10, 'address': 'Airport Road, Ramanattukara', 'customerName': 'Priya Sharma', 'timeWindow': '12:00 PM', 'type': 'end'}
            ]
        )

        InventoryItem.objects.all().delete()
        inventory_data = [
            {'name': 'Basmati Rice 5kg', 'sku': 'GROC-001', 'category': 'Grocery', 'stock_units': 245, 'stock_value': 12250.0, 'status': 'in_stock', 'location': 'Main Warehouse Aisle 01 - Rack 02', 'reorder_level': 50, 'reorder_qty': 100, 'supplier': 'Fresh Supplies Pvt. Ltd.', 'image_url': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80'},
            {'name': 'Sunflower Oil 1L', 'sku': 'GROC-002', 'category': 'Grocery', 'stock_units': 28, 'stock_value': 1960.0, 'status': 'low_stock', 'location': 'Main Warehouse Aisle 02 - Rack 01', 'reorder_level': 30, 'reorder_qty': 80, 'supplier': 'Fresh Supplies Pvt. Ltd.', 'image_url': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80'},
            {'name': 'Milk Powder 500g', 'sku': 'DAIRY-001', 'category': 'Dairy', 'stock_units': 0, 'stock_value': 0.0, 'status': 'out_of_stock', 'location': 'Main Warehouse Aisle 03 - Rack 01', 'reorder_level': 20, 'reorder_qty': 50, 'supplier': 'Milma Dairy', 'image_url': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80'},
            {'name': 'Colgate Toothpaste 100g', 'sku': 'HPC-001', 'category': 'Personal Care', 'stock_units': 156, 'stock_value': 3120.0, 'status': 'in_stock', 'location': 'Main Warehouse Aisle 04 - Rack 03', 'reorder_level': 40, 'reorder_qty': 100, 'supplier': 'Colgate Palmolive', 'image_url': 'https://images.unsplash.com/photo-1559591937-e10b14421b59?w=400&auto=format&fit=crop&q=80'},
        ]
        for inv_item in inventory_data:
            InventoryItem.objects.create(**inv_item)

        # 12. Analytics Metrics
        ChannelMetric.objects.all().delete()
        ChannelMetric.objects.create(channel_name='Web Chat', total_conversations=5801, percentage=45.2, color='#3B82F6')
        ChannelMetric.objects.create(channel_name='Mobile App', total_conversations=3688, percentage=28.7, color='#8B5CF6')
        ChannelMetric.objects.create(channel_name='WhatsApp', total_conversations=2003, percentage=15.6, color='#10B981')
        ChannelMetric.objects.create(channel_name='Email', total_conversations=964, percentage=7.5, color='#F59E0B')
        ChannelMetric.objects.create(channel_name='Others', total_conversations=389, percentage=3.0, color='#64748B')

        IntentMetric.objects.all().delete()
        IntentMetric.objects.create(intent_name='Getting Information', count=3254, percentage=25.3)
        IntentMetric.objects.create(intent_name='How To / Guidance', count=2487, percentage=19.3)
        IntentMetric.objects.create(intent_name='Account & Access', count=1934, percentage=15.0)
        IntentMetric.objects.create(intent_name='Orders & Delivery', count=1742, percentage=13.6)
        IntentMetric.objects.create(intent_name='Billing & Payments', count=1328, percentage=10.3)

        self.stdout.write(self.style.SUCCESS("Qiyam Business OS database successfully populated with all 36 screenshot datasets!"))
