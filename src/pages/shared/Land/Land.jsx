import { Button, Card, Flex, Form, Typography, Input, Space, Popconfirm } from 'antd'
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

const { Title } = Typography

const Land = () => {
	const [landData, setLandData] = useState(null)
	const [notesData, setNotesData] = useState(null)
	const { landId } = useParams()
	const [noteForm] = Form.useForm()
	const { openNotification } = useNotification()
	const cardRef = useRef(null)

	const landApi = useAPI()
	const notesApi = useAPI()

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
							<Button type='default' shape='round' icon={<PlusCircleOutlined />} onClick={handleOpenAddNoteModal}>
								افزودن یادداشت
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
													{new Date(note.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
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

				<DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />
			</Flex>
		</>
	)
}

export default Land
