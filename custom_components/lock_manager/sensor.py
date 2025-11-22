"""Sensor platform for Lock Manager."""
from __future__ import annotations

from homeassistant.components.sensor import (
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_LOCK_ENTITY_ID, CONF_LOCK_NAME, DOMAIN
from .coordinator import LockManagerCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Lock Manager sensors."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: LockManagerCoordinator = data["coordinator"]
    lock_entity_id = data["lock_entity_id"]
    lock_name = entry.data[CONF_LOCK_NAME]

    entities = [
        ActiveCodesSensor(coordinator, lock_entity_id, lock_name, entry.entry_id),
        LastCodeUsedSensor(coordinator, lock_entity_id, lock_name, entry.entry_id),
    ]

    async_add_entities(entities)


class LockManagerSensorBase(CoordinatorEntity[LockManagerCoordinator], SensorEntity):
    """Base class for Lock Manager sensors."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: LockManagerCoordinator,
        lock_entity_id: str,
        lock_name: str,
        entry_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._lock_entity_id = lock_entity_id
        self._lock_name = lock_name
        self._entry_id = entry_id

    @property
    def device_info(self) -> DeviceInfo:
        """Return device info."""
        return DeviceInfo(
            identifiers={(DOMAIN, self._lock_entity_id)},
            name=f"{self._lock_name} Lock Manager",
            manufacturer="Lock Manager",
            model="Virtual",
            via_device=(DOMAIN, self._lock_entity_id),
        )


class ActiveCodesSensor(LockManagerSensorBase):
    """Sensor showing number of active codes."""

    _attr_icon = "mdi:key-variant"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        coordinator: LockManagerCoordinator,
        lock_entity_id: str,
        lock_name: str,
        entry_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, lock_entity_id, lock_name, entry_id)
        self._attr_unique_id = f"{lock_entity_id}_active_codes"
        self._attr_name = "Active Codes"

    @property
    def native_value(self) -> int:
        """Return the number of active codes."""
        if self.coordinator.data is None:
            return 0
        return self.coordinator.data.get("active_codes", 0)

    @property
    def extra_state_attributes(self) -> dict:
        """Return extra state attributes."""
        if self.coordinator.data is None:
            return {}

        return {
            "total_slots": self.coordinator.data.get("total_slots", 0),
            "alert_codes": self.coordinator.data.get("alert_codes", 0),
        }


class LastCodeUsedSensor(LockManagerSensorBase):
    """Sensor showing last code used."""

    _attr_icon = "mdi:history"

    def __init__(
        self,
        coordinator: LockManagerCoordinator,
        lock_entity_id: str,
        lock_name: str,
        entry_id: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator, lock_entity_id, lock_name, entry_id)
        self._attr_unique_id = f"{lock_entity_id}_last_code_used"
        self._attr_name = "Last Code Used"

    @property
    def native_value(self) -> str | None:
        """Return the last code used."""
        if self.coordinator.data is None:
            return None

        history = self.coordinator.data.get("history", [])
        if not history:
            return None

        return history[0].get("code_name")

    @property
    def extra_state_attributes(self) -> dict:
        """Return extra state attributes."""
        if self.coordinator.data is None:
            return {}

        history = self.coordinator.data.get("history", [])
        if not history:
            return {}

        last = history[0]
        return {
            "timestamp": last.get("timestamp"),
            "action": last.get("action"),
            "slot": last.get("slot"),
        }
