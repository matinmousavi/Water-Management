import React from 'react'
import { Row, Col, Typography } from 'antd'
import styles from './ContactInfoDisplay.module.css'
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
		{
			label: 'نام و نام خانوادگی:',
			value: userData?.firstName || userData?.lastName ? `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() : '-',
		},
		{ label: 'ایمیل:', value: userData?.email || '-' },
		{ label: 'موبایل:', value: userData?.mobile || '-' },
		{ label: 'نقش:', value: getRoleLabel(userData?.role) },
	]

	return (
		<Row gutter={[0, 8]} className={styles.wrapper}>
			<Col xs={24} md={20} lg={12}>
				{contactInfo.slice(0, 3).map((item, index) => (
					<Row key={index} className={styles.row}>
						<Col xs={6} className={styles.label}>
							<Text className='text-label'>{item.label}</Text>
						</Col>
						<Col xs={18} className={styles.value}>
							<Text className='text-label'>{item.value}</Text>
						</Col>
					</Row>
				))}
			</Col>
			<Col xs={24} md={20} lg={12}>
				{contactInfo.slice(3, 6).map((item, index) => (
					<Row key={index} className={styles.row}>
						<Col xs={6} className={styles.label}>
							<Text className='text-label'>{item.label}</Text>
						</Col>
						<Col xs={18} className={styles.value}>
							<Text className='text-label'>{item.value}</Text>
						</Col>
					</Row>
				))}
			</Col>
		</Row>
	)
}

export default React.memo(ContactInfoDisplay)
