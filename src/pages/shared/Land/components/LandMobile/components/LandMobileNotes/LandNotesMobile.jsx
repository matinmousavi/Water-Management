import { Button, Drawer, Flex, Form, Input } from 'antd'
import styles from './LandNotesMobile.module.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'
import NotesListMobile from './components/MobileNotesList/NotesListMobile'
import ModalMobile from '../../../../../../../components/ModalMobile/ModalMobile'

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

	const handleOpenAddNoteModal = () => {
		showDrawer()
		setIsNoteEditMode(false)
		noteForm.resetFields()
		setSelectedNote(null)
	}

	const handleEditNote = note => {
		setIsNoteEditMode(true)
		setSelectedNote(note)
		noteForm.setFieldsValue({ text: note.text })
	}

	const handleDelete = async noteId => {
		try {
			await notesApi.delete(`lands/${landId}/notes/${noteId}`)
			setNotes(prev => prev.filter(note => note?._id !== noteId))
			openNotification('success', 'یادداشت با موفقیت حذف شد')
		} catch (error) {
			openNotification('error', 'خطا در حذف یادداشت')
			console.error('Error deleting note:', error)
		}
	}

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode && selectedNote?._id) {
				const response = await notesApi.put(`lands/${landId}/notes/${selectedNote._id}`, values)

				const updatedData = response.data || response.note || response
				if (!updatedData._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => prev.map(note => (note._id === updatedData._id ? updatedData : note)))
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				const response = await notesApi.post(`lands/${landId}/notes`, values)

				const newData = response.data || response.note || response
				if (!newData._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => [...prev, newData])
				openNotification('success', 'یادداشت با موفقیت افزوده شد')
				setOpen(false)
			}

			setSelectedNote(null)
			noteForm.resetFields()
		} catch (error) {
			console.error('Operation failed:', error)
			openNotification('error', `خطا در ${isNoteEditMode ? 'ویرایش' : 'افزودن'} یادداشت`)
		}
	}

	const showDrawer = () => {
		setOpen(true)
	}

	const onClose = () => {
		setOpen(false)
	}

	return (
		<>
			<div className={styles.commentContainer}>
				<div className={styles.card}>
					<Flex className={styles.buttonAddNote} align='center' justify='space-between'>
						<Button type='default' className='button-modal' onClick={handleOpenAddNoteModal}>
							افزودن یادداشت
						</Button>
					</Flex>

					<NotesListMobile handleDelete={handleDelete} handleEditNote={handleEditNote} data={notes} />
				</div>
			</div>

			<ModalMobile onClose={onClose} open={open} loading={notesApi.isLoading} handleSubmit={handleSubmitNote} title='افزودن یادداشت'>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<Input.TextArea className={styles.textArea} />
				</Form.Item>
			</ModalMobile>
		</>
	)
}

export default LandNotesMobile
