"""Constants for the Lock Manager integration."""
from datetime import timedelta
from typing import Final

DOMAIN: Final = "lock_manager"

# Platforms
PLATFORMS: Final = ["sensor", "binary_sensor", "switch"]

# Configuration
CONF_LOCK_ENTITY_ID: Final = "lock_entity_id"
CONF_LOCK_NAME: Final = "lock_name"
CONF_SLOTS: Final = "slots"
CONF_NOTIFY_SERVICE: Final = "notify_service"

# Defaults
DEFAULT_SLOTS: Final = 30
DEFAULT_HISTORY_DAYS: Final = 30

# Code slot attributes
ATTR_CODE_SLOT: Final = "code_slot"
ATTR_USER_CODE: Final = "usercode"
ATTR_CODE_NAME: Final = "name"
ATTR_CODE_ENABLED: Final = "enabled"
ATTR_CODE_ALERT: Final = "alert_on_use"
ATTR_CODE_EXPIRATION: Final = "expiration"

# Services
SERVICE_SET_CODE: Final = "set_code"
SERVICE_CLEAR_CODE: Final = "clear_code"
SERVICE_ENABLE_CODE: Final = "enable_code"
SERVICE_DISABLE_CODE: Final = "disable_code"
SERVICE_SET_ALERT: Final = "set_alert"
SERVICE_SET_EXPIRATION: Final = "set_expiration"
SERVICE_REFRESH_CODES: Final = "refresh_codes"

# Events
EVENT_LOCK_CODE_USED: Final = "lock_manager_code_used"
EVENT_CODE_EXPIRED: Final = "lock_manager_code_expired"

# Storage
STORAGE_VERSION: Final = 1
STORAGE_KEY: Final = f"{DOMAIN}.storage"

# Timers
SCAN_INTERVAL: Final = timedelta(minutes=5)
HISTORY_CLEANUP_INTERVAL: Final = timedelta(hours=1)
EXPIRATION_CHECK_INTERVAL: Final = timedelta(minutes=1)
