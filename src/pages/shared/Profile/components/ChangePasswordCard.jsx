import { Card, Button, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './ChangePasswordCard.module.css'

const ChangePasswordCard = () => (
	<Card className={styles.card}>
		<Flex align='center' justify='space-between'>
			<h2>تغییر پسورد</h2>
			<Button type='default' shape='round' icon={<EditOutlined />} size='middle'>
				<span>تغییر پسورد</span>
			</Button>
		</Flex>
	</Card>
)

export default ChangePasswordCard
