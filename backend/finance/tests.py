from django.test import TestCase
from rest_framework.test import APIClient
from finance.models import Quotation, Invoice, Expense

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


class ExpenseTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.exp = Expense.objects.create(
            date_str='May 31, 2024',
            description='Office Rent - May 2024',
            category='Rent & Utilities',
            vendor='Calicut Cyberpark Leasing',
            amount=55000.0,
            payment_mode='Bank Transfer',
            project='Corporate HQ',
            status='paid'
        )

    def test_list_expenses(self):
        """GET /api/finance/expenses/ returns expenses list"""
        resp = self.client.get('/api/finance/expenses/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_create_expense(self):
        """POST /api/finance/expenses/ creates a new expense"""
        data = {
            'date_str': 'Jun 01, 2024',
            'description': 'Copper Coil Restock',
            'category': 'Spare Parts & Inventory',
            'vendor': 'Calicut Spares Mart',
            'amount': 38500.0,
            'payment_mode': 'UPI',
            'project': 'AC Field Operations',
            'status': 'paid'
        }
        resp = self.client.post('/api/finance/expenses/', data, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['description'], 'Copper Coil Restock')
        self.assertEqual(resp.data['amount'], 38500.0)

    def test_update_expense(self):
        """PUT /api/finance/expenses/{id}/ updates an existing expense"""
        data = {
            'date_str': 'May 31, 2024',
            'description': 'Office Rent - May 2024 (Revised)',
            'category': 'Rent & Utilities',
            'vendor': 'Calicut Cyberpark Leasing',
            'amount': 60000.0,
            'payment_mode': 'Bank Transfer',
            'project': 'Corporate HQ',
            'status': 'paid'
        }
        resp = self.client.put(f'/api/finance/expenses/{self.exp.id}/', data, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['amount'], 60000.0)
        self.assertEqual(resp.data['description'], 'Office Rent - May 2024 (Revised)')

    def test_delete_expense(self):
        """DELETE /api/finance/expenses/{id}/ removes an expense"""
        resp = self.client.delete(f'/api/finance/expenses/{self.exp.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(Expense.objects.filter(id=self.exp.id).exists())


