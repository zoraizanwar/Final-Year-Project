from django.urls import path
from .views import (
    get_insights,
    get_live_insights,
    get_pricing_optimization,
    get_high_demand_items,
    get_inventory_warnings,
    recommendations_list_create,
)

urlpatterns = [
    path('', get_insights, name='insights'),
    path('live/', get_live_insights, name='insights-live'),
    path('pricing/', get_pricing_optimization, name='pricing-optimization'),
    path('demand-alerts/', get_high_demand_items, name='demand-alerts'),
    path('stock-warnings/', get_inventory_warnings, name='stock-warnings'),
    path('recommendations/', recommendations_list_create, name='insights-recommendations'),
]
