import { Card, Flex, Grid, Typography } from 'antd'
import styles from './SettingsCard.module.css'

const SettingsCard = ({ title, action, children }) => {
	const { useBreakpoint } = Grid;
	const screens = useBreakpoint();
	const isMobile = screens.xs;
	return (
		<Card>
			<Flex vertical gap={isMobile && 16}>
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
