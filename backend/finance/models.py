from django.db import models

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('transfer', 'Transfer'),
        ('refund', 'Refund'),
    ]

    date_str = models.CharField(max_length=50, default='May 31, 2024')
    tx_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='income')
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='AC Services')
    party = models.CharField(max_length=150, default='Amit Sharma')
    account = models.CharField(max_length=100, default='HDFC Bank - 1234')
    amount = models.FloatField(default=12500.0)
    payment_mode = models.CharField(max_length=50, default='UPI')
    reference_id = models.CharField(max_length=100, default='INV-2024-0521')
    status = models.CharField(max_length=50, default='completed')

    def __str__(self):
        return f"{self.reference_id} - ₹{self.amount} ({self.tx_type})"

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('partial_paid', 'Partially Paid'),
        ('overdue', 'Overdue'),
        ('sent', 'Sent'),
        ('draft', 'Draft'),
        ('cancelled', 'Cancelled'),
    ]

    invoice_number = models.CharField(max_length=50, default='INV-2024-0186')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(default='acservices@gmail.com')
    customer_phone = models.CharField(max_length=50, blank=True, default='+91 98765 43210')
    invoice_date = models.CharField(max_length=50, default='May 31, 2024')
    due_date = models.CharField(max_length=50, default='Jun 14, 2024')
    amount = models.FloatField(default=12500.0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='paid')
    paid_amount = models.FloatField(default=12500.0)
    payment_method = models.CharField(max_length=50, default='UPI')
    payment_date = models.CharField(max_length=50, default='May 31, 2024')
    items = models.JSONField(default=list)

    def __str__(self):
        return f"{self.invoice_number} - {self.customer_name} (₹{self.amount})"

class Expense(models.Model):
    date_str = models.CharField(max_length=50, default='May 31, 2024')
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Rent & Utilities')
    vendor = models.CharField(max_length=150, default='Landlord')
    amount = models.FloatField(default=55000.0)
    payment_mode = models.CharField(max_length=50, default='Bank Transfer')
    project = models.CharField(max_length=100, blank=True, default='-')
    status = models.CharField(max_length=50, default='paid')

    def __str__(self):
        return f"{self.description} - ₹{self.amount}"

class PaymentAccount(models.Model):
    name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=100, blank=True, null=True)
    account_type = models.CharField(max_length=50, default='Bank Account')
    provider = models.CharField(max_length=100, default='HDFC Bank')
    current_balance = models.FloatField(default=1245600.0)
    status = models.CharField(max_length=50, default='Active')

    def __str__(self):
        return f"{self.name} - ₹{self.current_balance}"


class Quotation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('converted', 'Converted to Invoice'),
    ]

    quotation_number = models.CharField(max_length=50, default='QUO-2024-0042')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField(blank=True, default='')
    customer_phone = models.CharField(max_length=50, blank=True, default='+91 98765 43210')
    quotation_date = models.CharField(max_length=50, default='May 30, 2024')
    valid_until = models.CharField(max_length=50, default='Jun 15, 2024')
    amount = models.FloatField(default=0.0)
    subtotal = models.FloatField(default=0.0)
    tax_amount = models.FloatField(default=0.0)
    discount_amount = models.FloatField(default=0.0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    converted_invoice_id = models.CharField(max_length=50, blank=True, default='')
    terms = models.TextField(blank=True, default='Validity: 15 days. 50% advance required upon acceptance.')
    notes = models.TextField(blank=True, default='')
    items = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"{self.quotation_number} - {self.customer_name} (₹{self.amount})"

