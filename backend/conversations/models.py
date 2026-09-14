from django.db import models
import json

class MetaWhatsAppConfig(models.Model):
    """
    Configuration credentials for Meta WhatsApp Cloud API (Graph API)
    """
    phone_number_id = models.CharField(max_length=100, blank=True, default='')
    waba_id = models.CharField(max_length=100, blank=True, default='') # WhatsApp Business Account ID
    access_token = models.TextField(blank=True, default='') # Permanent or Temporary Meta Token
    verify_token = models.CharField(max_length=100, default='qiyam_whatsapp_secret_token_2026')
    app_secret = models.CharField(max_length=100, blank=True, default='')
    api_version = models.CharField(max_length=20, default='v21.0')
    webhook_url = models.CharField(max_length=255, default='https://your-domain.com/api/conversations/webhook/')
    is_active = models.BooleanField(default=True)
    last_tested_at = models.DateTimeField(null=True, blank=True)
    connection_status = models.CharField(max_length=50, default='disconnected') # connected, disconnected, invalid_token, error
    business_phone_display = models.CharField(max_length=50, default='+91 98765 43210')
    business_name = models.CharField(max_length=150, default='CoolFix Services')
    quality_rating = models.CharField(max_length=50, default='GREEN')
    
    # Dual-Workspace Co-existence & Automated Replies
    auto_reply_enabled = models.BooleanField(default=True)
    dual_mode_enabled = models.BooleanField(default=True)
    forward_webhook_url = models.CharField(max_length=500, blank=True, default='')
    staff_numbers = models.TextField(blank=True, default='') # Comma-separated staff phone numbers
    staff_keywords = models.TextField(blank=True, default='staff,portal,workspace,attendance,clock,shift,leave,payroll,duty')

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Meta Config: {self.business_name} ({self.connection_status})"

class Conversation(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('waiting', 'Waiting'),
        ('resolved', 'Resolved'),
        ('ai_handled', 'AI Handled'),
        ('spam', 'Spam'),
    ]
    
    CATEGORY_CHOICES = [
        ('Lead', 'Lead'),
        ('Customer', 'Customer'),
        ('Hot Lead', 'Hot Lead'),
        ('Vendor', 'Vendor'),
    ]

    contact_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=50)
    avatar = models.CharField(max_length=255, blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Lead')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='open')
    unread_count = models.IntegerField(default=0)
    lead_owner = models.CharField(max_length=100, default='Ramesh Kumar')
    lead_stage = models.CharField(max_length=50, default='New Lead')
    source = models.CharField(max_length=50, default='WhatsApp')
    first_contact_date = models.CharField(max_length=100, default='May 12, 2024 10:30 AM')
    last_contact_date = models.CharField(max_length=100, default='May 12, 2024 10:32 AM')
    location = models.CharField(max_length=150, default='Koyilandy, Kerala')
    language = models.CharField(max_length=50, default='English')
    tags = models.JSONField(default=list)
    notes = models.TextField(blank=True, default='')
    service_needed = models.CharField(max_length=150, blank=True, default='AC Repair')
    estimated_value = models.FloatField(default=2800.0)
    active_workflow = models.CharField(max_length=150, default='Service Booking Flow')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.contact_name} ({self.phone_number})"

class Message(models.Model):
    SENDER_CHOICES = [
        ('customer', 'Customer'),
        ('agent', 'Agent'),
        ('bot', 'AI Bot'),
        ('system', 'System'),
    ]
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]

    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.CharField(max_length=20, choices=SENDER_CHOICES, default='customer')
    sender_name = models.CharField(max_length=100, blank=True, default='')
    text = models.TextField()
    timestamp = models.CharField(max_length=50, default='10:30 AM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='read')
    meta_message_id = models.CharField(max_length=150, blank=True, default='') # wamid.HBgL...
    error_details = models.JSONField(blank=True, null=True)
    rich_card = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"[{self.sender}] {self.text[:30]}"

class WhatsAppTemplate(models.Model):
    META_CATEGORY_CHOICES = [
        ('MARKETING', 'Marketing'),
        ('UTILITY', 'Utility'),
        ('AUTHENTICATION', 'Authentication'),
    ]
    META_STATUS_CHOICES = [
        ('APPROVED', 'Approved'),
        ('PENDING', 'In Review / Pending'),
        ('REJECTED', 'Rejected'),
        ('PAUSED', 'Paused'),
        ('DRAFT', 'Draft'),
    ]

    meta_template_id = models.CharField(max_length=100, blank=True, default='')
    name = models.CharField(max_length=150) # e.g. service_booking_confirmed (lowercase + underscores)
    category = models.CharField(max_length=100, default='Welcome & Onboarding')
    meta_category = models.CharField(max_length=50, choices=META_CATEGORY_CHOICES, default='UTILITY')
    status = models.CharField(max_length=50, default='Active')
    meta_status = models.CharField(max_length=50, choices=META_STATUS_CHOICES, default='APPROVED')
    language = models.CharField(max_length=50, default='en_US')
    
    # Template Components
    header_type = models.CharField(max_length=50, default='NONE') # NONE, TEXT, IMAGE, VIDEO, DOCUMENT, LOCATION
    header_text = models.CharField(max_length=200, blank=True, default='')
    header_url = models.CharField(max_length=500, blank=True, default='')
    header_sample = models.CharField(max_length=200, blank=True, default='')
    
    body = models.TextField() # legacy text field
    body_text = models.TextField(blank=True, default='') # Meta body text with {{1}}, {{2}}
    body_variables = models.JSONField(default=dict) # e.g. {"1": "Vikram", "2": "AC Repair"}
    
    footer_text = models.CharField(max_length=100, blank=True, default='') # Max 60 chars
    buttons = models.JSONField(default=list) # List of button objects (QUICK_REPLY, URL, PHONE_NUMBER, COPY_CODE)
    
    # Meta Review & Quality
    quality_score = models.CharField(max_length=50, default='GREEN') # GREEN, YELLOW, RED, UNKNOWN
    rejection_reason = models.TextField(blank=True, default='')
    allow_category_change = models.BooleanField(default=True)
    
    usage_count = models.IntegerField(default=0)
    last_updated = models.CharField(max_length=100, default='May 28, 2024')
    author = models.CharField(max_length=100, default='Ayesha K.')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.meta_category} - {self.meta_status})"
