from django.urls import path
from . import views

urlpatterns = [
    path('', views.courseListPage, name="courseListPage"),
    path('download/<int:pk>', views.downloadFile, name='downloadPage'),
]
