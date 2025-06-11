import { Button, Card, Drawer, Flex, Form, Input, Modal, Space, Typography } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import styles from './MobileLandNotes.module.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../../../hooks/useAPI'
import MobileNotesList from './components/MobileNotesList/MobileNotesList'
import useNotification from '../../../../../../../../../hooks/useNotification'

const { Title } = Typography

const MobileLandNotes = ({ notesData: initialNotes }) => {
	const { landId } = useParams()
	const notesApi = useAPI()
	const { openNotification } = useNotification()
	const [noteForm] = Form.useForm()
	const [open, setOpen] = useState(false)

	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
	const [selectedNote, setSelectedNote] = useState(null)
	const [notes, setNotes] = useState(initialNotes || [])

	useEffect(() => {
		setNotes(initialNotes || [])
	}, [initialNotes])

	const handleOpenAddNoteModal = () => {
		showDrawer()
		setIsNoteEditMode(false)
		noteForm.resetFields()
		setSelectedNote(null)
	}

	const handleEditNote = note => {
		setIsNoteEditMode(true)
		setSelectedNote(note)
		noteForm.setFieldsValue({ text: note.text })
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

	const showDrawer = () => {
		setOpen(true)
	}

	const onClose = () => {
		setOpen(false)
	}

	return (
		<>
			<div className={styles.commentContainer}>
				<div className={styles.card}>
					<Flex className={styles.buttonAddNote} align='center' justify='space-between'>
						<Button type='default' onClick={handleOpenAddNoteModal}>
							افزودن یادداشت
						</Button>
					</Flex>

					<MobileNotesList handleDelete={handleDelete} handleEditNote={handleEditNote} data={notes} />
				</div>
			</div>

			<Drawer placement='bottom' closable={false} width={322} onClose={onClose} open={open}>
				<Space>
					<span className={styles.lineDrawer}></span>
				</Space>
				<Form form={noteForm} onFinish={handleSubmitNote} layout='vertical' size='large'>
					<Title className='title-form'>افزودن یادداشت</Title>
					<Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
						<Input.TextArea rows={4} />
					</Form.Item>
					<Flex justify='end' gap={8}>
						<Button onClick={() => setIsShowModalNote(false)}>انصراف</Button>
						<Button type='primary' htmlType='submit' loading={notesApi.isLoading}>
							{isNoteEditMode ? 'ذخیره تغییرات' : 'ذخیره'}
						</Button>
					</Flex>
				</Form>
			</Drawer>
		</>
	)
}
export default MobileLandNotes
