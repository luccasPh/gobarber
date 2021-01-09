import emails
from typing import Any, Dict
from emails.template import JinjaTemplate

from app.core.config import settings


def send_email(
    email_to: str,
    subject_template: str = "",
    html_template: str = "",
    environment: Dict[str, Any] = {}
) -> None:
    assert settings.EMAIL_ENABLED, "no provided configuration for email variables"
    message = emails.Message(
        subject=JinjaTemplate(subject_template),
        html=JinjaTemplate(html_template),
        mail_from=(settings.EMAIL_FROM_NAME, settings.EMAIL_FROM_ADDRESS)
    )
    smtp_options = {
        "host": settings.SMTP_HOST,
        "port": settings.SMTP_PORT
    }
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD
    message.send(to=email_to, render=environment, smtp=smtp_options)

def send_reset_password_email(name: str, email: str, token: str) -> None:
    subject = f"[{settings.PROJECT_NAME}] Solicitação de recuperação de senha"
    with open(settings.BASE_DIR.joinpath("app/templates/reset_password.html")) as f:
        template_str = f.read()
    link = f"{settings.APP_WEB_URL}/reset?token={token}"
    send_email(
        email_to=email,
        subject_template=subject,
        html_template=template_str,
        environment={
            "name": name,
            "link": link,
            "team": settings.PROJECT_NAME
        }
    )

def send_account_activation_email(name: str, email: str, token: str) -> None:
    subject = f"[{settings.PROJECT_NAME}] Ativação de conta"
    with open(settings.BASE_DIR.joinpath("app/templates/account_activation.html")) as f:
        template_str = f.read()
    link = f"{settings.APP_WEB_URL}/activate?token={token}"
    send_email(
        email_to=email,
        subject_template=subject,
        html_template=template_str,
        environment={
            "name": name,
            "link": link,
            "team": settings.PROJECT_NAME
        }
    )