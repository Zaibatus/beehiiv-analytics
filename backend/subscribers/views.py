from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .beehiiv_client import BeehiivClient

# Create your views here.

@api_view(['GET'])
def get_subscribers(request):
    client = BeehiivClient()
    subscribers = client.get_subscribers(limit=100)  # Adjust limit as needed
    return Response(subscribers)
