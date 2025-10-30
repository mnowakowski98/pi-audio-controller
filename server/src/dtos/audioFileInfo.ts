import { writeFile } from 'fs/promises'
import { DatabaseSync } from 'node:sqlite'

import Base from '../models/audioFileInfo'
import { soundsFolder } from '../routes/soundFiles'
import { join } from 'path'

export class AudioFileInfo {
    private audioFileInfo: Base
    private db: DatabaseSync

    constructor(audioFileInfo: Base, db: DatabaseSync) {
        this.audioFileInfo = audioFileInfo
        this.db = db
    }

    async insert(fileBuffer?: Buffer) {
        const statement = this.db.prepare('insert into SoundFiles values (NULL, ?,?,?,?)')
        statement.run(this.audioFileInfo.fileName,
            this.audioFileInfo.title,
            this.audioFileInfo.artist,
            this.audioFileInfo.duration)

        if (fileBuffer != undefined)
            await writeFile(join(soundsFolder, this.audioFileInfo.fileName!), fileBuffer)

        return true
    }
}