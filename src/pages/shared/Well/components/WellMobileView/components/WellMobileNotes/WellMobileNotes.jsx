import { useEffect, useState } from 'react'

import MobileNotesPanel from '../../../../../../../components/responsive/mobile/MobileNotesPanel/MobileNotesPanel'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const normalizeNoteResponse = response => response?.data || response?.note || response

const WellMobileNotes = ({ wellId }) => {
        const notesApi = useAPI()
        const { openNotification } = useNotification()
        const [notes, setNotes] = useState([])

        useEffect(() => {
                if (!wellId) return
                notesApi.init('notes', { type: 'well', reference: wellId })
        }, [wellId, notesApi])

        useEffect(() => {
                const fetchedNotes = notesApi.data?.notes || []
                setNotes(fetchedNotes)
        }, [notesApi.data?.notes])

        const refreshNotes = () => {
                if (!wellId) return
                notesApi.init('notes', { type: 'well', reference: wellId }, true)
        }

        const handleAddNote = async values => {
                try {
                        const response = await notesApi.post('notes', {
                                text: values.text?.trim(),
                                type: 'well',
                                reference: wellId,
                        })
                        const newNote = normalizeNoteResponse(response)
                        if (newNote?._id || newNote?.id) {
                                // state will be synced via onNotesChange callback
                        } else {
                                refreshNotes()
                        }
                        openNotification('success', 'یادداشت اضافه شد', 'یادداشت با موفقیت اضافه شد')
                        return newNote
                } catch (error) {
                        console.error('خطا در ثبت یادداشت:', error)
                        openNotification('error', error?.message || 'خطایی رخ داد')
                        throw error
                }
        }

        const handleUpdateNote = async (note, values) => {
                try {
                        const response = await notesApi.patch(`notes/${note._id || note.id}`, {
                                text: values.text?.trim(),
                        })
                        const updatedNote = normalizeNoteResponse(response)
                        if (updatedNote?._id || updatedNote?.id) {
                                // state will be synced via onNotesChange callback
                        } else {
                                refreshNotes()
                        }
                        openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد')
                        return updatedNote
                } catch (error) {
                        console.error('خطا در ویرایش یادداشت:', error)
                        openNotification('error', error?.message || 'خطایی رخ داد')
                        throw error
                }
        }

        return (
                <MobileNotesPanel
                        notes={notes}
                        onNotesChange={setNotes}
                        onAddNote={handleAddNote}
                        onUpdateNote={handleUpdateNote}
                        isLoading={notesApi.isLoading}
                />
        )
}

export default WellMobileNotes
