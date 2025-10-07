import { useState } from 'react'

import './App.css'

import AudioPlayer from './audioplayer/audioPlayer'
import Settings from './settings/settings'
import SettingsContext, {type Settings as SettingsType} from './SettingsContext'

export default function App() {
  const settingsString = localStorage.getItem('settings')
  const [settings, setSettings] = useState<SettingsType>(settingsString ? JSON.parse(settingsString) : {
    hostUrl: ''
  })

  return <SettingsContext value={settings}>
    {settings.hostUrl != '' && <AudioPlayer />}
    <Settings onUpdate={(newSettings) => {
      setSettings(newSettings)
      localStorage.setItem('settings', JSON.stringify(newSettings))
    }}/>
  </SettingsContext>
}
