import Table from 'react-bootstrap/Table'

import useAudioInfo from './useAudioInfo'

export default function AudioInfo() {
    const audioInfo = useAudioInfo()

    if (audioInfo.isLoading) return 'Loading'
    if (audioInfo.isError) return audioInfo.error.message

    return <Table className='text-start'>
        <thead className='fw-bold'>
            <tr>
                <td>Title</td>
                <td>Artist</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{audioInfo.data?.title ?? '(No title)'}</td>
                <td>{audioInfo.data?.artist ?? '(No artist)'}</td>
            </tr>
        </tbody>
    </Table>
}