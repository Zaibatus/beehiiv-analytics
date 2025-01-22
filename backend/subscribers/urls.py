from django.urls import path
from . import views

urlpatterns = [
    path('api/cors-check/', views.cors_check, name='cors-check'),
    path('api/config', views.save_config, name='save_config'),
    path('api/subscribers/', views.get_subscribers, name='get_subscribers'),
]
