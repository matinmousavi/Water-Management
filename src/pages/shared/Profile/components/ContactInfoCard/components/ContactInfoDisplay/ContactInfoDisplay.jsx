import React from 'react'
import { Row, Col, Typography } from 'antd'
import moment from 'moment-jalaali'

moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true })

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const ContactInfoDisplay = ({ userData }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{ label: 'نقش:', value: getRoleLabel(userData?.role) },
		{ label: 'کد حسابداری:', value: userData?.accountingCode ? userData.accountingCode : '-' },
		{ label: 'شماره تماس:', value: userData?.mobile ? userData.mobile : '-' },
		{ label: 'آدرس ایمیل', value: userData?.email || '-' },
		{ label: 'آدرس:', value: userData?.address || '-' },
		{ label: 'تاریخ ثبت کاربر:', value: moment(userData?.updatedAt).format('dddd jD jMMMM jYYYY') || '-' },
	]

	return (
		<Row gutter={[0, 30]}>
			{contactInfo.map((item, index) => (
				<Col xs={24} md={12} key={index}>
					<Row>
						<Col xs={6} className='label'>
							<Typography.Text className='text'>{item.label}</Typography.Text>
						</Col>
						<Col xs={18} className='value'>
							<Typography.Text className='text'>{item.value}</Typography.Text>
						</Col>
					</Row>
				</Col>
			))}
		</Row>
	)
}

export default React.memo(ContactInfoDisplay)
