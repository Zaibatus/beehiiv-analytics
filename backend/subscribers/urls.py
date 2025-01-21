from django.urls import path
from . import views

urlpatterns = [
    path('api/subscribers/', views.get_subscribers, name='get_subscribers'),
    path('api/config', views.save_config, name='save_config'),
]
