from django.test import TestCase
from rest_framework.test import APIClient
from finance.models import Quotation, Invoice

class QuotationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.quo = Quotation.objects.create(
            quotation_number='QUO-2024-TEST1',
            customer_name='Meera Patel',
            customer_email='meera@example.com',
            customer_phone='+91 98471 22334',
            quotation_date='May 30, 2024',
            valid_until='Jun 15, 2024',
            amount=15000.0,
            status='accepted',
            items=[
                {'description': 'AC Duct Sanitization', 'qty': 1, 'unitPrice': 15000, 'amount': 15000}
            ]
        )

    def test_list_quotations(self):
        """GET /finance/quotations/ returns list of quotes"""
        resp = self.client.get('/api/finance/quotations/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_create_quotation(self):
        """POST /finance/quotations/ creates a new quote"""
        data = {
            'quotation_number': 'QUO-2024-TEST2',
            'customer_name': 'Kiran Varma',
            'customer_email': 'kiran@example.com',
            'customer_phone': '+91 98472 33445',
            'quotation_date': 'May 31, 2024',
            'valid_until': 'Jun 20, 2024',
            'amount': 8500.0,
            'status': 'sent',
            'items': [{'description': 'Compressor overhaul', 'qty': 1, 'unitPrice': 8500, 'amount': 8500}]
        }
        resp = self.client.post('/api/finance/quotations/', data, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['customer_name'], 'Kiran Varma')

    def test_convert_to_invoice(self):
        """POST /finance/quotations/{id}/convert-to-invoice/ generates invoice and updates quote status"""
        resp = self.client.post(f'/api/finance/quotations/{self.quo.id}/convert-to-invoice/', {
            'invoice_number': 'INV-2024-TEST99'
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['quotation']['status'], 'converted')
        self.assertEqual(resp.data['quotation']['converted_invoice_id'], 'INV-2024-TEST99')

        # Verify Invoice was created in DB
        inv = Invoice.objects.filter(invoice_number='INV-2024-TEST99').first()
        self.assertIsNotNone(inv)
        self.assertEqual(inv.customer_name, 'Meera Patel')
        self.assertEqual(inv.amount, 15000.0)

