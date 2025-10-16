import express from 'express'
import cors from 'cors'

import audioplayer from './routes/audioplayer'

const port = 3000
const app = express()
app.use(cors({ origin: '*' }))

app.use('/audioplayer', audioplayer)

app.get('/', (_req, res) => res.send('pi-audio-controller-server'))

app.listen(port, () => {
    console.log(`Listening on ${port}`)
})