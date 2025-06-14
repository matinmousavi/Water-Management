import { Flex, Tag, Typography, Form, Modal, Select } from 'antd'
import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import { EditOutlined } from '@ant-design/icons'

const { Title } = Typography

const Profile = () => {
	const [pageTitle, setPageTitle] = useState('')
	const { user: currentUser } = useUser()
	const { userId } = useParams()
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
	const [status, setStatus] = useState([])
	const [form] = Form.useForm()

	const api = useAPI()
	if (userId) api.init(`users/${userId}`)

	const rawUserData = userId ? api.data?.user : currentUser

	const userDataRef = useRef(null)

	useEffect(() => {
		if (rawUserData && !userDataRef.current) {
			userDataRef.current = rawUserData
			const { firstName = '', lastName = '' } = rawUserData
			const defaultTitle = firstName || lastName ? `${firstName} ${lastName}` : 'پروفایل'
			setPageTitle(defaultTitle)
		}
	}, [rawUserData])

	if (userId && (api.isLoading || !api.data)) return <Loading />

	const userData = userDataRef.current || {}
	// setStatus(userData.status)

	const handleStatusChange = async () => {
		try {
			const values = await form.validateFields()
			const newStatus = values.status
			console.log('New Status:', newStatus)
			setStatus(newStatus)
			setIsStatusModalOpen(false)
		} catch (error) {
			openNotification('error', 'خطا در تغییر وضعیت  زمین')
			console.error('خطا در  تغییر وضعیت زمین:', error)
		}
	}

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between'>
				<Breadcrumbs data={{ title: pageTitle }} />

				<Flex align='center' gap={16}>
					<BackButton backTo='/users' />

					<Title level={1} className='text-page-title'>
						{pageTitle}
					</Title>

					<Tag color={status === 'active' ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={() => setIsStatusModalOpen(true)}>
						<Flex align='center' gap={3}>
							{status === 'active' ? 'فعال' : 'غیرفعال'} <EditOutlined />
						</Flex>
					</Tag>
				</Flex>

				<ContactInfoCard initialValue={userData} setPageTitle={setPageTitle} />
			</Flex>

			<Modal
				title={`تغییر وضعیت ${userData?.firstName}${userData?.lastName}`}
				open={isStatusModalOpen}
				onCancel={() => setIsStatusModalOpen(false)}
				onOk={handleStatusChange}
				okText='ثبت'
				cancelText='انصراف'
			>
				<Form layout='vertical' form={form} initialValues={{ status }}>
					<Form.Item name='status' label='وضعیت' rules={[{ required: true, message: 'لطفا وضعیت را انتخاب کنید' }]}>
						<Select
							optionLabelProp='label'
							options={[
								{
									label: (
										<Tag color='green' style={{ color: 'green', padding: '0 8px' }}>
											فعال
										</Tag>
									),
									value: 'active',
								},
								{
									label: (
										<Tag color='red' style={{ color: 'red', padding: '0 8px' }}>
											غیرفعال
										</Tag>
									),
									value: 'inactive',
								},
							]}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default Profile
