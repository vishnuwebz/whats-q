from django.db import models

class KnowledgeArticle(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('draft', 'Draft'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Getting Started')
    content = models.TextField(blank=True, default='')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='published')
    last_updated = models.CharField(max_length=100, default='May 28, 2024')
    author = models.CharField(max_length=100, default='Faris Usman')
    views = models.IntegerField(default=1245)
    helpful_percent = models.IntegerField(default=96)

    def __str__(self):
        return f"{self.title} ({self.status})"

class AISettings(models.Model):
    assistant_name = models.CharField(max_length=100, default='Qiyam AI Assistant')
    default_language = models.CharField(max_length=50, default='English (US)')
    time_zone = models.CharField(max_length=100, default='(GMT+05:30) Asia/Kolkata')
    response_length = models.CharField(max_length=50, default='Balanced')
    enable_ai_assistant = models.BooleanField(default=True)
    suggest_follow_up_questions = models.BooleanField(default=True)
    use_knowledge_base_first = models.BooleanField(default=True)
    user_roles = models.CharField(max_length=100, default='All Roles (8)')
    data_access = models.CharField(max_length=100, default='Organization Data')
    conversation_visibility = models.CharField(max_length=100, default='Admins Only')

    def __str__(self):
        return self.assistant_name
