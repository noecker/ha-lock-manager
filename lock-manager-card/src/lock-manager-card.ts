import { LitElement, html, css, PropertyValues, TemplateResult, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface CodeSlot {
  slot: number;
  name: string;
  code: string | null;
  enabled: boolean;
  alert_on_use: boolean;
  expiration: string | null;
}

interface LockData {
  entity_id: string;
  name: string;
  slots: { [key: string]: CodeSlot };
  notify_service: string | null;
}

interface HistoryEntry {
  timestamp: string;
  lock_entity_id: string;
  slot: number;
  code_name: string;
  action: string;
}

interface Config {
  type: string;
  entity: string;
  title?: string;
  show_history?: boolean;
  history_limit?: number;
}

interface HomeAssistant {
  states: { [key: string]: { state: string; attributes: { [key: string]: unknown } } };
  callService: (domain: string, service: string, data: object) => Promise<void>;
  callWS: (msg: object) => Promise<unknown>;
  connection: {
    subscribeEvents: (callback: (event: unknown) => void, eventType: string) => Promise<() => void>;
  };
}

declare global {
  interface Window {
    customCards: Array<{ type: string; name: string; description: string }>;
  }
}

@customElement('lock-manager-card')
export class LockManagerCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private _config!: Config;
  @state() private _lockData: LockData | null = null;
  @state() private _history: HistoryEntry[] = [];
  @state() private _editingSlot: number | null = null;
  @state() private _editForm: Partial<CodeSlot> = {};
  @state() private _activeTab: 'codes' | 'history' = 'codes';
  @state() private _showAddModal = false;

  static getConfigElement(): HTMLElement {
    return document.createElement('lock-manager-card-editor');
  }

  static getStubConfig(): Config {
    return {
      type: 'custom:lock-manager-card',
      entity: '',
      show_history: true,
      history_limit: 20,
    };
  }

  setConfig(config: Config): void {
    if (!config.entity) {
      throw new Error('Please define a lock entity');
    }
    this._config = {
      show_history: true,
      history_limit: 20,
      ...config,
    };
  }

  protected async firstUpdated(_changedProperties: PropertyValues): Promise<void> {
    super.firstUpdated(_changedProperties);
    await this._fetchLockData();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('hass') && this.hass) {
      this._fetchLockData();
    }
  }

  private async _fetchLockData(): Promise<void> {
    if (!this.hass || !this._config?.entity) return;

    try {
      const result = await this.hass.callWS({
        type: 'lock_manager/get_lock_data',
        entity_id: this._config.entity,
      }) as { lock_data: LockData; history: HistoryEntry[] };

      this._lockData = result.lock_data;
      this._history = result.history || [];
    } catch {
      // WebSocket API not available, use entity state attributes
      const state = this.hass.states[this._config.entity];
      if (state) {
        // Fallback to basic state
        this._lockData = null;
      }
    }
  }

  private _getSlots(): CodeSlot[] {
    if (!this._lockData) return [];
    return Object.values(this._lockData.slots).sort((a, b) => a.slot - b.slot);
  }

  private _getActiveSlots(): CodeSlot[] {
    return this._getSlots().filter(slot => slot.code !== null);
  }

  private _getEmptySlots(): CodeSlot[] {
    return this._getSlots().filter(slot => slot.code === null);
  }

  private async _setCode(slot: number, data: Partial<CodeSlot>): Promise<void> {
    await this.hass.callService('lock_manager', 'set_code', {
      lock_entity_id: this._config.entity,
      code_slot: slot,
      usercode: data.code,
      name: data.name,
      enabled: data.enabled ?? true,
      alert_on_use: data.alert_on_use ?? false,
      expiration: data.expiration,
    });
    await this._fetchLockData();
  }

  private async _clearCode(slot: number): Promise<void> {
    await this.hass.callService('lock_manager', 'clear_code', {
      lock_entity_id: this._config.entity,
      code_slot: slot,
    });
    await this._fetchLockData();
  }

  private async _toggleEnabled(slot: CodeSlot): Promise<void> {
    const service = slot.enabled ? 'disable_code' : 'enable_code';
    await this.hass.callService('lock_manager', service, {
      lock_entity_id: this._config.entity,
      code_slot: slot.slot,
    });
    await this._fetchLockData();
  }

  private async _toggleAlert(slot: CodeSlot): Promise<void> {
    await this.hass.callService('lock_manager', 'set_alert', {
      lock_entity_id: this._config.entity,
      code_slot: slot.slot,
      alert_on_use: !slot.alert_on_use,
    });
    await this._fetchLockData();
  }

  private _startEdit(slot: CodeSlot): void {
    this._editingSlot = slot.slot;
    this._editForm = { ...slot };
  }

  private _cancelEdit(): void {
    this._editingSlot = null;
    this._editForm = {};
  }

  private async _saveEdit(): Promise<void> {
    if (this._editingSlot === null) return;
    await this._setCode(this._editingSlot, this._editForm);
    this._cancelEdit();
  }

  private _startAdd(): void {
    const emptySlots = this._getEmptySlots();
    if (emptySlots.length === 0) return;

    this._showAddModal = true;
    this._editForm = {
      slot: emptySlots[0].slot,
      name: '',
      code: '',
      enabled: true,
      alert_on_use: false,
      expiration: null,
    };
  }

  private async _saveAdd(): Promise<void> {
    if (!this._editForm.slot || !this._editForm.code) return;
    await this._setCode(this._editForm.slot, this._editForm);
    this._showAddModal = false;
    this._editForm = {};
  }

  private _cancelAdd(): void {
    this._showAddModal = false;
    this._editForm = {};
  }

  private _formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString();
  }

  private _isExpired(slot: CodeSlot): boolean {
    if (!slot.expiration) return false;
    return new Date(slot.expiration) <= new Date();
  }

  private _getExpirationStatus(slot: CodeSlot): string {
    if (!slot.expiration) return '';
    const exp = new Date(slot.expiration);
    const now = new Date();
    if (exp <= now) return 'Expired';

    const diff = exp.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Expires in ${days}d`;
    if (hours > 0) return `Expires in ${hours}h`;
    return 'Expires soon';
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    const lockState = this.hass.states[this._config.entity];
    const lockName = this._config.title || this._lockData?.name || this._config.entity;

    return html`
      <ha-card>
        <div class="card-header">
          <div class="header-content">
            <ha-icon icon="mdi:lock"></ha-icon>
            <span class="title">${lockName}</span>
            <span class="lock-state ${lockState?.state}">${lockState?.state || 'unknown'}</span>
          </div>
        </div>

        <div class="tabs">
          <button
            class="tab ${this._activeTab === 'codes' ? 'active' : ''}"
            @click=${() => this._activeTab = 'codes'}
          >
            <ha-icon icon="mdi:key-variant"></ha-icon>
            Codes
          </button>
          ${this._config.show_history ? html`
            <button
              class="tab ${this._activeTab === 'history' ? 'active' : ''}"
              @click=${() => this._activeTab = 'history'}
            >
              <ha-icon icon="mdi:history"></ha-icon>
              History
            </button>
          ` : ''}
        </div>

        <div class="card-content">
          ${this._activeTab === 'codes' ? this._renderCodes() : this._renderHistory()}
        </div>

        ${this._showAddModal ? this._renderAddModal() : ''}
      </ha-card>
    `;
  }

  private _renderCodes(): TemplateResult {
    const activeSlots = this._getActiveSlots();
    const emptySlots = this._getEmptySlots();

    return html`
      <div class="codes-section">
        <div class="section-header">
          <span>Active Codes (${activeSlots.length})</span>
          <button class="add-btn" @click=${this._startAdd} ?disabled=${emptySlots.length === 0}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Code
          </button>
        </div>

        ${activeSlots.length === 0 ? html`
          <div class="empty-state">
            <ha-icon icon="mdi:key-plus"></ha-icon>
            <p>No codes configured</p>
            <button class="primary-btn" @click=${this._startAdd}>Add your first code</button>
          </div>
        ` : html`
          <div class="code-list">
            ${activeSlots.map(slot => this._renderCodeSlot(slot))}
          </div>
        `}
      </div>
    `;
  }

  private _renderCodeSlot(slot: CodeSlot): TemplateResult {
    const isEditing = this._editingSlot === slot.slot;
    const isExpired = this._isExpired(slot);
    const expirationStatus = this._getExpirationStatus(slot);

    if (isEditing) {
      return this._renderEditForm(slot);
    }

    return html`
      <div class="code-item ${slot.enabled ? 'enabled' : 'disabled'} ${isExpired ? 'expired' : ''}">
        <div class="code-main">
          <div class="code-info">
            <span class="code-name">${slot.name}</span>
            <span class="code-slot">Slot ${slot.slot}</span>
            ${expirationStatus ? html`<span class="code-expiration ${isExpired ? 'expired' : ''}">${expirationStatus}</span>` : ''}
          </div>
          <div class="code-badges">
            ${slot.alert_on_use ? html`<span class="badge alert" title="Alerts enabled"><ha-icon icon="mdi:bell"></ha-icon></span>` : ''}
            ${slot.expiration ? html`<span class="badge temp" title="Temporary code"><ha-icon icon="mdi:clock-outline"></ha-icon></span>` : ''}
          </div>
        </div>
        <div class="code-actions">
          <button
            class="icon-btn ${slot.enabled ? 'on' : 'off'}"
            @click=${() => this._toggleEnabled(slot)}
            title="${slot.enabled ? 'Disable code' : 'Enable code'}"
          >
            <ha-icon icon="${slot.enabled ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'}"></ha-icon>
          </button>
          <button
            class="icon-btn ${slot.alert_on_use ? 'on' : ''}"
            @click=${() => this._toggleAlert(slot)}
            title="${slot.alert_on_use ? 'Disable alerts' : 'Enable alerts'}"
          >
            <ha-icon icon="${slot.alert_on_use ? 'mdi:bell' : 'mdi:bell-outline'}"></ha-icon>
          </button>
          <button class="icon-btn" @click=${() => this._startEdit(slot)} title="Edit code">
            <ha-icon icon="mdi:pencil"></ha-icon>
          </button>
          <button class="icon-btn danger" @click=${() => this._clearCode(slot.slot)} title="Delete code">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _renderEditForm(slot: CodeSlot): TemplateResult {
    return html`
      <div class="code-item editing">
        <div class="edit-form">
          <div class="form-row">
            <label>Name</label>
            <input
              type="text"
              .value=${this._editForm.name || ''}
              @input=${(e: InputEvent) => this._editForm = { ...this._editForm, name: (e.target as HTMLInputElement).value }}
            />
          </div>
          <div class="form-row">
            <label>Code</label>
            <input
              type="password"
              .value=${this._editForm.code || ''}
              @input=${(e: InputEvent) => this._editForm = { ...this._editForm, code: (e.target as HTMLInputElement).value }}
            />
          </div>
          <div class="form-row">
            <label>Expiration (optional)</label>
            <input
              type="datetime-local"
              .value=${this._editForm.expiration?.slice(0, 16) || ''}
              @input=${(e: InputEvent) => this._editForm = { ...this._editForm, expiration: (e.target as HTMLInputElement).value || null }}
            />
          </div>
          <div class="form-row checkbox">
            <label>
              <input
                type="checkbox"
                .checked=${this._editForm.alert_on_use || false}
                @change=${(e: Event) => this._editForm = { ...this._editForm, alert_on_use: (e.target as HTMLInputElement).checked }}
              />
              Alert when used
            </label>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click=${this._cancelEdit}>Cancel</button>
            <button class="save-btn" @click=${this._saveEdit}>Save</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderAddModal(): TemplateResult {
    const emptySlots = this._getEmptySlots();

    return html`
      <div class="modal-overlay" @click=${this._cancelAdd}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>Add New Code</h3>
            <button class="close-btn" @click=${this._cancelAdd}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <label>Slot</label>
              <select @change=${(e: Event) => this._editForm = { ...this._editForm, slot: parseInt((e.target as HTMLSelectElement).value) }}>
                ${emptySlots.map(s => html`<option value=${s.slot}>Slot ${s.slot}</option>`)}
              </select>
            </div>
            <div class="form-row">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g., Front Door Guest"
                .value=${this._editForm.name || ''}
                @input=${(e: InputEvent) => this._editForm = { ...this._editForm, name: (e.target as HTMLInputElement).value }}
              />
            </div>
            <div class="form-row">
              <label>Code (PIN)</label>
              <input
                type="password"
                placeholder="4-8 digits"
                .value=${this._editForm.code || ''}
                @input=${(e: InputEvent) => this._editForm = { ...this._editForm, code: (e.target as HTMLInputElement).value }}
              />
            </div>
            <div class="form-row">
              <label>Expiration (optional)</label>
              <input
                type="datetime-local"
                .value=${this._editForm.expiration || ''}
                @input=${(e: InputEvent) => this._editForm = { ...this._editForm, expiration: (e.target as HTMLInputElement).value || null }}
              />
            </div>
            <div class="form-row checkbox">
              <label>
                <input
                  type="checkbox"
                  .checked=${this._editForm.alert_on_use || false}
                  @change=${(e: Event) => this._editForm = { ...this._editForm, alert_on_use: (e.target as HTMLInputElement).checked }}
                />
                Alert when this code is used
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click=${this._cancelAdd}>Cancel</button>
            <button class="save-btn" @click=${this._saveAdd} ?disabled=${!this._editForm.code || !this._editForm.name}>
              Add Code
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderHistory(): TemplateResult {
    const limit = this._config.history_limit || 20;
    const history = this._history.slice(0, limit);

    return html`
      <div class="history-section">
        ${history.length === 0 ? html`
          <div class="empty-state">
            <ha-icon icon="mdi:history"></ha-icon>
            <p>No usage history yet</p>
          </div>
        ` : html`
          <div class="history-list">
            ${history.map(entry => html`
              <div class="history-item">
                <div class="history-icon ${entry.action}">
                  <ha-icon icon="${entry.action === 'unlock' ? 'mdi:lock-open' : 'mdi:lock'}"></ha-icon>
                </div>
                <div class="history-info">
                  <span class="history-name">${entry.code_name}</span>
                  <span class="history-action">${entry.action}</span>
                </div>
                <div class="history-time">${this._formatDate(entry.timestamp)}</div>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --primary-color: var(--ha-primary-color, #03a9f4);
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --danger-color: #f44336;
        --disabled-color: #9e9e9e;
      }

      ha-card {
        overflow: hidden;
      }

      .card-header {
        padding: 16px;
        background: var(--primary-color);
        color: white;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-content ha-icon {
        --mdc-icon-size: 24px;
      }

      .title {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
      }

      .lock-state {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.2);
      }

      .lock-state.locked {
        background: var(--success-color);
      }

      .lock-state.unlocked {
        background: var(--warning-color);
      }

      .tabs {
        display: flex;
        border-bottom: 1px solid var(--divider-color);
      }

      .tab {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border: none;
        background: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        font-size: 14px;
        transition: all 0.2s;
      }

      .tab:hover {
        background: var(--secondary-background-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom: 2px solid var(--primary-color);
      }

      .tab ha-icon {
        --mdc-icon-size: 18px;
      }

      .card-content {
        padding: 16px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-header span {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border: none;
        border-radius: 20px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;
      }

      .add-btn:hover {
        opacity: 0.9;
      }

      .add-btn:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      .add-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        --mdc-icon-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0 0 16px 0;
      }

      .primary-btn {
        padding: 10px 24px;
        border: none;
        border-radius: 20px;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        font-size: 14px;
      }

      .code-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .code-item {
        display: flex;
        flex-direction: column;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        transition: all 0.2s;
      }

      .code-item.disabled {
        opacity: 0.6;
      }

      .code-item.expired {
        border-left: 3px solid var(--danger-color);
      }

      .code-item.editing {
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
      }

      .code-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .code-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .code-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .code-slot {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .code-expiration {
        font-size: 12px;
        color: var(--warning-color);
      }

      .code-expiration.expired {
        color: var(--danger-color);
      }

      .code-badges {
        display: flex;
        gap: 4px;
      }

      .badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--secondary-background-color);
      }

      .badge ha-icon {
        --mdc-icon-size: 14px;
      }

      .badge.alert {
        color: var(--warning-color);
      }

      .badge.temp {
        color: var(--primary-color);
      }

      .code-actions {
        display: flex;
        gap: 4px;
        justify-content: flex-end;
      }

      .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s;
      }

      .icon-btn:hover {
        background: var(--divider-color);
      }

      .icon-btn.on {
        color: var(--primary-color);
      }

      .icon-btn.off {
        color: var(--disabled-color);
      }

      .icon-btn.danger:hover {
        background: var(--danger-color);
        color: white;
      }

      .icon-btn ha-icon {
        --mdc-icon-size: 20px;
      }

      .edit-form {
        width: 100%;
      }

      .form-row {
        margin-bottom: 12px;
      }

      .form-row label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .form-row input[type="text"],
      .form-row input[type="password"],
      .form-row input[type="datetime-local"],
      .form-row select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-row.checkbox label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .form-row.checkbox input {
        width: auto;
      }

      .form-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .cancel-btn, .save-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .cancel-btn {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }

      .save-btn {
        background: var(--primary-color);
        color: white;
      }

      .save-btn:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal {
        width: 90%;
        max-width: 400px;
        background: var(--card-background-color);
        border-radius: 12px;
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .modal-header h3 {
        margin: 0;
        font-size: 18px;
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: transparent;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .close-btn:hover {
        background: var(--secondary-background-color);
      }

      .modal-body {
        padding: 16px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .history-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
      }

      .history-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-background-color);
      }

      .history-icon.unlock {
        color: var(--success-color);
      }

      .history-icon.lock {
        color: var(--primary-color);
      }

      .history-icon ha-icon {
        --mdc-icon-size: 20px;
      }

      .history-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .history-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .history-action {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: capitalize;
      }

      .history-time {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'lock-manager-card',
  name: 'Lock Manager Card',
  description: 'A card for managing Z-Wave lock codes',
});
