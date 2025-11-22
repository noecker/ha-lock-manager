"""WebSocket API for Lock Manager."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import CONF_LOCK_ENTITY_ID, DOMAIN
from .store import LockManagerStore

_LOGGER = logging.getLogger(__name__)


async def async_setup_websocket_api(hass: HomeAssistant) -> None:
    """Set up the WebSocket API."""
    websocket_api.async_register_command(hass, ws_get_lock_data)
    websocket_api.async_register_command(hass, ws_get_all_locks)
    websocket_api.async_register_command(hass, ws_get_history)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lock_manager/get_lock_data",
        vol.Required("entity_id"): str,
    }
)
@websocket_api.async_response
async def ws_get_lock_data(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get lock data for a specific lock."""
    entity_id = msg["entity_id"]

    # Find the store for this lock
    store: LockManagerStore | None = None
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if entry_data.get("lock_entity_id") == entity_id:
            store = entry_data["store"]
            break

    if store is None:
        connection.send_error(msg["id"], "not_found", f"Lock {entity_id} not found")
        return

    lock_data = store.get_lock(entity_id)
    if lock_data is None:
        connection.send_error(msg["id"], "not_found", f"Lock {entity_id} not found in store")
        return

    history = store.get_history(lock_entity_id=entity_id, limit=50)

    # Don't send actual codes over WebSocket for security
    sanitized_slots = {}
    for slot_key, slot_data in lock_data["slots"].items():
        sanitized_slots[slot_key] = {
            **slot_data,
            "code": "****" if slot_data["code"] else None,
        }

    response = {
        "lock_data": {
            **lock_data,
            "slots": sanitized_slots,
        },
        "history": history,
    }

    connection.send_result(msg["id"], response)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lock_manager/get_all_locks",
    }
)
@websocket_api.async_response
async def ws_get_all_locks(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get all managed locks."""
    locks = []

    for entry_data in hass.data.get(DOMAIN, {}).values():
        store: LockManagerStore = entry_data.get("store")
        if store is None:
            continue

        entity_id = entry_data.get("lock_entity_id")
        if entity_id is None:
            continue

        lock_data = store.get_lock(entity_id)
        if lock_data is None:
            continue

        # Count active codes
        active_codes = sum(
            1 for slot in lock_data["slots"].values()
            if slot["enabled"] and slot["code"]
        )

        locks.append({
            "entity_id": entity_id,
            "name": lock_data["name"],
            "active_codes": active_codes,
            "total_slots": len(lock_data["slots"]),
        })

    connection.send_result(msg["id"], {"locks": locks})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lock_manager/get_history",
        vol.Optional("entity_id"): str,
        vol.Optional("slot"): int,
        vol.Optional("limit", default=50): int,
    }
)
@websocket_api.async_response
async def ws_get_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Get usage history."""
    entity_id = msg.get("entity_id")
    slot = msg.get("slot")
    limit = msg.get("limit", 50)

    # Find a store (any will do since history is shared)
    store: LockManagerStore | None = None
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if "store" in entry_data:
            store = entry_data["store"]
            break

    if store is None:
        connection.send_result(msg["id"], {"history": []})
        return

    history = store.get_history(
        lock_entity_id=entity_id,
        slot=slot,
        limit=limit,
    )

    connection.send_result(msg["id"], {"history": history})
