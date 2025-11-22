"""Storage handling for Lock Manager."""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, TypedDict

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DEFAULT_HISTORY_DAYS,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)


class CodeSlotData(TypedDict):
    """Type for code slot data."""

    slot: int
    name: str
    code: str | None
    enabled: bool
    alert_on_use: bool
    expiration: str | None  # ISO format datetime or None


class UsageHistoryEntry(TypedDict):
    """Type for usage history entry."""

    timestamp: str  # ISO format datetime
    lock_entity_id: str
    slot: int
    code_name: str
    action: str  # "unlock", "lock", "failed"


class LockData(TypedDict):
    """Type for lock data."""

    entity_id: str
    name: str
    slots: dict[str, CodeSlotData]  # slot number as string key
    notify_service: str | None


class StorageData(TypedDict):
    """Type for storage data."""

    locks: dict[str, LockData]  # entity_id as key
    history: list[UsageHistoryEntry]


class LockManagerStore:
    """Class to manage Lock Manager storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the store."""
        self.hass = hass
        self._store: Store[StorageData] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY
        )
        self._data: StorageData | None = None

    async def async_load(self) -> StorageData:
        """Load data from storage."""
        if self._data is not None:
            return self._data

        data = await self._store.async_load()
        if data is None:
            data = {"locks": {}, "history": []}

        self._data = data
        return self._data

    async def async_save(self) -> None:
        """Save data to storage."""
        if self._data is not None:
            await self._store.async_save(self._data)

    def get_lock(self, entity_id: str) -> LockData | None:
        """Get lock data by entity ID."""
        if self._data is None:
            return None
        return self._data["locks"].get(entity_id)

    def get_all_locks(self) -> dict[str, LockData]:
        """Get all locks."""
        if self._data is None:
            return {}
        return self._data["locks"]

    async def async_add_lock(
        self,
        entity_id: str,
        name: str,
        num_slots: int = 30,
        notify_service: str | None = None,
    ) -> LockData:
        """Add a new lock to manage."""
        await self.async_load()

        slots: dict[str, CodeSlotData] = {}
        for i in range(1, num_slots + 1):
            slots[str(i)] = {
                "slot": i,
                "name": f"Code {i}",
                "code": None,
                "enabled": False,
                "alert_on_use": False,
                "expiration": None,
            }

        lock_data: LockData = {
            "entity_id": entity_id,
            "name": name,
            "slots": slots,
            "notify_service": notify_service,
        }

        self._data["locks"][entity_id] = lock_data
        await self.async_save()
        return lock_data

    async def async_remove_lock(self, entity_id: str) -> None:
        """Remove a lock from management."""
        await self.async_load()
        if entity_id in self._data["locks"]:
            del self._data["locks"][entity_id]
            await self.async_save()

    async def async_update_slot(
        self,
        entity_id: str,
        slot: int,
        **kwargs: Any,
    ) -> CodeSlotData | None:
        """Update a code slot."""
        await self.async_load()

        lock = self._data["locks"].get(entity_id)
        if lock is None:
            return None

        slot_key = str(slot)
        if slot_key not in lock["slots"]:
            return None

        slot_data = lock["slots"][slot_key]

        for key, value in kwargs.items():
            if key in slot_data:
                slot_data[key] = value

        await self.async_save()
        return slot_data

    async def async_clear_slot(self, entity_id: str, slot: int) -> bool:
        """Clear a code slot."""
        await self.async_load()

        lock = self._data["locks"].get(entity_id)
        if lock is None:
            return False

        slot_key = str(slot)
        if slot_key not in lock["slots"]:
            return False

        lock["slots"][slot_key] = {
            "slot": slot,
            "name": f"Code {slot}",
            "code": None,
            "enabled": False,
            "alert_on_use": False,
            "expiration": None,
        }

        await self.async_save()
        return True

    def get_slot(self, entity_id: str, slot: int) -> CodeSlotData | None:
        """Get a specific code slot."""
        if self._data is None:
            return None

        lock = self._data["locks"].get(entity_id)
        if lock is None:
            return None

        return lock["slots"].get(str(slot))

    async def async_add_history_entry(
        self,
        lock_entity_id: str,
        slot: int,
        code_name: str,
        action: str,
    ) -> None:
        """Add a history entry."""
        await self.async_load()

        entry: UsageHistoryEntry = {
            "timestamp": dt_util.utcnow().isoformat(),
            "lock_entity_id": lock_entity_id,
            "slot": slot,
            "code_name": code_name,
            "action": action,
        }

        self._data["history"].append(entry)
        await self.async_save()

    def get_history(
        self,
        lock_entity_id: str | None = None,
        slot: int | None = None,
        limit: int | None = None,
    ) -> list[UsageHistoryEntry]:
        """Get usage history with optional filters."""
        if self._data is None:
            return []

        history = self._data["history"]

        if lock_entity_id is not None:
            history = [h for h in history if h["lock_entity_id"] == lock_entity_id]

        if slot is not None:
            history = [h for h in history if h["slot"] == slot]

        # Sort by timestamp descending (most recent first)
        history = sorted(history, key=lambda x: x["timestamp"], reverse=True)

        if limit is not None:
            history = history[:limit]

        return history

    async def async_cleanup_history(
        self, days: int = DEFAULT_HISTORY_DAYS
    ) -> int:
        """Remove history entries older than specified days."""
        await self.async_load()

        cutoff = dt_util.utcnow() - timedelta(days=days)
        cutoff_iso = cutoff.isoformat()

        original_count = len(self._data["history"])
        self._data["history"] = [
            h for h in self._data["history"]
            if h["timestamp"] >= cutoff_iso
        ]

        removed_count = original_count - len(self._data["history"])
        if removed_count > 0:
            await self.async_save()
            _LOGGER.debug("Removed %d old history entries", removed_count)

        return removed_count

    async def async_get_expired_codes(self) -> list[tuple[str, int, CodeSlotData]]:
        """Get all expired codes."""
        await self.async_load()

        now = dt_util.utcnow()
        expired: list[tuple[str, int, CodeSlotData]] = []

        for entity_id, lock in self._data["locks"].items():
            for slot_key, slot_data in lock["slots"].items():
                if slot_data["expiration"] is not None and slot_data["enabled"]:
                    exp_time = datetime.fromisoformat(slot_data["expiration"])
                    if exp_time <= now:
                        expired.append((entity_id, int(slot_key), slot_data))

        return expired

    async def async_update_notify_service(
        self, entity_id: str, notify_service: str | None
    ) -> bool:
        """Update notification service for a lock."""
        await self.async_load()

        lock = self._data["locks"].get(entity_id)
        if lock is None:
            return False

        lock["notify_service"] = notify_service
        await self.async_save()
        return True
