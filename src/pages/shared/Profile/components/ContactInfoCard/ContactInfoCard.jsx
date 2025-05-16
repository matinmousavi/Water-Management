import { Card, Col, Row, Typography, Button, Flex, Modal, Form, Input, Spin } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './ContactInfoCard.module.css'
import { useEffect, useState } from 'react'
import useAPI from '../../../../../hooks/useAPI'

const { Text } = Typography

const ContactInfoCard = ({ userId }) => {
	const [isShowModal, setIsShowModal] = useState(false)
	const [editUser, setEditUser] = useState()
	const [form] = Form.useForm()
	const [saving, setSaving] = useState(false)
	const profileApi = useAPI()
	profileApi.init(`users/${userId}`)
	const handleOpenModal = () => {
		setIsShowModal(true)
		form.setFieldsValue(userData)
	}

	const handleCloseModal = () => {
		setIsShowModal(false)
		form.resetFields()
	}

	const onFinish = async values => {
		setSaving(true)
		const res = await profileApi.patch(`users/${userId}`, values)
		if (res?.user) {
			setEditUser(res.user)
		}
		setSaving(false)
		setIsShowModal(false)
	}
	useEffect(() => {
		profileApi.get(`users/${userId}`)
	}, [editUser])

	if (profileApi.isLoading) {
		return (
			<div style={{ textAlign: 'center', marginTop: 64 }}>
				<Spin size='large' />
			</div>
		)
	}
	const userData = profileApi.data.user
	const contactInfo = [
		{ label: 'نام و نام خانوادگی:', value: `${userData?.firstName || '-'} ${userData?.lastName || '-'} ` || '-' },
		{ label: 'ایمیل:', value: userData?.email || '-' },
		{ label: 'موبایل:', value: userData?.mobile || '-' },
	]

	return (
		<>
			<Card className={styles.card}>
				<Flex align='center' justify='space-between'>
					<h2>اطلاعات شخصی</h2>
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
										<Text className={styles.text} strong>
											{item.label}
										</Text>
									</Col>
									<Col xs={14}>
										<Text className={styles.text}>{item.value}</Text>
									</Col>
								</Row>
							</Col>
						))}
					</Row>
				</div>
			</Card>
			<Modal title='ویرایش اطلاعات' centered open={isShowModal} onCancel={handleCloseModal} footer={null}>
				<Form form={form} onFinish={onFinish} layout='vertical' size='large'>
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<Form.Item name='firstName' label='نام' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='lastName' label='نام خانوادگی' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						name='email'
						label='ایمیل'
						rules={[
							{
								pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
								message: 'فرمت ایمیل معتبر نیست',
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item name='mobile' label='موبایل' rules={[{ required: true, message: 'شماره موبایل الزامی است' }]}>
						<Input />
					</Form.Item>
					<Row justify='end' gutter={8}>
						<Col>
							<Button onClick={handleCloseModal}>انصراف</Button>
						</Col>
						<Col>
							<Button type='primary' htmlType='submit' loading={saving}>
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
