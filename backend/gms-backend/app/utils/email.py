import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import threading

def _send_smtp_email(to_email: str, subject: str, html_body: str):
    """Send email via SMTP (Gmail, Outlook, corporate server)"""
    if not settings.email_enabled:
        print(f"[EMAIL DISABLED] Would send to {to_email}: {subject}")
        return
    
    if not settings.smtp_user or not settings.smtp_password:
        print(f"[EMAIL STUB] To: {to_email} | Subject: {subject}")
        print(f"[EMAIL STUB] Configure SMTP_USER and SMTP_PASSWORD in .env")
        return
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.mail_from
        msg["To"] = to_email
        
        # Attach HTML body
        html_part = MIMEText(html_body, "html")
        msg.attach(html_part)
        
        # Connect and send
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        
        print(f"[EMAIL SENT] To: {to_email} | Subject: {subject} | Via: SMTP")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {str(e)}")

def _send_resend_email(to_email: str, subject: str, html_body: str):
    """Send email via Resend API"""
    if not settings.email_enabled:
        print(f"[EMAIL DISABLED] Would send to {to_email}: {subject}")
        return
    
    if not settings.resend_api_key:
        print(f"[EMAIL STUB] To: {to_email} | Subject: {subject}")
        print(f"[EMAIL STUB] Configure RESEND_API_KEY in .env")
        return
    
    try:
        import resend
        resend.api_key = settings.resend_api_key
        
        params = {
            "from": settings.mail_from,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        
        response = resend.Emails.send(params)
        print(f"[EMAIL SENT] To: {to_email} | Subject: {subject} | Resend ID: {response['id']}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {str(e)}")

def _send_stub_email(to_email: str, subject: str, html_body: str):
    """Stub email sender - just logs to console"""
    print(f"[EMAIL STUB] To: {to_email}")
    print(f"[EMAIL STUB] Subject: {subject}")
    print(f"[EMAIL STUB] Body preview: {html_body[:100]}...")

class EmailSender:
    def send(self, to_email: str, subject: str, body_html: str, body_text: str = None):
        """Send email in background thread using configured backend"""
        # Choose backend based on configuration
        if settings.email_backend == "smtp":
            send_func = _send_smtp_email
        elif settings.email_backend == "resend":
            send_func = _send_resend_email
        else:  # stub
            send_func = _send_stub_email
        
        # Send in background thread to avoid blocking
        thread = threading.Thread(target=send_func, args=(to_email, subject, body_html))
        thread.daemon = True
        thread.start()

email_sender = EmailSender()
