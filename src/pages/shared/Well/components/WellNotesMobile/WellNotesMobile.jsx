import { Button, Flex, Form, Input } from 'antd'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'
import styles from './WellNotesMobile.module.css'
import { useState } from 'react'
import useAPI from '../../../../../hooks/useAPI'
const WellNotesMobile = () => {
	const [open, setOpen] = useState(false)
	const onClose = () => {
		setOpen(false)
	}
	const apiNotes = useAPI()
	init
	return (
		<>
			<div className={styles.commentContainer}>
				<div className={styles.card}>
					<Flex className={styles.buttonAddNote} align='center' justify='space-between'>
						<Button type='default' className={`button-modal ${styles.addBtnNote}`} onClick={() => setOpen(true)}>
							افزودن یادداشت
						</Button>
					</Flex>
				</div>
			</div>

			<ModalMobile
				/* 		form={noteForm} */
				onClose={onClose}
				height={322}
				open={open}
				/* loading={notesApi.isLoading}
				handleSubmit={handleSubmitNote} */
				title='افزودن یادداشت'
			>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
			</ModalMobile>
		</>
	)
}

export default WellNotesMobile
