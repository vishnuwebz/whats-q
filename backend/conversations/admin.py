from django.contrib import admin
from .models import Conversation, Message, WhatsAppTemplate, MetaWhatsAppConfig

@admin.register(MetaWhatsAppConfig)
class MetaWhatsAppConfigAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'business_phone_display', 'connection_status', 'last_tested_at', 'updated_at')
    readonly_fields = ('last_tested_at', 'updated_at')

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('contact_name', 'phone_number', 'category', 'status', 'lead_stage', 'unread_count', 'updated_at')
    list_filter = ('status', 'category', 'lead_stage')
    search_fields = ('contact_name', 'phone_number', 'service_needed')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'status', 'timestamp', 'meta_message_id', 'created_at')
    list_filter = ('sender', 'status')
    search_fields = ('text', 'sender_name', 'meta_message_id')

@admin.register(WhatsAppTemplate)
class WhatsAppTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'meta_category', 'meta_status', 'language', 'quality_score', 'usage_count', 'updated_at')
    list_filter = ('meta_category', 'meta_status', 'quality_score', 'language')
    search_fields = ('name', 'body', 'body_text')
