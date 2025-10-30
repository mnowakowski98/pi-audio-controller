import { rm, writeFile } from 'fs/promises'
import { DatabaseSync } from 'node:sqlite'

import Base from '../models/audioFileInfo'
import { soundsFolder } from '../routes/soundFiles'
import { join } from 'path'

export class AudioFileInfo {
    private _audioFileInfo: Base | undefined
    private db: DatabaseSync

    public get audioFileInfo() { return this._audioFileInfo }

    constructor(db: DatabaseSync, audioFileInfo?: Base) {
        this._audioFileInfo = audioFileInfo
        this.db = db
    }

    async get(id: number) {
        const statement = this.db.prepare('select * from SoundFiles where Id = ?')
        const result = statement.all(id)[0]
        if (result == undefined) throw 'wat'
        this._audioFileInfo = {
            id: parseInt(result['Id']?.toString() ?? '0'),
            fileName: result['FileName']?.toString() ?? 'No file name (?)',
            title: result['Title']?.toString() ?? 'No title (?)',
            artist: result['Artist']?.toString() ?? 'Not artist (?)',
            duration: parseFloat(result['Duration']?.toString() ?? '0')
        }
    }

    async insert(fileBuffer?: Buffer) {
        if(this._audioFileInfo == undefined) throw 'Can not insert audioFileInfo without AudioFileInfo'

        const statement = this.db.prepare('insert into SoundFiles values (NULL, ?,?,?,?)')
        statement.run(this._audioFileInfo.fileName,
            this._audioFileInfo.title,
            this._audioFileInfo.artist,
            this._audioFileInfo.duration)

        if (fileBuffer != undefined)
            await writeFile(join(soundsFolder, this._audioFileInfo.fileName!), fileBuffer)

        return true
    }

    async delete(id: number) {
        const query = this.db.prepare('select * from SoundFiles where Id = ?')
        const result = query.all(id)[0]
        if (result == undefined) return false

        const statement = this.db.prepare('delete from SoundFiles where Id = ?')
        statement.run(id)

        const fileName = result['FileName']?.toString()
        if (fileName == undefined) throw 'File path undefined'
        await rm(join(soundsFolder, fileName))

        return true
    }
}