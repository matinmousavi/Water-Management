import { useEffect, useState } from 'react'
import { Flex, Tag, Typography, Modal, Select, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'
import WellLandsCard from './components/WellLandsCard/WellLandsCard'
import WellLogCard from './components/WellLogsCard/WellLogsCard'
import { useUser } from '../../../contexts/UserContext'
import { EditOutlined } from '@ant-design/icons'

const Well = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { isAdmin } = useUser()

	const [title, setPageTitle] = useState('')
	const [logs, setLogs] = useState([])
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
	const [status, setStatus] = useState([])
	const [form] = Form.useForm()

	if (wellId) api.init(`wells/${wellId}`)

	useEffect(() => {
		if (api.data?.well) {
			setPageTitle(api.data.well.title)
			setLogs(api.data.well.logs || [])
			// setStatus(userData.status)
		}
	}, [api.data?.well])

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

	if (api.isLoading || !api.data?.well) return <Loading />

	return (
		<>
			<MetaTitle>ویرایش چاه</MetaTitle>

			<Flex vertical>
				<Breadcrumbs data={api.data?.well} />

				<Flex align='center' gap={8}>
					<BackButton backTo='/wells' />
					<Typography.Title className='text-page-title'>{title}</Typography.Title>
					<Tag color={status === 'active' ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={() => setIsStatusModalOpen(true)}>
						<Flex align='center' gap={3}>
							{status === 'active' ? 'فعال' : 'غیرفعال'} <EditOutlined />
						</Flex>
					</Tag>
				</Flex>

				<WellInfoCard wellInfo={api.data?.well} setPageTitle={setPageTitle} />

				<WellLandsCard wellLands={api.data?.well?.lands} />

				<WellLogCard wellLogs={logs} setLogs={setLogs} />

				{isAdmin && <DeleteCard title='چاه' api={`wells/${wellId}`} backTo='/wells' />}
			</Flex>

			<Modal
				title={`تغییر وضعیت چاه ${api.data?.well?.title}`}
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

export default Well
