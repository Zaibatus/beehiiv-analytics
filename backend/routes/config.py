from flask import Blueprint, request, jsonify
from subscribers.beehiiv_client import BeehiivClient
import os
import json

config_bp = Blueprint('config', __name__)

@config_bp.route('/api/config', methods=['POST'])
def save_config():
    try:
        data = request.get_json()
        api_key = data.get('apiKey')
        publication_id = data.get('publicationId')

        if not api_key or not publication_id:
            return jsonify({'message': 'API key and Publication ID are required'}), 400

        # Test the credentials by trying to fetch subscribers
        client = BeehiivClient(api_key, publication_id)
        try:
            # Test connection by fetching first page
            client.get_subscribers(page=1)
        except Exception as e:
            return jsonify({'message': 'Invalid credentials'}), 401

        # Store credentials securely
        config = {
            'api_key': api_key,
            'publication_id': publication_id
        }
        
        # Save to a config file (you might want to encrypt these values in production)
        config_path = os.path.join(os.path.dirname(__file__), '..', 'config.json')
        with open(config_path, 'w') as f:
            json.dump(config, f)

        return jsonify({'message': 'Configuration saved successfully'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500 