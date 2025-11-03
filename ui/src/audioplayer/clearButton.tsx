import { useContext } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import Button from 'react-bootstrap/Button'

import settingsContext from '../settingsContext'
import { audioFileInfoKey } from '../models/audioFileInfo'

interface ClearButtonProps {
    clearId: string | null,
    hasFile: boolean
}

export default function ClearButton(props: ClearButtonProps) {
    const url = useContext(settingsContext).hostUrl
    const queryClient = useQueryClient()
    
    const selectFile = useMutation({
        mutationFn: async () => (await fetch(url, { method: 'POST', body: props.clearId })).json(),
        onSuccess: (data) => queryClient.setQueryData([audioFileInfoKey], data)
    })

    return <Button
        type='button'
        disabled={selectFile.isPending == true || props.hasFile == false}
        onClick={() => selectFile.mutate()}>
        Clear file
    </Button>
}