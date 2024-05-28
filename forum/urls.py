from django.urls import path
from . import views

urlpatterns = [
    path("", views.forumListPage, name="forumListPage"),
    path("forumid/", views.forumPage, name="forumPage")
]
