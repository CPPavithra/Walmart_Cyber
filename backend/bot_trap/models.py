from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional

class BotTrapEvent(BaseModel):
    ip: str
    event_type: str
    user_agent: str
    metadata: dict
    timestamp: datetime
    product_id: Optional[int] = None

    @classmethod
    async def find_all(cls):
        """Get all bot trap events from database"""
        db = AsyncIOMotorClient().walmart_security
        events = []
        async for event in db.bot_trap_events.find().sort("timestamp", -1):
            events.append(cls(**event))
        return events

    async def save(self):
        """Save event to database"""
        db = AsyncIOMotorClient().walmart_security
        await db.bot_trap_events.insert_one(self.dict())
