from django.contrib.auth import views as auth_views
from django.urls import path
from . import views


urlpatterns = [
    path('', views.homePage, name="homePage"),
    path('home/', views.homePage, name="homePage"),
    path("signup/", views.signupPage, name="signupPage"),
    path("login/", auth_views.LoginView.as_view(template_name="core/loginPage.html"), name="loginPage"),
    path("logout/", auth_views.LogoutView.as_view(), name="logoutPage"),
]