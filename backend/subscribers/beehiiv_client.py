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
        
        # Updated expand parameters based on Beehiiv API documentation
        params = {
            "limit": limit,
            "page": page,
            "expand[]": ["stats", "utm_data"]  # Changed from subscription_stats to stats
        }
        
        try:
            print("Making request with params:", params)
            response = requests.get(url, headers=headers, params=params)
            print(f"Full URL with params: {response.request.url}")
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                raw_data = response.json()
                if 'data' in raw_data and raw_data['data']:
                    # Log the first subscriber's data structure
                    print("First subscriber data structure:", 
                          json.dumps(raw_data['data'][0], indent=2))
                return raw_data
            else:
                print(f"Error response: {response.text}")
                raise Exception(f"API Error (Status {response.status_code})")
                
        except Exception as e:
            print(f"Request failed: {str(e)}")
            raise