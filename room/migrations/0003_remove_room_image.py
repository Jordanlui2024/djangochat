# Generated by Django 4.2 on 2024-05-25 08:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0002_room_logo_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='image',
        ),
    ]
