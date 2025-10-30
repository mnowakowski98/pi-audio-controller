import express from 'express'
import cors from 'cors'

import audioPlayer from './routes/audioPlayer'
import soundFiles from './routes/soundFiles'

const port = 3000
const app = express()
app.use(cors({ origin: '*' }))
app.use('/audioplayer', audioPlayer)
app.use('/soundfiles', soundFiles)

app.get('/', (_req, res) => res.send('remote-audio-controller-server'))

app.listen(port, () => console.log(`Listening on ${port}`))