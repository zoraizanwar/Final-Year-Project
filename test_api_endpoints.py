import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system.settings')
django.setup()

from django.test import Client

client = Client()

print("=" * 70)
print("TESTING API ENDPOINTS:")
print("=" * 70)

endpoints = [
    ('/api/insights/', 'Main Insights'),
    ('/api/insights/live/', 'Live Insights'),
    ('/api/insights/pricing/', 'Pricing Optimization'),
    ('/api/insights/demand-alerts/', 'Demand Alerts'),
    ('/api/insights/stock-warnings/', 'Stock Warnings'),
]

for endpoint, name in endpoints:
    print(f"\n{name} ({endpoint}):")
    try:
        response = client.get(endpoint)
        if response.status_code == 200:
            data = response.json()
            if 'data' in data:
                if isinstance(data['data'], dict):
                    count = len(data['data'])
                    print(f"  ✓ Status: 200 OK - Data retrieved ({count} items)")
                elif isinstance(data['data'], list):
                    print(f"  ✓ Status: 200 OK - {len(data['data'])} items found")
                else:
                    print(f"  ✓ Status: 200 OK - Data: {type(data['data'])}")
                    
                # Show sample data
                if isinstance(data['data'], list) and data['data']:
                    print(f"    Sample: {data['data'][0]}")
            else:
                print(f"  ✓ Status: 200 OK")
        else:
            print(f"  ✗ Status: {response.status_code}")
            print(f"    Response: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"  ✗ Error: {e}")

print("\n" + "=" * 70)
