import { Button, Flex, Form, Input, Empty, Card, Typography } from 'antd'
import ModalMobile from '../../../../../../../components/responsive/mobile/ModalMobile/ModalMobile'
import styles from './WellNotesMobile.module.css'
import { useState } from 'react'
import useAPI from '../../../../../../../hooks/useAPI'
import moment from 'moment-jalaali'
import useNotification from '../../../../../../../hooks/useNotification'
import { EditOutlined } from '@ant-design/icons'

const WellNotesMobile = ({ wellId }) => {
	const [openAdd, setOpenAdd] = useState(false)
	const [openEdit, setOpenEdit] = useState(false)
	const [editingNoteId, setEditingNoteId] = useState(null)

	const [addForm] = Form.useForm()
	const [editForm] = Form.useForm()

	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const { Title, Text } = Typography

	notesApi.init('notes', { type: 'well', reference: wellId })

	const onClose = () => {
		setOpenAdd(false)
		setOpenEdit(false)
		setEditingNoteId(null)
		addForm.resetFields()
		editForm.resetFields()
	}

	const handleSubmitNote = async values => {
		try {
			await notesApi.post('notes', {
				text: values.text.trim(),
				type: 'well',
				reference: wellId,
			})
			openNotification('success', 'یادداشت اضافه شد', 'یادداشت با موفقیت اضافه شد')
			onClose()
			notesApi.init('notes', { type: 'well', reference: wellId }, true)
		} catch (err) {
			console.error('خطا در ثبت یادداشت:', err)
			openNotification('error', err?.message || 'خطایی رخ داد')
		}
	}

	const handleEditSubmit = async values => {
		try {
			await notesApi.patch(`notes/${editingNoteId}`, {
				text: values.text.trim(),
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
						<Button type='default' className={`button-modal ${styles.addBtnNote}`} onClick={() => setOpenAdd(true)}>
							افزودن یادداشت
						</Button>
					</Flex>
				</div>
			</div>
			<Flex style={{ paddingBottom: '60px' }} vertical gap={16}>
				{notesApi?.data?.notes?.length === 0 ? (
					<Empty />
				) : (
					notesApi.data?.notes?.map(note => {
						const id = note._id || note.id

						return (
							<Card key={id}>
								<Flex gap={8} vertical>
									<Flex align='center' justify='space-between' gap={20}>
										<Title className={styles.title} level={4}>
											{note?.user ? note?.user?.fullName : 'کاربر ناشناس'}
										</Title>
										<Text className={styles.date}>{moment(note?.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</Text>
									</Flex>

									<Flex gap={8} vertical>
										<Text className={styles.text}>{note?.text}</Text>
										<div>
											<Button
												className={styles.btn}
												onClick={() => {
													setOpenEdit(true)
													setEditingNoteId(id)
													editForm.setFieldsValue({ text: note.text }) // 👈 پر کردن TextArea
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
						)
					})
				)}
			</Flex>

			<ModalMobile
				height={322}
				open={openEdit}
				title='ویرایش یادداشت'
				onClose={onClose}
				handleSubmit={handleEditSubmit}
				loading={notesApi.isLoading}
				form={editForm}
			>
				<div className={styles.modalContainer}>
					<Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<Input.TextArea className={styles.textArea} rows={6} />
					</Form.Item>
				</div>
			</ModalMobile>

			<ModalMobile
				height={322}
				open={openAdd}
				title='افزودن یادداشت'
				onClose={onClose}
				handleSubmit={handleSubmitNote}
				loading={notesApi.isLoading}
				form={addForm}
			>
				<Form.Item noStyle name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
			</ModalMobile>
		</>
	)
}

export default WellNotesMobile
