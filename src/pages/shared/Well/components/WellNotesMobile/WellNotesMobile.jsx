import { Button, Flex, Form, Input, Spin, Empty } from 'antd'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'
import styles from './WellNotesMobile.module.css'
import { useState } from 'react'
import useAPI from '../../../../../hooks/useAPI'

const WellNotesMobile = ({ wellId }) => {
	const [open, setOpen] = useState(false)
	const [form] = Form.useForm()
	const notesApi = useAPI()

	notesApi.init('notes', { type: 'well', reference: wellId })

	const onClose = () => {
		setOpen(false)
		form.resetFields()
	}
	console.log(notesApi.data)

	const handleSubmitNote = async () => {
		try {
			const values = await form.validateFields()

			await notesApi.post('/notes', {
				text: values.text,
				type: 'well',
				reference: wellId,
			})

			onClose()
		} catch (err) {
			console.error('خطا در ثبت یادداشت:', err)
		}
	}

	return (
		<>
			<div className={styles.commentContainer}>
				<div className={styles.card}>
					<Flex className={styles.buttonAddNote} align='center' justify='space-between'>
						<Button type='default' className={`button-modal ${styles.addBtnNote}`} onClick={() => setOpen(true)}>
							افزودن یادداشت
						</Button>
					</Flex>

					{notesApi.isLoading ? (
						<Spin />
					) : notesApi.data?.notes?.length ? (
						<div className={styles.notesList}>
							{notesApi.data.notes.map(note => (
								<div key={note.id} className={styles.noteItem}>
									<p>{note.text}</p>
									<small>{new Date(note.createdAt).toLocaleString('fa-IR')}</small>
								</div>
							))}
						</div>
					) : (
						<Empty description='یادداشتی برای این چاه ثبت نشده است' />
					)}
				</div>
			</div>

			<ModalMobile
				form={form}
				onClose={onClose}
				height={322}
				open={open}
				loading={notesApi.isLoading}
				handleSubmit={handleSubmitNote}
				title='افزودن یادداشت'
			>
				<Form form={form}>
					<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<div className={styles.modalContainer}>
							<Input.TextArea className={styles.textArea} />
						</div>
					</Form.Item>
				</Form>
			</ModalMobile>
		</>
	)
}

export default WellNotesMobile
