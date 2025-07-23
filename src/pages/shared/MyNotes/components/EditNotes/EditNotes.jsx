import { useEffect, useState } from 'react'
import { Form, Input } from 'antd'
import styles from './EditNotes.module.css'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'

const EditNotes = ({ open, onClose, text, id, setNotesData }) => {
	const [editedText, setEditedText] = useState('')
	const notesApi = useAPI()
	useEffect(() => {
		if (open) {
			setEditedText(text || '')
		}
	}, [open, text])
	const { openNotification } = useNotification()

	const handleSubmit = async () => {
		try {
			await notesApi.patch(`notes/${id}`, { text: editedText })
			openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد.')

			setNotesData(prev => ({
				...prev,
				notes: prev.notes.map(note => (note.id === id ? { ...note, text: editedText, updatedAt: new Date().toISOString() } : note)),
			}))

			onClose()
		} catch (error) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}

	return (
		<ModalMobile open={open} title='ویرایش یادداشت' onClose={onClose} handleSubmit={handleSubmit} loading={notesApi.isLoading}>
			<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
				<Input.TextArea className={styles.textArea} value={editedText} onChange={e => setEditedText(e.target.value)} rows={5} />
			</Form.Item>
		</ModalMobile>
	)
}

export default EditNotes
