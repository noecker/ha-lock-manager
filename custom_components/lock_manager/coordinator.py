"""Data coordinator for Lock Manager."""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, SCAN_INTERVAL
from .store import LockManagerStore

_LOGGER = logging.getLogger(__name__)


class LockManagerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator to manage lock data updates."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: LockManagerStore,
        lock_entity_id: str,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{lock_entity_id}",
            update_interval=SCAN_INTERVAL,
        )
        self.store = store
        self.lock_entity_id = lock_entity_id

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from the lock and store."""
        try:
            lock_data = self.store.get_lock(self.lock_entity_id)
            if lock_data is None:
                raise UpdateFailed(f"Lock {self.lock_entity_id} not found in store")

            # Get lock state from Home Assistant
            lock_state = self.hass.states.get(self.lock_entity_id)

            # Get recent history
            history = self.store.get_history(
                lock_entity_id=self.lock_entity_id,
                limit=50,
            )

            # Count active codes
            active_codes = sum(
                1 for slot in lock_data["slots"].values()
                if slot["enabled"] and slot["code"]
            )

            # Count codes with alerts
            alert_codes = sum(
                1 for slot in lock_data["slots"].values()
                if slot["alert_on_use"]
            )

            return {
                "lock_data": lock_data,
                "lock_state": lock_state.state if lock_state else "unknown",
                "lock_attributes": lock_state.attributes if lock_state else {},
                "history": history,
                "active_codes": active_codes,
                "alert_codes": alert_codes,
                "total_slots": len(lock_data["slots"]),
            }

        except Exception as ex:
            raise UpdateFailed(f"Error updating lock data: {ex}") from ex

    def get_slot_data(self, slot: int) -> dict[str, Any] | None:
        """Get data for a specific slot."""
        if self.data is None:
            return None

        lock_data = self.data.get("lock_data")
        if lock_data is None:
            return None

        return lock_data["slots"].get(str(slot))

    def get_history(self, limit: int = 20) -> list[dict[str, Any]]:
        """Get recent history."""
        if self.data is None:
            return []

        return self.data.get("history", [])[:limit]
