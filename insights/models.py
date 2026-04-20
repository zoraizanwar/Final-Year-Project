from django.db import models
from django.contrib.auth.models import User


class InsightCache(models.Model):
    """Cache AI insights to avoid excessive API calls"""
    INSIGHT_TYPES = [
        ('general', 'General Insights'),
        ('products', 'Product Insights'),
        ('sales', 'Sales Insights'),
    ]
    
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES)
    data = models.JSONField()
    ai_analysis = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['insight_type', '-updated_at']),
        ]

    def __str__(self):
        return f"{self.get_insight_type_display()} - {self.created_at}"


class InsightRecommendation(models.Model):
    """User-saved recommendation from AI insights widget."""

    recommendation_text = models.TextField()
    context_snapshot = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Recommendation #{self.id}"
