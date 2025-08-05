import { Button, Flex, Form, Input, Spin, Empty, Card, Typography } from 'antd'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'
import styles from './WellNotesMobile.module.css'
import { useState } from 'react'
import useAPI from '../../../../../hooks/useAPI'
import moment from 'moment-jalaali'
import useNotification from '../../../../../hooks/useNotification'
import { EditOutlined } from '@ant-design/icons'

const WellNotesMobile = ({ wellId }) => {
	const [open, setOpen] = useState(false)
	const [openEdit, setOpenEdit] = useState(false)
	const [editingNoteId, setEditingNoteId] = useState(null)
	const [editedText, setEditedText] = useState('')
	const [form] = Form.useForm()
	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const { Title, Text } = Typography

	notesApi.init('notes', { type: 'well', reference: wellId })

	const onClose = () => {
		setOpen(false)
		setOpenEdit(false)
		setEditedText('')
		setEditingNoteId(null)
		form.resetFields()
	}

	const handleSubmitNote = async () => {
		try {
			const values = await form.validateFields()

			await notesApi.post('notes', {
				text: values.text,
				type: 'well',
				reference: wellId,
			})
			openNotification('success', 'یادداشت اضافه شد', 'یادداشت با موفقیت اضافه شد')
			onClose()
			notesApi.init('notes', { type: 'well', reference: wellId }, true)
		} catch (err) {
			console.error('خطا در ثبت یادداشت:', err)
			openNotification('error', err?.message)
		}
	}

	const handleEditSubmit = async () => {
		if (!editingNoteId || !editedText.trim()) {
			openNotification('error', 'متن یادداشت نمی‌تواند خالی باشد')
			return
		}

		try {
			await notesApi.patch(`notes/${editingNoteId}`, {
				text: editedText.trim(),
			})

			openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد')
			onClose()
			notesApi.init('notes', { type: 'well', reference: wellId }, true)
		} catch (err) {
			console.error('خطا در ویرایش یادداشت:', err)
			openNotification('error', err?.message || 'خطایی رخ داد')
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
				</div>
			</div>

			<Flex vertical gap={16}>
				{notesApi.data?.notes?.map(note => (
					<Card key={note.id}>
						<Flex gap={8} vertical>
							<Flex align='center' justify='space-between' gap={20}>
								<Title className={styles.title} level={4}>
									{note?.user ? `${note?.user?.fullName}` : 'کاربر ناشناس'}
								</Title>
								<Text className={styles.date}>{moment(note?.createdAt).locale('fa').format(' jD jMMMM jYYYY - ساعت HH:mm')}</Text>
							</Flex>
							<Flex gap={8} vertical>
								<Text className={styles.text}>{note?.text}</Text>
								<div>
									<Button
										className={styles.btn}
										onClick={() => {
											setOpenEdit(true)
											setEditingNoteId(note.id)
											setEditedText(note.text)
										}}
										icon={<EditOutlined />}
										type='link'
									>
										ویرایش
									</Button>
								</div>
							</Flex>
						</Flex>
					</Card>
				))}
			</Flex>

			{/* ویرایش یادداشت */}
			<ModalMobile height={322} open={openEdit} title='ویرایش یادداشت' onClose={onClose} handleSubmit={handleEditSubmit} loading={notesApi.isLoading}>
				<div className={styles.container}>
					<Form.Item noStyle className={styles.itemForm} rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<Input.TextArea className={styles.textArea} value={editedText} onChange={e => setEditedText(e.target.value)} rows={5} />
					</Form.Item>
				</div>
			</ModalMobile>

			{/* افزودن یادداشت */}
			<ModalMobile
				form={form}
				onClose={onClose}
				height={322}
				open={open}
				loading={notesApi.isLoading}
				handleSubmit={handleSubmitNote}
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
