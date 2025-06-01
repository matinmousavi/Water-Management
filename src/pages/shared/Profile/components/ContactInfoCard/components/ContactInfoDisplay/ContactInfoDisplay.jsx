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
	console.log(userData);
	

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
					<Row className={styles.row}>
						<Col xs={8} className={styles.label}>
							<Text className='text-label'>{item.label}</Text>
						</Col>
						<Col xs={16} className={styles.value}>
							<Text className='text-label'>{item.value}</Text>
						</Col>
					</Row>
				</Col>
			))}
		</Row>
	)
}

export default React.memo(ContactInfoDisplay)
