from django.urls import path
from . import views

urlpatterns = [
    path("forumlist/<int:page>/", views.forumListPage, name="forumListPage"),
    path("forumid/<int:forum_id>/<int:page>/", views.forumPage, name="forumPage"),
    path("article/<int:author_id>/", views.forumArticlePage , name="articlePage"),
]
