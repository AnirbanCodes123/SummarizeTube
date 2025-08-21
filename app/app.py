from flask import Flask, render_template, request, jsonify
import requests
from urllib.parse import urlparse

app = Flask(__name__)

API_URL = "http://localhost:8080/generate-summary"  # Update with your API URL

def is_valid_youtube_url(url):
    """Validate if the URL is a YouTube URL"""
    try:
        parsed_url = urlparse(url)
        return any([
            parsed_url.netloc == 'youtu.be',
            parsed_url.netloc in ('www.youtube.com', 'youtube.com')
        ])
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    url = request.json.get('url')
    
    if not url:
        return jsonify({
            'success': False,
            'error': 'Please provide a YouTube URL'
        }), 400
    
    if not is_valid_youtube_url(url):
        return jsonify({
            'success': False,
            'error': 'Please provide a valid YouTube URL'
        }), 400
    
    try:
        # Call the summarizer API
        response = requests.post(
            API_URL,
            json={'url': url},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({
                'success': False,
                'error': f'API Error: {response.json().get("detail", "Unknown error")}'
            }), response.status_code
            
    except requests.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Failed to connect to the summarizer API: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)