import { Button, Card, Flex, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'
import styles from './NotesListMobile.module.css'

const NotesListMobile = ({ data, handleEditNote }) => {
	const { Text, Title } = Typography

	return (
		<Flex vertical gap={16} className={styles.wrapper}>
			{data?.map(note => (
				<Card key={note?._id} className={styles.card}>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between' gap={20}>
							<Title className={styles.title} level={4}>
								{note?.user ? `${note?.user.fullName}` : 'کاربر ناشناس'}
							</Title>
							<Text className={styles.date}>{moment(note?.createdAt).locale('fa').format(' jD jMMMM jYYYY - ساعت HH:mm')}</Text>
						</Flex>
						<Text className={styles.text}>{note?.text}</Text>
						<Flex gap={8}>
							<Button className={styles.btn} onClick={() => handleEditNote(note)} icon={<EditOutlined />} type='link'>
								ویرایش
							</Button>
						</Flex>
					</Flex>
				</Card>
			))}
		</Flex>
	)
}

export default NotesListMobile
