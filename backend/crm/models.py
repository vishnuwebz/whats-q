from django.db import models

class Lead(models.Model):
    STAGE_CHOICES = [
        ('new', 'New Lead'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal_sent', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    service = models.CharField(max_length=150, default='AC Repair')
    location = models.CharField(max_length=150, default='Koyilandy, Kerala')
    value = models.FloatField(default=2800.0)
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='new')
    owner = models.CharField(max_length=100, default='Ramesh Kumar')
    source = models.CharField(max_length=50, default='WhatsApp')
    created_at_str = models.CharField(max_length=100, default='May 12, 2024 10:30 AM')
    last_contact_str = models.CharField(max_length=100, default='May 12, 2024 10:30 AM')
    notes = models.TextField(blank=True, default='')
    tags = models.JSONField(default=list)
    next_follow_up_date = models.CharField(max_length=50, blank=True, null=True)
    next_follow_up_time = models.CharField(max_length=50, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - ₹{self.value} ({self.stage})"

class Deal(models.Model):
    STAGE_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('proposal_sent', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]

    deal_name = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    amount = models.FloatField(default=12000.0)
    stage = models.CharField(max_length=50, choices=STAGE_CHOICES, default='new')
    probability = models.IntegerField(default=60)
    deal_owner = models.CharField(max_length=100, default='Ramesh Kumar')
    source = models.CharField(max_length=50, default='WhatsApp')
    expected_close_date = models.CharField(max_length=50, default='May 20, 2024')
    tags = models.JSONField(default=list)
    notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.deal_name} - ₹{self.amount}"

class FollowUp(models.Model):
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
    ]
    STATUS_CHOICES = [
        ('due_today', 'Due Today'),
        ('scheduled', 'Scheduled'),
        ('overdue', 'Overdue'),
        ('completed', 'Completed'),
    ]
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    title = models.CharField(max_length=200)
    related_to = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    follow_up_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='whatsapp')
    assigned_to = models.CharField(max_length=100, default='Priya Sharma')
    due_date = models.CharField(max_length=50, default='May 12, 2024')
    due_time = models.CharField(max_length=50, default='12:00 PM')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='scheduled')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='high')
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.title} ({self.customer_name})"

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(default='Koyilandy, Kerala')
    total_spent = models.FloatField(default=0.0)
    jobs_count = models.IntegerField(default=0)
    tags = models.JSONField(default=list)
    notes = models.TextField(blank=True, default='')
    first_seen = models.CharField(max_length=100, default='May 1, 2024')

    def __str__(self):
        return f"{self.name} ({self.phone})"
