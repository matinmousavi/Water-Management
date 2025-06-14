import React from 'react'
import { Row, Col, Flex, Typography, Avatar } from 'antd'
import moment from 'moment-jalaali'
import { UserOutlined } from '@ant-design/icons'
import styles from './ContactInfoDisplay.module.css'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const ContactInfoDisplay = ({ userData }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{ label: 'نقش', value: getRoleLabel(userData?.role) },
		{ label: 'کد حسابداری', value: userData?.accountingCode ? userData.accountingCode : '-' },
		{ label: 'شماره تماس', value: userData?.mobile ? userData.mobile : '-' },
		{ label: 'آدرس ایمیل', value: userData?.email || '-' },
		{ label: 'آدرس', value: userData?.address || '-' },
		{ label: 'تاریخ ثبت کاربر', value: moment(userData?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	return (
		<Row gutter={[40, 0]} align='middle' wrap={false}>
			<Col flex='none' className={styles.container_avatar}>
				<Avatar src={userData?.profilePicture?.url} icon={<UserOutlined />} className={styles.avatar} />
			</Col>
			<Col flex='auto'>
				<Row gutter={[0, 20]}>
					{contactInfo.map((item, index) => (
						<Col xs={24} md={12} key={index}>
							<Row>
								<Col xs={8} className='label'>
									<Typography.Text className='text'>{item.label}</Typography.Text>
								</Col>
								<Col xs={16} className='value'>
									<Typography.Text className='text'>{item.value}</Typography.Text>
								</Col>
							</Row>
						</Col>
					))}
				</Row>
			</Col>
		</Row>
	)
}

export default React.memo(ContactInfoDisplay)
