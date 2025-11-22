"""Switch platform for Lock Manager."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_LOCK_ENTITY_ID, CONF_LOCK_NAME, CONF_SLOTS, DEFAULT_SLOTS, DOMAIN
from .coordinator import LockManagerCoordinator
from .store import LockManagerStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Lock Manager switches."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: LockManagerCoordinator = data["coordinator"]
    store: LockManagerStore = data["store"]
    lock_entity_id = data["lock_entity_id"]
    lock_name = entry.data[CONF_LOCK_NAME]
    num_slots = entry.data.get(CONF_SLOTS, DEFAULT_SLOTS)

    entities = []

    # Create a switch for each code slot
    for slot in range(1, num_slots + 1):
        entities.append(
            CodeSlotSwitch(
                coordinator,
                store,
                lock_entity_id,
                lock_name,
                slot,
                entry.entry_id,
            )
        )

    async_add_entities(entities)


class CodeSlotSwitch(CoordinatorEntity[LockManagerCoordinator], SwitchEntity):
    """Switch to enable/disable a code slot."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: LockManagerCoordinator,
        store: LockManagerStore,
        lock_entity_id: str,
        lock_name: str,
        slot: int,
        entry_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator)
        self._store = store
        self._lock_entity_id = lock_entity_id
        self._lock_name = lock_name
        self._slot = slot
        self._entry_id = entry_id
        self._attr_unique_id = f"{lock_entity_id}_slot_{slot}_enabled"

    @property
    def name(self) -> str:
        """Return the name of the switch."""
        slot_data = self.coordinator.get_slot_data(self._slot)
        if slot_data and slot_data.get("name"):
            return f"{slot_data['name']} Enabled"
        return f"Code {self._slot} Enabled"

    @property
    def icon(self) -> str:
        """Return the icon."""
        return "mdi:key" if self.is_on else "mdi:key-outline"

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._lock_entity_id)},
            name=f"{self._lock_name} Lock Manager",
            manufacturer="Lock Manager",
            model="Virtual",
        )

    @property
    def is_on(self) -> bool:
        """Return true if the code is enabled."""
        slot_data = self.coordinator.get_slot_data(self._slot)
        if slot_data is None:
            return False
        return slot_data.get("enabled", False)

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        slot_data = self.coordinator.get_slot_data(self._slot)
        # Only available if a code is set
        if slot_data is None:
            return False
        return slot_data.get("code") is not None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        slot_data = self.coordinator.get_slot_data(self._slot)
        if slot_data is None:
            return {"slot": self._slot}

        return {
            "slot": self._slot,
            "code_name": slot_data.get("name"),
            "alert_on_use": slot_data.get("alert_on_use", False),
            "expiration": slot_data.get("expiration"),
            "has_code": slot_data.get("code") is not None,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable the code."""
        await self.hass.services.async_call(
            DOMAIN,
            "enable_code",
            {
                "lock_entity_id": self._lock_entity_id,
                "code_slot": self._slot,
            },
            blocking=True,
        )
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable the code."""
        await self.hass.services.async_call(
            DOMAIN,
            "disable_code",
            {
                "lock_entity_id": self._lock_entity_id,
                "code_slot": self._slot,
            },
            blocking=True,
        )
        await self.coordinator.async_request_refresh()
