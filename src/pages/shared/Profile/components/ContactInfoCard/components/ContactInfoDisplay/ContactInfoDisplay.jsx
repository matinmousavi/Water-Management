import React from 'react'
import { Row, Col, Typography } from 'antd'
import english2persian from '../../../../../../../utils/english2persian'

const { Text } = Typography

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const ContactInfoDisplay = ({ userData }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{ label: 'نقش:', value: getRoleLabel(userData?.role) },
		{ label: 'کد حسابداری:', value: userData?.accountingCode ? english2persian(userData.accountingCode) : '-' },
		{ label: 'شماره تماس:', value: userData?.mobile ? english2persian(userData.mobile) : '-' },
		{ label: 'آدرس ایمیل', value: userData?.email || '-' },
		{ label: 'آدرس:', value: userData?.address || '-' },
		{ label: 'تاریخ ثبت کاربر:', value: userData?.updatedAt || '-' },
	]

	return (
		<Row gutter={[0, 30]}>
			{contactInfo.map((item, index) => (
				<Col xs={24} md={12} key={index}>
					<Row>
						<Col xs={6} className="label">
							<Text className='text'>{item.label}</Text>
						</Col>
						<Col xs={18} className="value">
							<Text className='text'>{item.value}</Text>
						</Col>
					</Row>
				</Col>
			))}
		</Row>
	)
}

export default React.memo(ContactInfoDisplay)
