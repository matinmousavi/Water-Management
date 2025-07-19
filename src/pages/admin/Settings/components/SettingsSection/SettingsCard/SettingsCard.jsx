import { Card, Typography, Flex, Input } from 'antd'
import styles from './SettingsCard.module.css'

const SettingsCard = ({ data, title, children }) => {
	return (
		<Card>
			<Flex vertical gap={16}>
				<Flex className='heading-container' align='center' justify='space-between'>
					<Typography.Title className={styles['card-title']}>{title}</Typography.Title>
					{children}
				</Flex>
				{data.key === 'public_information_registration' ? (
					<Input.TextArea rows={4} placeholder='متن پیام را وارد کنید' value={data.text} onChange={() => {}} />
				) : (
					<Typography.Text className={styles['card-text']}>{data.text}</Typography.Text>
				)}
			</Flex>
		</Card>
	)
}

export default SettingsCard
