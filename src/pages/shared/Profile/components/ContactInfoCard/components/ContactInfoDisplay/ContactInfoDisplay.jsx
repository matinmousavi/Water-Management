import React from 'react'
import { Row, Col, Typography, Avatar, Grid } from 'antd'
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
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const contactInfo = [
		{ label: 'نقش', value: getRoleLabel(userData?.role) },
		{ label: 'کد حساب‌داری', value: userData?.accountingCode ? userData.accountingCode : '-' },
		{ label: 'شماره تماس', value: userData?.mobile ? userData.mobile : '-' },
		{ label: 'آدرس ایمیل', value: userData?.email || '-' },
		{ label: 'آدرس', value: userData?.address || '-' },
		{ label: 'تاریخ ثبت کاربر', value: moment(userData?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	return (
		<Row gutter={[40, 0]} align='middle'>
			<Col 
			xs={24}
			md={8}
			flex={isMobile ? 'auto' : 'none'}
			className={styles.container_avatar}
			>
				<Avatar src={userData?.profilePicture?.url} icon={<UserOutlined />} className={styles.avatar} />
			</Col>
			<Col 
			xs={24}
			md={16}
			flex='auto'
			>
				<Row gutter={[0, 20]}>
					{contactInfo.map((item, index) => (
						<Col xs={24} md={12} key={index}>
							<Row>
								<Col xs={12} md={8} className='label'>
									<Typography.Text className='text-label'>{item.label}</Typography.Text>
								</Col>
								<Col xs={12} md={16} className='value'>
									<Typography.Text className='text-value'>{item.value}</Typography.Text>
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
