# Complete Meta WhatsApp Cloud API Configuration & Integration Guide

This guide provides complete, step-by-step instructions for setting up and configuring the **Official Meta WhatsApp Cloud API** with **Qiyam Business OS**.

---

## 1. Architecture Overview

```
 ┌───────────────────────────────────────┐
 │       Meta WhatsApp Cloud API         │
 │     (https://graph.facebook.com)      │
 └───────────────────▲───────────────────┘
                     │ (Graph API v21.0)
         Webhook     │ Inbound / Outbound
         Events      │ Messages & Templates
                     │
 ┌───────────────────▼───────────────────┐
 │       Qiyam Django Backend API        │
 │  • /api/conversations/webhook/        │
 │  • /api/conversations/templates/      │
 │  • /api/conversations/meta-config/    │
 └───────────────────▲───────────────────┘
                     │
 ┌───────────────────▼───────────────────┐
 │     Qiyam Frontend Business OS        │
 │  • Meta Template Creator Modal        │
 │  • Multi-Agent Shared WhatsApp Inbox  │
 │  • Live Meta Connection Tester        │
 └───────────────────────────────────────┘
```

---

## 2. Prerequisites
1. A **Meta (Facebook) Account**.
2. A **Meta Business Portfolio (Business Manager)** at [business.facebook.com](https://business.facebook.com).
3. A clean phone number that is **not currently registered** on personal WhatsApp or WhatsApp Business App (or you can start with the free Meta Sandbox test number).

---

## 3. Step 1: Create Meta Developer Account & App

1. Go to the [Meta for Developers Portal](https://developers.facebook.com).
2. Click **My Apps** > **Create App**.
3. Select **Other** > click **Next**.
4. Choose **Business** as the app type > click **Next**.
5. Fill in details:
   - **App Name**: `Qiyam Business OS` (or your company name).
   - **App Contact Email**: Your work email.
   - **Business Account**: Select your Meta Business Portfolio.
6. Click **Create App**.

---

## 4. Step 2: Add WhatsApp Product to App

1. In the App Dashboard, scroll down to **WhatsApp** in the "Add products to your app" list.
2. Click **Set Up**.
3. You will be redirected to the **API Setup** page.
4. On this page, Meta automatically provisions:
   - A **Test WhatsApp Business Account**
   - A **Test Phone Number** (e.g. `+1 555 055 5555`)
   - A **Temporary Access Token** (valid for 24 hours)
   - Your **Phone Number ID** (e.g. `105439876543210`)
   - Your **WhatsApp Business Account ID (WABA ID)** (e.g. `109876543210987`)

> [!WARNING]
> **Temporary tokens expire in 24 hours.** To keep your backend running continuously in production, follow **Step 3** below to generate a **Permanent System User Access Token**.

---

## 5. Step 3: Generate Permanent System User Access Token

A Permanent System User Token never expires and is required for production server deployments.

1. Open [Meta Business Suite](https://business.facebook.com/settings).
2. Ensure your Business Portfolio is selected in the top-left dropdown.
3. In the left navigation menu, go to **Users** > **System Users**.
4. Click **Add**:
   - **System User Name**: `Qiyam-Server-Bot`
   - **System User Role**: `Admin`
   - Click **Create System User**.
5. Select the newly created system user and click **Assign Assets**:
   - Under **Apps**, select your app (`Qiyam Business OS`) and toggle **Full Control (Manage App)**.
   - Under **WhatsApp Accounts**, select your WhatsApp Business Account and toggle **Full Control (Manage WhatsApp Account)**.
   - Click **Save Changes**.
6. Now, click **Generate New Token**:
   - Select your App from the dropdown.
   - Set **Token Expiration**: **Never**.
   - In the permissions list, check:
     - `whatsapp_business_messaging` (Required: send & receive messages)
     - `whatsapp_business_management` (Required: create & manage templates)
   - Click **Generate Token**.
7. **Copy this token immediately** and store it safely. This is your **Permanent Meta Access Token**.

---

## 6. Step 4: Configure Webhooks for Real-Time Messages

Webhooks notify Qiyam Business OS instantly whenever a customer sends a message or when message delivery receipts (`delivered`, `read`) occur.

1. In your Meta Developer App dashboard, expand **WhatsApp** in the sidebar > click **Configuration**.
2. Under **Webhook**, click **Edit**:
   - **Callback URL**: `https://your-domain.com/api/conversations/webhook/`
     - *For local testing:* Run `ngrok http 8000` and use `https://<ngrok-subdomain>.ngrok-free.app/api/conversations/webhook/`
   - **Verify Token**: `qiyam_whatsapp_secret_token_2026` (or the custom string you configured in Qiyam Settings).
3. Click **Verify and Save**. Meta will send a `GET` challenge handshake. If configured correctly, Meta will show a green checkmark.
4. Under **Webhook Fields**, click **Manage**:
   - Subscribe to **`messages`** (Captures inbound customer messages, button clicks, and message delivery statuses).
   - Subscribe to **`message_template_status_update`** (Captures Meta template approval/rejection updates).
   - Click **Done**.

---

## 7. Step 5: Save Credentials in Qiyam Business OS

You can save your credentials in two ways:

### Option A: Via the In-App Settings / Template Creator (Recommended)
1. In Qiyam Business OS, open **AI Assistant** > **Templates** (or **Integrations** > **WhatsApp Cloud API**).
2. Click **Meta Setup Guide** or **Configure**.
3. In the **API Credentials** tab, enter:
   - **Phone Number ID**: Your 15-digit ID from Meta.
   - **WhatsApp Business Account ID (WABA ID)**: Your 15-digit WABA ID.
   - **Permanent Access Token**: The system user token from Step 3.
   - **Verify Token**: `qiyam_whatsapp_secret_token_2026`
4. Click **Test Meta Connection**. The system will verify your token with Meta and display your verified business name, display phone number, and quality score with green checkmarks!

### Option B: Via Direct REST API
```bash
curl -X POST http://localhost:8000/api/conversations/meta-config/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number_id": "105439876543210",
    "waba_id": "109876543210987",
    "access_token": "EAAG...",
    "verify_token": "qiyam_whatsapp_secret_token_2026",
    "business_name": "CoolFix Services",
    "business_phone_display": "+91 98765 43210"
  }'
```

---

## 8. Step 6: Add a Production Phone Number

1. In Meta Developer App > **WhatsApp** > **API Setup**, scroll to **Step 5: Add a phone number**.
2. Click **Add phone number**.
3. Fill in:
   - **Display Name**: Your official business name (e.g. `CoolFix Services`).
   - **Category**: Your industry (e.g. `Home Services`).
   - **Business Description**: Brief description.
4. Enter the phone number and verify via SMS or Voice Code.
5. Once verified, this phone number ID becomes your production sender!

---

## 9. Meta WhatsApp Template Rules & Approval Best Practices

Meta enforces strict automated AI review for all message templates. Following these rules ensures **100% instant approval**:

| Rule | Requirement | Why Meta Rejects |
|---|---|---|
| **Template Name** | Lowercase letters, numbers, underscores only (`^[a-z0-9_]+$`). | Spaces or special characters like `my-template` will error. |
| **Variables** | Must use sequential double curly braces: `{{1}}`, `{{2}}`, `{{3}}`. | Cannot start with `{{0}}`, cannot skip numbers, cannot use named variables like `{{name}}`. |
| **Sample Values** | **Mandatory.** Every variable `{{1}}`, `{{2}}` must have a realistic sample value provided. | Meta rejects any template that has variables without sample data. |
| **Header Variables** | Only single variable `{{1}}` is allowed in text headers. | Multiple variables in header are rejected. |
| **Consecutive Variables** | Must have text separating variables: e.g. `Hi {{1}}, your order {{2}}...`. | `{{1}}{{2}}` without spaces or punctuation is strictly rejected. |
| **Category Selection** | Choose `UTILITY` for order confirmations, receipts, reminders; choose `MARKETING` for discounts, promotions. | Marking promotional text as Utility will result in rejection or category reclassification. |
| **URL Format in CTA** | Must start with `https://`. In dynamic URLs, only the variable at the end is allowed: `https://site.com/track/{{1}}`. | Shorteners like bit.ly or invalid protocols are rejected. |

---

## 10. API Verification & Testing via cURL

### 1. Test Inbound Webhook Verification (GET Handshake)
```bash
curl -X GET "http://localhost:8000/api/conversations/webhook/?hub.mode=subscribe&hub.verify_token=qiyam_whatsapp_secret_token_2026&hub.challenge=11223344"
# Response: 11223344
```

### 2. Send Freeform Message to Customer
```bash
curl -X POST "http://localhost:8000/api/conversations/threads/1/send_message/" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Your technician Ramesh Kumar has departed for your location.",
    "sender": "agent",
    "sender_name": "Rahul Mehta"
  }'
```

### 3. Submit Template to Meta Graph API
```bash
curl -X POST "http://localhost:8000/api/conversations/templates/1/submit_to_meta/" \
  -H "Content-Type: application/json"
```

### 4. Test Send Template to WhatsApp Number
```bash
curl -X POST "http://localhost:8000/api/conversations/templates/1/test_send/" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919876543210",
    "variables": {
      "1": "Vikram Mehta",
      "2": "AC Deep Cleaning",
      "3": "May 13, 2024",
      "4": "10:30 AM",
      "5": "Ramesh Kumar",
      "6": "₹2,800"
    }
  }'
```

---

## 11. Troubleshooting Common Meta Error Codes

- **Error `190` - Invalid OAuth Access Token**: Token expired or revoked. Follow Step 3 to generate a Permanent System User Token with `Never` expiring duration.
- **Error `100` - Invalid Parameter**: Often caused by template names with uppercase letters/spaces, or missing variable samples.
- **Error `131030` - Recipient phone number not in allowed list**: Occurs only when using Meta's Sandbox Test number. You must add the recipient's number in Meta Developer App > WhatsApp > API Setup > **To** dropdown. (Production numbers do not have this restriction).
- **Error `132000` - Template does not exist in language**: The language code specified (e.g. `en_US`) does not match the language in which the template was created.
