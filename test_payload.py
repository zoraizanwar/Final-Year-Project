import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system.settings')
django.setup()

from insights.services import get_insights_payload
import traceback

try:
    payload = get_insights_payload()
    print("Payload retrieved successfully")
    print(f"Sales data count: {len(payload['sales_data'])}")
    print(f"Product performance: {payload['product_performance']}")
    print(f"Total revenue: {payload['total_revenue']}")
    print(f"Total sales: {payload['total_sales']}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
