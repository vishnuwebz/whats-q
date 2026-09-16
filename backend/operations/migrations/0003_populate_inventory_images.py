from django.db import migrations

SAMPLE_IMAGES = {
    'GROC-001': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    'GROC-002': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    'DAIRY-001': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    'HPC-001': 'https://images.unsplash.com/photo-1559591937-e10b14421b59?w=400&auto=format&fit=crop&q=80',
}

def populate_images(apps, schema_editor):
    InventoryItem = apps.get_model('operations', 'InventoryItem')
    for item in InventoryItem.objects.all():
        if not item.image_url:
            sku = (item.sku or '').upper()
            name = (item.name or '').lower()
            cat = (item.category or '').lower()
            if sku in SAMPLE_IMAGES:
                item.image_url = SAMPLE_IMAGES[sku]
                item.save(update_fields=['image_url'])
            elif 'rice' in name or 'basmati' in name:
                item.image_url = SAMPLE_IMAGES['GROC-001']
                item.save(update_fields=['image_url'])
            elif 'oil' in name or 'sunflower' in name:
                item.image_url = SAMPLE_IMAGES['GROC-002']
                item.save(update_fields=['image_url'])
            elif 'milk' in name or 'dairy' in name:
                item.image_url = SAMPLE_IMAGES['DAIRY-001']
                item.save(update_fields=['image_url'])
            elif 'colgate' in name or 'toothpaste' in name:
                item.image_url = SAMPLE_IMAGES['HPC-001']
                item.save(update_fields=['image_url'])
            elif 'instrument' in name or 'tool' in name or 'box' in name or 'hardware' in cat:
                item.image_url = 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80'
                item.save(update_fields=['image_url'])
            elif 'grocery' in cat:
                item.image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
                item.save(update_fields=['image_url'])

def reverse_populate(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('operations', '0002_inventoryitem_image_url'),
    ]

    operations = [
        migrations.RunPython(populate_images, reverse_populate),
    ]
