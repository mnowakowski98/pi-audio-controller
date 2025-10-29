import { useContext } from 'react'

import SoundFiles from './soundFiles'
import SettingsContext from '../settingsContext'

export default function SoundFilesContext() {
    const settings = useContext(SettingsContext)
    const hostUrl = new URL('./soundfiles/', settings.hostUrl)

    return <SettingsContext value={{ hostUrl }}>
        <SoundFiles />
    </SettingsContext>
}