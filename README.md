# Lock Manager for Home Assistant

> **Disclaimer:** This integration was built entirely by AI (Claude). If that bothers you, this isn't the project for you. No hard feelings.

A Home Assistant custom integration for managing Z-Wave lock codes, specifically designed for Schlage Z-Wave locks. Includes a custom Lovelace card for easy code management.

## Features

- **Code Management**: Add, edit, and remove lock codes through a user-friendly interface
- **Enable/Disable Codes**: Temporarily disable codes without deleting them
- **Usage Alerts**: Get mobile notifications when specific codes are used
- **Temporary Codes**: Set expiration dates for guest codes that auto-disable
- **Usage History**: Track which codes were used and when (30-day retention)
- **Custom Lovelace Card**: Beautiful card for managing all your lock codes

## Requirements

- Home Assistant 2024.1.0 or newer
- Z-Wave JS integration configured with at least one lock
- HACS (Home Assistant Community Store) for easy installation

## Installation

### HACS Installation (Recommended)

1. Open HACS in Home Assistant
2. Click on "Integrations"
3. Click the three dots in the top right corner and select "Custom repositories"
4. Add this repository URL and select "Integration" as the category
5. Click "Add"
6. Search for "Lock Manager" and install it
7. Restart Home Assistant

### Manual Installation

1. Download the latest release from GitHub
2. Copy the `custom_components/lock_manager` folder to your Home Assistant `config/custom_components/` directory
3. Restart Home Assistant

## Configuration

### Adding a Lock

1. Go to **Settings** > **Devices & Services**
2. Click **+ Add Integration**
3. Search for "Lock Manager"
4. Select your Z-Wave lock from the dropdown
5. Enter a friendly name for the lock
6. Optionally configure the number of code slots (default: 30)
7. Optionally enter your notification service name (e.g., `mobile_app_your_phone`)

### Adding the Lovelace Card

The Lovelace card is **automatically registered** when you install the integration. No manual resource configuration needed!

Add the card to your dashboard:
   ```yaml
   type: custom:lock-manager-card
   entity: lock.front_door_lock
   title: Front Door
   show_history: true
   history_limit: 20
   ```

## Card Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | *required* | The lock entity ID |
| `title` | string | Lock name | Card title |
| `show_history` | boolean | `true` | Show usage history tab |
| `history_limit` | number | `20` | Number of history entries to show |

## Services

The integration provides the following services:

### `lock_manager.set_code`
Set or update a code in a lock slot.

```yaml
service: lock_manager.set_code
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
  usercode: "1234"
  name: "Family Code"
  enabled: true
  alert_on_use: false
  expiration: "2024-12-31T23:59:59"  # Optional
```

### `lock_manager.clear_code`
Remove a code from a lock slot.

```yaml
service: lock_manager.clear_code
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
```

### `lock_manager.enable_code`
Enable a previously disabled code.

```yaml
service: lock_manager.enable_code
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
```

### `lock_manager.disable_code`
Disable a code without deleting it.

```yaml
service: lock_manager.disable_code
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
```

### `lock_manager.set_alert`
Enable or disable usage alerts for a code.

```yaml
service: lock_manager.set_alert
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
  alert_on_use: true
```

### `lock_manager.set_expiration`
Set or clear expiration for a temporary code.

```yaml
service: lock_manager.set_expiration
data:
  lock_entity_id: lock.front_door_lock
  code_slot: 1
  expiration: "2024-12-31T23:59:59"  # Or omit to clear
```

## Entities

For each managed lock, the integration creates:

### Sensors
- **Active Codes**: Number of currently enabled codes
- **Last Code Used**: Name of the most recently used code

### Switches
- **Code X Enabled**: One switch per code slot to quickly enable/disable codes

## Events

The integration fires the following events:

### `lock_manager_code_used`
Fired when a code is used to lock/unlock.

```yaml
event_type: lock_manager_code_used
data:
  lock_entity_id: lock.front_door_lock
  slot: 1
  code_name: "Family Code"
  action: "unlock"
```

### `lock_manager_code_expired`
Fired when a temporary code expires.

```yaml
event_type: lock_manager_code_expired
data:
  lock_entity_id: lock.front_door_lock
  slot: 5
  code_name: "Guest Code"
```

## Automations

### Example: Welcome notification when family arrives

```yaml
automation:
  - alias: "Welcome home notification"
    trigger:
      - platform: event
        event_type: lock_manager_code_used
        event_data:
          action: unlock
    condition:
      - condition: template
        value_template: "{{ trigger.event.data.code_name in ['Dad', 'Mom', 'Kids'] }}"
    action:
      - service: notify.mobile_app_phone
        data:
          title: "Welcome Home!"
          message: "{{ trigger.event.data.code_name }} just arrived."
```

### Example: Alert on unknown code usage

```yaml
automation:
  - alias: "Unknown code alert"
    trigger:
      - platform: event
        event_type: lock_manager_code_used
    condition:
      - condition: template
        value_template: "{{ 'Code ' in trigger.event.data.code_name }}"
    action:
      - service: notify.mobile_app_phone
        data:
          title: "Unknown Code Used!"
          message: "Slot {{ trigger.event.data.slot }} was used at {{ now().strftime('%H:%M') }}"
```

## Troubleshooting

### Codes not syncing to lock
- Ensure Z-Wave JS is properly configured
- Check Home Assistant logs for error messages
- Try using the `lock_manager.refresh_codes` service

### Notifications not working
- Verify your notification service name in the integration options
- Test the notification service directly first
- Check that the notification service exists: `notify.your_service_name`

### Card not loading
- Clear browser cache
- Verify the card resource is properly added
- Check browser console for JavaScript errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
