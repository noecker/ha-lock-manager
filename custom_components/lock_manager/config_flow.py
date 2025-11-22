"""Config flow for Lock Manager integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.components.lock import DOMAIN as LOCK_DOMAIN
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
    TextSelectorConfig,
)

from .const import (
    CONF_LOCK_ENTITY_ID,
    CONF_LOCK_NAME,
    CONF_NOTIFY_SERVICE,
    CONF_SLOTS,
    DEFAULT_SLOTS,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


def get_zwave_locks(hass: HomeAssistant) -> dict[str, str]:
    """Get available Z-Wave lock entities."""
    entity_reg = er.async_get(hass)
    locks: dict[str, str] = {}

    for entity in entity_reg.entities.values():
        if entity.domain == LOCK_DOMAIN and entity.platform == "zwave_js":
            name = entity.name or entity.original_name or entity.entity_id
            locks[entity.entity_id] = name

    return locks


class LockManagerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Lock Manager."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            entity_id = user_input[CONF_LOCK_ENTITY_ID]

            # Check if already configured
            await self.async_set_unique_id(entity_id)
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=user_input[CONF_LOCK_NAME],
                data=user_input,
            )

        # Get available Z-Wave locks
        zwave_locks = get_zwave_locks(self.hass)

        if not zwave_locks:
            return self.async_abort(reason="no_zwave_locks")

        # Build schema
        data_schema = vol.Schema(
            {
                vol.Required(CONF_LOCK_ENTITY_ID): EntitySelector(
                    EntitySelectorConfig(
                        domain=LOCK_DOMAIN,
                        integration="zwave_js",
                    )
                ),
                vol.Required(CONF_LOCK_NAME): TextSelector(
                    TextSelectorConfig(type="text")
                ),
                vol.Optional(CONF_SLOTS, default=DEFAULT_SLOTS): NumberSelector(
                    NumberSelectorConfig(
                        min=1,
                        max=100,
                        step=1,
                        mode=NumberSelectorMode.BOX,
                    )
                ),
                vol.Optional(CONF_NOTIFY_SERVICE): TextSelector(
                    TextSelectorConfig(
                        type="text",
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={
                "lock_count": str(len(zwave_locks)),
            },
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""
        return LockManagerOptionsFlowHandler(config_entry)


class LockManagerOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for Lock Manager."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_NOTIFY_SERVICE,
                        default=self.config_entry.data.get(CONF_NOTIFY_SERVICE, ""),
                    ): TextSelector(
                        TextSelectorConfig(type="text")
                    ),
                }
            ),
        )
