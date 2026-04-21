"""
Purchases App - URL Configuration
==================================

Purchase order and vendor management endpoints
"""

from django.urls import path
from . import views

app_name = 'purchases'

urlpatterns = [
    # ==================== Purchase CRUD ====================
    path('', views.purchase_list, name='purchase-list'),
    path('<int:pk>/', views.purchase_detail, name='purchase-detail'),
]

"""
API ENDPOINTS:
==============

Purchase Management:
- GET    /api/purchases/          # List all purchases
- POST   /api/purchases/          # Create new purchase
- GET    /api/purchases/<id>/     # Get specific purchase
- PUT    /api/purchases/<id>/     # Update purchase
- DELETE /api/purchases/<id>/     # Delete purchase

Integration with main urls.py:

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/purchases/', include('purchases.urls', namespace='purchases')),
]
"""
