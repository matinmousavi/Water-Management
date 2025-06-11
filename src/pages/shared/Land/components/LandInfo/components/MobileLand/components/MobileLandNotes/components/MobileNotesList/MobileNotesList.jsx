import { Card, Flex, Typography } from 'antd'
import styles from './MobileNotesList.module.css'
const MobileNotesList = ({ data }) => {
	const { Text } = Typography
	return (
		<Flex vertical gap={16} className={styles.wrapper}>
			{data?.map(note => (
				<Card>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between' gap={20}>
							<h4>{note?.user ? `${note?.user.firstName} ${note?.user.lastName}` : 'کاربر ناشناس'}</h4>
							<span className={styles.date}>
								{new Date(note?.createdAt).toLocaleDateString('fa-IR', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</span>
						</Flex>
						<Text>{note?.text}</Text>
					</Flex>
				</Card>
			))}
		</Flex>
	)
}
export default MobileNotesList
