import styles from '../SettingsSection/SettingsCard/SettingsCard.module.css'
import { Button, Card, Flex, Input, Typography } from 'antd'

const BroadcastNotification = ({ title }) => {
	return (
		<Card>
			<Flex vertical gap={16}>
				<Flex className='heading-container' align='center' justify='space-between'>
					<Typography.Title className={styles['card-title']}>{title}</Typography.Title>
					<Flex justify='end'>
						<Button type='primary' onClick={() => {}}>
							ارسال به همه
						</Button>
					</Flex>
				</Flex>
				<Input.TextArea rows={4} placeholder='متن پیام را وارد کنید' value='' onChange={() => {}} />
			</Flex>
		</Card>
	)
}

export default BroadcastNotification
