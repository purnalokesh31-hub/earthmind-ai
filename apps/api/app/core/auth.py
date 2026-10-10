# auth.py - EarthMind AI Authentication Core
import os
import smtplib
from email.message import EmailMessage
import random
import string
import datetime
from apps.api.app.core.db import get_db_connection

def generate_otp() -> str:
    """Generates a secure 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(user_email: str, otp_code: str):
    """Sends the OTP email using SMTP."""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    
    if not smtp_user or not smtp_pass:
        print(f"\n[AUTH ENGINE - MOCK] Cannot send email. Missing SMTP credentials in environment.")
        print(f"[AUTH ENGINE - MOCK] >>> MOCK OTP for {user_email}: {otp_code} <<<\n")
        return

    try:
        msg = EmailMessage()
        msg.set_content(f"Your EarthMind PIOS login code is: {otp_code}\n\nThis code will expire in 10 minutes.")
        msg['Subject'] = 'Your EarthMind Security Code'
        msg['From'] = smtp_user
        msg['To'] = user_email

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[AUTH ENGINE] Successfully dispatched OTP email to {user_email}.")
    except Exception as e:
        print(f"\n[AUTH ENGINE ERROR] Failed to send email to {user_email}: {e}")
        # Fallback to mock so we can still test
        print(f"[AUTH ENGINE - MOCK FALLBACK] >>> MOCK OTP for {user_email}: {otp_code} <<<\n")

def request_otp_service(email: str):
    """Generates an OTP, stores it in DB, and sends it to the user."""
    otp_code = generate_otp()
    
    # 10 minute expiry
    expires_at = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=10)).isoformat()
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO otps (email, otp_code, expires_at, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET 
            otp_code=excluded.otp_code, 
            expires_at=excluded.expires_at,
            created_at=excluded.created_at
    """, (email, otp_code, expires_at, now_str))
    conn.commit()
    conn.close()
    
    send_otp_email(email, otp_code)
    return True

def verify_otp_service(email: str, submitted_otp: str):
    """Verifies an OTP and returns user data if successful."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT otp_code, expires_at FROM otps WHERE email = ?", (email,))
    record = cursor.fetchone()
    
    if not record:
        conn.close()
        return False, "OTP not requested or expired."
        
    stored_otp = record["otp_code"]
    expires_at = datetime.datetime.fromisoformat(record["expires_at"])
    
    if datetime.datetime.now(datetime.timezone.utc) > expires_at:
        cursor.execute("DELETE FROM otps WHERE email = ?", (email,))
        conn.commit()
        conn.close()
        return False, "OTP has expired."
        
    if stored_otp != submitted_otp:
        conn.close()
        return False, "Invalid OTP code."
        
    # OTP is valid! Delete it so it can't be reused.
    cursor.execute("DELETE FROM otps WHERE email = ?", (email,))
    
    # Now fetch or create user
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if not user:
        # Create user automatically on first login
        user_id = "usr-" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        name = email.split("@")[0].title()
        
        cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, organization, department, region, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, email, "PASSWORDLESS", "Field Officer", "Government", "General", "Local", "active", now_str))
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
    conn.commit()
    conn.close()
    
    user_dict = dict(user)
    if "password_hash" in user_dict:
        del user_dict["password_hash"]
        
    return True, user_dict
