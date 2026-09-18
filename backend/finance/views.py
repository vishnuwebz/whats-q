from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import datetime
from .models import Transaction, Invoice, Expense, PaymentAccount, Quotation

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class PaymentAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAccount
        fields = '__all__'

class QuotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quotation
        fields = '__all__'

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-id')
    serializer_class = TransactionSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-id')
    serializer_class = InvoiceSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by('-id')
    serializer_class = ExpenseSerializer

class PaymentAccountViewSet(viewsets.ModelViewSet):
    queryset = PaymentAccount.objects.all().order_by('id')
    serializer_class = PaymentAccountSerializer

class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-id')
    serializer_class = QuotationSerializer

    @action(detail=True, methods=['post'], url_path='convert-to-invoice')
    def convert_to_invoice(self, request, pk=None):
        quotation = self.get_object()
        custom_inv_num = request.data.get('invoice_number')
        
        if not custom_inv_num:
            inv_count = Invoice.objects.count() + 1
            custom_inv_num = f"INV-2024-{str(187 + inv_count).zfill(4)}"

        # Create corresponding Invoice
        now_str = datetime.datetime.now().strftime('%b %d, %Y')
        due_str = (datetime.datetime.now() + datetime.timedelta(days=14)).strftime('%b %d, %Y')
        
        invoice_items = []
        for it in (quotation.items or []):
            invoice_items.append({
                'description': it.get('description', 'Service Item'),
                'qty': it.get('qty', 1),
                'unitPrice': it.get('unitPrice', quotation.amount),
                'amount': it.get('amount', quotation.amount),
            })
        if not invoice_items:
            invoice_items = [{
                'description': f"Services as per Quotation {quotation.quotation_number}",
                'qty': 1,
                'unitPrice': quotation.amount,
                'amount': quotation.amount,
            }]

        invoice = Invoice.objects.create(
            invoice_number=custom_inv_num,
            customer_name=quotation.customer_name,
            customer_email=quotation.customer_email or 'customer@gmail.com',
            customer_phone=quotation.customer_phone,
            invoice_date=now_str,
            due_date=due_str,
            amount=quotation.amount,
            status='sent',
            paid_amount=0.0,
            payment_method='UPI',
            items=invoice_items,
        )

        quotation.status = 'converted'
        quotation.converted_invoice_id = invoice.invoice_number
        quotation.save(update_fields=['status', 'converted_invoice_id'])

        return Response({
            'success': True,
            'message': f"Quotation {quotation.quotation_number} converted to Invoice {invoice.invoice_number} successfully!",
            'quotation': QuotationSerializer(quotation).data,
            'invoice': InvoiceSerializer(invoice).data,
        })

