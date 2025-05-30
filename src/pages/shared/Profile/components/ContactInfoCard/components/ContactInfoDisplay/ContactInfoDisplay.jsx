import { Row, Col, Typography } from 'antd'
import styles from './ContactInfoDisplay.module.css'
import english2persian from '../../../../../../../utils/english2persian'

const { Text } = Typography

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]
const ContactInfoDisplay = ({ user }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{ label: 'نقش:', value: getRoleLabel(user?.role) },
		{ label: 'شماره تماس:', value: english2persian(user?.mobile) || '-' },
		{ label: 'آدرس:', value: '-' },
		{ label: 'کد حسابداری:', value: user?.accountingCode || '-' },
		{ label: 'آدرس ایمیل:', value: user?.email || '-' },
		{ label: 'تاریخ ثبت کاربر:', value: user?.createdAt || '-' },
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

export default ContactInfoDisplay
