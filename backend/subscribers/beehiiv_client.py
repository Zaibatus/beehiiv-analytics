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
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        })
        
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

    def get_all_subscribers(self):
        """Fetch all subscribers by automatically handling pagination"""
        all_subscribers = []
        page = 1
        limit = 1000  # Maximum allowed by Beehiiv API
        
        while True:
            response = self.get_subscribers(page=page, limit=limit)
            subscribers = response.get('data', [])
            
            if not subscribers:  # No more results
                break
                
            all_subscribers.extend(subscribers)
            page += 1
            
        return all_subscribers

    def get_subscriber_metrics(self):
        subscribers = self.get_all_subscribers()  # Use get_all_subscribers instead of get_subscribers
        
        total_subscribers = len(subscribers)
        
        # Count subscribers who have clicked at least once
        subscribers_with_clicks = sum(
            1 for sub in subscribers 
            if sub.get('stats', {}).get('total_unique_clicked', 0) >= 1
        )
        
        # Calculate percentage of subscribers who clicked at least once
        percent_clicked_once = (subscribers_with_clicks / total_subscribers * 100) if total_subscribers > 0 else 0
        
        print(f"Debug: Total subscribers: {total_subscribers}")
        print(f"Debug: Subscribers who clicked at least once: {subscribers_with_clicks}")
        print(f"Debug: Percentage: {percent_clicked_once}%")
        
        return {
            'total_subscribers': total_subscribers,
            'percent_clicked_once': round(percent_clicked_once, 1),
            'subscribers': subscribers
        }