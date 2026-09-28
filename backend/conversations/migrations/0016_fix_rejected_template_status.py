from django.db import migrations

def fix_rejected_templates(apps, schema_editor):
    WhatsAppTemplate = apps.get_model('conversations', 'WhatsAppTemplate')
    WhatsAppTemplate.objects.filter(meta_status='REJECTED').update(status='Rejected')

class Migration(migrations.Migration):

    dependencies = [
        ('conversations', '0015_suppressionrecord'),
    ]

    operations = [
        migrations.RunPython(fix_rejected_templates, migrations.RunPython.noop),
    ]
