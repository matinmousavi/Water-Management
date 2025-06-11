import { Button, Card, Flex, Form, Input, Modal, Typography } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import styles from './LandNote.module.css'
import useAPI from '../../../../../hooks/useAPI'
import { useEffect, useRef, useState } from 'react'
import useNotification from '../../../../../hooks/useNotification'
import { useParams } from 'react-router'
import NoteList from './components/NoteList/NoteList'

const { Title } = Typography

const LandNote = ({ notesData: initialNotes }) => {
	const { landId } = useParams()
	const cardRef = useRef()
	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const [noteForm] = Form.useForm()

	const [isShowModalNote, setIsShowModalNote] = useState(false)
	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
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

	const handleDelete = async noteId => {
		try {
			await notesApi.delete(`lands/${landId}/notes/${noteId}`)
			setNotes(prev => prev.filter(note => note?._id !== noteId))
			openNotification('success', 'یادداشت با موفقیت حذف شد')
		} catch (error) {
			openNotification('error', 'خطا در حذف یادداشت')
			console.error('Error deleting note:', error)
		}
	}

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode && selectedNote?._id) {
				const response = await notesApi.put(`lands/${landId}/notes/${selectedNote._id}`, values)
				console.log('Full update response:', response)

				const updatedData = response.data || response.note || response
				if (!updatedData._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => prev.map(note => (note._id === updatedData._id ? updatedData : note)))
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				const response = await notesApi.post(`lands/${landId}/notes`, values)
				console.log('Full create response:', response)

				const newData = response.data || response.note || response
				if (!newData._id) {
					throw new Error('Invalid response structure - missing _id')
				}

				setNotes(prev => [...prev, newData])
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
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-h2'>
							یادداشت زمین
						</Title>
						<Button type='default' onClick={handleOpenAddNoteModal}>
							<PlusCircleOutlined />
							<span>افزودن یادداشت</span>
						</Button>
					</Flex>

					<NoteList handleDelete={handleDelete} handleEditNote={handleEditNote} data={notes} />
				</Card>
			</div>

			<Modal
				title={isNoteEditMode ? 'ویرایش یادداشت' : 'افزودن یادداشت'}
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
						<Input.TextArea rows={4} placeholder='متن یادداشت را وارد کنید...' />
					</Form.Item>
					<Flex justify='end' gap={8}>
						<Button onClick={() => setIsShowModalNote(false)}>انصراف</Button>
						<Button type='primary' htmlType='submit' loading={notesApi.isLoading}>
							{isNoteEditMode ? 'ذخیره تغییرات' : 'ذخیره'}
						</Button>
					</Flex>
				</Form>
			</Modal>
		</>
	)
}
export default LandNote
