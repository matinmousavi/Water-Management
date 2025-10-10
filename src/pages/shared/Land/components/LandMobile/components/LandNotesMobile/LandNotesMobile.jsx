import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import NotesPanelMobile from '../../../../../../../components/responsive/mobile/NotesPanelMobile/NotesPanelMobile'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const normalizeNoteResponse = response => response?.data || response?.note || response

const LandNotesMobile = ({ notesData: initialNotes = [] }) => {
	const { landId } = useParams()
	const notesApi = useAPI()
	const { openNotification } = useNotification()

	const [notes, setNotes] = useState(initialNotes)

	useEffect(() => {
		setNotes(initialNotes)
	}, [initialNotes])

	const handleAddNote = async values => {
		try {
			const response = await notesApi.post(`lands/${landId}/notes`, {
				...values,
				text: values.text?.trim(),
			})
			const newNote = normalizeNoteResponse(response)
			if (!newNote?._id && !newNote?.id) {
				throw new Error('Invalid response structure - missing identifier')
			}
			openNotification('success', 'یادداشت با موفقیت افزوده شد')
			return newNote
		} catch (error) {
			console.error('Failed to add note:', error)
			openNotification('error', 'خطا در افزودن یادداشت')
			throw error
		}
	}

	const handleUpdateNote = async (note, values) => {
		try {
			const response = await notesApi.put(`lands/${landId}/notes/${note._id || note.id}`, {
				...values,
				text: values.text?.trim(),
			})
			const updatedNote = normalizeNoteResponse(response)
			if (!updatedNote?._id && !updatedNote?.id) {
				throw new Error('Invalid response structure - missing identifier')
			}
			openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			return updatedNote
		} catch (error) {
			console.error('Failed to update note:', error)
			openNotification('error', 'خطا در ویرایش یادداشت')
			throw error
		}
	}

	return <NotesPanelMobile notes={notes} onNotesChange={setNotes} onAddNote={handleAddNote} onUpdateNote={handleUpdateNote} isLoading={notesApi.isLoading} />
}

export default LandNotesMobile
