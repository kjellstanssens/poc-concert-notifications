import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
SMTP_PORT = int(os.getenv("SMTP_PORT", "1025"))

def send_daily_digest(email: str, notifications: list):
    """
    Sends a daily digest email with the list of new/updated concerts.
    """
    if not notifications:
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Daily Concert Digest - {len(notifications)} Updates"
    msg["From"] = "notifications@concert-poc.com"
    msg["To"] = email

    # Create plain-text content
    text = "Here are your concert updates for today:\n\n"
    html = "<html><body><h2>Your Daily Concert Digest</h2><ul>"

    for n in notifications:
        concert = n.concert
        venue_name = concert.venue.name if concert.venue else "Unknown Venue"
        change_label = "NEW" if n.change_type == "new" else "UPDATED"
        
        info = f"[{change_label}] {concert.title} @ {venue_name} on {concert.date.strftime('%Y-%m-%d')}"
        text += f"- {info}\n  Link: {concert.url}\n\n"
        html += f"<li><strong>{change_label}</strong>: {concert.title} @ {venue_name} ({concert.date.strftime('%Y-%m-%d')})<br><a href='{concert.url}'>View Details</a></li>"

    html += "</ul></body></html>"

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.sendmail(msg["From"], msg["To"], msg.as_string())
        logger.info(f"Successfully sent digest to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {e}")
        return False
