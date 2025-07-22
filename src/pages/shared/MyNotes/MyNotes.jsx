import { Button, Card, Flex, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './MyNotes.module.css'
import NotesIcon from '../../../assets/icons/NotesIcon.svg'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import EditNotes from './components/EditNotes/EditNotes'
import { useState } from 'react'
import moment from 'moment-jalaali'
import { useUser } from '../../../contexts/UserContext'

const MyNotes = () => {
	const [editingNoteId, setEditingNoteId] = useState(null)
	const { Title, Text } = Typography
	const { user } = useUser()
	const userId = user._id

	const apiNotes = useAPI()
	apiNotes.init(`notes/user/${userId}`)

	if (apiNotes.isLoading) return <Loading />

	const onClose = () => {
		setEditingNoteId(null)
	}

	return (
		<Flex gap={20} vertical>
			<Flex justify='center' gap={8}>
				<img src={NotesIcon} alt='notes icon' />
				<Title level={1} className={styles.headTitle}>
					یادداشت‌های من
				</Title>
			</Flex>

			<Flex vertical gap={8}>
				{apiNotes.data?.notes?.map(note => {
					const isOpen = editingNoteId === note?.id
					return (
						<Card key={note?.id} rootClassName={styles.customCardRoot}>
							<Flex gap={5} vertical>
								<Flex align='center' className={styles.cardHeader} justify='space-between'>
									<Title className={styles.title} level={4}>
										زمین {note?.reference?.title}
									</Title>
									<span className={styles.date}>{moment(note?.updatedAt).locale('fa').format(' jD jMMMM jYYYY - ساعت HH:mm')}</span>
								</Flex>
								<Flex gap={8} vertical>
									<Text className={styles.text}>{note?.text}</Text>
									<div>
										<Button onClick={() => setEditingNoteId(note?.id)} icon={<EditOutlined />} type='link'>
											ویرایش
										</Button>
									</div>
								</Flex>
							</Flex>
							<EditNotes setNotesData={apiNotes.setData} id={note?.id} text={note?.text} open={isOpen} onClose={onClose} />
						</Card>
					)
				})}
			</Flex>
		</Flex>
	)
}

export default MyNotes
