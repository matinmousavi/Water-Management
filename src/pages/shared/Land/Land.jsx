import { Button, Card, Col, Flex, Form, Modal, Row, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './Land.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import FormFields from '../../../components/FormFields/FormFields'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import SelectOwner from '../../../components/SelectOwner/SelectOwner'

const { Text, Title } = Typography

const Land = () => {
	const [isShowModal, setIsShowModal] = useState(false)
	const [landData, setLandData] = useState(null)
	const { landId } = useParams()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()

	const landApi = useAPI()

	useEffect(() => {
		const fetchLand = async () => {
			try {
				const response = await landApi.get(`lands/${landId}`)
				if (response?.land) {
					setLandData(response.land)
				}
			} catch (error) {
				openNotification('error', 'خطا در دریافت اطلاعات زمین')
				console.error('خطا در دریافت اطلاعات زمین:', error)
			}
		}

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
		setIsShowModal(true)
	}

	const handleCloseModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}

	const onFinish = async values => {
		try {
			const response = await landApi.patch(`lands/${landId}`, values)
			if (!response?.error) {
				setIsShowModal(false)
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
				<Title level={1} className='text-h1'>
					زمین ها
				</Title>

				<Card>
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-h2'>
							مشخصات زمین
						</Title>
						<Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal}>
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

				<DeleteCard title='زمین' api={`lands/${landId}`} backTo='/lands' />

				<Modal title='ویرایش اطلاعات' centered open={isShowModal} onCancel={handleCloseModal} footer={null}>
					<Form form={form} onFinish={onFinish} layout='vertical' size='large'>
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
			</Flex>
		</>
	)
}

export default Land
