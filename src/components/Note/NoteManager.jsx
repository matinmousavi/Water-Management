import { Button, Card, Flex, Form, Input, Modal, Space, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import styles from './NoteManager.module.css'
import useAPI from '../../hooks/useAPI'
import moment from 'moment-jalaali'
import useNotification from '../../hooks/useNotification'

const { Title, Text } = Typography

const NoteList = ({ data, handleDeleteClick, handleEditNote }) => {
	return (
		<Flex vertical gap={8}>
			{data?.map(note => (
				<div key={note?._id} className={styles.fakePopoverBox}>
					<div className={styles.arrowLeft}></div>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between'>
							<Flex align='center' gap={20}>
								<h4 className={styles.userName}>{note?.user ? `${note?.user?.fullName}` : 'کاربر ناشناس'}</h4>
								<span className={styles.date}>{moment(note?.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</span>
							</Flex>
							<Space className={styles.btns}>
								<Button type='link' icon={<EditOutlined />} onClick={() => handleEditNote(note)} />
								<Button type='link' icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(note)} />
							</Space>
						</Flex>
						<p className={styles.commentText}>{note?.text}</p>
					</Flex>
				</div>
			))}
		</Flex>
	)
}

const NoteManager = ({ entityType, notesData: initialNotes, status }) => {
	const params = useParams()
	const entityId = entityType === 'land' ? params.landId : params.wellId

	const cardRef = useRef()
	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const [noteForm] = Form.useForm()

	const [isShowModalNote, setIsShowModalNote] = useState(false)
	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
	const [isNoteDeleteMode, setIsNoteDeleteMode] = useState(false)
	const [selectedNote, setSelectedNote] = useState(null)
	const [notes, setNotes] = useState(initialNotes || [])

	useEffect(() => {
		setNotes(initialNotes || [])
	}, [initialNotes])

	const getNoteId = note => note._id || note.id

	const apiPaths = {
		create: () => (entityType === 'land' ? `lands/${entityId}/notes` : `notes`),
		update: noteId => (entityType === 'land' ? `lands/${entityId}/notes/${noteId}` : `notes/${noteId}`),
		delete: noteId => (entityType === 'land' ? `lands/${entityId}/notes/${noteId}` : `notes/${noteId}`),
	}

	const handleOpenAddNoteModal = () => {
		setIsNoteEditMode(false)
		noteForm.resetFields()
		setSelectedNote(null)
		setIsShowModalNote(true)
	}

	const handleEditNote = note => {
		setIsNoteEditMode(true)
		setSelectedNote(note)
		noteForm.setFieldsValue({ text: note.text })
		setIsShowModalNote(true)
	}

	const handleDeleteClick = note => {
		setSelectedNote(note)
		setIsNoteDeleteMode(true)
	}

	const confirmDeleteNote = async () => {
		if (!getNoteId(selectedNote)) return
		try {
			await notesApi.delete(apiPaths.delete(getNoteId(selectedNote)))
			setNotes(prev => prev.filter(note => getNoteId(note) !== getNoteId(selectedNote)))
			openNotification('success', 'یادداشت با موفقیت حذف شد')
		} catch (error) {
			openNotification('error', 'خطا در حذف یادداشت')
			console.error('Error deleting note:', error)
		} finally {
			setIsNoteDeleteMode(false)
			setSelectedNote(null)
		}
	}

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode && getNoteId(selectedNote)) {
				// Update
				const response =
					entityType === 'land'
						? await notesApi.put(apiPaths.update(getNoteId(selectedNote)), values)
						: await notesApi.patch(apiPaths.update(getNoteId(selectedNote)), { text: values.text })

				const updatedNote = response.data || response.note || response
				const updatedId = getNoteId(updatedNote)
				if (!updatedId) throw new Error('Invalid response structure')

				setNotes(prev => prev.map(note => (getNoteId(note) === updatedId ? updatedNote : note)))
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				// Create
				const response =
					entityType === 'land'
						? await notesApi.post(apiPaths.create(), values)
						: await notesApi.post(apiPaths.create(), {
								type: 'well',
								reference: entityId,
								text: values.text,
						  })

				const newNote = response.data || response.note || response
				if (!getNoteId(newNote)) throw new Error('Invalid response structure')

				setNotes(prev => [...prev, newNote])
				openNotification('success', 'یادداشت با موفقیت افزوده شد')
			}

			setIsShowModalNote(false)
			setSelectedNote(null)
			noteForm.resetFields()
		} catch (error) {
			console.error('Operation failed:', error)
			openNotification('error', `خطا در ${isNoteEditMode ? 'ویرایش' : 'افزودن'} یادداشت`)
		}
	}

	const entityTitle = entityType === 'land' ? 'یادداشت زمین' : 'یادداشت چاه'

	return (
		<>
			<div ref={cardRef} className={styles.commentContainer}>
				<Card className={styles.card}>
					<Flex gap={36} vertical>
						<Flex align='center' justify='space-between'>
							<Title level={2} className='text-card-title'>
								{entityTitle} ({notes?.length})
							</Title>
							<Button color='primary' variant='outlined' onClick={handleOpenAddNoteModal}>
								<PlusCircleOutlined />
								<span>افزودن یادداشت</span>
							</Button>
						</Flex>

						<NoteList handleDeleteClick={handleDeleteClick} handleEditNote={handleEditNote} data={notes} status={status} />
					</Flex>
				</Card>
			</div>

			{/* Add/Edit Modal */}
			<Modal
				title={isNoteEditMode ? `ویرایش یادداشت ${selectedNote?.user?.fullName}` : 'افزودن یادداشت'}
				centered
				open={isShowModalNote}
				onCancel={() => {
					setIsShowModalNote(false)
					noteForm.resetFields()
					setSelectedNote(null)
				}}
				footer={null}
			>
				<Form form={noteForm} onFinish={handleSubmitNote} layout='vertical' size='large'>
					<Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<Input.TextArea rows={4} />
					</Form.Item>
					<Flex justify='end' gap={8}>
						<Button onClick={() => setIsShowModalNote(false)}>انصراف</Button>
						<Button type='primary' htmlType='submit' loading={notesApi.isLoading}>
							ثبت
						</Button>
					</Flex>
				</Form>
			</Modal>

			{/* Delete Modal */}
			<Modal
				title={`حذف یادداشت ${selectedNote?.user?.fullName}`}
				open={isNoteDeleteMode}
				onCancel={() => {
					setIsNoteDeleteMode(false)
					setSelectedNote(null)
				}}
				onOk={confirmDeleteNote}
				confirmLoading={notesApi.isLoading}
				okText='تایید'
				cancelText='انصراف'
				okButtonProps={{
					danger: true,
				}}
			>
				<Text>آیا از حذف این یادداشت اطمینان دارید؟</Text>
			</Modal>
		</>
	)
}

export default NoteManager
