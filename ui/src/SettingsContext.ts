import { createContext } from 'react';

export interface Settings {
    hostUrl: URL
}

export default createContext<Settings>({ hostUrl: new URL('http://localhost') })