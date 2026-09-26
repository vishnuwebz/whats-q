from django.db import models
import json

class MetaWhatsAppConfig(models.Model):
    """
    Configuration credentials for Meta WhatsApp Cloud API (Graph API)
    """
    phone_number_id = models.CharField(max_length=100, blank=True, default='1307178355804150')
    waba_id = models.CharField(max_length=100, blank=True, default='4567067243541240') # WhatsApp Business Account ID
    access_token = models.TextField(blank=True, default='') # Permanent or Temporary Meta Token
    verify_token = models.CharField(max_length=100, default='qiyam_whatsapp_secret_token_2026')
    app_secret = models.CharField(max_length=100, blank=True, default='')
    api_version = models.CharField(max_length=20, default='v21.0')
    webhook_url = models.CharField(max_length=255, default='https://your-domain.com/api/conversations/webhook/')
    is_active = models.BooleanField(default=True)
    last_tested_at = models.DateTimeField(null=True, blank=True)
    connection_status = models.CharField(max_length=50, default='connected') # connected, disconnected, invalid_token, error
    business_phone_display = models.CharField(max_length=50, default='+91 94963 00233')
    business_name = models.CharField(max_length=150, default='Qiyam Business Solutions')
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
    avatar = models.TextField(blank=True, default='')
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
    is_online = models.BooleanField(default=False)
    last_seen = models.CharField(max_length=100, blank=True, default='Recently')
    is_blocked = models.BooleanField(default=False)
    is_opted_out = models.BooleanField(default=False)
    suppression_reason = models.CharField(max_length=255, blank=True, default='')
    active_line_device = models.CharField(max_length=150, blank=True, default='')
    active_line_phone = models.CharField(max_length=50, blank=True, default='')
    active_employee_name = models.CharField(max_length=150, blank=True, default='')
    active_line_type = models.CharField(max_length=50, blank=True, default='meta_cloud') # "meta_cloud" or "employee"
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    meta_message_id = models.CharField(max_length=150, blank=True, default='') # wamid.HBgL...
    sender_device = models.CharField(max_length=150, blank=True, default='') # e.g. "Ramesh Kumar (Sales Desk)", "Meta Cloud API"
    sender_phone = models.CharField(max_length=50, blank=True, default='') # e.g. "+91 98471 23456"
    recipient_phone = models.CharField(max_length=50, blank=True, default='') # Phone line that received this message
    error_details = models.JSONField(blank=True, null=True)
    rich_card = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f"[{self.sender}] {self.text[:30]}"

class LinkedEmployeeDevice(models.Model):
    """
    Connected Employee WhatsApp Devices linked via QR Code scanning.
    Allows sales staff, dispatch coordinators, and field employees to chat with customers
    directly from their individual or company-given WhatsApp phone lines within Qiyam Business OS.
    """
    device_label = models.CharField(max_length=150, default='Surat Wholesale Line')
    phone_number = models.CharField(max_length=50, blank=True, default='')
    employee_name = models.CharField(max_length=150, blank=True, default='')
    session_token = models.CharField(max_length=100, blank=True, default='', db_index=True)
    status = models.CharField(max_length=50, default='connected') # connected, pending, disconnected
    device_type = models.CharField(max_length=100, default='WhatsApp Web Multi-Device')
    battery_level = models.IntegerField(default=95)
    is_active = models.BooleanField(default=True)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.device_label} ({self.phone_number}) [{self.status}]"

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
    header_url = models.TextField(blank=True, default='')
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


class BulkCampaign(models.Model):
    """
    Persists every real WhatsApp broadcast campaign launched via Qiyam.
    Tracks gateway results so Campaign History shows real send/deliver/fail counts.
    """
    STATUS_CHOICES = [
        ('QUEUED', 'Queued'),
        ('RUNNING', 'Running'),
        ('COMPLETED', 'Completed'),
        ('PAUSED', 'Paused'),
        ('FAILED', 'Failed'),
    ]
    TYPE_CHOICES = [
        ('Marketing', 'Marketing'),
        ('Utility', 'Utility'),
        ('Authentication', 'Authentication'),
        ('Engagement', 'Engagement'),
    ]

    gateway_campaign_id = models.CharField(max_length=100, blank=True, default='')  # gateway camp-xxx id
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Marketing')
    category = models.CharField(max_length=50, default='marketing')  # marketing | utility | authentication

    # Audience
    audience_list_name = models.CharField(max_length=255, default='')
    total_recipients = models.IntegerField(default=0)

    # Results (updated by gateway callbacks or on completion)
    delivered_count = models.IntegerField(default=0)
    read_count = models.IntegerField(default=0)
    replied_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)

    # Template / Message
    template_name = models.CharField(max_length=255, blank=True, default='')
    message_text = models.TextField(blank=True, default='')

    # Financials
    cost = models.FloatField(default=0.0)  # INR

    # Timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    created_by = models.CharField(max_length=150, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status}) — {self.total_recipients} recipients"

    @property
    def delivered_percent(self):
        if self.total_recipients == 0:
            return 0.0
        return round((self.delivered_count / self.total_recipients) * 100, 1)

    @property
    def failed_percent(self):
        if self.total_recipients == 0:
            return 0.0
        return round((self.failed_count / self.total_recipients) * 100, 1)


class BulkCampaignLog(models.Model):
    """
    Individual per-contact dispatch log for a BulkCampaign.
    STATUS shows real delivery state returned by Meta Cloud API or Baileys.
    """
    STATUS_CHOICES = [
        ('QUEUED', 'Queued'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('FAILED', 'Failed'),
    ]

    campaign = models.ForeignKey(BulkCampaign, related_name='logs', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='QUEUED')
    error_reason = models.CharField(max_length=500, blank=True, default='')
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.phone} [{self.status}] — {self.campaign.name}"
