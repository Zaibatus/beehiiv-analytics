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
from datetime import datetime
import pytz
from django.conf import settings

@api_view(['GET'])
def get_subscribers(request):
    try:
        # Read configuration
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                print("=== Configuration ===")
                print(f"Publication ID: {config['publication_id']}")
                print(f"API Key length: {len(config['api_key'])}")
        except FileNotFoundError:
            return Response(
                {'message': 'API configuration not found'}, 
                status=400
            )
        except json.JSONDecodeError:
            return Response(
                {'message': 'Invalid configuration file'}, 
                status=400
            )
        
        # Validate configuration
        if not config.get('api_key') or not config.get('publication_id'):
            return Response(
                {'message': 'Missing API key or publication ID'}, 
                status=400
            )
        
        # Create client
        client = BeehiivClient(
            api_key=config['api_key'],
            publication_id=config['publication_id']
        )
        
        print("=== Fetching Subscribers ===")
        response_data = client.get_subscribers(limit=500)  # Increased from 100 to 1000
        
        if not response_data or 'data' not in response_data:
            print("Warning: No data in response")
            return Response(
                {'message': 'No data received from API'}, 
                status=404
            )
        
        # Format response
        formatted_response = {
            'data': response_data.get('data', []),
            'total': response_data.get('total', 0),
            'page': response_data.get('page', 1),
            'limit': response_data.get('limit', 1000)
        }
        
        print(f"Returning {len(formatted_response['data'])} subscribers")

        # Calculate days to unsubscribe
        for subscriber in formatted_response['data']:
            if subscriber.get('status') == 'inactive':
                subscriber['days_to_unsubscribe'] = calculate_days_to_unsubscribe(subscriber)

        # Get metrics
        metrics = client.get_subscriber_metrics()

        return Response({
            'total_subscribers': metrics['total_subscribers'],
            'percent_clicked_once': metrics['percent_clicked_once'],
            'subscribers': metrics['subscribers']
        })
        
    except Exception as e:
        print(f"Error in get_subscribers: {str(e)}")
        print(traceback.format_exc())  # Print full traceback
        return Response(
            {'message': f'Error fetching subscribers: {str(e)}'}, 
            status=500
        )

def calculate_days_to_unsubscribe(subscriber):
    if subscriber.get('status') != 'inactive':
        return None
    
    # Debug print entire subscriber object for inactive subscribers
    print("Inactive subscriber data:")
    print(subscriber)
    
    created_at = subscriber.get('created_at')
    updated_at = subscriber.get('updated_at')
    
    print(f"Created at: {created_at}")
    print(f"Updated at: {updated_at}")
    
    # Check if either date is missing
    if not created_at or not updated_at:
        return None
        
    try:
        # Try different date formats
        date_formats = [
            '%Y-%m-%dT%H:%M:%S.%fZ',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d %H:%M:%S'
        ]
        
        subscribe_date = None
        unsubscribe_date = None
        
        for date_format in date_formats:
            try:
                subscribe_date = datetime.strptime(created_at, date_format)
                unsubscribe_date = datetime.strptime(updated_at, date_format)
                break
            except ValueError:
                continue
                
        if not subscribe_date or not unsubscribe_date:
            return None
            
        # Convert to UTC if needed
        subscribe_date = subscribe_date.replace(tzinfo=pytz.UTC)
        unsubscribe_date = unsubscribe_date.replace(tzinfo=pytz.UTC)
        
        days_difference = (unsubscribe_date - subscribe_date).days
        return max(0, days_difference)  # Ensure we don't return negative days
        
    except Exception as e:
        print(f"Error calculating days to unsubscribe: {e}")
        return None

@csrf_exempt
@require_http_methods(["POST"])
def save_config(request):
    try:
        print("=== Starting save_config ===")
        print("Request method:", request.method)
        print("Request headers:", dict(request.headers))
        
        data = json.loads(request.body)
        print("Parsed request data:", {
            'apiKey': '***' if data.get('apiKey') else None,
            'publicationId': data.get('publicationId')
        })
        
        api_key = data.get('apiKey', '').strip()
        publication_id = data.get('publicationId', '').strip()

        if not api_key or not publication_id:
            print("Missing required fields")
            return JsonResponse(
                {'message': 'API key and Publication ID are required'}, 
                status=400
            )

        # Test the credentials
        print("Testing credentials...")
        client = BeehiivClient(api_key, publication_id)
        
        try:
            result = client.get_subscribers(page=1)
            print("Credentials test successful")
            
            # Save config
            config_path = os.path.join(os.path.dirname(__file__), 'config.json')
            with open(config_path, 'w') as f:
                json.dump({
                    'api_key': api_key,
                    'publication_id': publication_id
                }, f)
            print("Configuration saved successfully")
            
            return JsonResponse({'message': 'Configuration saved successfully'})
            
        except Exception as e:
            print(f"Error testing credentials: {str(e)}")
            return JsonResponse({'message': str(e)}, status=401)
            
    except Exception as e:
        print(f"Error in save_config: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")
        return JsonResponse({
            'message': f'Server error: {str(e)}',
            'traceback': traceback.format_exc()
        }, status=500)

@csrf_exempt
def cors_check(request):
    try:
        print("CORS check endpoint hit")  # Debug print
        return JsonResponse({
            "status": "ok",
            "message": "CORS check successful"
        })
    except Exception as e:
        print(f"Error in cors_check: {str(e)}")
        print(f"Full traceback: {traceback.format_exc()}")  # Add full traceback
        return JsonResponse({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }, status=500)
