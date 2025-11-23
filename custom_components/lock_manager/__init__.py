"""The Lock Manager integration."""
from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

# Frontend card paths
CARD_URL_PATH = "/lock_manager/lock-manager-card.js"

from .const import (
    ATTR_CODE_ALERT,
    ATTR_CODE_ENABLED,
    ATTR_CODE_EXPIRATION,
    ATTR_CODE_NAME,
    ATTR_CODE_SLOT,
    ATTR_USER_CODE,
    CONF_LOCK_ENTITY_ID,
    CONF_LOCK_NAME,
    CONF_NOTIFY_SERVICE,
    CONF_SLOTS,
    DEFAULT_SLOTS,
    DOMAIN,
    EVENT_CODE_EXPIRED,
    EVENT_LOCK_CODE_USED,
    EXPIRATION_CHECK_INTERVAL,
    HISTORY_CLEANUP_INTERVAL,
    SERVICE_CLEAR_CODE,
    SERVICE_DISABLE_CODE,
    SERVICE_ENABLE_CODE,
    SERVICE_REFRESH_CODES,
    SERVICE_SET_ALERT,
    SERVICE_SET_CODE,
    SERVICE_SET_EXPIRATION,
)
from .coordinator import LockManagerCoordinator
from .store import LockManagerStore
from .websocket_api import async_setup_websocket_api

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.SWITCH]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Lock Manager component."""
    # Register the frontend card
    await _async_register_card(hass)
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    """Register the Lovelace card as a static resource."""
    # Path to the card JS file
    card_path = Path(__file__).parent / "www" / "lock-manager-card.js"

    if card_path.exists():
        # Register static path
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_URL_PATH, str(card_path), cache_headers=True)]
        )
        # Add as extra JS module for Lovelace
        add_extra_js_url(hass, CARD_URL_PATH)
        _LOGGER.debug("Registered Lock Manager card at %s", CARD_URL_PATH)
    else:
        _LOGGER.warning("Lock Manager card not found at %s", card_path)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Lock Manager from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Ensure card is registered
    await _async_register_card(hass)

    # Initialize store
    store = LockManagerStore(hass)
    await store.async_load()

    # Get config values
    lock_entity_id = entry.data[CONF_LOCK_ENTITY_ID]
    lock_name = entry.data[CONF_LOCK_NAME]
    num_slots = entry.data.get(CONF_SLOTS, DEFAULT_SLOTS)
    notify_service = entry.data.get(CONF_NOTIFY_SERVICE)

    # Add lock to store if not exists
    if store.get_lock(lock_entity_id) is None:
        await store.async_add_lock(
            lock_entity_id, lock_name, num_slots, notify_service
        )

    # Create coordinator
    coordinator = LockManagerCoordinator(hass, store, lock_entity_id)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        "store": store,
        "coordinator": coordinator,
        "lock_entity_id": lock_entity_id,
    }

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register services (only once)
    await _async_setup_services(hass, store)

    # Set up WebSocket API
    await async_setup_websocket_api(hass)

    # Set up event listener for lock events
    _setup_lock_event_listener(hass, store, lock_entity_id)

    # Set up background tasks
    _setup_background_tasks(hass, store)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok


async def _async_setup_services(hass: HomeAssistant, store: LockManagerStore) -> None:
    """Set up services for Lock Manager."""
    if hass.services.has_service(DOMAIN, SERVICE_SET_CODE):
        return  # Services already registered

    async def handle_set_code(call: ServiceCall) -> None:
        """Handle set_code service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]
        code = call.data[ATTR_USER_CODE]
        name = call.data.get(ATTR_CODE_NAME, f"Code {slot}")
        enabled = call.data.get(ATTR_CODE_ENABLED, True)
        alert = call.data.get(ATTR_CODE_ALERT, False)
        expiration = call.data.get(ATTR_CODE_EXPIRATION)

        # Update store
        await store.async_update_slot(
            entity_id,
            slot,
            name=name,
            code=code,
            enabled=enabled,
            alert_on_use=alert,
            expiration=expiration,
        )

        # Send code to lock via Z-Wave JS
        if enabled:
            await hass.services.async_call(
                "zwave_js",
                "set_lock_usercode",
                {
                    "entity_id": entity_id,
                    "code_slot": slot,
                    "usercode": code,
                },
                blocking=True,
            )
        else:
            await hass.services.async_call(
                "zwave_js",
                "clear_lock_usercode",
                {
                    "entity_id": entity_id,
                    "code_slot": slot,
                },
                blocking=True,
            )

        _LOGGER.info("Set code slot %d on %s", slot, entity_id)

    async def handle_clear_code(call: ServiceCall) -> None:
        """Handle clear_code service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]

        # Clear from store
        await store.async_clear_slot(entity_id, slot)

        # Clear from lock
        await hass.services.async_call(
            "zwave_js",
            "clear_lock_usercode",
            {
                "entity_id": entity_id,
                "code_slot": slot,
            },
            blocking=True,
        )

        _LOGGER.info("Cleared code slot %d on %s", slot, entity_id)

    async def handle_enable_code(call: ServiceCall) -> None:
        """Handle enable_code service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]

        slot_data = store.get_slot(entity_id, slot)
        if slot_data is None or slot_data["code"] is None:
            _LOGGER.error("Cannot enable slot %d - no code set", slot)
            return

        await store.async_update_slot(entity_id, slot, enabled=True)

        # Set code on lock
        await hass.services.async_call(
            "zwave_js",
            "set_lock_usercode",
            {
                "entity_id": entity_id,
                "code_slot": slot,
                "usercode": slot_data["code"],
            },
            blocking=True,
        )

        _LOGGER.info("Enabled code slot %d on %s", slot, entity_id)

    async def handle_disable_code(call: ServiceCall) -> None:
        """Handle disable_code service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]

        await store.async_update_slot(entity_id, slot, enabled=False)

        # Clear from lock (but keep in store)
        await hass.services.async_call(
            "zwave_js",
            "clear_lock_usercode",
            {
                "entity_id": entity_id,
                "code_slot": slot,
            },
            blocking=True,
        )

        _LOGGER.info("Disabled code slot %d on %s", slot, entity_id)

    async def handle_set_alert(call: ServiceCall) -> None:
        """Handle set_alert service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]
        alert = call.data[ATTR_CODE_ALERT]

        await store.async_update_slot(entity_id, slot, alert_on_use=alert)
        _LOGGER.info("Set alert=%s for slot %d on %s", alert, slot, entity_id)

    async def handle_set_expiration(call: ServiceCall) -> None:
        """Handle set_expiration service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]
        slot = call.data[ATTR_CODE_SLOT]
        expiration = call.data.get(ATTR_CODE_EXPIRATION)

        await store.async_update_slot(entity_id, slot, expiration=expiration)
        _LOGGER.info("Set expiration=%s for slot %d on %s", expiration, slot, entity_id)

    async def handle_refresh_codes(call: ServiceCall) -> None:
        """Handle refresh_codes service call."""
        entity_id = call.data[CONF_LOCK_ENTITY_ID]

        # Find coordinator for this lock
        for entry_data in hass.data[DOMAIN].values():
            if entry_data.get("lock_entity_id") == entity_id:
                coordinator = entry_data["coordinator"]
                await coordinator.async_refresh()
                break

        _LOGGER.info("Refreshed codes for %s", entity_id)

    # Register services
    hass.services.async_register(DOMAIN, SERVICE_SET_CODE, handle_set_code)
    hass.services.async_register(DOMAIN, SERVICE_CLEAR_CODE, handle_clear_code)
    hass.services.async_register(DOMAIN, SERVICE_ENABLE_CODE, handle_enable_code)
    hass.services.async_register(DOMAIN, SERVICE_DISABLE_CODE, handle_disable_code)
    hass.services.async_register(DOMAIN, SERVICE_SET_ALERT, handle_set_alert)
    hass.services.async_register(DOMAIN, SERVICE_SET_EXPIRATION, handle_set_expiration)
    hass.services.async_register(DOMAIN, SERVICE_REFRESH_CODES, handle_refresh_codes)


def _setup_lock_event_listener(
    hass: HomeAssistant, store: LockManagerStore, lock_entity_id: str
) -> None:
    """Set up listener for Z-Wave lock events."""

    @callback
    def handle_zwave_notification(event: Event) -> None:
        """Handle Z-Wave notification events from locks."""
        event_data = event.data

        # Check if this is a lock notification
        if event_data.get("domain") != "zwave_js":
            return

        # Check if it's for our lock
        device_id = event_data.get("device_id")
        if device_id is None:
            return

        # Get node info
        node_id = event_data.get("node_id")
        command_class = event_data.get("command_class")

        # Lock notifications typically come from Notification CC (0x71) or
        # Door Lock CC (0x62)
        if command_class not in (98, 113):  # 0x62, 0x71
            return

        event_type = event_data.get("event_type")
        event_type_label = event_data.get("event_type_label", "")
        parameters = event_data.get("parameters", {})

        # Check for lock/unlock events with user codes
        user_id = parameters.get("userId")
        if user_id is None:
            return

        # Determine action
        action = "unknown"
        if "lock" in event_type_label.lower():
            if "unlock" in event_type_label.lower():
                action = "unlock"
            else:
                action = "lock"

        # Get slot data
        slot_data = store.get_slot(lock_entity_id, user_id)
        code_name = slot_data["name"] if slot_data else f"Code {user_id}"

        # Log to history
        hass.async_create_task(
            store.async_add_history_entry(
                lock_entity_id, user_id, code_name, action
            )
        )

        # Fire event
        hass.bus.async_fire(
            EVENT_LOCK_CODE_USED,
            {
                "lock_entity_id": lock_entity_id,
                "slot": user_id,
                "code_name": code_name,
                "action": action,
            },
        )

        # Send notification if alert is enabled
        if slot_data and slot_data.get("alert_on_use"):
            lock_data = store.get_lock(lock_entity_id)
            if lock_data and lock_data.get("notify_service"):
                hass.async_create_task(
                    _send_notification(
                        hass,
                        lock_data["notify_service"],
                        f"Lock Code Used: {code_name}",
                        f"{code_name} was used to {action} {lock_data['name']}",
                    )
                )

    # Listen for Z-Wave JS events
    hass.bus.async_listen("zwave_js_notification", handle_zwave_notification)


def _setup_background_tasks(hass: HomeAssistant, store: LockManagerStore) -> None:
    """Set up background tasks for cleanup and expiration checks."""

    async def cleanup_history(_: datetime) -> None:
        """Clean up old history entries."""
        await store.async_cleanup_history()

    async def check_expired_codes(_: datetime) -> None:
        """Check for and disable expired codes."""
        expired = await store.async_get_expired_codes()

        for entity_id, slot, slot_data in expired:
            _LOGGER.info(
                "Code '%s' (slot %d) on %s has expired, disabling",
                slot_data["name"],
                slot,
                entity_id,
            )

            # Disable the code
            await store.async_update_slot(entity_id, slot, enabled=False)

            # Clear from lock
            await hass.services.async_call(
                "zwave_js",
                "clear_lock_usercode",
                {
                    "entity_id": entity_id,
                    "code_slot": slot,
                },
                blocking=True,
            )

            # Fire event
            hass.bus.async_fire(
                EVENT_CODE_EXPIRED,
                {
                    "lock_entity_id": entity_id,
                    "slot": slot,
                    "code_name": slot_data["name"],
                },
            )

            # Send notification
            lock_data = store.get_lock(entity_id)
            if lock_data and lock_data.get("notify_service"):
                await _send_notification(
                    hass,
                    lock_data["notify_service"],
                    f"Lock Code Expired: {slot_data['name']}",
                    f"The temporary code '{slot_data['name']}' on {lock_data['name']} has expired and been disabled.",
                )

    # Schedule background tasks
    async_track_time_interval(hass, cleanup_history, HISTORY_CLEANUP_INTERVAL)
    async_track_time_interval(hass, check_expired_codes, EXPIRATION_CHECK_INTERVAL)


async def _send_notification(
    hass: HomeAssistant,
    notify_service: str,
    title: str,
    message: str,
) -> None:
    """Send a notification."""
    try:
        await hass.services.async_call(
            "notify",
            notify_service,
            {
                "title": title,
                "message": message,
            },
            blocking=True,
        )
    except Exception as ex:
        _LOGGER.error("Failed to send notification: %s", ex)
