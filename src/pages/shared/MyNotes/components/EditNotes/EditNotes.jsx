import { useEffect, useState } from 'react'
import { Button, Drawer, Flex, Form, Input, message } from 'antd'
import styles from './EditNotes.module.css'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
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
		<Drawer
			rootClassName={styles.customDrawerRoot}
			className={styles.containerDrawer}
			placement='bottom'
			closable={false}
			height={322}
			onClose={onClose}
			open={open}
		>
			<Form className={styles.form} layout='vertical' size='large' onFinish={handleSubmit}>
				<Flex className={styles.contentDrawer} vertical gap={10}>
					<div className={styles.drawerHeader}>
						<div className={styles.lineDrawer}></div>
					</div>
					<Input.TextArea value={editedText} onChange={e => setEditedText(e.target.value)} rows={5} />
					<Flex gap={16} justify='center'>
						<Button onClick={onClose} className={styles.returnButton}>
							بازگشت
						</Button>
						<Button className={styles.okButton} type='primary' htmlType='submit' loading={notesApi.isLoading}>
							ثبت
						</Button>
					</Flex>
				</Flex>
			</Form>
		</Drawer>
	)
}

export default EditNotes
