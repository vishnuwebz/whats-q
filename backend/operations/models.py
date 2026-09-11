from django.db import models

class Job(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('overdue', 'Overdue'),
    ]

    job_id_str = models.CharField(max_length=50, default='JOB-1024')
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    service = models.CharField(max_length=150, default='AC Installation - 1.5 Ton Inverter AC')
    date_str = models.CharField(max_length=50, default='May 12, 2024')
    time_str = models.CharField(max_length=50, default='10:30 AM')
    assigned_to = models.CharField(max_length=100, default='Amit Sharma')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='in_progress')
    priority = models.CharField(max_length=20, default='high')
    location = models.CharField(max_length=200, default='Kozhikode, Kerala')
    amount = models.FloatField(default=1200.0)
    advance_paid = models.FloatField(default=360.0)
    payment_status = models.CharField(max_length=50, default='partially_paid')
    timeline = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_id_str} - {self.service} ({self.customer_name})"

class Appointment(models.Model):
    apt_id_str = models.CharField(max_length=50, default='APT-1024')
    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=50)
    service = models.CharField(max_length=150, default='AC Installation')
    employee = models.CharField(max_length=100, default='Amit Sharma')
    date_str = models.CharField(max_length=50, default='May 12, 2024')
    time_str = models.CharField(max_length=50, default='10:30 AM')
    status = models.CharField(max_length=50, default='confirmed')
    duration = models.CharField(max_length=50, default='2h 00m')
    location = models.CharField(max_length=200, default='Kozhikode, Kerala')
    amount = models.FloatField(default=1200.0)
    advance = models.FloatField(default=360.0)
    payment_status = models.CharField(max_length=50, default='advance_paid')
    source = models.CharField(max_length=50, default='WhatsApp')
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.apt_id_str} - {self.customer_name}"

class Employee(models.Model):
    name = models.CharField(max_length=150)
    employee_id_str = models.CharField(max_length=50, default='EMP-001')
    role = models.CharField(max_length=100, default='Field Technician')
    department = models.CharField(max_length=100, default='AC Services')
    phone = models.CharField(max_length=50, default='+91 90000 11123')
    email = models.EmailField(default='amit.sharma@qiyam.com')
    status = models.CharField(max_length=50, default='on_duty')
    location = models.CharField(max_length=150, default='Kozhikode, Kerala')
    rating = models.FloatField(default=4.8)
    jobs_completed_month = models.IntegerField(default=28)
    on_time_percent = models.IntegerField(default=96)
    today_schedule = models.JSONField(default=list)

    def __str__(self):
        return f"{self.name} ({self.role})"

class ScheduleShift(models.Model):
    employee_name = models.CharField(max_length=150)
    role = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    shifts = models.JSONField(default=dict)

    def __str__(self):
        return f"Shift: {self.employee_name}"

class AttendanceRecord(models.Model):
    employee_id_str = models.CharField(max_length=50, default='EMP-001')
    employee_name = models.CharField(max_length=150)
    department = models.CharField(max_length=100)
    shift = models.CharField(max_length=100, default='9:00 AM - 6:00 PM')
    check_in = models.CharField(max_length=50, default='9:02 AM')
    check_out = models.CharField(max_length=50, blank=True, null=True)
    work_hours = models.CharField(max_length=50, default='8h 59m')
    status = models.CharField(max_length=50, default='present')
    location = models.CharField(max_length=150, default='Kozhikode, Kerala')
    device = models.CharField(max_length=100, default='Mobile App (Android)')

    def __str__(self):
        return f"{self.employee_name} ({self.status})"

class Task(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True, default='')
    related_to = models.CharField(max_length=100, default='JOB-1024')
    assignee = models.CharField(max_length=100, default='Amit Sharma')
    priority = models.CharField(max_length=20, default='high')
    status = models.CharField(max_length=50, default='in_progress')
    due_date = models.CharField(max_length=100, default='May 16, 2024 10:30 AM')
    tags = models.JSONField(default=list)
    description = models.TextField(blank=True, default='')
    checklist = models.JSONField(default=list)

    def __str__(self):
        return self.title

class Route(models.Model):
    route_id_str = models.CharField(max_length=50, default='RTE-001')
    driver_name = models.CharField(max_length=150, default='Rahul Mehta')
    phone = models.CharField(max_length=50, default='+91 98765 43210')
    vehicle = models.CharField(max_length=100, default='KL 11 AB 1234')
    status = models.CharField(max_length=50, default='in_progress')
    stops_count = models.IntegerField(default=12)
    distance_km = models.FloatField(default=65.4)
    duration = models.CharField(max_length=50, default='3h 15m')
    estimated_end = models.CharField(max_length=50, default='12:15 PM')
    fuel_cost = models.FloatField(default=1120.0)
    completed_stops = models.IntegerField(default=9)
    stops = models.JSONField(default=list)

    def __str__(self):
        return f"{self.route_id_str} ({self.driver_name})"

class InventoryItem(models.Model):
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=100, default='Grocery')
    stock_units = models.IntegerField(default=245)
    stock_value = models.FloatField(default=12250.0)
    status = models.CharField(max_length=50, default='in_stock')
    location = models.CharField(max_length=150, default='Main Warehouse Aisle 01 - Rack 02')
    reorder_level = models.IntegerField(default=50)
    reorder_qty = models.IntegerField(default=100)
    supplier = models.CharField(max_length=150, default='Fresh Supplies Pvt. Ltd.')

    def __str__(self):
        return f"{self.name} ({self.sku})"
