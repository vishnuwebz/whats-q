from django.db import models

class ChannelMetric(models.Model):
    channel_name = models.CharField(max_length=50)
    total_conversations = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    color = models.CharField(max_length=20, default='#3B82F6')

    def __str__(self):
        return f"{self.channel_name}: {self.total_conversations}"

class IntentMetric(models.Model):
    intent_name = models.CharField(max_length=100)
    count = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.intent_name}: {self.count}"

class DailyMetric(models.Model):
    date_str = models.CharField(max_length=50)
    conversations_count = models.IntegerField(default=0)
    response_time_sec = models.FloatField(default=2.6)
    resolution_rate_percent = models.FloatField(default=92.6)

    def __str__(self):
        return f"{self.date_str} - {self.conversations_count} convs"
