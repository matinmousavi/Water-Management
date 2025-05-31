import React from 'react'
import { Row, Col, Typography } from 'antd'

const { Text } = Typography

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]
const ContactInfoDisplay = ({ userData }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{
			label: 'نام و نام خانوادگی:',
			value: userData?.firstName || userData?.lastName ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() : '-',
		},
		{ label: 'ایمیل:', value: userData?.email || '-' },
		{ label: 'موبایل:', value: userData?.mobile || '-' },
		{ label: 'نقش:', value: getRoleLabel(userData?.role) },
	]

	return (
		<Row gutter={[0, 8]}>
			{contactInfo.map((item, index) => (
				<Col key={index} xs={24} md={20} lg={18}>
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
	)
}

export default React.memo(ContactInfoDisplay)
