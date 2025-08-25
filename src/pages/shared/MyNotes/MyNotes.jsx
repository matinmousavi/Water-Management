import { Button, Card, Empty, Flex, Typography } from 'antd'
import { useState } from 'react'

import { useUser } from '../../../contexts/UserContext'
import useAPI from '../../../hooks/useAPI'

import moment from 'moment-jalaali'

import Loading from '../../../components/Loading/Loading'
import EditNotes from './components/EditNotes/EditNotes'

import styles from './MyNotes.module.css'

import { EditOutlined } from '@ant-design/icons'
import NotesIcon from '../../../assets/icons/NotesIcon.svg'
import HeaderIrrigation from '../../../components/HeaderIrrigation/HeaderIrrigation'

const MyNotes = () => {
	const [editingNoteId, setEditingNoteId] = useState(null)
	const { Title, Text } = Typography
	const { user } = useUser()
	const userId = user._id

	const apiNotes = useAPI()
	apiNotes.init('notes', { filters: { user: userId } })
	if (apiNotes.isLoading) return <Loading />

	const onClose = () => {
		setEditingNoteId(null)
	}

	return (
		<Flex gap={20} vertical>
			<HeaderIrrigation title='یادداشت های من' icon={NotesIcon} />

			<Flex vertical gap={16}>
				{apiNotes.data?.notes?.length == 0 ? (
					<Empty />
				) : (
					apiNotes.data?.notes?.map(note => {
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
											<Button className={styles.btn} onClick={() => setEditingNoteId(note?.id)} icon={<EditOutlined />} type='link'>
												ویرایش
											</Button>
										</div>
									</Flex>
								</Flex>
								<EditNotes setNotesData={apiNotes.setData} id={note?.id} text={note?.text} open={isOpen} onClose={onClose} />
							</Card>
						)
					})
				)}
			</Flex>
		</Flex>
	)
}

export default MyNotes
