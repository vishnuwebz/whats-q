from django.db import models

class Workflow(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='CRM')
    business_function = models.CharField(max_length=100, default='Sales')
    trigger_type = models.CharField(max_length=100, default='New WhatsApp Message')
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    runs_this_month = models.IntegerField(default=156)
    success_rate = models.FloatField(default=98.7)
    last_modified = models.CharField(max_length=100, default='May 31, 2024 10:30 AM')
    nodes = models.JSONField(default=list)
    edges = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.status})"

class WorkflowTemplate(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='CRM')
    business_function = models.CharField(max_length=100, default='Sales')
    description = models.TextField()
    template_type = models.CharField(max_length=50, default='Official')
    used_count = models.IntegerField(default=24)

    def __str__(self):
        return self.name

class AutomationLog(models.Model):
    time_str = models.CharField(max_length=100, default='May 31, 2024 10:30:45 AM')
    workflow_action = models.CharField(max_length=150, default='Invoice Generation')
    branch = models.CharField(max_length=100, default='Kochi Branch')
    status = models.CharField(max_length=50, default='success')
    log_level = models.CharField(max_length=50, default='Info')
    message = models.TextField(default='Invoice INV-2024-1056 generated successfully.')
    triggered_by = models.CharField(max_length=50, default='System')
    duration = models.CharField(max_length=50, default='1.23s')

    def __str__(self):
        return f"[{self.status}] {self.workflow_action} - {self.time_str}"

class Approval(models.Model):
    request_id_str = models.CharField(max_length=50, default='APR-1024')
    title = models.CharField(max_length=200)
    approval_type = models.CharField(max_length=50, default='Purchase')
    department = models.CharField(max_length=100, default='Operations')
    requested_by = models.CharField(max_length=100, default='Aneesh K')
    submitted_on = models.CharField(max_length=100, default='May 31, 2024 10:24 AM')
    status = models.CharField(max_length=50, default='Pending')
    amount = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.request_id_str}: {self.title} ({self.status})"
