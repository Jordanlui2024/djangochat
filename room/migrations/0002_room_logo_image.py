# Generated by Django 4.2 on 2024-05-25 07:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('room', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='logo_image',
            field=models.ImageField(blank=True, default='', upload_to='images/'),
        ),
    ]
