from rest_framework import serializers

from .models import InsightRecommendation


class ProductPerformanceSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    category = serializers.CharField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.FloatField()
    stock_level = serializers.IntegerField()
    reorder_level = serializers.IntegerField()
    status = serializers.CharField()
    trend = serializers.CharField()


class SalesTrendSerializer(serializers.Serializer):
    date = serializers.CharField()
    sales = serializers.IntegerField()


class InsightsSerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    total_sales = serializers.IntegerField()
    average_order_value = serializers.FloatField()
    hot_products = ProductPerformanceSerializer(many=True)
    cold_products = ProductPerformanceSerializer(many=True)
    restocking_needed = ProductPerformanceSerializer(many=True)
    sales_trend = SalesTrendSerializer(many=True)
    ai_insights = serializers.CharField()


class InsightRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsightRecommendation
        fields = ('id', 'recommendation_text', 'context_snapshot', 'created_at', 'updated_at')


class InsightRecommendationCreateSerializer(serializers.Serializer):
    recommendation_text = serializers.CharField(max_length=1000)
