import { Card, Flex, Typography, Button, Spin, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import moment from 'moment-jalaali'
import styles from './ListNotesGroup.module.css'

const ListNotesGroup = ({ notes = [], loading, onEdit, onDelete }) => {
	const { Title, Text } = Typography

	if (!notes.length) {
		return (
			<Flex align='center' justify='center' style={{ padding: 24 }}>
				<Text type='secondary'>یادداشتی ثبت نشده است</Text>
			</Flex>
		)
	}

	return (
		<Flex gap={16} vertical>
			{notes.map(note => (
				<Card key={note.id} className={styles.card}>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between' gap={20}>
							<Title className={styles.title} level={5}>
								{note.user?.fullName || 'کاربر ناشناس'}
							</Title>
							<Text className={styles.date}>{moment(note.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</Text>
						</Flex>

						<Text className={styles.text}>{note.text}</Text>

						<Flex gap={8} justify='end'>
							<Button size='small' type='link' icon={<EditOutlined />} onClick={() => onEdit(note)}>
								ویرایش
							</Button>
						</Flex>
					</Flex>
				</Card>
			))}
		</Flex>
	)
}

export default ListNotesGroup
