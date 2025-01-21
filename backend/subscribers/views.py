from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .beehiiv_client import BeehiivClient
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import os
import traceback

@api_view(['GET'])
def get_subscribers(request):
    try:
        # Read configuration from config file
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                print("Loaded config:", {
                    'publication_id': config['publication_id'],
                    'api_key_length': len(config['api_key'])
                })
        except FileNotFoundError:
            return Response(
                {'message': 'Please configure your API credentials first'}, 
                status=400
            )
        
        # Create client with stored credentials
        client = BeehiivClient(
            api_key=config['api_key'],
            publication_id=config['publication_id']
        )
        
        print("Fetching subscribers...")
        response_data = client.get_subscribers(limit=100)
        print("API Response:", json.dumps(response_data, indent=2)[:500])  # Print first 500 chars
        
        # Format the response to match what the frontend expects
        formatted_response = {
            'data': response_data.get('data', []),
            'total': response_data.get('total', 0),
            'page': response_data.get('page', 1),
            'limit': response_data.get('limit', 100)
        }
        
        print("Formatted response:", json.dumps(formatted_response, indent=2)[:500])
        return Response(formatted_response)
        
    except Exception as e:
        print(f"Error in get_subscribers: {str(e)}")
        if hasattr(e, '__traceback__'):
            print(traceback.format_exc())
        return Response(
            {'message': f'Error fetching subscribers: {str(e)}'}, 
            status=500
        )

@csrf_exempt
@require_http_methods(["POST"])
def save_config(request):
    try:
        print("Received request body:", request.body.decode('utf-8'))
        data = json.loads(request.body)
        api_key = data.get('apiKey', '').strip()
        publication_id = data.get('publicationId', '').strip()

        if not api_key or not publication_id:
            return JsonResponse(
                {'message': 'API key and Publication ID are required'}, 
                status=400
            )

        # Test the credentials by trying to fetch subscribers
        client = BeehiivClient(api_key, publication_id)
        try:
            print("Attempting to fetch subscribers...")
            result = client.get_subscribers(page=1)
            print("Successfully fetched subscribers")
            
            # Store credentials securely
            config = {
                'api_key': api_key,
                'publication_id': publication_id
            }
            
            config_path = os.path.join(os.path.dirname(__file__), 'config.json')
            with open(config_path, 'w') as f:
                json.dump(config, f)

            return JsonResponse({'message': 'Configuration saved successfully'})

        except Exception as e:
            error_message = str(e)
            if "Publication not found" in error_message:
                return JsonResponse({'message': error_message}, status=404)
            elif "unauthorized" in error_message.lower():
                return JsonResponse({'message': 'Invalid API key'}, status=401)
            else:
                return JsonResponse({'message': error_message}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'message': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        return JsonResponse({'message': str(e)}, status=500)
