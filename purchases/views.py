from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Purchase
from .serializers import PurchaseSerializer


@api_view(['GET', 'POST'])
def purchase_list(request):
    if request.method == 'GET':
        purchases = Purchase.objects.all()
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)

    serializer = PurchaseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def purchase_detail(request, pk):
    purchase = get_object_or_404(Purchase, pk=pk)

    if request.method == 'GET':
        serializer = PurchaseSerializer(purchase)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = PurchaseSerializer(purchase, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    purchase.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
