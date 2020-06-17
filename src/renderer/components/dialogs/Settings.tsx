import React, { useState, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { C } from 'deltachat-node/dist/constants'
import {
  Elevation,
  H5,
  H6,
  Card,
  Classes,
  Button,
  Switch,
  Label,
  RadioGroup,
  Radio,
  HTMLSelect,
  Callout,
} from '@blueprintjs/core'

import LoginForm from '../LoginForm'
import { confirmationDialogLegacy as confirmationDialog } from './ConfirmationDialog'
import { ThemeManager } from '../../ThemeManager'
const { remote } = window.electron_functions
const { ipcRenderer } = window.electron_functions
import { SettingsContext } from '../../contexts'

import { OpenDialogOptions } from 'electron'
import { AppState } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import SettingsAutodelete from './Settings-Autodelete'
import SettingsManageKeys from './Settings-ManageKeys'
import SettingsEncryption from './Settings-Encryption'
import {
  DeltaDialogBase,
  DeltaDialogHeader,
  DeltaDialogBody,
} from './DeltaDialog'
import SettingsBackup from './Settings-Backup'
import SettingsAccount from './Settings-Account'
import SettingsAppearance from './Settings-Appearance'

function flipDeltaBoolean(value: string) {
  return value === '1' ? '0' : '1'
}

export function SettingsButton(props: any) {
  const { onClick, children, ...otherProps } = props
  return (
    <div className='SettingsButton' onClick={onClick}>
      <button {...otherProps}>{children}</button>
    </div>
  )
}

export function SettingsSelector(props: any) {
  const { onClick, currentValue, children, ...otherProps } = props
  return (
    <div className='SettingsSelector' onClick={onClick}>
      <button {...otherProps}>{children}</button>
      <div className='CurrentValue'>{currentValue}</div>
    </div>
  )
}

export default class Settings extends React.Component {
  translate: todo
  state: {
    showSettingsDialog: boolean
    settings: todo
    show: string
    selfContact: todo
  }
  constructor(public props: DialogProps) {
    super(props)
    this.state = {
      showSettingsDialog: false,
      settings: {},
      show: 'main',
      selfContact: {},
    }
    this.onKeyTransferComplete = this.onKeyTransferComplete.bind(this)
    this.handleDesktopSettingsChange = this.handleDesktopSettingsChange.bind(
      this
    )
    this.handleDeltaSettingsChange = this.handleDeltaSettingsChange.bind(this)
    this.renderDTSettingSwitch = this.renderDTSettingSwitch.bind(this)
    this.renderDeltaSwitch = this.renderDeltaSwitch.bind(this)
    this.translate = window.translate
    this.setShow = this.setShow.bind(this)
  }

  setShow(show: string) {
    this.setState({ show })
  }

  async componentDidMount() {
    await this.loadSettings()
    const selfContact = await DeltaBackend.call(
      'contacts.getContact',
      C.DC_CONTACT_ID_SELF
    )
    this.setState({ selfContact })
  }

  async loadSettings() {
    const settings = await DeltaBackend.call('settings.getConfigFor', [
      'inbox_watch',
      'sentbox_watch',
      'mvbox_watch',
      'mvbox_move',
      'e2ee_enabled',
      'displayname',
      'selfstatus',
      'mdns_enabled',
      'show_emails',
      'bcc_self',
      'delete_device_after',
      'delete_server_after',
    ])

    this.setState({ settings })
  }

  onKeyTransferComplete() {
    this.setState({ keyTransfer: false })
  }

  /*
   * Saves settings for the Deltachat Desktop
   * persisted in ~/.config/DeltaChat/deltachat.json
   */
  handleDesktopSettingsChange(key: string, value: string | boolean) {
    ipcRenderer.send('updateDesktopSetting', key, value)
    if (key === 'notifications' && !value) {
      ipcRenderer.send('updateDesktopSetting', 'showNotificationContent', false)
    }
  }

  /** Saves settings to deltachat core */
  handleDeltaSettingsChange(key: string, value: string | boolean) {
    ipcRenderer.sendSync('setConfig', key, value)
    const settings = this.state.settings
    settings[key] = String(value)
    this.setState({ settings })
  }

  /*
   * render switch for Desktop Setings
   */
  renderDTSettingSwitch(configKey: string, label: string) {
    return (
      <SettingsContext.Consumer>
        {(settings: todo) => (
          <Switch
            checked={settings[configKey]}
            className={settings[configKey] ? 'active' : 'inactive'}
            label={label}
            disabled={
              configKey === 'showNotificationContent' &&
              !settings['notifications']
            }
            onChange={() =>
              this.handleDesktopSettingsChange(configKey, !settings[configKey])
            }
            alignIndicator='right'
          />
        )}
      </SettingsContext.Consumer>
    )
  }

  renderDeltaSwitch(configKey: string, label: string) {
    const configValue = this.state.settings[configKey]
    return (
      <Switch
        checked={configValue === '1'}
        className={configValue === '1' ? 'active' : 'inactive'}
        label={label}
        onChange={() =>
          this.handleDeltaSettingsChange(
            configKey,
            flipDeltaBoolean(configValue)
          )
        }
        alignIndicator='right'
      />
    )
  }

  renderDeltaInput(configKey: string, label: string) {
    const configValue = this.state.settings[configKey]
    return (
      <Label>
        {label}
        <input
          value={configValue}
          className={Classes.INPUT}
          onChange={ev =>
            this.handleDeltaSettingsChange(configKey, ev.target.value)
          }
        />
      </Label>
    )
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('DC_EVENT_IMEX_FILE_WRITTEN')
  }

  renderDialogContent() {
    const { deltachat, openDialog } = this.props
    const { settings } = this.state
    if (this.state.show === 'main') {
      return (
        <div>
          <Card elevation={Elevation.ONE}>
            <ProfileImageSelector
              displayName={
                this.state.settings['displayname'] ||
                this.state.selfContact.address
              }
              color={this.state.selfContact.color}
            />
            <H5>{this.translate('pref_profile_info_headline')}</H5>
            <p>{deltachat.credentials.addr}</p>
            {this.renderDeltaInput(
              'displayname',
              this.translate('pref_your_name')
            )}
            {this.renderDeltaInput(
              'selfstatus',
              this.translate('pref_default_status_label')
            )}
            <SettingsButton onClick={() => this.setState({ show: 'login' })}>
              {this.translate('pref_password_and_account_settings')}
            </SettingsButton>
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_communication')}</H5>
            <RadioGroup
              label={this.translate('pref_show_emails')}
              onChange={(ev: React.FormEvent<HTMLInputElement>) =>
                this.handleDeltaSettingsChange(
                  'show_emails',
                  ev.currentTarget.value
                )
              }
              selectedValue={Number(settings['show_emails'])}
            >
              <Radio
                label={this.translate('pref_show_emails_no')}
                value={C.DC_SHOW_EMAILS_OFF}
              />
              <Radio
                label={this.translate('pref_show_emails_accepted_contacts')}
                value={C.DC_SHOW_EMAILS_ACCEPTED_CONTACTS}
              />
              <Radio
                label={this.translate('pref_show_emails_all')}
                value={C.DC_SHOW_EMAILS_ALL}
              />
            </RadioGroup>
            <br />
            <H5>{this.translate('pref_privacy')}</H5>
            {this.renderDeltaSwitch(
              'mdns_enabled',
              this.translate('pref_read_receipts')
            )}
            <br />
            <SettingsAutodelete
              {...{
                handleDeltaSettingsChange: this.handleDeltaSettingsChange,
                settings,
              }}
            />
          </Card>
          <SettingsAppearance
            handleDesktopSettingsChange={this.handleDesktopSettingsChange}
          />
          <SettingsEncryption renderDeltaSwitch={this.renderDeltaSwitch} />
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_chats_and_media')}</H5>
            {this.renderDTSettingSwitch(
              'enterKeySends',
              this.translate('pref_enter_sends_explain')
            )}
            {this.renderDTSettingSwitch(
              'notifications',
              this.translate('pref_notifications_explain')
            )}
            {this.renderDTSettingSwitch(
              'showNotificationContent',
              this.translate('pref_show_notification_content_explain')
            )}
          </Card>
          <Card elevation={Elevation.ONE}>
            <H5>{this.translate('pref_experimental_features')}</H5>
            {this.renderDTSettingSwitch(
              'enableOnDemandLocationStreaming',
              this.translate('pref_on_demand_location_streaming')
            )}
            <br />
            <H5>{this.translate('pref_imap_folder_handling')}</H5>
            {this.renderDeltaSwitch(
              'inbox_watch',
              this.translate('pref_watch_inbox_folder')
            )}
            {this.renderDeltaSwitch(
              'sentbox_watch',
              this.translate('pref_watch_sent_folder')
            )}
            {this.renderDeltaSwitch(
              'mvbox_watch',
              this.translate('pref_watch_mvbox_folder')
            )}
            {this.renderDeltaSwitch(
              'bcc_self',
              this.translate('pref_send_copy_to_self')
            )}
            {this.renderDeltaSwitch(
              'mvbox_move',
              this.translate('pref_auto_folder_moves')
            )}
          </Card>
          <SettingsManageKeys />
          <SettingsBackup />
        </div>
      )
    } else if (this.state.show === 'login') {
      return (
        <SettingsAccount
          deltachat={deltachat}
          show={this.state.show}
          setShow={this.setShow}
          onClose={this.props.onClose}
        />
      )
    } else {
      throw new Error('Invalid state name: ' + this.state.show)
    }
  }

  render() {
    const { onClose } = this.props
    let title
    if (this.state.show === 'main') {
      title = this.translate('menu_settings')
    } else if (this.state.show === 'login') {
      title = this.translate('pref_password_and_account_settings')
    }

    return (
      <DeltaDialogBase
        isOpen={this.props.isOpen}
        onClose={() => this.setState({ showSettingsDialog: false })}
        className='SettingsDialog'
        fixed
      >
        <DeltaDialogHeader
          showBackButton={this.state.show !== 'main'}
          onClickBack={() => this.setState({ show: 'main' })}
          title={title}
          onClose={onClose}
        />
        <DeltaDialogBody noFooter>{this.renderDialogContent()}</DeltaDialogBody>
      </DeltaDialogBase>
    )
  }
}

function ProfileImageSelector(props: any) {
  const { displayName, color } = props
  const tx = window.translate
  const [profileImagePreview, setProfileImagePreview] = useState('')
  useEffect(() => {
    DeltaBackend.call('getProfilePicture').then(setProfileImagePreview)
    // return nothing because reacts wants it like that
  }, [profileImagePreview])

  const changeProfilePicture = async (picture: string) => {
    await DeltaBackend.call('setProfilePicture', picture)
    setProfileImagePreview(await DeltaBackend.call('getProfilePicture'))
  }

  const openSelectionDialog = () => {
    remote.dialog.showOpenDialog(
      {
        title: tx('select_profile_image_desktop'),
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
        properties: ['openFile'],
      },
      async (files: string[]) => {
        if (Array.isArray(files) && files.length > 0) {
          changeProfilePicture(files[0])
        }
      }
    )
  }

  const codepoint = displayName && displayName.codePointAt(0)
  const initial = codepoint
    ? String.fromCodePoint(codepoint).toUpperCase()
    : '#'

  return (
    <div className='profile-image-selector'>
      {/* TODO: show anything else when there is no profile image, like the letter avatar */}
      {profileImagePreview ? (
        <img src={profileImagePreview} alt={tx('a11y_profile_image_label')} />
      ) : (
        <span style={{ backgroundColor: color }}>{initial}</span>
      )}
      <div>
        {/* TODO: replace the text by icons that get described by aria-label */}
        <button
          aria-label={tx('a11y_profile_image_select')}
          onClick={openSelectionDialog}
          className={'bp3-button'}
        >
          Select
        </button>
        {profileImagePreview && (
          <button
            aria-label={tx('a11y_profile_image_remove')}
            onClick={changeProfilePicture.bind(null, '')}
            className={'bp3-button'}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
