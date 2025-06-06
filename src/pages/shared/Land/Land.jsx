import { Button, Card, Flex, Form, Typography, Input, Space, Popconfirm, Modal } from 'antd'
import { EditOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import styles from './Land.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import { useEffect, useState, useRef } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import BackButton from '../../../components/BackButton/BackButton'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import LandInfo from './components/LandInfo/LandInfo'
import { useUser } from '../../../contexts/UserContext'

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [notesData, setNotesData] = useState(null)
	const { landId } = useParams()
	const [noteForm] = Form.useForm()
	const { openNotification } = useNotification()
	const cardRef = useRef(null)
	const { isAdmin } = useUser()

	const landApi = useAPI()
	const notesApi = useAPI()

	const [isShowModalNote, setIsShowModalNote] = useState(false)
	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
	const [selectedNote, setSelectedNote] = useState(null)

	const fetchLand = async () => {
		try {
			const response = await landApi.get(`lands/${landId}`)
			if (response?.land) {
				setLandData(response.land)
				setNotesData(response.land.notes)
			}
		} catch (error) {
			openNotification('error', 'خطا در دریافت اطلاعات زمین')
			console.error('خطا در دریافت اطلاعات زمین:', error)
		}
	}

	useEffect(() => {
		if (landId) {
			fetchLand()
		}
	}, [landId])

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
			openNotification('success', 'یادداشت با موفقیت حذف شد')
			fetchLand()
		} catch (error) {
			openNotification('error', 'خطا در حذف یادداشت')
			console.error('Error deleting note:', error)
		}
	}

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode && selectedNote?._id) {
				await notesApi.put(`lands/${landId}/notes/${selectedNote._id}`, values)
				openNotification('success', 'یادداشت با موفقیت ویرایش شد')
			} else {
				await notesApi.post(`lands/${landId}/notes`, values)
				openNotification('success', 'یادداشت با موفقیت افزوده شد')
			}
			setIsShowModalNote(false)
			setSelectedNote(null)
			noteForm.resetFields()
			fetchLand()
		} catch (error) {
			openNotification('error', `خطا در ${isNoteEditMode ? 'ویرایش' : 'افزودن'} یادداشت`)
			console.error(error)
		}
	}

	if (landApi.isLoading || !landData) return <Loading />

	return (
		<>
			<MetaTitle>ویرایش زمین</MetaTitle>

			<Flex vertical gap={10}>
				<Breadcrumbs data={landData} />
				<Flex>
					<BackButton backTo={'wells'} />
					<Title level={1} className='text-h3'>
						{landData.name}
					</Title>
				</Flex>

				<LandInfo landData={landData} />

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

						<Flex vertical gap={8} className={styles.wrapper}>
							{notesData?.map(note => (
								<div key={note._id} className={styles.fakePopoverBox}>
									<div className={styles.arrowLeft}></div>
									<Flex gap={8} vertical>
										<Flex align='center' justify='space-between'>
											<Flex align='center' gap={20}>
												<h4>{note?.user ? `${note.user.firstName} ${note.user.lastName}` : 'کاربر ناشناس'}</h4>
												<span className={styles.date}>
													{new Date(note.createdAt).toLocaleDateString('fa-IR', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
													})}
												</span>
											</Flex>
											<Space size={8} className={styles.btns}>
												<Button type='link' icon={<EditOutlined />} onClick={() => handleEditNote(note)} />
												<Popconfirm
													placement='topRight'
													title='آیا مطمئنید؟'
													getPopupContainer={trigger => trigger.parentElement}
													okText='بله'
													cancelText='خیر'
													onConfirm={() => handleDelete(note._id)}
												>
													<Button type='link' icon={<DeleteOutlined />} danger />
												</Popconfirm>
											</Space>
										</Flex>
										<p className={styles.commentText}>{note.text}</p>
									</Flex>
								</div>
							))}
						</Flex>
					</Card>
				</div>
				{isAdmin && <DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />}
			</Flex>

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

export default Land
