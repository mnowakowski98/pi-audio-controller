import { createContext } from 'react';

interface SettingsContext {
    serverUrl: string
}

export default createContext<SettingsContext>({ serverUrl: '' })