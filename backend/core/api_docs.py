import json
from django.http import HttpResponse, JsonResponse

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "WhatsQ - Intelligent WhatsApp Automation & CRM API",
        "version": "1.0.0",
        "description": "Comprehensive REST API specification for WhatsQ platform by Qiyam Business Solutions. Includes WhatsApp Cloud API webhooks, templates, CRM pipeline, dispatch operations, billing, and AI Copilot workflows.",
        "contact": {
            "name": "Qiyam Business Solutions Engineering",
            "email": "dev@qiyambusinesssolutions.com",
            "url": "https://whatsq.qiyambusinesssolutions.com"
        }
    },
    "servers": [
        {
            "url": "https://whatsq.qiyambusinesssolutions.com",
            "description": "Production Server (AWS Lightsail)"
        },
        {
            "url": "http://127.0.0.1:8000",
            "description": "Local Development Server"
        }
    ],
    "tags": [
        {"name": "WhatsApp & Conversations", "description": "WhatsApp Cloud API threads, messages, templates & webhooks"},
        {"name": "CRM Pipeline", "description": "Leads, deals, customers, and automated follow-ups"},
        {"name": "Operations & Dispatch", "description": "Field jobs, technician scheduling, attendance, and tasks"},
        {"name": "Finance & Billing", "description": "Invoices, payments, expenses, and transactions"},
        {"name": "Automation & Workflows", "description": "Visual workflow builder, trigger execution engine, and logs"},
        {"name": "AI Assistant & Copilot", "description": "Knowledge base articles, AI chat completions, and settings"},
        {"name": "Core & System", "description": "System health, version updater, search, and workspace settings"},
        {"name": "Analytics", "description": "Real-time channel KPIs, intent distribution, and metrics"}
    ],
    "paths": {
        "/api/core/system-version/": {
            "get": {
                "tags": ["Core & System"],
                "summary": "Check current and latest Git system version",
                "description": "Returns active server commit, author, timestamp, and checks GitHub for pending updates.",
                "responses": {
                    "200": {
                        "description": "System version information",
                        "content": {
                            "application/json": {
                                "example": {
                                    "current_commit": "9fa159d",
                                    "current_author": "Vishnu G",
                                    "current_date": "Sep 14, 2026",
                                    "current_message": "Update Sidebar brand to WhatsQ",
                                    "latest_commit": "9fa159d",
                                    "update_available": False,
                                    "is_git": True
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/core/system-update/": {
            "post": {
                "tags": ["Core & System"],
                "summary": "Trigger 1-click live system update and database auto-backup",
                "description": "Creates an automated PostgreSQL backup, pulls latest Git code, applies migrations, rebuilds frontend, and reloads services.",
                "responses": {
                    "200": {
                        "description": "Update execution started",
                        "content": {
                            "application/json": {
                                "example": {
                                    "success": True,
                                    "message": "System update and PostgreSQL backup initiated successfully!"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/core/search/": {
            "get": {
                "tags": ["Core & System"],
                "summary": "Global cross-module search",
                "parameters": [
                    {
                        "name": "q",
                        "in": "query",
                        "required": True,
                        "schema": {"type": "string"},
                        "description": "Search keyword (min 2 characters)"
                    }
                ],
                "responses": {
                    "200": {"description": "List of matching leads, conversations, jobs, invoices, and templates"}
                }
            }
        },
        "/api/core/workspace/": {
            "get": {
                "tags": ["Core & System"],
                "summary": "Get workspace company profile and configuration",
                "responses": {"200": {"description": "Workspace settings"}}
            }
        },
        "/api/core/branches/": {
            "get": {
                "tags": ["Core & System"],
                "summary": "List all business branches and locations",
                "responses": {"200": {"description": "List of branches"}}
            }
        },
        "/api/core/integrations/": {
            "get": {
                "tags": ["Core & System"],
                "summary": "List third-party integrations (Razorpay, Google Calendar, Meta)",
                "responses": {"200": {"description": "Connected integrations"}}
            }
        },
        "/api/conversations/threads/": {
            "get": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "List all WhatsApp customer chat threads",
                "description": "Returns open, in-progress, and resolved WhatsApp conversation threads with recent message preview and unread counts.",
                "responses": {"200": {"description": "Array of conversation threads"}}
            }
        },
        "/api/conversations/messages/": {
            "get": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "List message history",
                "responses": {"200": {"description": "Message list"}}
            },
            "post": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Send WhatsApp message to contact",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "conversation": {"type": "integer"},
                                    "text": {"type": "string"},
                                    "sender": {"type": "string", "default": "agent"}
                                },
                                "required": ["conversation", "text"]
                            }
                        }
                    }
                },
                "responses": {"201": {"description": "Message dispatched"}}
            }
        },
        "/api/conversations/templates/": {
            "get": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "List all 34 Meta WhatsApp message templates",
                "description": "Returns approved templates with categories (MARKETING, UTILITY), body text, and variables.",
                "responses": {"200": {"description": "List of WhatsApp templates"}}
            }
        },
        "/api/conversations/meta-config/": {
            "get": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Get Meta WhatsApp Cloud API credentials and connection health",
                "responses": {"200": {"description": "Connection parameters and status"}}
            },
            "post": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Update Meta credentials and test connection",
                "responses": {"200": {"description": "Connection verified successfully"}}
            }
        },
        "/api/conversations/webhook/": {
            "get": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Meta Webhook challenge handshake verification",
                "parameters": [
                    {"name": "hub.mode", "in": "query", "required": True, "schema": {"type": "string"}},
                    {"name": "hub.verify_token", "in": "query", "required": True, "schema": {"type": "string"}},
                    {"name": "hub.challenge", "in": "query", "required": True, "schema": {"type": "string"}}
                ],
                "responses": {
                    "200": {"description": "Verification challenge returned"},
                    "403": {"description": "Verify token mismatch"}
                }
            },
            "post": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Meta Webhook event delivery (Incoming messages, status receipts, template updates)",
                "responses": {"200": {"description": "Payload processed and stored"}}
            }
        },
        "/api/conversations/simulate/": {
            "post": {
                "tags": ["WhatsApp & Conversations"],
                "summary": "Simulate incoming WhatsApp message for testing",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "phone_number": {"type": "string"},
                                    "customer_name": {"type": "string"},
                                    "message": {"type": "string"}
                                }
                            }
                        }
                    }
                },
                "responses": {"200": {"description": "Simulated message received"}}
            }
        },
        "/api/crm/leads/": {
            "get": {
                "tags": ["CRM Pipeline"],
                "summary": "List CRM leads",
                "responses": {"200": {"description": "Array of leads"}}
            },
            "post": {
                "tags": ["CRM Pipeline"],
                "summary": "Create new sales lead",
                "responses": {"201": {"description": "Lead created"}}
            }
        },
        "/api/crm/leads/{id}/convert_to_deal/": {
            "post": {
                "tags": ["CRM Pipeline"],
                "summary": "Convert lead to active deal",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"200": {"description": "Deal created and lead marked won"}}
            }
        },
        "/api/crm/deals/": {
            "get": {
                "tags": ["CRM Pipeline"],
                "summary": "List active deals and pipeline stages",
                "responses": {"200": {"description": "Deals list"}}
            }
        },
        "/api/crm/customers/": {
            "get": {
                "tags": ["CRM Pipeline"],
                "summary": "List verified customers",
                "responses": {"200": {"description": "Customer list"}}
            }
        },
        "/api/crm/follow-ups/": {
            "get": {
                "tags": ["CRM Pipeline"],
                "summary": "List scheduled customer follow-up actions",
                "responses": {"200": {"description": "Follow-ups list"}}
            }
        },
        "/api/operations/jobs/": {
            "get": {
                "tags": ["Operations & Dispatch"],
                "summary": "List field jobs and service dispatches",
                "responses": {"200": {"description": "Jobs list"}}
            }
        },
        "/api/operations/appointments/": {
            "get": {
                "tags": ["Operations & Dispatch"],
                "summary": "List customer service appointments",
                "responses": {"200": {"description": "Appointments list"}}
            }
        },
        "/api/operations/employees/": {
            "get": {
                "tags": ["Operations & Dispatch"],
                "summary": "List staff, technicians and attendance status",
                "responses": {"200": {"description": "Employee directory"}}
            }
        },
        "/api/operations/tasks/": {
            "get": {
                "tags": ["Operations & Dispatch"],
                "summary": "List operational tasks and checklists",
                "responses": {"200": {"description": "Tasks list"}}
            }
        },
        "/api/operations/inventory/": {
            "get": {
                "tags": ["Operations & Dispatch"],
                "summary": "List spare parts and equipment inventory",
                "responses": {"200": {"description": "Inventory items"}}
            }
        },
        "/api/finance/invoices/": {
            "get": {
                "tags": ["Finance & Billing"],
                "summary": "List customer invoices and payment statuses",
                "responses": {"200": {"description": "Invoices list"}}
            }
        },
        "/api/finance/transactions/": {
            "get": {
                "tags": ["Finance & Billing"],
                "summary": "List financial revenue and expense transactions",
                "responses": {"200": {"description": "Transactions ledger"}}
            }
        },
        "/api/finance/expenses/": {
            "get": {
                "tags": ["Finance & Billing"],
                "summary": "List operational business expenses",
                "responses": {"200": {"description": "Expenses list"}}
            }
        },
        "/api/finance/accounts/": {
            "get": {
                "tags": ["Finance & Billing"],
                "summary": "List payment gateways and bank accounts",
                "responses": {"200": {"description": "Accounts list"}}
            }
        },
        "/api/automation/workflows/": {
            "get": {
                "tags": ["Automation & Workflows"],
                "summary": "List visual automation workflows",
                "responses": {"200": {"description": "Workflows list"}}
            }
        },
        "/api/automation/workflows/{id}/execute/": {
            "post": {
                "tags": ["Automation & Workflows"],
                "summary": "Test & execute workflow against simulated or live trigger",
                "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"200": {"description": "Execution steps and duration output"}}
            }
        },
        "/api/automation/approvals/": {
            "get": {
                "tags": ["Automation & Workflows"],
                "summary": "List manager approval requests",
                "responses": {"200": {"description": "Approvals list"}}
            }
        },
        "/api/automation/logs/": {
            "get": {
                "tags": ["Automation & Workflows"],
                "summary": "List workflow execution audit logs",
                "responses": {"200": {"description": "Automation logs"}}
            }
        },
        "/api/ai/chat/": {
            "post": {
                "tags": ["AI Assistant & Copilot"],
                "summary": "Ask AI Copilot with business knowledge context",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "prompt": {"type": "string"}
                                },
                                "required": ["prompt"]
                            }
                        }
                    }
                },
                "responses": {"200": {"description": "AI reply and suggestion chips"}}
            }
        },
        "/api/ai/knowledge-base/": {
            "get": {
                "tags": ["AI Assistant & Copilot"],
                "summary": "List business knowledge base articles",
                "responses": {"200": {"description": "Knowledge articles"}}
            }
        },
        "/api/analytics/channels/": {
            "get": {
                "tags": ["Analytics"],
                "summary": "Channel performance statistics",
                "responses": {"200": {"description": "Channel stats"}}
            }
        },
        "/api/analytics/intents/": {
            "get": {
                "tags": ["Analytics"],
                "summary": "Customer message intent classifications",
                "responses": {"200": {"description": "Intent distributions"}}
            }
        }
    }
}

