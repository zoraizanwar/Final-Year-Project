from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from products.models import Product


class Purchase(models.Model):
    """
    Purchase order model for procurement management
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='purchases'
    )
    company_name = models.CharField(max_length=255)
    quantity_purchased = models.IntegerField(
        validators=[MinValueValidator(1)]
    )
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    purchase_date = models.DateField()
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('PAID', 'Paid'),
            ('UNPAID', 'Unpaid'),
            ('PARTIAL', 'Partially Paid'),
        ],
        default='UNPAID'
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchases'
        ordering = ['-purchase_date', '-created_at']
        indexes = [
            models.Index(fields=['purchase_date']),
            models.Index(fields=['product']),
            models.Index(fields=['company_name']),
        ]

    def __str__(self):
        return f"Purchase #{self.id} - {self.product.name} - Rs.{self.total_cost}"

    def save(self, *args, **kwargs):
        """Calculate total_cost before saving"""
        if not self.total_cost:
            self.total_cost = self.quantity_purchased * self.unit_cost
        super().save(*args, **kwargs)
