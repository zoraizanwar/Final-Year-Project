import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system.settings')
django.setup()

from insights.services import get_sales_data
from sales.models import Sale
from django.utils import timezone
from datetime import timedelta

# Direct query
thirty_days_ago = timezone.now() - timedelta(days=30)
print(f"Query date (30 days ago): {thirty_days_ago}")
print(f"Today: {timezone.now()}")

direct_query = Sale.objects.filter(sale_date__gte=thirty_days_ago).values(
    'product', 'quantity_sold', 'total_price', 'unit_price', 'sale_date'
)
print(f"Direct query result: {direct_query.count()}")

# Via function
sales_data = get_sales_data()
print(f"get_sales_data() result: {len(sales_data)}")

if sales_data:
    print("First 3 records:")
    for s in sales_data[:3]:
        print(f"  {s}")
else:
    print("No sales data returned!")
    
# Check raw database
raw_sales = Sale.objects.all()
print(f"\nTotal sales in DB: {raw_sales.count()}")

# Check dates
if raw_sales.exists():
    first = raw_sales.order_by('sale_date').first()
    last = raw_sales.order_by('-sale_date').first()
    print(f"First sale: {first.sale_date}")
    print(f"Last sale: {last.sale_date}")
