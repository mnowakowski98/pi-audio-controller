import { useContext } from 'react';

import AudioPlayer from './audioPlayer';
import SettingsContext from '../settingsContext';


export default function AudioPlayerContext() {
    const settings = useContext(SettingsContext)
    const hostUrl = new URL('./audioplayer/', settings.hostUrl)

    return <SettingsContext value={{ hostUrl }}>
        <AudioPlayer />
    </SettingsContext>
}