from django.urls import path
from . import views

urlpatterns = [
    path("", views.forumPage, name="forumPage")
]
