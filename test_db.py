#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system.settings')
django.setup()

from django.db import connection
from sales.models import Sale
from products.models import Product
from django.db.models import Sum, Count

print("=" * 60)
print("DATABASE CONNECTION TEST")
print("=" * 60)

# Get tables
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"✓ Total Tables: {len(tables)}")

sales_count = Sale.objects.count()
products_count = Product.objects.count()
print(f"✓ Sales records: {sales_count}")
print(f"✓ Products records: {products_count}")

if sales_count > 0:
    # Calculate metrics
    revenue = Sale.objects.aggregate(total=Sum('total_price'))['total'] or 0
    print(f"✓ Total Revenue: ₨{revenue:,.2f}")
    
    # Get latest sale
    latest = Sale.objects.latest('id')
    print(f"✓ Latest Sale: Product ID={latest.product_id}, Amount=₨{latest.total_price}")

if products_count > 0:
    # Check inventory
    low_stock = Product.objects.filter(stock_quantity__lt=100).count()
    print(f"✓ Low Stock Products: {low_stock}")
    print(f"✓ DB Connection: WORKING ✓")
