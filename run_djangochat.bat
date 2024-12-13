@echo off
cd /d "C:\HOMEPAGE\django_chat\djangochat"
call "C:\HOMEPAGE\django_chat\venv-djangochat\Scripts\activate.bat"
gunicorn --workers 3 --bind 0.0.0.0:32668 djangochat.wsgi:application
