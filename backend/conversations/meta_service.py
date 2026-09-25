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
    def clean_phone_number(cls, phone: str) -> str:
        """
        Cleans and normalizes phone number for Meta Cloud API.
        If a 10-digit number is provided without country prefix, defaults to +91.
        """
        clean = re.sub(r'[^0-9]', '', str(phone or ''))
        if len(clean) == 10:
            clean = '91' + clean
        return clean

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
    def get_app_id(cls, access_token: str, api_version: str = DEFAULT_API_VERSION):
        """
        Retrieves the Meta App ID associated with the access token.
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/app"
        try:
            resp = requests.get(url, params={"access_token": access_token.strip()}, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("id")
        except Exception as e:
            logger.error(f"Error fetching Meta App ID: {e}")
        return None

    @classmethod
    def upload_resumable_media(cls, access_token: str, media_source: str, header_type: str, api_version: str = DEFAULT_API_VERSION):
        """
        Uploads sample media via Meta Resumable Upload API to obtain a valid header_handle.
        Required by Meta Graph API for template headers with IMAGE, VIDEO, or DOCUMENT format.
        """
        import base64
        import mimetypes

        app_id = cls.get_app_id(access_token, api_version)
        if not app_id:
            return {"success": False, "error": "Unable to determine Meta App ID from access token"}

        media_bytes = None
        mime_type = "image/png"
        file_name = "sample_media.png"

        if header_type == "IMAGE":
            mime_type = "image/jpeg"
            file_name = "sample_header.jpg"
        elif header_type == "DOCUMENT":
            mime_type = "application/pdf"
            file_name = "sample_document.pdf"
        elif header_type == "VIDEO":
            mime_type = "video/mp4"
            file_name = "sample_video.mp4"

        # 1. Parse media source
        media_source = (media_source or "").strip()
        if media_source.startswith("data:"):
            # Base64 Data URL: data:<mime>;base64,<encoded>
            try:
                header_part, data_part = media_source.split(";base64,", 1)
                parsed_mime = header_part.replace("data:", "").strip()
                if parsed_mime:
                    mime_type = parsed_mime
                media_bytes = base64.b64decode(data_part)
                ext = mimetypes.guess_extension(mime_type) or (".jpg" if header_type == "IMAGE" else ".pdf")
                file_name = f"sample_header{ext}"
            except Exception as e:
                logger.error(f"Failed to decode base64 media source: {e}")
        elif media_source.startswith("http://") or media_source.startswith("https://"):
            try:
                r = requests.get(media_source, timeout=15)
                if r.status_code == 200 and r.content:
                    media_bytes = r.content
                    content_type = r.headers.get("Content-Type", "").split(";")[0].strip()
                    if content_type and content_type != "application/octet-stream":
                        mime_type = content_type
                    ext = mimetypes.guess_extension(mime_type) or (".jpg" if header_type == "IMAGE" else ".pdf")
                    file_name = f"sample_header{ext}"
            except Exception as e:
                logger.warning(f"Failed to download remote media from {media_source}: {e}")

        # Fallback if no media downloaded or provided
        if not media_bytes:
            if header_type == "IMAGE":
                # Valid 1x1 PNG fallback
                media_bytes = (
                    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06'
                    b'\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf'
                    b'\xa4q\x00\x00\x00\x00IEND\xaeB`\x82'
                )
                mime_type = "image/png"
                file_name = "sample_header.png"
            elif header_type == "DOCUMENT":
                # Valid minimal PDF document fallback
                media_bytes = (
                    b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
                    b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
                    b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
                    b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000108 00000 n \n"
                    b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n189\n%%EOF"
                )
                mime_type = "application/pdf"
                file_name = "sample_document.pdf"
            else:
                return {"success": False, "error": f"Valid sample media required for {header_type} template header"}

        # Validate file size (Meta max limit 5MB for images)
        if header_type == "IMAGE" and len(media_bytes) > 5 * 1024 * 1024:
            return {"success": False, "error": "Sample image exceeds Meta limit of 5MB"}

        version = api_version or cls.DEFAULT_API_VERSION
        session_url = f"{cls.GRAPH_BASE_URL}/{version}/{app_id}/uploads"
        try:
            session_resp = requests.post(
                session_url,
                params={
                    "file_name": file_name,
                    "file_length": len(media_bytes),
                    "file_type": mime_type,
                    "access_token": access_token.strip()
                },
                timeout=20
            )
            if session_resp.status_code not in [200, 201]:
                err = session_resp.json().get("error", {}).get("message", "Failed to initiate Meta upload session")
                return {"success": False, "error": f"Meta Resumable Upload session failed: {err}"}

            session_id = session_resp.json().get("id")
            if not session_id:
                return {"success": False, "error": "No session ID returned by Meta upload endpoint"}

            upload_url = f"{cls.GRAPH_BASE_URL}/{version}/{session_id}"
            upload_resp = requests.post(
                upload_url,
                headers={
                    "Authorization": f"OAuth {access_token.strip()}",
                    "file_offset": "0"
                },
                data=media_bytes,
                timeout=30
            )
            if upload_resp.status_code not in [200, 201]:
                err = upload_resp.json().get("error", {}).get("message", "Failed to upload media data to Meta")
                return {"success": False, "error": f"Meta Resumable Upload data transfer failed: {err}"}

            handle = upload_resp.json().get("h")
            if not handle:
                return {"success": False, "error": "Meta did not return a valid upload handle 'h'"}

            return {"success": True, "handle": handle}
        except Exception as e:
            return {"success": False, "error": f"Network error during Meta media upload: {str(e)}"}

    @classmethod
    def build_meta_components(cls, template_obj, media_handle: str = None):
        """
        Converts template into Meta Graph API components payload.
        Handles headers (TEXT with {{1}}, IMAGE, VIDEO, DOCUMENT with media handles),
        body with {{1}}, {{2}} and sample variables, footer, and buttons.
        """
        components = []

        # 1. HEADER (Optional)
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
            if media_handle:
                header_comp["example"] = {"header_handle": [media_handle]}
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
        Handles sample media handles for media headers automatically.
        """
        valid, err_msg = cls.validate_template_name(template_obj.name)
        if not valid:
            return {"success": False, "error": err_msg}

        version = api_version or cls.DEFAULT_API_VERSION
        header_type = (getattr(template_obj, 'header_type', None) or "NONE").upper()
        media_handle = None

        if header_type in ["IMAGE", "VIDEO", "DOCUMENT"]:
            media_source = getattr(template_obj, 'header_url', '') or ''
            upload_res = cls.upload_resumable_media(
                access_token=access_token,
                media_source=media_source,
                header_type=header_type,
                api_version=version
            )
            if not upload_res.get("success"):
                return {
                    "success": False,
                    "error": f"Failed to upload sample header thumbnail to Meta: {upload_res.get('error')}"
                }
            media_handle = upload_res.get("handle")

        url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}/message_templates"
        headers = cls.get_headers(access_token)

        category = getattr(template_obj, 'meta_category', 'UTILITY') or 'UTILITY'
        language = getattr(template_obj, 'language', 'en_US') or 'en_US'
        components = cls.build_meta_components(template_obj, media_handle=media_handle)

        payload = {
            "name": template_obj.name,
            "category": category.upper(),
            "language": language,
            "components": components,
            "allow_category_change": getattr(template_obj, 'allow_category_change', True)
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
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
        Fetches all message templates for a WABA: GET /{WABA_ID}/message_templates (paginated)
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{waba_id.strip()}/message_templates"
        headers = cls.get_headers(access_token)

        try:
            all_templates = []
            next_url = url
            params = {"limit": 100}
            while next_url:
                if next_url == url:
                    resp = requests.get(next_url, headers=headers, params=params, timeout=15)
                else:
                    resp = requests.get(next_url, headers=headers, timeout=15)

                if resp.status_code == 200:
                    data = resp.json()
                    all_templates.extend(data.get("data", []))
                    paging = data.get("paging", {})
                    next_url = paging.get("next")
                else:
                    err = resp.json().get("error", {}).get("message", "Failed to fetch templates")
                    return {"success": False, "error": err, "details": resp.json()}

            return {"success": True, "templates": all_templates}
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
    def edit_meta_template(cls, template_id: str, access_token: str, template_obj, api_version: str = DEFAULT_API_VERSION):
        """
        Updates an existing template on Meta Graph API: POST /{MESSAGE_TEMPLATE_ID}
        Meta allows editing components (BODY, HEADER, FOOTER, BUTTONS).
        Once updated, Meta puts the template back into PENDING review.
        """
        if not template_id:
            return {"success": False, "error": "No Meta Template ID provided for editing"}

        version = api_version or cls.DEFAULT_API_VERSION
        headers = cls.get_headers(access_token)
        url = f"{cls.GRAPH_BASE_URL}/{version}/{str(template_id).strip()}"

        header_type = (getattr(template_obj, 'header_type', None) or "NONE").upper()
        media_handle = None
        if header_type in ["IMAGE", "VIDEO", "DOCUMENT"]:
            media_source = getattr(template_obj, 'header_url', '') or ''
            upload_res = cls.upload_resumable_media(
                access_token=access_token,
                media_source=media_source,
                header_type=header_type,
                api_version=version
            )
            if upload_res.get("success"):
                media_handle = upload_res.get("handle")

        components = cls.build_meta_components(template_obj, media_handle=media_handle)
        payload = {
            "components": components
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=20)
            data = resp.json()
            if resp.status_code in [200, 201] and (data.get("success") is True or "id" in data):
                return {
                    "success": True,
                    "meta_template_id": data.get("id") or str(template_id),
                    "status": "PENDING",
                    "raw": data
                }
            else:
                error_msg = data.get("error", {}).get("message", "Meta template update failed")
                error_user_title = data.get("error", {}).get("error_user_title", "")
                error_user_msg = data.get("error", {}).get("error_user_msg", "")
                full_err = f"{error_msg}. {error_user_title}: {error_user_msg}".strip()
                return {"success": False, "error": full_err or error_msg, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error updating Meta template: {str(e)}"}

    @classmethod
    def send_whatsapp_text(cls, phone_number_id: str, access_token: str, to_phone: str, text: str, api_version: str = DEFAULT_API_VERSION):
        """
        Sends a freeform text message (valid within 24h customer service window).
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = cls.clean_phone_number(to_phone)

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
    def send_whatsapp_audio(cls, phone_number_id: str, access_token: str, to_phone: str, audio_url: str = None, media_id: str = None, api_version: str = DEFAULT_API_VERSION):
        """
        Sends a WhatsApp audio / voice note message.
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = cls.clean_phone_number(to_phone)

        audio_payload = {}
        if media_id:
            audio_payload["id"] = media_id
        elif audio_url:
            audio_payload["link"] = audio_url

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "audio",
            "audio": audio_payload
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            data = resp.json()
            if resp.status_code in [200, 201]:
                msg_id = data.get("messages", [{}])[0].get("id")
                return {"success": True, "message_id": msg_id, "raw": data}
            else:
                err = data.get("error", {}).get("message", "Failed to send WhatsApp audio message")
                return {"success": False, "error": err, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}

    @classmethod
    def upload_whatsapp_audio(cls, phone_number_id: str, access_token: str, audio_bytes: bytes, mime_type: str = 'audio/ogg', api_version: str = DEFAULT_API_VERSION) -> dict:
        """
        Uploads audio/voice note bytes directly to Meta WhatsApp Media API:
        POST /{PHONE_NUMBER_ID}/media
        Returns {"success": True, "media_id": "<ID>"}
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/media"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}"
        }

        # Meta accepts audio/ogg, audio/mp4, audio/aac, audio/amr, audio/mpeg
        files = {
            'file': ('voice_note.ogg', audio_bytes, mime_type or 'audio/ogg')
        }
        data = {
            'messaging_product': 'whatsapp',
            'type': mime_type or 'audio/ogg'
        }

        try:
            resp = requests.post(url, headers=headers, files=files, data=data, timeout=25)
            res_json = resp.json()
            if resp.status_code in [200, 201] and res_json.get('id'):
                logger.info(f"[Meta Cloud API] Audio uploaded successfully, media_id: {res_json.get('id')}")
                return {"success": True, "media_id": res_json.get('id'), "raw": res_json}
            else:
                err = res_json.get('error', {}).get('message', 'Failed to upload audio to Meta')
                logger.warning(f"[Meta Cloud API] Audio upload failed: {err}")
                return {"success": False, "error": err, "details": res_json}
        except Exception as e:
            logger.error(f"[Meta Cloud API] Audio upload network error: {e}")
            return {"success": False, "error": f"Network error uploading audio to Meta: {str(e)}"}

    @classmethod
    def download_whatsapp_media(cls, media_id: str, access_token: str, save_path: str = None, api_version: str = DEFAULT_API_VERSION) -> dict:
        """
        Downloads a media file (voice note, image, document) from Meta Cloud API.
        Step 1: GET /{MEDIA_ID} to obtain download URL.
        Step 2: GET {download_url} with Authorization: Bearer {access_token} to get binary bytes.
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{media_id.strip()}"
        headers = {
            "Authorization": f"Bearer {access_token.strip()}"
        }

        try:
            meta_resp = requests.get(url, headers=headers, timeout=15)
            if meta_resp.status_code != 200:
                err = meta_resp.json().get('error', {}).get('message', 'Failed to fetch media metadata')
                return {"success": False, "error": err}

            media_meta = meta_resp.json()
            download_url = media_meta.get('url')
            mime_type = media_meta.get('mime_type', 'audio/ogg')

            if not download_url:
                return {"success": False, "error": "No download URL returned by Meta"}

            # Step 2: Download binary data
            bin_resp = requests.get(download_url, headers=headers, timeout=30)
            if bin_resp.status_code != 200:
                return {"success": False, "error": f"Failed to download media binary from Meta (HTTP {bin_resp.status_code})"}

            audio_data = bin_resp.content

            if save_path:
                import os
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                with open(save_path, 'wb') as f:
                    f.write(audio_data)

            return {
                "success": True,
                "data": audio_data,
                "mime_type": mime_type,
                "file_size": len(audio_data)
            }
        except Exception as e:
            logger.error(f"[Meta Media Download Error]: {e}")
            return {"success": False, "error": str(e)}

    @classmethod
    def send_whatsapp_template(cls, phone_number_id: str, access_token: str, to_phone: str, template_name: str, language_code: str = "en_US", components: list = None, api_version: str = DEFAULT_API_VERSION):
        """
        Sends an approved template message to start a conversation or notify customer.
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = cls.clean_phone_number(to_phone)

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

    @classmethod
    def send_whatsapp_interactive(cls, phone_number_id: str, access_token: str, to_phone: str, body_text: str, buttons: list, header_text: str = None, footer_text: str = None, api_version: str = DEFAULT_API_VERSION):
        """
        Sends an interactive button message (up to 3 quick reply buttons) to WhatsApp.
        POST /{PHONE_NUMBER_ID}/messages
        """
        version = api_version or cls.DEFAULT_API_VERSION
        url = f"{cls.GRAPH_BASE_URL}/{version}/{phone_number_id.strip()}/messages"
        headers = cls.get_headers(access_token)

        clean_phone = cls.clean_phone_number(to_phone)

        # Format buttons for Meta interactive API
        formatted_buttons = []
        for idx, btn in enumerate(buttons[:3]): # Meta limits quick reply to max 3
            btn_id = btn.get('id', f'btn_{idx}')
            btn_title = btn.get('title', btn.get('text', f'Option {idx+1}'))[:20] # Max 20 chars
            formatted_buttons.append({
                "type": "reply",
                "reply": {
                    "id": btn_id,
                    "title": btn_title
                }
            })

        interactive_payload = {
            "type": "button",
            "body": {"text": body_text},
            "action": {
                "buttons": formatted_buttons
            }
        }

        if header_text:
            interactive_payload["header"] = {
                "type": "text",
                "text": header_text[:60]
            }

        if footer_text:
            interactive_payload["footer"] = {
                "text": footer_text[:60]
            }

        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "interactive",
            "interactive": interactive_payload
        }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=15)
            data = resp.json()
            if resp.status_code in [200, 201]:
                msg_id = data.get("messages", [{}])[0].get("id")
                return {"success": True, "message_id": msg_id, "raw": data}
            else:
                err = data.get("error", {}).get("message", "Failed to send WhatsApp interactive message")
                return {"success": False, "error": err, "details": data}
        except Exception as e:
            return {"success": False, "error": f"Network error: {str(e)}"}

    @classmethod
    def forward_webhook_payload(cls, target_url: str, raw_payload: dict, custom_headers: dict = None) -> dict:
        """
        Asynchronously or synchronously forwards raw Meta webhook payload to external workspace (e.g. Staff Portal).
        Protects against timeouts and errors.
        """
        if not target_url or not target_url.startswith("http"):
            return {"success": False, "error": "Invalid target URL"}

        headers = {"Content-Type": "application/json"}
        if custom_headers:
            headers.update(custom_headers)

        try:
            resp = requests.post(target_url, json=raw_payload, headers=headers, timeout=5)
            logger.info(f"[Dual-Workspace Proxy] Webhook forwarded to {target_url} (HTTP {resp.status_code})")
            return {
                "success": resp.status_code in [200, 201, 202, 204],
                "status_code": resp.status_code,
                "response_body": resp.text[:200]
            }
        except Exception as e:
            logger.warning(f"[Dual-Workspace Proxy] Forwarding to {target_url} failed: {str(e)}")
            return {"success": False, "error": str(e)}

