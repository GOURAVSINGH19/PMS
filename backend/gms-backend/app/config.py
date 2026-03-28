from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Email settings
    email_enabled: bool = True
    email_backend: str = "smtp"  # Options: smtp, resend, stub
    
    # SMTP settings (for Gmail, Outlook, corporate email)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""  # Use App Password for Gmail
    smtp_use_tls: bool = True
    
    # Resend settings (optional)
    resend_api_key: str = ""
    
    # Common email settings
    mail_from: str = "PMS Platform <noreply@example.com>"
    
    class Config:
        env_file = ".env"

settings = Settings()
