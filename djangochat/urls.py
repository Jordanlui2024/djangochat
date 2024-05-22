from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static

from django.conf import settings
from django.views.static import serve



urlpatterns = [
    re_path(r'^media/(?P<path>.*)$', serve,{'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve,{'document_root': settings.STATIC_ROOT}),
    path('', include('core.urls')),
    path('rooms/', include("room.urls")),
    path('contactus/', include('contactus.urls')),
    path('video/', include('video.urls')),
    path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
