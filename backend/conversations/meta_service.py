import re
import requests
import json
import logging

logger = logging.getLogger(__name__)

class MetaWhatsAppService:
    """
    Service client for Meta WhatsApp Cloud API (Graph API v21.0)
    Handles:
    - Connectivity testing & account verification
    - Template creation, querying, and deletion
    - Sending freeform text and template messages
    - Building Meta Graph API compatible components payloads
    """

    DEFAULT_API_VERSION = "v21.0"
    GRAPH_BASE_URL = "https://graph.facebook.com"

    @classmethod
    def get_headers(cls, access_token: str):
        return {
            "Authorization": f"Bearer {access_token.strip()}",
            "Content-Type": "application/json",
        }

    @classmethod
    def test_connection(cls, phone_number_id: str, waba_id: str, access_token: str, api_version: str = DEFAULT_API_VERSION):
        """
        Validates credentials by pinging Meta Graph API for Phone Number & WABA details.
        """
        if not access_token:
            return {"success": False, "error": "Access token is required"}

        version = api_version or cls.DEFAULT_API_VERSION
        headers = cls.get_headers(access_token)

        results = {
            "success": True,
            "phone_number_valid": False,
            "waba_valid": False,
            "phone_details": {},
            "waba_details": {},
        }

        # 1. Check Phone Number ID if provided
        if phone_number_id:
            try:
                phone_url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}"
                params = {"fields": "verified_name,display_phone_number,quality_rating,code_verification_status"}
                resp = requests.get(phone_url, headers=headers, params=params, timeout=10)
                if resp.status_code == 200:
                    results["phone_number_valid"] = True
                    results["phone_details"] = resp.json()
                else:
                    err = resp.json().get("error", {}).get("message", "Invalid Phone Number ID or Token")
                    return {"success": False, "error": f"Phone Number ID Check Failed: {err}", "details": resp.json()}
            except Exception as e:
                return {"success": False, "error": f"Failed to connect to Meta Graph API: {str(e)}"}

        # 2. Check WABA ID if provided
        if waba_id:
            try:
                waba_url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}"
                params = {"fields": "id,name,currency,timezone_id,message_template_namespace"}
                resp = requests.get(waba_url, headers=headers, params=params, timeout=10)
                if resp.status_code == 200:
                    results["waba_valid"] = True
                    results["waba_details"] = resp.json()
                else:
                    err = resp.json().get("error", {}).get("message", "Invalid WABA ID or Token")
                    return {"success": False, "error": f"WABA ID Check Failed: {err}", "details": resp.json()}
            except Exception as e:
                return {"success": False, "error": f"Failed to connect to Meta Graph API: {str(e)}"}

        return results

    @classmethod
    def validate_template_name(cls, name: str) -> tuple[bool, str]:
        """
        Meta enforces strict naming: only lowercase alphanumeric and underscores, max 512 chars.
        """
        if not name:
            return False, "Template name cannot be empty."
        if len(name) > 512:
            return False, "Template name exceeds 512 characters."
        if not re.match(r'^[a-z0-9_]+$', name):
            return False, "Template name can only contain lowercase letters, numbers, and underscores (no spaces or hyphens)."
        return True, ""

    @classmethod
    def build_meta_components(cls, template_obj) -> list:
        """
        Converts local template configuration into Meta's official Graph API components array.
        """
        components = []

        # 1. HEADER
        header_type = (getattr(template_obj, 'header_type', None) or "NONE").upper()
        if header_type == "TEXT" and getattr(template_obj, 'header_text', None):
            header_comp = {
                "type": "HEADER",
                "format": "TEXT",
                "text": template_obj.header_text
            }
            # If header has variable {{1}}
            if "{{1}}" in template_obj.header_text:
                sample_val = getattr(template_obj, 'header_sample', '') or "Valued Customer"
                header_comp["example"] = {"header_text": [sample_val]}
            components.append(header_comp)
        elif header_type in ["IMAGE", "VIDEO", "DOCUMENT"]:
            header_comp = {
                "type": "HEADER",
                "format": header_type,
            }
            sample_handle = getattr(template_obj, 'header_url', '') or "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"
            header_comp["example"] = {"header_handle": [sample_handle]}
            components.append(header_comp)

        # 2. BODY (Required)
        body_text = getattr(template_obj, 'body_text', None) or getattr(template_obj, 'body', "") or ""
        body_comp = {
            "type": "BODY",
            "text": body_text
        }

        # Extract variables {{1}}, {{2}}, etc.
        vars_found = re.findall(r'\{\{(\d+)\}\}', body_text)
        if vars_found:
            indices = sorted(list(set(int(x) for x in vars_found)))
            sample_dict = getattr(template_obj, 'body_variables', None) or {}
            sample_row = []
            for idx in indices:
                val = str(sample_dict.get(str(idx), sample_dict.get(idx, f"Sample_{idx}")))
                sample_row.append(val)
            body_comp["example"] = {"body_text": [sample_row]}

        components.append(body_comp)

        # 3. FOOTER (Optional)
        footer_text = getattr(template_obj, 'footer_text', None)
        if footer_text and footer_text.strip():
            components.append({
                "type": "FOOTER",
                "text": footer_text.strip()
            })

        # 4. BUTTONS (Optional, up to 10)
        buttons = getattr(template_obj, 'buttons', None) or []
        if buttons:
            button_list = []
            for b in buttons:
                b_type = b.get("type", "QUICK_REPLY").upper()
                text = b.get("text", "")

                if b_type == "QUICK_REPLY":
                    btn = {
                        "type": "QUICK_REPLY",
                        "text": text[:25]
                    }
                    button_list.append(btn)
                elif b_type in ["URL", "CTA_URL"]:
                    url = b.get("url", "https://example.com")
                    btn = {
                        "type": "URL",
                        "text": text[:25],
                        "url": url
                    }
                    if "{{1}}" in url:
                        btn["example"] = [b.get("url_sample", "order123")]
                    button_list.append(btn)
                elif b_type in ["PHONE_NUMBER", "CTA_PHONE"]:
                    btn = {
                        "type": "PHONE_NUMBER",
                        "text": text[:25],
                        "phone_number": b.get("phone_number", "+919876543210")
                    }
                    button_list.append(btn)
                elif b_type == "COPY_CODE":
                    btn = {
                        "type": "COPY_CODE",
                        "example": b.get("code", "OFFER2026")
                    }
                    button_list.append(btn)

            if button_list:
                components.append({
                    "type": "BUTTONS",
                    "buttons": button_list
                })

        return components

    @classmethod
    def create_meta_template(cls, waba_id: str, access_token: str, template_obj, api_version: str = DEFAULT_API_VERSION):
        """
        Submits template to Meta Graph API: POST /{WABA_ID}/message_templates
        """
        valid, err_msg = cls.validate_template_name(template_obj.name)
        if not valid:
            return {"success": False, "error": err_msg}

        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}/message_templates"
        headers = cls.get_headers(access_token)

        category = getattr(template_obj, 'meta_category', 'UTILITY') or 'UTILITY'
        language = getattr(template_obj, 'language', 'en_US') or 'en_US'
        components = cls.build_meta_components(template_obj)

        payload = {
            "name": template_obj.name,
            "category": category.upper(),
            "language": language,
            "components": components,
            "allow_category_change": getattr(template_obj, 'allow_category_change', True)
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            data = resp.json()
            if resp.status_code in [200, 201]:
                return {
                    "success": True,
                    "meta_template_id": data.get("id"),
                    "status": data.get("status", "PENDING"),
                    "category": data.get("category", category),
                    "raw": data
                }
            else:
                error_msg = data.get("error", {}).get("message", "Meta template submission failed")
                error_user_title = data.get("error", {}).get("error_user_title", "")
                error_user_msg = data.get("error", {}).get("error_user_msg", "")
                full_err = f"{error_msg}. {error_user_title}: {error_user_msg}".strip()
                return {"success": False, "error": full_err or error_msg, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error submitting to Meta: {str(e)}"}

    @classmethod
    def fetch_meta_templates(cls, waba_id: str, access_token: str, api_version: str = DEFAULT_API_VERSION):
        """
        Fetches all message templates for a WABA: GET /{WABA_ID}/message_templates
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}/message_templates"
        headers = cls.get_headers(access_token)

        try:
            resp = requests.get(url, headers=headers, params={"limit": 100}, timeout=15)
            if resp.status_code == 200:
                return {"success": True, "templates": resp.json().get("data", [])}
            else:
                err = resp.json().get("error", {}).get("message", "Failed to fetch templates")
                return {"success": False, "error": err, "details": resp.json()}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}

    @classmethod
    def delete_meta_template(cls, waba_id: str, access_token: str, template_name: str, api_version: str = DEFAULT_API_VERSION):
        """
        Deletes a template on Meta: DELETE /{WABA_ID}/message_templates?name={name}
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}/message_templates"
        headers = cls.get_headers(access_token)

        try:
            resp = requests.delete(url, headers=headers, params={"name": template_name}, timeout=15)
            if resp.status_code == 200 and resp.json().get("success"):
                return {"success": True}
            else:
                err = resp.json().get("error", {}).get("message", "Failed to delete template on Meta")
                return {"success": False, "error": err, "details": resp.json()}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}

    @classmethod
    def send_whatsapp_text(cls, phone_number_id: str, access_token: str, to_phone: str, text: str, api_version: str = DEFAULT_API_VERSION):
        """
        Sends a freeform text message (valid within 24h customer service window).
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = re.sub(r'[^0-9]', '', str(to_phone))

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "text",
            "text": {"preview_url": True, "body": text}
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            data = resp.json()
            if resp.status_code in [200, 201]:
                msg_id = data.get("messages", [{}])[0].get("id")
                return {"success": True, "message_id": msg_id, "raw": data}
            else:
                err = data.get("error", {}).get("message", "Failed to send WhatsApp message")
                return {"success": False, "error": err, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}

    @classmethod
    def send_whatsapp_template(cls, phone_number_id: str, access_token: str, to_phone: str, template_name: str, language_code: str = "en_US", components: list = None, api_version: str = DEFAULT_API_VERSION):
        """
        Sends an approved template message to start a conversation or notify customer.
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = re.sub(r'[^0-9]', '', str(to_phone))

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code or "en_US"}
            }
        }

        if components:
            payload["template"]["components"] = components

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            data = resp.json()
            if resp.status_code in [200, 201]:
                msg_id = data.get("messages", [{}])[0].get("id")
                return {"success": True, "message_id": msg_id, "raw": data}
            else:
                err = data.get("error", {}).get("message", "Failed to send WhatsApp template message")
                return {"success": False, "error": err, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}
