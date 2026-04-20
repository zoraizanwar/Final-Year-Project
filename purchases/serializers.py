from rest_framework import serializers
from .models import Purchase
from .company_mapping import company_for_category


class PurchaseSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.sku', read_only=True)
    product_category = serializers.CharField(source='product.category', read_only=True)
    current_unit_price = serializers.DecimalField(source='product.unit_price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = Purchase
        fields = (
            'id',
            'product',
            'product_name',
            'product_code',
            'product_category',
            'company_name',
            'quantity_purchased',
            'unit_cost',
            'total_cost',
            'current_unit_price',
            'purchase_date',
            'payment_status',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def _assign_company(self, validated_data, instance=None):
        product = validated_data.get('product', getattr(instance, 'product', None))
        if product:
            validated_data['company_name'] = company_for_category(product.category)
        return validated_data

    def create(self, validated_data):
        validated_data = self._assign_company(validated_data)
        if not validated_data.get('total_cost'):
            quantity = validated_data.get('quantity_purchased', 0)
            unit_cost = validated_data.get('unit_cost', 0)
            validated_data['total_cost'] = quantity * unit_cost
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._assign_company(validated_data, instance=instance)
        if 'total_cost' not in validated_data:
            quantity = validated_data.get('quantity_purchased', instance.quantity_purchased)
            unit_cost = validated_data.get('unit_cost', instance.unit_cost)
            validated_data['total_cost'] = quantity * unit_cost
        return super().update(instance, validated_data)
