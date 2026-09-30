import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Decorative accent on cover page
            self.saveState()
            self.setFillColor(colors.HexColor("#059669"))
            self.rect(0, 782, 612, 10, fill=True, stroke=False)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(0, 0, 612, 16, fill=True, stroke=False)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#059669"))
        self.drawString(54, 752, "DIRECT GOOGLE RCS PROVIDER BLUEPRINT")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(558, 752, "QIYAM VENTURES CPaaS ARCHITECTURE")
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 744, 558, 744)

        # Footer
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 32, "Confidential • Architectural Playbook & Deployment Guide")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()


def create_rcs_blueprint_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom typography palette
    primary_color = colors.HexColor("#0F172A")    # Deep Navy
    emerald_color = colors.HexColor("#059669")    # Qiyam Emerald
    blue_accent   = colors.HexColor("#2563EB")    # Tech Blue
    text_color    = colors.HexColor("#334155")    # Charcoal Slate
    muted_color   = colors.HexColor("#64748B")    # Slate Muted
    card_bg       = colors.HexColor("#F8FAFC")    # Clean Light Background
    border_color  = colors.HexColor("#E2E8F0")    # Border Line

    # Custom paragraph styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=primary_color,
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=emerald_color,
        spaceAfter=15,
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=emerald_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_color,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=text_color,
        leftIndent=15,
        spaceAfter=4,
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#38BDF8"),
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_color,
    )

    story = []

    # =========================================================================
    # COVER / TITLE BLOCK
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("BECOMING A DIRECT GOOGLE RCS PROVIDER", title_style))
    story.append(Paragraph("The Definitive Tier-1 CPaaS Blueprint & Carrier Integration Playbook", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=emerald_color, spaceAfter=15, spaceBefore=5))

    meta_text = (
        "<b>Document Version:</b> 1.0 Enterprise Edition &nbsp;|&nbsp; "
        "<b>Target Spec:</b> GSMA Universal Profile 2.4 / Google RBM v1<br/>"
        "<b>Architected for:</b> Qiyam Ventures &amp; Enterprise Business OS &nbsp;|&nbsp; "
        "<b>Scope:</b> Zero Third-Party Dependency (Direct Google Cloud &amp; Carrier Interconnect)"
    )
    story.append(Paragraph(meta_text, ParagraphStyle('Meta', parent=body_style, fontSize=8.5, textColor=muted_color, leading=12)))
    story.append(Spacer(1, 15))

    # Executive Overview Callout Box
    summary_html = (
        "<b>Executive Mandate:</b> This engineering blueprint outlines the exact regulatory, architectural, and "
        "backend engineering roadmap to operate your own <b>Direct RCS Business Messaging (RBM) Provider</b>—the exact same "
        "model utilized by global CPaaS operators such as Twilio, Sinch, and Infobip. By integrating directly with "
        "<b>Google Jibe Cloud Hub</b>, your organization eliminates per-message resale markups, takes direct control over verified sender "
        "approvals, acquires wholesale carrier pricing, and can independently issue RCS APIs to enterprise clients."
    )
    story.append(
        Table(
            [[Paragraph(summary_html, callout_text)]],
            colWidths=[504],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ECFDF5")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#10B981")),
                ('PADDING', (0,0), (-1,-1), 10),
            ])
        )
    )
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 1: THE RCS ECOSYSTEM & ARCHITECTURE REALITY
    # =========================================================================
    story.append(Paragraph("1. The RCS Ecosystem & How Twilio Actually Operates", h1_style))
    story.append(Paragraph(
        "A common industry misconception is that companies like Twilio own telecommunication towers or physical base stations "
        "to deliver RCS. In reality, RCS is an IP-based data protocol standard defined by the <b>GSMA (Universal Profile 2.4)</b>. "
        "Google operates the dominant global infrastructure layer known as <b>Google Jibe Cloud</b>.",
        body_style
    ))
    story.append(Paragraph(
        "When an Android user opens Google Messages, their device establishes a persistent, TLS-encrypted data socket directly to "
        "Google Jibe servers connected with telecom carriers (Reliance Jio, Bharti Airtel, Vodafone Idea in India, and AT&amp;T/T-Mobile/Vodafone globally).",
        body_style
    ))

    # Architectural Comparison Table
    story.append(Paragraph("<b>Table 1.1: Direct Google RBM vs. 3rd-Party Resale Aggregators</b>", h2_style))
    table_data = [
        [
            Paragraph("Metric / Dimension", table_header_style),
            Paragraph("Using 3rd-Party (Twilio/Sinch)", table_header_style),
            Paragraph("Direct Google RBM Partner (Your Own)", table_header_style),
        ],
        [
            Paragraph("<b>Cost per Message</b>", table_cell_style),
            Paragraph("Wholesale Telco cost + ₹0.20–₹0.45 markup", table_cell_style),
            Paragraph("<b>Pure Wholesale Telco Rate (0% Markup)</b>", table_cell_style),
        ],
        [
            Paragraph("<b>Brand Verification</b>", table_cell_style),
            Paragraph("Depends on aggregator support queue (weeks)", table_cell_style),
            Paragraph("<b>Direct submission to Google Partner console</b>", table_cell_style),
        ],
        [
            Paragraph("<b>API Rate Limits</b>", table_cell_style),
            Paragraph("Capped by aggregator account tier", table_cell_style),
            Paragraph("<b>Direct Google Cloud quota (10,000+ QPS)</b>", table_cell_style),
        ],
        [
            Paragraph("<b>Data Privacy</b>", table_cell_style),
            Paragraph("Customer chats pass through 3rd-party servers", table_cell_style),
            Paragraph("<b>End-to-End TLS encrypted directly with Google</b>", table_cell_style),
        ],
        [
            Paragraph("<b>Commercial Role</b>", table_cell_style),
            Paragraph("Consumer / End-customer", table_cell_style),
            Paragraph("<b>Registered CPaaS Provider &amp; API Reseller</b>", table_cell_style),
        ],
    ]
    t1 = Table(table_data, colWidths=[120, 192, 192])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(t1)
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 2: REGULATORY, LEGAL & GOOGLE PARTNER ONBOARDING
    # =========================================================================
    story.append(Paragraph("2. Legal, Regulatory & Google Partner Prerequisites", h1_style))
    story.append(Paragraph(
        "To become recognized as an official RBM Solution Provider by Google, your business entity must complete three specific registrations:",
        body_style
    ))

    story.append(Paragraph("<b>Step 2.1: Corporate D-U-N-S Number (Dun &amp; Bradstreet)</b>", h2_style))
    story.append(Paragraph(
        "Google requires a valid 9-digit D-U-N-S number to verify legal entity ownership. "
        "If your company (Pvt Ltd, LLC, Inc.) does not already possess one, apply through the official Dun &amp; Bradstreet portal (free of cost, takes 3–5 business days). "
        "Ensure your corporate legal name, address, and domain match your business filing precisely.",
        body_style
    ))

    story.append(Paragraph("<b>Step 2.2: Google Business Communications Console Enrollment</b>", h2_style))
    story.append(Paragraph(
        "1. Log into the <b>Google Business Communications Console</b> (<i>business-communications.cloud.google.com</i>).<br/>"
        "2. Select <b>'Create Partner Account'</b> and choose the role: <b>'RCS Business Messaging Solution Provider'</b>.<br/>"
        "3. Provide corporate contact details, registered domain email, business registration documents, and D-U-N-S number.<br/>"
        "4. Sign the standard Google RBM Master Services Agreement (MSA). Google's carrier compliance team completes verification within 5–7 business days.",
        body_style
    ))

    story.append(Paragraph("<b>Step 2.3: Telecom Regulatory &amp; DLT Compliance (India &amp; Global)</b>", h2_style))
    story.append(Paragraph(
        "• <b>India (TRAI / DLT Regulations):</b> Register your enterprise on the DLT Portals (Jio DLT, Airtel DLT, Vilpower) as an "
        "Enterprise / Telemarketer. Register your Principal Entity (PE ID) and Sender Headers. RCS operates under carrier DLT governance.<br/>"
        "• <b>International (US / EU):</b> Comply with CTIA opt-out requirements and GDPR user consent mandates. "
        "Every promotional rich message must provide a 1-tap compliance opt-out mechanism (which our visual builder automatically includes as the floating Unsubscribe pill).",
        body_style
    ))
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 3: GOOGLE CLOUD PLATFORM DIRECT INTEGRATION
    # =========================================================================
    story.append(Paragraph("3. Direct Google Cloud Platform (GCP) Architecture", h1_style))
    story.append(Paragraph(
        "Once your Google Partner Account is verified, you interact directly with Google Cloud APIs with zero intermediate libraries.",
        body_style
    ))

    story.append(Paragraph("<b>3.1: Enable the Android RBM API &amp; Service Account</b>", h2_style))
    story.append(Paragraph(
        "1. In your Google Cloud Console, enable the <b>Android RCS Business Messaging API</b> (<code>rcsbusinessmessaging.googleapis.com</code>).<br/>"
        "2. Navigate to <b>IAM &amp; Admin &gt; Service Accounts</b> and create a service account named <code>rbm-gateway-sa</code>.<br/>"
        "3. Assign the role: <b>RBM Partner Admin</b>.<br/>"
        "4. Generate and download the JSON Private Key (<code>credentials.json</code>).",
        body_style
    ))

    story.append(Paragraph("<b>3.2: Native Google OAuth 2.0 JWT Token Generation</b>", h2_style))
    story.append(Paragraph(
        "Every request to Google's RBM API requires an OAuth 2.0 Bearer Token with the scope <code>https://www.googleapis.com/auth/rcsbusinessmessaging</code>. "
        "Here is the standard, zero-dependency token generator for your Django/Python backend:",
        body_style
    ))

    code_snippet_auth = (
        "# Native Python Google OAuth 2.0 Bearer Token Engine\n"
        "from google.oauth2 import service_account\n"
        "from google.auth.transport.requests import Request\n\n"
        "SCOPES = ['https://www.googleapis.com/auth/rcsbusinessmessaging']\n"
        "creds = service_account.Credentials.from_service_account_file(\n"
        "    '/var/www/whatsq/google_rbm_credentials.json',\n"
        "    scopes=SCOPES\n"
        ")\n"
        "creds.refresh(Request())\n"
        "google_access_token = creds.token  # Valid for 3,600 seconds"
    )
    story.append(
        Table(
            [[Paragraph(code_snippet_auth.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]],
            colWidths=[504],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
                ('PADDING', (0,0), (-1,-1), 8),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#334155")),
            ])
        )
    )
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>3.3: Real-Time Inbound &amp; Delivery Tracking via Google Cloud Pub/Sub</b>", h2_style))
    story.append(Paragraph(
        "Google does not dispatch webhooks to arbitrary public HTTP endpoints. Google publishes all real-time events "
        "(inbound customer text, button taps, delivered receipts, read receipts) through <b>Google Cloud Pub/Sub</b>:<br/>"
        "1. Create a Pub/Sub topic: <code>projects/YOUR_GCP_PROJECT/topics/rbm-inbound-events</code>.<br/>"
        "2. Add Google's service account (<code>rbm-pubsub-service-account@google.com</code>) as a <b>Pub/Sub Publisher</b>.<br/>"
        "3. Create a <b>Push Subscription</b> delivering to: <code>https://yourdomain.com/api/conversations/rcs/webhook/</code>.",
        body_style
    ))
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 4: CORE API ENDPOINTS & WIRE SPECIFICATIONS
    # =========================================================================
    story.append(Paragraph("4. Gateway Engine Implementation: The 4 Core Endpoints", h1_style))
    story.append(Paragraph(
        "To function as an independent CPaaS like Twilio, your backend gateway must execute four core primitives:",
        body_style
    ))

    story.append(Paragraph("<b>Endpoint 1: Real-Time RCS Capability Check</b>", h2_style))
    story.append(Paragraph(
        "Before sending rich media, query Google Jibe to verify whether the recipient's phone number and SIM currently support RCS Universal Profile 2.4. "
        "If RCS is disabled, your engine immediately falls back to SMS.",
        body_style
    ))
    cap_request = (
        "POST https://rcsbusinessmessaging.googleapis.com/v1/phones/+919447122334/capability\n"
        "Authorization: Bearer <GOOGLE_OAUTH_TOKEN>\n"
        "Content-Type: application/json\n\n"
        '{\n  "requestId": "cap-check-99214"\n}'
    )
    story.append(
        Table(
            [[Paragraph(cap_request.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]],
            colWidths=[504],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
                ('PADDING', (0,0), (-1,-1), 8),
            ])
        )
    )
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Endpoint 2: Standalone Rich Card &amp; Universal Action Buttons Dispatch</b>", h2_style))
    story.append(Paragraph(
        "This dispatches the exact rich card layout showcased in your ICICI Bank &amp; Kotak811 reference messages with full-width action buttons.",
        body_style
    ))
    send_request = (
        "POST https://rcsbusinessmessaging.googleapis.com/v1/phones/+919447122334/agentMessages?agentId=qiyam-rbm-agent\n"
        "Authorization: Bearer <GOOGLE_OAUTH_TOKEN>\n"
        "Content-Type: application/json\n\n"
        '{\n'
        '  "contentMessage": {\n'
        '    "richCard": {\n'
        '      "standaloneCard": {\n'
        '        "cardOrientation": "VERTICAL",\n'
        '        "cardContent": {\n'
        '          "title": "Big plans for your business? Let our Gold Loan help! 😎",\n'
        '          "description": "🤝Funds for business? Sorted\\n🔐Gold ownership? Untouched\\n🔄Disbursal? Quick",\n'
        '          "media": {\n'
        '            "height": "MEDIUM",\n'
        '            "contentInfo": { "fileUrl": "https://storage.googleapis.com/assets/banner.jpg" }\n'
        '          },\n'
        '          "suggestions": [\n'
        '            {\n'
        '              "action": {\n'
        '                "text": "👉 Explore now!",\n'
        '                "postbackData": "ACTION_EXPLORE",\n'
        '                "openUrlAction": { "url": "https://icicibank.com/gold-loan" }\n'
        '              }\n'
        '            },\n'
        '            {\n'
        '              "action": {\n'
        '                "text": "📞 Call Branch Manager",\n'
        '                "postbackData": "ACTION_CALL",\n'
        '                "dialAction": { "phoneNumber": "+9118001080" }\n'
        '              }\n'
        '            }\n'
        '          ]\n'
        '        }\n'
        '      }\n'
        '    }\n'
        '  }\n'
        '}'
    )
    story.append(
        Table(
            [[Paragraph(send_request.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)]],
            colWidths=[504],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
                ('PADDING', (0,0), (-1,-1), 8),
            ])
        )
    )
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>The 7 Supported GSMA Action Button Types (Covered in Full)</b>", h2_style))
    story.append(Paragraph("1. <code>openUrlAction</code>: Opens website or app deep link (Globe icon 🌐).", bullet_style))
    story.append(Paragraph("2. <code>dialAction</code>: Launches native dialer with pre-populated phone number (Phone icon 📞).", bullet_style))
    story.append(Paragraph("3. <code>clipboardAction</code>: 1-tap copies discount coupon code, OTP, or account number to device clipboard (Copy icon 📋).", bullet_style))
    story.append(Paragraph("4. <code>viewLocationAction</code>: Displays exact GPS coordinates or address pin in Google Maps (MapPin icon 📍).", bullet_style))
    story.append(Paragraph("5. <code>createCalendarEventAction</code>: Prompts user to save appointment or webinar to Google Calendar (Calendar icon 📅).", bullet_style))
    story.append(Paragraph("6. <code>reply</code>: Quick reply chip that returns payload to chatbot without typing.", bullet_style))
    story.append(Paragraph("7. <code>unsubscribe</code>: Mandatory compliance opt-out pill preventing spam penalties.", bullet_style))
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 5: COMMERCIAL MODEL & PRICING ECONOMICS
    # =========================================================================
    story.append(Paragraph("5. Wholesale Carrier Pricing & CPaaS Profit Margins", h1_style))
    story.append(Paragraph(
        "By connecting directly to Google RBM as a Tier-1 Solution Provider, you eliminate third-party markup. "
        "Google RBM bills based on three standardized conversation tiers:",
        body_style
    ))

    pricing_data = [
        [
            Paragraph("Billing Tier", table_header_style),
            Paragraph("Definition & Characteristics", table_header_style),
            Paragraph("Wholesale Cost (Approx)", table_header_style),
            Paragraph("Your Resale Price (CPaaS)", table_header_style),
        ],
        [
            Paragraph("<b>Basic Message</b>", table_cell_style),
            Paragraph("Plain text messages up to 160 characters", table_cell_style),
            Paragraph("₹0.12 – ₹0.15", table_cell_style),
            Paragraph("₹0.22 – ₹0.28 (<b>~80% margin</b>)", table_cell_style),
        ],
        [
            Paragraph("<b>Single Rich Card</b>", table_cell_style),
            Paragraph("High-res banner, formatted copy, action buttons", table_cell_style),
            Paragraph("₹0.28 – ₹0.35", table_cell_style),
            Paragraph("₹0.60 – ₹0.75 (<b>~110% margin</b>)", table_cell_style),
        ],
        [
            Paragraph("<b>24-Hour Session</b>", table_cell_style),
            Paragraph("Unlimited 2-way messages within 24h of customer reply", table_cell_style),
            Paragraph("₹0.45 – ₹0.55", table_cell_style),
            Paragraph("₹0.95 – ₹1.25 (<b>~120% margin</b>)", table_cell_style),
        ],
    ]
    t2 = Table(pricing_data, colWidths=[100, 184, 110, 110])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(t2)
    story.append(Spacer(1, 15))

    # =========================================================================
    # CHAPTER 6: 6-WEEK MASTER IMPLEMENTATION TIMELINE
    # =========================================================================
    story.append(Paragraph("6. Six-Week Master Implementation Roadmap", h1_style))
    story.append(Paragraph(
        "Follow this sequential step-by-step roadmap to achieve full production deployment:",
        body_style
    ))

    roadmap_data = [
        [
            Paragraph("Timeline", table_header_style),
            Paragraph("Core Objectives", table_header_style),
            Paragraph("Deliverables & Key Milestones", table_header_style),
        ],
        [
            Paragraph("<b>Week 1</b>", table_cell_style),
            Paragraph("Corporate & Legal Setup", table_cell_style),
            Paragraph("Obtain D-U-N-S Number; Register on Telecom DLT Portals (Jio/Airtel); Submit Google Business Communications Partner application.", table_cell_style),
        ],
        [
            Paragraph("<b>Week 2</b>", table_cell_style),
            Paragraph("GCP & API Provisioning", table_cell_style),
            Paragraph("Create Google Cloud Project; Enable Android RBM API; Generate Service Account credentials; Configure Cloud Pub/Sub topic and push subscription.", table_cell_style),
        ],
        [
            Paragraph("<b>Week 3</b>", table_cell_style),
            Paragraph("Backend Gateway Build", table_cell_style),
            Paragraph("Implement JWT OAuth 2.0 generator; Wire capability check engine; Connect Pub/Sub push receiver in Qiyam OS Django backend.", table_cell_style),
        ],
        [
            Paragraph("<b>Week 4</b>", table_cell_style),
            Paragraph("Studio & Card Engine", table_cell_style),
            Paragraph("Validate Standalone Rich Card and Carousel serializers; Verify all 7 action button types; Connect automatic carrier SMS fallback engine.", table_cell_style),
        ],
        [
            Paragraph("<b>Week 5</b>", table_cell_style),
            Paragraph("Carrier Verification", table_cell_style),
            Paragraph("Submit Qiyam Agent to Google & Carrier Review; Obtain Verified Checkmark Crest; Perform end-to-end device testing across Jio & Airtel SIMs.", table_cell_style),
        ],
        [
            Paragraph("<b>Week 6</b>", table_cell_style),
            Paragraph("Production Go-Live", table_cell_style),
            Paragraph("Switch Qiyam OS Gateway setting to Direct Google RBM Mode; Launch commercial client onboarding and wholesale API key provisioning.", table_cell_style),
        ],
    ]
    t3 = Table(roadmap_data, colWidths=[65, 140, 299])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), emerald_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
    ]))
    story.append(t3)
    story.append(Spacer(1, 15))

    # Concluding Callout
    conclusion_html = (
        "<b>Conclusion &amp; Readiness:</b> Your Qiyam Business OS codebase is already equipped with the Universal Profile 2.4 data types, "
        "the interactive Visual Studio, realistic light/dark Android simulator, and the multi-tenant database models. "
        "By following this guide to obtain your direct Google Partner credentials, your platform transitions into an independent, "
        "tier-1 CPaaS powerhouse."
    )
    story.append(
        Table(
            [[Paragraph(conclusion_html, callout_text)]],
            colWidths=[504],
            style=TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                ('PADDING', (0,0), (-1,-1), 10),
            ])
        )
    )

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_filename}")


if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "GOOGLE_RCS_PROVIDER_BLUEPRINT.pdf")
    create_rcs_blueprint_pdf(out_path)
