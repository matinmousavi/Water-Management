import { Button, Flex, Form, Input } from 'antd'
import styles from './NotesGroup.module.css'
import { useState } from 'react'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'
import ListNotesGroup from './components/ListNotes/ListNotesGroup'

const NotesGroup = () => {
	const [open, setOpen] = useState(false)

	const handleSubmitNote = () => {
		setOpen(true)
	}

	const onClose = () => {
		setOpen(false)
	}
	return (
		<Flex>
			<div className={styles.footer}>
				<Button type='default' onClick={() => setOpen(true)} className={`button-modal ${styles.buttonAdd}`}>
					افزودن یادداشت
				</Button>
			</div>
			<ListNotesGroup />
			<ModalMobile
				/* form={noteForm} */
				onClose={onClose}
				height={322}
				open={open}
				/* loading={notesApi.isLoading} */
				handleSubmit={handleSubmitNote}
				title='افزودن یادداشت'
			>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
			</ModalMobile>
		</Flex>
	)
}

export default NotesGroup
