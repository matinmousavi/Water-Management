import { Card, Flex, Typography } from 'antd'
import styles from './NotesListMobile.module.css'
const NotesListMobile = ({ data }) => {
	const { Text, Title } = Typography
	return (
		<Flex vertical gap={16} className={styles.wrapper}>
			{data?.map(note => (
				<Card>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between' gap={20}>
							<Title className={styles.title} level={4}>
								{note?.user ? `${note?.user.firstName} ${note?.user.lastName}` : 'کاربر ناشناس'}
							</Title>
							<Text className={styles.date}>
								|{' '}
								{new Date(note?.createdAt).toLocaleDateString('fa-IR', {
									hour: 'numeric',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</Text>
						</Flex>
						<Text className={styles.text}>{note?.text}</Text>
					</Flex>
				</Card>
			))}
		</Flex>
	)
}
export default NotesListMobile
