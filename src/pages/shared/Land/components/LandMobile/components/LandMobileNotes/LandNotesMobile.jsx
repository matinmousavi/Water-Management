import { Button, Flex, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

import NotesListMobile from './components/MobileNotesList/NotesListMobile'
import BottomSheetModal from '../../../../../../../components/responsive/mobile/BottomSheetModal/BottomSheetModal'

import styles from './LandNotesMobile.module.css'

const LandNotesMobile = ({ notesData: initialNotes }) => {
	const { landId } = useParams()
	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const [noteForm] = Form.useForm()

	const [open, setOpen] = useState(false)
	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
	const [selectedNote, setSelectedNote] = useState(null)
	const [notes, setNotes] = useState(initialNotes || [])

	useEffect(() => {
		setNotes(initialNotes || [])
	}, [initialNotes])

	useEffect(() => {
		if (!open) {
			noteForm.resetFields()
			return
		}

		if (isNoteEditMode && selectedNote) {
			setTimeout(() => {
				noteForm.setFieldsValue({ text: selectedNote.text ?? '' })
			}, 0)
		} else {
			setTimeout(() => noteForm.resetFields(), 0)
		}
	}, [open, isNoteEditMode, selectedNote, noteForm])

	const handleOpenAddNoteModal = () => {
		setIsNoteEditMode(false)
		setSelectedNote(null)
		setOpen(true)
	}

	const handleEditNote = note => {
		setIsNoteEditMode(true)
		setSelectedNote(note)
		setOpen(true)
	}

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode && selectedNote?._id) {
				const response = await notesApi.put(`lands/${landId}/notes/${selectedNote._id}`, values)

				const updatedNote = response.data || response.note || response
				if (!updatedNote._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => prev.map(n => (n._id === updatedNote._id ? updatedNote : n)))
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				const response = await notesApi.post(`lands/${landId}/notes`, values)

				const newNote = response.data || response.note || response
				if (!newNote._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => [...prev, newNote])
				openNotification('success', 'یادداشت با موفقیت افزوده شد')
			}

			setOpen(false)
			setSelectedNote(null)
			noteForm.resetFields()
		} catch (error) {
			console.error('Operation failed:', error)
			openNotification('error', `خطا در ${isNoteEditMode ? 'ویرایش' : 'افزودن'} یادداشت`)
		}
	}

	const onClose = () => {
		setOpen(false)
		setSelectedNote(null)
		noteForm.resetFields()
	}

	return (
		<>
			<div className={styles.commentContainer}>
				<div className={styles.card}>
					<Flex className={styles.buttonAddNote} align='center' justify='space-between'>
						<Button type='default' className={`button-modal ${styles.addBtnNote}`} onClick={handleOpenAddNoteModal}>
							افزودن یادداشت
						</Button>
					</Flex>
					<NotesListMobile data={notes} handleEditNote={handleEditNote} />
				</div>
			</div>

                        <BottomSheetModal
                                form={noteForm}
                                onClose={onClose}
                                height={322}
                                open={open}
                                loading={notesApi.isLoading}
                                onSubmit={handleSubmitNote}
                                title={isNoteEditMode ? 'ویرایش یادداشت' : 'افزودن یادداشت'}
                        >
				<div className={styles.modalContainer}>
					<Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<Input.TextArea className={styles.textArea} rows={6} />
					</Form.Item>
				</div>
                        </BottomSheetModal>
                </>
        )
}

export default LandNotesMobile
