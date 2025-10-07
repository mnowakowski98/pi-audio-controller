import { createContext } from 'react';

export interface Settings {
    hostUrl: string
}

export default createContext<Settings>({ hostUrl: '' })