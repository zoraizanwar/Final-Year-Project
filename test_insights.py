import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system.settings')
django.setup()

from insights.services import (
    get_pricing_suggestions,
    get_demand_alerts,
    get_stock_warnings,
    get_insights_payload,
)

print("=" * 60)
print("PRICING SUGGESTIONS:")
print("=" * 60)
pricing = get_pricing_suggestions()
print(f"Total suggestions: {len(pricing)}")
for p in pricing[:3]:
    print(f"- {p['product_name']}: {p['sales_in_30_days']} sales, "
          f"Current: ₨{p['current_price']}, Suggested: ₨{p['suggested_price']}")

print("\n" + "=" * 60)
print("DEMAND ALERTS:")
print("=" * 60)
demand = get_demand_alerts()
print(f"Total alerts: {len(demand)}")
for d in demand[:3]:
    print(f"- {d['product_name']}: {d['sales_30d']} sales (30d), "
          f"{d['sales_7d']} sales (7d)")

print("\n" + "=" * 60)
print("STOCK WARNINGS:")
print("=" * 60)
warnings = get_stock_warnings()
print(f"Total warnings: {len(warnings)}")
for w in warnings[:3]:
    print(f"- {w['product_name']}: {w['current_stock']} units "
          f"(Reorder: {w['reorder_level']}) - {w['urgency']}")

print("\n" + "=" * 60)
print("GENERAL INSIGHTS:")
print("=" * 60)
payload = get_insights_payload()
print(f"Total Revenue (30d): ₨{payload['total_revenue']:,.2f}")
print(f"Total Sales (30d): {payload['total_sales']}")
print(f"Average Order Value: ₨{payload['average_order_value']:,.2f}")
print(f"Hot Products: {len(payload['hot_products'])}")
print(f"Cold Products: {len(payload['cold_products'])}")
print(f"Restocking Needed: {len(payload['restocking_needed'])}")
