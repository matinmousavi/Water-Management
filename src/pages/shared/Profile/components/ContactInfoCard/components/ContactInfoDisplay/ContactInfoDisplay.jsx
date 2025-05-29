import { Row, Col, Typography } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../../../../../hooks/useAPI'

const { Text } = Typography

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]
const ContactInfoDisplay = ({ user }) => {
	const getRoleLabel = key => ROLES.find(r => r.key === key)?.label || '-'

	const contactInfo = [
		{
			label: 'نام و نام خانوادگی:',
			value: user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : '-',
		},
		{ label: 'ایمیل:', value: user?.email || '-' },
		{ label: 'موبایل:', value: user?.mobile || '-' },
		{ label: 'نقش:', value: getRoleLabel(user?.role) },
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

export default ContactInfoDisplay
