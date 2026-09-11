from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, InvoiceViewSet, ExpenseViewSet, PaymentAccountViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'accounts', PaymentAccountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
