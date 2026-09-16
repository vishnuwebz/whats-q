from django.db import models

class Workspace(models.Model):
    workspace_id = models.CharField(max_length=50, default='WS-10324', unique=True)
    name = models.CharField(max_length=200, default='Qiyam Business OS')
    workspace_url = models.CharField(max_length=200, default='qiyam-business-os.qiyamapp.com')
    default_language = models.CharField(max_length=50, default='English (US)')
    date_format = models.CharField(max_length=50, default='MMM DD, YYYY')
    time_zone = models.CharField(max_length=100, default='(GMT+05:30) Asia/Kolkata')
    week_starts_on = models.CharField(max_length=20, default='Monday')
    enable_ai_assistant = models.BooleanField(default=True)
    enable_desktop_notifications = models.BooleanField(default=True)
    allow_file_uploads = models.BooleanField(default=True)
    auto_save = models.BooleanField(default=True)
    show_onboarding_tips = models.BooleanField(default=True)
    compact_view = models.BooleanField(default=False)
    created_on = models.DateField(auto_now_add=True)
    created_by = models.CharField(max_length=100, default='Faris Usman')
    plan = models.CharField(max_length=50, default='Professional')
    status = models.CharField(max_length=50, default='Active')
    members_count = models.IntegerField(default=18)
    storage_used_gb = models.FloatField(default=24.6)
    storage_limit_gb = models.FloatField(default=100.0)

    def __str__(self):
        return self.name

class Branch(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    branch_type = models.CharField(max_length=50, default='Branch Office')
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Kerala')
    country = models.CharField(max_length=100, default='India')
    status = models.CharField(max_length=20, default='Active')
    automations_count = models.IntegerField(default=0)
    tasks_automated = models.IntegerField(default=0)
    last_activity = models.CharField(max_length=100, default='Just now')
    image = models.TextField(blank=True, default='')
    pincode = models.CharField(max_length=20, blank=True, default='682016')
    manager_name = models.CharField(max_length=100, blank=True, default='Rahul Mehta')
    manager_role = models.CharField(max_length=100, blank=True, default='Branch Manager')
    employees_count = models.IntegerField(default=8)
    customers_count = models.IntegerField(default=450)
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Integration(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(max_length=50, default='connected') # connected, partially_connected, not_connected
    connected_on = models.CharField(max_length=100, blank=True, null=True)
    automations_enabled = models.IntegerField(default=0)
    icon_slug = models.CharField(max_length=50, default='google')

    def __str__(self):
        return self.name
