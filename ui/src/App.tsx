import './App.css'
import AudioPlayer from './audioplayer/audioplayer'
import SettingsContext from './SettingsContext'

export default function App() {
  const serverUrl = localStorage.getItem('pi-audio-controller-serverUrl') ?? ''

  return <SettingsContext value={{ serverUrl }}>
    <AudioPlayer />
  </SettingsContext>
}