def openapi_schema_view(request):
    """Returns the OpenAPI 3.0.3 specification JSON."""
    return JsonResponse(OPENAPI_SPEC)

def swagger_ui_view(request):
    """Renders interactive Swagger UI pointing to OpenAPI schema."""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WhatsQ API Explorer & Swagger Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310B981'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>" />
    <style>
        body { margin: 0; padding: 0; background: #0b1528; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; }
        .swagger-ui .topbar { background-color: #060d1a; border-bottom: 1px solid #1e293b; padding: 12px 24px; }
        .topbar-wrapper img { display: none; }
        .brand-heading { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-weight: 700; font-size: 18px; }
        .brand-badge { background: #059669; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
        .back-link { margin-left: auto; color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 8px; border: 1px solid #334155; transition: all 0.2s; }
        .back-link:hover { background: #1e293b; color: #fff; }
        .swagger-ui { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .swagger-ui .info { margin: 25px 0; }
        .swagger-ui .info .title { color: #f8fafc; font-size: 28px; }
        .swagger-ui .info p { color: #cbd5e1; font-size: 14px; }
        .swagger-ui .scheme-container { background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; box-shadow: none; margin: 20px 0; padding: 16px 24px; }
        .swagger-ui .servers-title, .swagger-ui label { color: #94a3b8; }
        .swagger-ui select { background: #1e293b; color: #f8fafc; border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; }
        .swagger-ui .opblock-tag { color: #f1f5f9; border-bottom: 1px solid #1e293b; font-size: 18px; margin: 20px 0 10px; }
        .swagger-ui .opblock { border-radius: 10px; box-shadow: none; margin: 0 0 14px; background: #0f172a; border: 1px solid #1e293b; }
        .swagger-ui .opblock.opblock-get { border-color: #0284c7; }
        .swagger-ui .opblock.opblock-post { border-color: #059669; }
        .swagger-ui .opblock.opblock-put { border-color: #d97706; }
        .swagger-ui .opblock.opblock-delete { border-color: #dc2626; }
        .swagger-ui .opblock-summary-path { color: #f8fafc; font-weight: 600; }
        .swagger-ui .opblock-summary-description { color: #94a3b8; }
    </style>
</head>
<body>
    <div class="swagger-ui">
        <div class="topbar">
            <div style="display: flex; align-items: center; max-width: 1400px; margin: 0 auto; width: 100%;">
                <a href="/" class="brand-heading">
                    <span style="color: #10b981;">⚡ WhatsQ</span> Cloud API
                    <span class="brand-badge">v1.0.0</span>
                </a>
                <a href="/" class="back-link">← Back to WhatsQ Web App</a>
            </div>
        </div>
    </div>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
        window.onload = () => {
            window.ui = SwaggerUIBundle({
                url: '/api/schema/',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        };
    </script>
</body>
</html>"""
    return HttpResponse(html, content_type='text/html')

def api_root_view(request):
    """
    Renders an interactive API Hub directory for browsers (text/html)
    or returns clean JSON for API clients (application/json).
    """
    accept = request.headers.get('Accept', '')
    if 'text/html' in accept:
        categories = [
            {
                "name": "WhatsApp & Messaging",
                "desc": "Official Meta WhatsApp Cloud API webhooks, inbound chats, and 34 message templates",
                "endpoints": [
                    {"method": "GET", "url": "/api/conversations/threads/", "desc": "List active customer WhatsApp chat threads"},
                    {"method": "POST", "url": "/api/conversations/messages/", "desc": "Send outbound message or reply to customer"},
                    {"method": "GET", "url": "/api/conversations/templates/", "desc": "List 34 pre-approved Meta WhatsApp templates"},
                    {"method": "GET/POST", "url": "/api/conversations/webhook/", "desc": "Meta webhook verification handshake & incoming message receiver"},
                    {"method": "GET", "url": "/api/conversations/meta-config/", "desc": "WhatsApp Cloud API credentials & connection health"},
                    {"method": "POST", "url": "/api/conversations/simulate/", "desc": "WhatsApp Interactive Message Simulator endpoint"},
                ]
            },
            {
                "name": "CRM Pipeline",
                "desc": "Leads, deals, customers, and automated follow-ups",
                "endpoints": [
                    {"method": "GET/POST", "url": "/api/crm/leads/", "desc": "CRM Leads directory and stage pipeline"},
                    {"method": "POST", "url": "/api/crm/leads/{id}/convert_to_deal/", "desc": "1-Click convert lead to active deal"},
                    {"method": "GET", "url": "/api/crm/deals/", "desc": "Deals pipeline and expected revenues"},
                    {"method": "GET", "url": "/api/crm/customers/", "desc": "Customer database and history"},
                    {"method": "GET", "url": "/api/crm/follow-ups/", "desc": "Scheduled follow-up reminders"},
                ]
            },
            {
                "name": "Operations & Dispatch",
                "desc": "Technician dispatch, field service jobs, inventory, and attendance",
                "endpoints": [
                    {"method": "GET/PUT", "url": "/api/operations/jobs/", "desc": "Field service jobs and status dispatch"},
                    {"method": "GET", "url": "/api/operations/appointments/", "desc": "Scheduled customer calendar bookings"},
                    {"method": "GET/PUT", "url": "/api/operations/employees/", "desc": "Staff directory and technician clock-in"},
                    {"method": "GET", "url": "/api/operations/tasks/", "desc": "Operational checklists and tasks"},
                    {"method": "GET", "url": "/api/operations/inventory/", "desc": "Stock and spare parts inventory"},
                ]
            },
            {
                "name": "Finance & Billing",
                "desc": "Invoices, online payments, expenses, and ledger transactions",
                "endpoints": [
                    {"method": "GET/POST", "url": "/api/finance/invoices/", "desc": "Customer invoices, payment links, and statuses"},
                    {"method": "GET", "url": "/api/finance/transactions/", "desc": "Income and expense transaction ledger"},
                    {"method": "GET", "url": "/api/finance/expenses/", "desc": "Operational business expenses"},
                    {"method": "GET", "url": "/api/finance/accounts/", "desc": "Payment gateways and bank accounts"},
                ]
            },
            {
                "name": "Automation & AI Workflows",
                "desc": "Visual workflow builder, trigger execution engine, and AI Copilot",
                "endpoints": [
                    {"method": "GET/POST", "url": "/api/automation/workflows/", "desc": "Visual automation workflows"},
                    {"method": "POST", "url": "/api/automation/workflows/{id}/execute/", "desc": "Test & execute workflow triggers with sample input"},
                    {"method": "GET", "url": "/api/automation/approvals/", "desc": "Manager approval requests"},
                    {"method": "GET", "url": "/api/automation/logs/", "desc": "Workflow audit logs"},
                    {"method": "POST", "url": "/api/ai/chat/", "desc": "AI Copilot intelligent query endpoint"},
                    {"method": "GET", "url": "/api/ai/knowledge-base/", "desc": "Business knowledge base articles"},
                ]
            },
            {
                "name": "Core & System",
                "desc": "System health, version updater, search, and workspace settings",
                "endpoints": [
                    {"method": "GET", "url": "/api/core/system-version/", "desc": "Check current Git version & GitHub updates"},
                    {"method": "POST", "url": "/api/core/system-update/", "desc": "Trigger automated PostgreSQL backup & live update"},
                    {"method": "GET", "url": "/api/core/search/?q=...", "desc": "Cross-module global search"},
                    {"method": "GET", "url": "/api/core/workspace/", "desc": "Company workspace settings"},
                    {"method": "GET", "url": "/api/core/branches/", "desc": "Branch office locations"},
                ]
            }
        ]

        cards_html = ""
        for cat in categories:
            ep_rows = ""
            for ep in cat["endpoints"]:
                m = ep["method"]
                badge_class = "bg-blue-900/60 text-blue-300 border-blue-700" if m == "GET" else "bg-emerald-900/60 text-emerald-300 border-emerald-700" if m == "POST" else "bg-amber-900/60 text-amber-300 border-amber-700"
                ep_rows += f"""
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition gap-2">
                    <div class="flex items-center gap-3">
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded border {badge_class}">{ep['method']}</span>
                        <a href="{ep['url']}" class="font-mono text-xs text-emerald-400 hover:text-emerald-300 transition underline-offset-2 hover:underline">{ep['url']}</a>
                    </div>
                    <span class="text-xs text-slate-400">{ep['desc']}</span>
                </div>
                """
            cards_html += f"""
            <div class="bg-[#0f172a] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
                <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    {cat['name']}
                </h3>
                <p class="text-xs text-slate-400 mb-4">{cat['desc']}</p>
                <div class="space-y-2">
                    {ep_rows}
                </div>
            </div>
            """

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsQ API Explorer & Endpoints Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310B981'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>" />
</head>
<body class="bg-[#0b1528] text-slate-200 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
    <div class="border-b border-slate-800 bg-[#060d1a]/80 backdrop-blur sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-base">⚡</div>
                <div>
                    <h1 class="text-lg font-bold text-white leading-none">WhatsQ Cloud API Hub</h1>
                    <p class="text-[11px] text-emerald-400 font-medium">Qiyam Business Solutions</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <a href="/api/docs/" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm shadow-emerald-600/30 flex items-center gap-1.5">
                    <span>📖 Open Swagger UI Explorer</span>
                </a>
                <a href="/" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition border border-slate-700">
                    ← Back to App
                </a>
            </div>
        </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-800/40 rounded-2xl p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-900/50 border border-emerald-700/50 px-2.5 py-1 rounded-full mb-3">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Status: Healthy & Active (v1.0.0)
                    </span>
                    <h2 class="text-2xl font-black text-white">WhatsQ REST API Endpoints Directory</h2>
                    <p class="text-sm text-slate-400 mt-1 max-w-2xl">
                        Explore all 34 active production API endpoints powering WhatsQ. Includes full WhatsApp Cloud API integrations, CRM deals pipeline, field job dispatch, and live automated workflows.
                    </p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <a href="/api/schema/" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition">
                        GET /api/schema/
                    </a>
                    <a href="/api/core/system-version/" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition">
                        GET /api/core/system-version/
                    </a>
                </div>
            </div>
        </div>

        {cards_html}
    </main>

    <footer class="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        WhatsQ Cloud Platform &copy; 2026 Qiyam Business Solutions. All rights reserved.
    </footer>
</body>
</html>"""
        return HttpResponse(html, content_type='text/html')

    # Return standard JSON response for API clients
    return JsonResponse({
        'name': 'WhatsQ Cloud API',
        'version': '1.0.0',
        'status': 'healthy',
        'docs': '/api/docs/',
        'schema': '/api/schema/',
        'endpoints': {
            'core': '/api/core/',
            'system_version': '/api/core/system-version/',
            'system_update': '/api/core/system-update/',
            'conversations': '/api/conversations/threads/',
            'whatsapp_webhook': '/api/conversations/webhook/',
            'whatsapp_templates': '/api/conversations/templates/',
            'meta_config': '/api/conversations/meta-config/',
            'crm_leads': '/api/crm/leads/',
            'crm_deals': '/api/crm/deals/',
            'crm_customers': '/api/crm/customers/',
            'crm_followups': '/api/crm/follow-ups/',
            'operations_jobs': '/api/operations/jobs/',
            'operations_appointments': '/api/operations/appointments/',
            'operations_employees': '/api/operations/employees/',
            'finance_invoices': '/api/finance/invoices/',
            'finance_transactions': '/api/finance/transactions/',
            'automation_workflows': '/api/automation/workflows/',
            'ai_chat': '/api/ai/chat/',
            'analytics_channels': '/api/analytics/channels/',
        }
    })
