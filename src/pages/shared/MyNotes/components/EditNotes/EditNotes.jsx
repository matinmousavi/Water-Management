import { useEffect, useState } from 'react'
import { Form, Input } from 'antd'

import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import BottomSheetModal from '../../../../../components/responsive/mobile/BottomSheetModal/BottomSheetModal'

import styles from './EditNotes.module.css'

const EditNotes = ({ open, onClose, text, id, setNotesData }) => {
	const [editedText, setEditedText] = useState('')
	const notesApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (open) {
			setEditedText(text || '')
		}
	}, [open, text])

	const handleSubmit = async () => {
		try {
			const updatedNote = await notesApi.patch(`notes/${id}`, { text: editedText })
			openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد.')
			setNotesData(prev => ({
				...prev,
				notes: prev.notes.map(note => (note._id === id ? { ...note, text: editedText, updatedAt: new Date().toISOString() } : note)),
			}))

			onClose()
		} catch (error) {
			openNotification('error', 'خطا', error?.message || 'خطایی رخ داده است')
		}
	}

        return (
                <BottomSheetModal
                        height={322}
                        open={open}
                        title='ویرایش یادداشت'
                        onClose={onClose}
                        onSubmit={handleSubmit}
                        loading={notesApi.isLoading}
                >
                        <div className={styles.container}>
                                <Form.Item noStyle className={styles.itemForm} rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
                                        <Input.TextArea className={styles.textArea} value={editedText} onChange={e => setEditedText(e.target.value)} rows={6} />
                                </Form.Item>
                        </div>
                </BottomSheetModal>
        )
}

export default EditNotes
