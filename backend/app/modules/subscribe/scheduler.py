"""
Background scheduler for sending digest notifications
This should be run as a separate process or cron job
"""

import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.subscribe.notification_service import send_digest_notifications


async def run_digest_notifications():
    """Run digest notifications for all frequencies"""
    db = SessionLocal()
    try:
        await send_digest_notifications(db)
    finally:
        db.close()


if __name__ == "__main__":
    """
    Run this script as a cron job or scheduled task:
    - Daily at 9 AM: python -m app.modules.subscribe.scheduler
    """
    asyncio.run(run_digest_notifications())

