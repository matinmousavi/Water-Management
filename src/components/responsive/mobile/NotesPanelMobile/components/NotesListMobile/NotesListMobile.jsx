import { Button, Card, Flex, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'

import styles from './NotesListMobile.module.css'

const { Title, Text } = Typography

const NotesListMobile = ({ notes = [], onEditNote }) => (
	<Flex vertical gap={16} className={styles.wrapper}>
		{notes.map(note => {
			const id = note?._id || note?.id

			return (
				<Card key={id}>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between' gap={20}>
							<Title className={styles.title} level={4}>
								{note?.user ? note.user.fullName : 'کاربر ناشناس'}
							</Title>
							<Text className={styles.date}>{moment(note?.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</Text>
						</Flex>
						<Flex gap={8} vertical>
							<Text className={styles.text}>{note?.text}</Text>
							{onEditNote && (
								<Button className={styles.btn} onClick={() => onEditNote(note)} icon={<EditOutlined />} type='link'>
									ویرایش
								</Button>
							)}
						</Flex>
					</Flex>
				</Card>
			)
		})}
	</Flex>
)

export default NotesListMobile
