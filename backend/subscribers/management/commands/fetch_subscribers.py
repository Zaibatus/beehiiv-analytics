from django.core.management.base import BaseCommand
from subscribers.beehiiv_client import BeehiivClient
import json

class Command(BaseCommand):
    help = 'Fetch subscribers from Beehiiv API'

    def handle(self, *args, **options):
        client = BeehiivClient()
        try:
            # Add debug info before making the request
            self.stdout.write(self.style.SUCCESS('Attempting to fetch subscribers...'))
            subscribers = client.get_subscribers(limit=10)  # Start with a smaller limit for testing
            
            # Print raw response first
            self.stdout.write(self.style.SUCCESS('Raw response:'))
            self.stdout.write(json.dumps(subscribers, indent=2))
            
            # Then try to process the data
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched subscribers'))
            for subscriber in subscribers.get('data', [])[:5]:
                self.stdout.write(json.dumps(subscriber, indent=2))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching subscribers: {str(e)}'))
            # Print more error details if available
            if hasattr(e, 'response'):
                self.stdout.write(self.style.ERROR(f'Response content: {e.response.content}'))