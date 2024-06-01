from django.urls import path
from . import views

urlpatterns = [
    path("", views.forumListPage, name="forumListPage"),
    path("forumid/<int:forum_id>/", views.forumPage, name="forumPage")
]
