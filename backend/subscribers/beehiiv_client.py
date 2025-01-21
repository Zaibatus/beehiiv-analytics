import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

class BeehiivClient:
    def __init__(self, api_key, publication_id):
        self.api_key = api_key
        self.publication_id = publication_id
        self.base_url = "https://api.beehiiv.com/v2"
        
    def get_subscribers(self, page=1, limit=100):
        url = f"{self.base_url}/publications/{self.publication_id}/subscriptions"
        
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        params = {
            "limit": limit,
            "page": page,
            "expand[]": ["stats", "custom_fields", "referrals"]
        }
        
        try:
            print(f"Making request to: {url}")
            print(f"Headers: {headers}")
            print(f"Params: {params}")
            
            response = requests.get(url, headers=headers, params=params)
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text[:500]}")
            
            if response.status_code == 200:
                raw_data = response.json()
                print("Raw data from API:", json.dumps(raw_data, indent=2)[:500])
                
                subscribers_data = []
                for subscription in raw_data.get('data', []):
                    email_stats = subscription.get('email_stats', {})
                    print("Email stats:", email_stats)
                    
                    subscriber = {
                        'id': subscription.get('id'),
                        'email': subscription.get('email'),
                        'stats': {
                            'total_received': email_stats.get('total_emails_received', 0),
                            'open_rate': email_stats.get('open_rate', 0),
                            'click_rate': email_stats.get('click_rate', 0),
                            'total_clicked': email_stats.get('total_clicks', 0),
                            'total_unique_clicked': email_stats.get('unique_clicks', 0)
                        }
                    }
                    subscribers_data.append(subscriber)
                
                return {
                    'data': subscribers_data,
                    'total': raw_data.get('total', 0),
                    'page': raw_data.get('page', page),
                    'limit': raw_data.get('limit', limit)
                }
            
            # Handle error cases
            error_message = "Unknown error"
            try:
                error_data = response.json()
                error_message = error_data.get('message', str(error_data))
            except:
                error_message = response.text or "No error message provided"
            
            if response.status_code == 404:
                raise Exception("Publication not found. Please verify your publication ID.")
            elif response.status_code == 401:
                raise Exception("Invalid API key or unauthorized access.")
            else:
                raise Exception(f"API Error (Status {response.status_code}): {error_message}")
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            raise Exception(f"Failed to connect to Beehiiv API: {str(e)}")
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {str(e)}")
            print(f"Raw response: {response.text}")
            raise Exception("Invalid response from Beehiiv API")