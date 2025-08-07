import { Button, Card, Flex, Form, Input, Modal, Typography } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import styles from './WellNote.module.css'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'
import NoteList from '../../../../../Land/components/LandNote/components/NoteList/NoteList'

const { Title, Text } = Typography

const WellNote = ({ notesData: initialNotes, status }) => {
	const { wellId } = useParams()
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
		if (!selectedNote?._id) return
		try {
			await notesApi.delete(`notes/${selectedNote._id}`)
			setNotes(prev => prev.filter(note => note._id !== selectedNote._id))
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
			if (isNoteEditMode && selectedNote?._id) {
				const response = await notesApi.patch(`notes/${selectedNote._id}`, {
					text: values.text,
				})

				setNotes(prev => prev.map(note => (note._id === response.id ? response : note)))
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				const response = await notesApi.post('notes', {
					type: 'well',
					reference: wellId,
					text: values.text,
				})

				if (!response.note?.id) throw new Error('Invalid response structure - missing _id')

				setNotes(prev => [...prev, response.note])
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

	return (
		<>
			<div ref={cardRef} className={styles.commentContainer}>
				<Card className={styles.card}>
					<Flex gap={36} vertical>
						<Flex align='center' justify='space-between'>
							<Title level={2} className='text-card-title'>
								یادداشت چاه ({notes?.length})
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

export default WellNote
