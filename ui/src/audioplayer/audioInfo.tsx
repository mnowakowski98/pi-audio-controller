import Col from 'react-bootstrap/Col'

import useAudioInfo from './useAudioInfo'

export default function AudioInfo() {
    const audioInfo = useAudioInfo()

    if (audioInfo.isLoading) return 'Loading'
    if (audioInfo.isError) return audioInfo.error.message

    return <>
        <Col className='text-center'>{audioInfo.data?.fileName}</Col>
        <Col className='text-center'>{audioInfo.data?.title ?? '(No title)'}</Col>
        <Col className='text-center'>{audioInfo.data?.artist ?? '(No artist)'}</Col>
    </>
}