# Generated by Django 4.2 on 2024-12-11 01:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('course', '0004_coursemodel_description_coursemodel_file_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coursemodel',
            name='file',
            field=models.FileField(blank=True, default='', upload_to='images/'),
        ),
    ]