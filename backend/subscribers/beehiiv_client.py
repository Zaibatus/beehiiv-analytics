import os
import requests
from dotenv import load_dotenv

load_dotenv()

class BeehiivClient:
    BASE_URL = "https://api.beehiiv.com/v2"
    
    def __init__(self):
        self.api_key = "fEAdbr042k0ysylUNIzXAE0b0zLXLFFpaLGGURgVMGSrgbmYKRYoaJs8NbdpaPGg"
        self.publication_id = "pub_95898ac0-69d8-467f-a595-00816f36cefa"
        if not self.api_key:
            raise ValueError("BEEHIIV_API_KEY not found in environment variables")
        if not self.publication_id:
            raise ValueError("BEEHIIV_PUBLICATION_ID not found in environment variables")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def get_subscribers(self, limit=100, page=1):
        """Fetch subscribers from Beehiiv API"""
        endpoint = f"{self.BASE_URL}/publications/{self.publication_id}/subscriptions"
        params = {
            "limit": limit,
            "page": page,
            "expand[]": ["stats", "custom_fields", "referrals"]
        }
        
        print(f"Making request to: {endpoint}")
        print(f"Headers: {self.headers}")
        print(f"Params: {params}")
        response = requests.get(endpoint, headers=self.headers, params=params)
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        response.raise_for_status()
        return response.json()