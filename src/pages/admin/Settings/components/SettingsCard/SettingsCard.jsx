import { Card, Flex, Typography } from 'antd'
import styles from './SettingsCard.module.css'

const SettingsCard = ({ title, action, children }) => {
	return (
		<Card>
			<Flex vertical>
				<Flex align='center' justify='space-between'>
					<Typography.Title className={styles['card-title']}>{title}</Typography.Title>
					{action}
				</Flex>
				{children}
			</Flex>
		</Card>
	)
}

export default SettingsCard
