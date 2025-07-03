import { useEffect, useState } from 'react'
import { Typography, Tag, Grid, Flex, Modal, Select, Form } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useParams } from 'react-router'

import useAPI from '../../../hooks/useAPI'
import { useUser } from '../../../contexts/UserContext'

import Loading from '../../../components/Loading/Loading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'
import WellLandsCard from './components/WellLandsCard/WellLandsCard'
import WellLogCard from './components/WellLogsCard/WellLogsCard'
import WellLogsMobile from './components/WellLogsMobile/WellLogsMobile'

import iconWell from '../../../assets/icons/Vector.svg'
import useNotification from '../../../hooks/useNotification'
import WellStatus from './components/WellStatus'

const Well = () => {
	const { wellId } = useParams()
	const api = useAPI()
	const { user, isAdmin } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	const { openNotification } = useNotification()

	const [title, setTitle] = useState('')
	const [logs, setLogs] = useState([])
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
	const [status] = useState([])
	const [form] = Form.useForm()

	wellId ? api.init(`wells/${wellId}`) : api.init('wells', { irrigator: user._id })

	useEffect(() => {
		const fetchedWell = api.data?.well || api.data?.wells?.[0]
		if (fetchedWell) {
			setTitle(fetchedWell.title)
			setLogs(fetchedWell.logs || [])
		}
	}, [api.data?.well])

	const handleStatusChange = async () => {
		try {
			const values = await form.validateFields()
			await api.patch(`wells/${actualWellId}`, { status: values.status })
			setIsStatusModalOpen(false)
			openNotification('وضعیت چاه با موفقیت تغییر کرد')
		} catch (error) {
			openNotification('خطا در تغییر وضعیت چاه', error)
		}
	}

	if (api.isLoading || (!api.data?.well && !api.data?.wells)) {
		return <Loading />
	}

	const well = api.data?.well || api.data?.wells?.[0]
	const actualWellId = wellId || well?._id

	return (
		<>
			<MetaTitle>چاه</MetaTitle>

			<Flex vertical gap='large'>
				{isMobile ? (
					<Flex gap={8} justify='center' align='center'>
						<img src={iconWell} alt='icon' />
						<Typography.Title level={2} className='text-h2'>
							چاه {well?.title}
						</Typography.Title>
					</Flex>
				) : (
					<>
						<Breadcrumbs data={{ title }} />
						<Flex align='center' gap={16}>
							<BackButton backTo='/wells' />
							<Typography.Title className='text-page-title'>{title}</Typography.Title>
							<WellStatus wellId={wellId} currentStatus={well?.status} />
						</Flex>
					</>
				)}

				{!isMobile && (
					<>
						<WellInfoCard wellInfo={well} setPageTitle={setTitle} />
						<WellLandsCard wellLands={well?.lands} />
						<WellLogCard wellLogs={logs} wellId={actualWellId} setLogs={setLogs} />
					</>
				)}

				{isMobile && (
					<Flex vertical gap={12}>
						{well?.logs?.map(log => (
							<WellLogsMobile key={log._id} data={log} />
						))}
					</Flex>
				)}

				{isAdmin && <DeleteCard title='چاه' api={`wells/${actualWellId}`} backTo='/wells' />}
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
