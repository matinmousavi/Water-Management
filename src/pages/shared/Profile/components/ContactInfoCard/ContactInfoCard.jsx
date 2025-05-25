import { Card, Col, Row, Typography, Button, Flex, Modal, Form, Radio } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './ContactInfoCard.module.css'
import { useState } from 'react'
import { useParams } from 'react-router'
import useAPI from '../../../../../hooks/useAPI'
import { useUser } from '../../../../../contexts/UserContext'
import FormFields from '../../../../../components/FormFields/FormFields'

const { Text, Title } = Typography

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const ContactInfoCard = ({ userData }) => {
	const { setUser } = useUser()
	const [isShowModal, setIsShowModal] = useState(false)
	const [form] = Form.useForm()
	const { userId } = useParams()
	const contactInfoApi = useAPI()
	const { isLoading } = contactInfoApi

	const [userInfo, setUserInfo] = useState(userData)

	const handleOpenModal = () => {
		setIsShowModal(true)
		form.setFieldsValue(userInfo)
	}

	const handleCloseModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}

	const onFinish = async values => {
		try {
			const endpoint = userId ? `users/${userId}` : 'me'
			const res = await contactInfoApi.patch(endpoint, values)

			if (!res?.error) {
				if (res?.user) {
					setUserInfo(res.user)
					setUser(res.user)
				}
				setIsShowModal(false)
			}
		} catch (error) {
			console.error('Operation failed:', error)
		}
	}

	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{
			label: 'نام و نام خانوادگی:',
			value: userInfo?.firstName || userInfo?.lastName ? `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim() : '-',
		},
		{ label: 'ایمیل:', value: userInfo?.email || '-' },
		{ label: 'موبایل:', value: userInfo?.mobile || '-' },
		{ label: 'نقش:', value: getRoleLabel(userInfo?.role) },
	]

	const contactFormFields = [
		{
			name: 'firstName',
			label: 'نام',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'lastName',
			label: 'نام خانوادگی',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'role',
			label: 'نقش',
			col: 24,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
			customComponent: (
				<Radio.Group>
					{ROLES.map(role => (
						<Radio key={role.key} value={role.key}>
							{role.label}
						</Radio>
					))}
				</Radio.Group>
			),
		},
		{
			name: 'email',
			label: 'ایمیل',
			rules: [
				{
					pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
					message: 'فرمت ایمیل معتبر نیست',
				},
			],
		},
		{
			name: 'mobile',
			label: 'موبایل',
			rules: [
				{ required: true, message: 'شماره موبایل الزامی است' },
				{
					pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
					message: 'شماره موبایل معتبر نیست!',
				},
			],
		},
	]

	return (
		<>
			<Card className={styles.card}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						اطلاعات شخصی
					</Title>
					<Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal}>
						<span>ویرایش</span>
					</Button>
				</Flex>

				<div className={styles.infoWrapper}>
					<Row gutter={[0, 8]}>
						{contactInfo.map((item, index) => (
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

			<Modal title='ویرایش اطلاعات' centered open={isShowModal} onCancel={handleCloseModal} footer={null}>
				<Form form={form} onFinish={onFinish} layout='vertical' size='large'>
					<FormFields fields={contactFormFields} />
					<Row justify='end' gutter={8}>
						<Col>
							<Button onClick={handleCloseModal}>انصراف</Button>
						</Col>
						<Col>
							<Button type='primary' htmlType='submit' loading={isLoading}>
								ذخیره
							</Button>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	)
}

export default ContactInfoCard
