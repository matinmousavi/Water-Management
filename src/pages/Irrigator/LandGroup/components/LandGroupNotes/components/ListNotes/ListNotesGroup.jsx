import { Card, Flex, Typography, Button, Form, Input } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'
import { useState } from 'react'
import styles from './ListNotesGroup.module.css'
import BottomSheetModal from '../../../../../../../components/responsive/mobile/BottomSheetModal/BottomSheetModal'

const ListNotesGroup = ({ notes = [], loading, noteApi, openNotification }) => {
	const { Title, Text } = Typography
	const [openEdit, setOpenEdit] = useState(false)
	const [editingNote, setEditingNote] = useState(null)
	const [editForm] = Form.useForm()

	const onClose = () => {
		setOpenEdit(false)
		editForm.resetFields()
		setEditingNote(null)
	}

	const handleEditSubmit = async () => {
		try {
			const values = await editForm.validateFields()
			const noteId = editingNote?.id || editingNote?._id
			if (!noteId) throw new Error('آیدی یادداشت پیدا نشد')

			await noteApi.patch(
				`notes/${noteId}`,
				{ text: values.text },
				{
					responseHandler: (prev, res) => ({
						...prev,
						notes: prev.notes.map(n => (n.id === noteId || n._id === noteId ? res.note : n)),
					}),
				}
			)

			openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد')
			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', err?.message || 'خطا در ویرایش یادداشت')
		}
	}

	if (!notes.length) {
		return (
			<Flex align='center' justify='center' style={{ padding: 24 }}>
				<Text type='secondary'>یادداشتی ثبت نشده است</Text>
			</Flex>
		)
	}

	return (
		<>
			<Flex gap={16} vertical style={{ paddingBottom: '70px' }}>
				{notes.map(note => (
					<Card key={note.id || note._id} className={styles.card}>
						<Flex gap={8} vertical>
							<Flex align='center' justify='space-between' gap={20}>
								<Title className={styles.title} level={5}>
									{note.user?.fullName || 'کاربر ناشناس'}
								</Title>
								<Text className={styles.date}>{moment(note.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</Text>
							</Flex>

							<Text className={styles.text}>{note.text}</Text>

							<Flex gap={8} justify='end'>
								<Button
									size='small'
									type='link'
									icon={<EditOutlined />}
									onClick={() => {
										setEditingNote(note)
										editForm.setFieldsValue({ text: note.text })
										setOpenEdit(true)
									}}
								>
									ویرایش
								</Button>
							</Flex>
						</Flex>
					</Card>
				))}
			</Flex>

			<BottomSheetModal
				form={editForm}
				onClose={onClose}
				height={322}
				open={openEdit}
				loading={noteApi.isLoading}
				onSubmit={handleEditSubmit}
				title='ویرایش یادداشت'
			>
				<Form.Item noStyle className={styles.itemForm} name='text'>
					<div className={styles.modalContainer}>
						<Input.TextArea
							className={styles.textArea}
							value={editingNote?.text || ''}
							onChange={e => {
								setEditingNote(prev => ({ ...prev, text: e.target.value }))
								editForm.setFieldsValue({ text: e.target.value })
							}}
						/>
					</div>
				</Form.Item>
			</BottomSheetModal>
		</>
	)
}

export default ListNotesGroup
