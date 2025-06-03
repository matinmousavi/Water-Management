import { Button, Card, Col, Flex, Form, Modal, Row, Typography, Input, Space, Popconfirm } from 'antd'
import { EditOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import styles from './Land.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import FormFields from '../../../components/FormFields/FormFields'
import { useEffect, useState, useRef } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'

import SelectOwner from '../../../components/SelectOwner/SelectOwner'
import BackButton from '../../../components/BackButton/BackButton'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'

const { Text, Title } = Typography
const { TextArea } = Input

const Land = () => {
	const [isShowModalEdit, setIsShowModalEdit] = useState(false)
	const [isShowModalNote, setIsShowModalNote] = useState(false)
	const [isNoteEditMode, setIsNoteEditMode] = useState(false)
	const [selectedNote, setSelectedNote] = useState(null)

	const [landData, setLandData] = useState(null)
	const [notesData, setNotesData] = useState(null)
	const { landId } = useParams()
	const [form] = Form.useForm()
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

	const handleOpenModal = () => {
		if (landData) {
			form.setFieldsValue({
				name: landData.name,
				owner: landData.owner?.id,
				area: landData.area,
				kFactor: landData.kFactor,
				location: landData.location,
				irrigationType: landData.irrigationType,
			})
		}
		setIsShowModalEdit(true)
	}

	const handleCloseModal = () => {
		setIsShowModalEdit(false)
		form.resetFields()
	}

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

	const handleSubmitNote = async values => {
		try {
			if (isNoteEditMode) {
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

	const onFinish = async values => {
		try {
			const response = await landApi.patch(`lands/${landId}`, values)
			if (!response?.error) {
				setIsShowModalEdit(false)
				setLandData(response.land)
			}
		} catch (error) {
			console.error('Operation failed:', error)
		}
	}

	if (landApi.isLoading || !landData) return <Loading />

	const landInfoList = [
		{ label: 'نام زمین', value: landData.name },
		{ label: 'مالک', value: `${landData.owner?.firstName || ''} ${landData.owner?.lastName || ''}` },
		{ label: 'متراژ', value: `${landData.area} متر مربع` },
		{ label: 'ضریب k', value: landData.kFactor },
		{ label: 'موقعیت', value: landData.location || '-' },
		{ label: 'نوع آبیاری', value: landData.irrigationType },
		{ label: 'تعداد چاه‌ها', value: `${landData.wells?.length || 0}` },
	]

	const LandFormFields = [
		{
			name: 'name',
			label: 'نام',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'owner',
			label: 'مالک',
			col: 12,
			customComponent: <SelectOwner />,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'area',
			label: 'مساحت',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'kFactor',
			label: 'ضریب K',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'location',
			label: 'موقعیت',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'irrigationType',
			label: 'نوع آبیاری',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
	]

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

				<Card>
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-h2'>
							مشخصات زمین
						</Title>
						<Button type='default' shape='round' icon={<EditOutlined />} onClick={handleOpenModal}>
							ویرایش
						</Button>
					</Flex>

					<div className={styles.infoWrapper}>
						<Row gutter={[0, 8]}>
							{landInfoList.map((item, index) => (
								<Col key={index} xs={24} md={20} lg={18} className={styles.line}>
									<Row>
										<Col xs={10}>
											<Text className='text-label'>{item.label}</Text>
										</Col>
										<Col xs={14}>
											<Text className='text-label'>{item.value}</Text>
										</Col>
									</Row>
								</Col>
							))}
						</Row>
					</div>
				</Card>

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

				<Modal title='ویرایش اطلاعات' centered open={isShowModalEdit} onCancel={handleCloseModal} footer={null}>
					<Form form={form} onFinish={onFinish} layout='horizontal' size='large'>
						<FormFields fields={LandFormFields} />
						<Row justify='end' gutter={8}>
							<Col>
								<Button onClick={handleCloseModal}>انصراف</Button>
							</Col>
							<Col>
								<Button type='primary' htmlType='submit' loading={landApi.isLoading}>
									ذخیره
								</Button>
							</Col>
						</Row>
					</Form>
				</Modal>

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
					<Form form={noteForm} onFinish={handleSubmitNote} layout='horizontal' size='large'>
						<Form.Item name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
							<TextArea rows={4} placeholder='متن یادداشت را وارد کنید...' />
						</Form.Item>
						<Row justify='end' gutter={8}>
							<Col>
								<Button onClick={() => setIsShowModalNote(false)}>انصراف</Button>
							</Col>
							<Col>
								<Button type='primary' htmlType='submit' loading={notesApi.isLoading}>
									{isNoteEditMode ? 'ذخیره تغییرات' : 'ذخیره'}
								</Button>
							</Col>
						</Row>
					</Form>
				</Modal>
			</Flex>
		</>
	)
}

export default Land
