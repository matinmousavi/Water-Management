import { Button, Card, Flex, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './MyNotes.module.css'
import NotesIcon from '../../../assets/icons/NotesIcon.svg'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import EditNotes from './components/EditNotes/EditNotes'
import { useState } from 'react'
import moment from 'moment-jalaali'
const MyNotes = () => {
	const [isOpen, setIsOpen] = useState(false)
	const { Title, Text } = Typography
	const apiNotes = useAPI()
	apiNotes.init('notes')
	if (apiNotes.isLoading) return <Loading />
	const onClose = () => {
		setIsOpen(false)
	}
	return (
		<Flex gap={20} vertical>
			<Flex justify='center' gap={8}>
				<img src={NotesIcon} alt='notes icon' />
				<Title level={1} className={styles.headTitle}>
					یادداشت های من
				</Title>
			</Flex>
			<Flex vertical gap={8}>
				{apiNotes.data?.notes?.map(notes => (
					<Card key={notes?.id} rootClassName={styles.customCardRoot}>
						<Flex align='center' justify='space-between'>
							<Title className={styles.title} level={4}>
								{notes?.reference?.title}
							</Title>
							<span className={styles.date}>| {moment(notes?.updatedAt).locale('fa').format('HH:mm dddd jD jMMMM jYYYY')}</span>
						</Flex>
						<Text className={styles.text}>{notes?.text}</Text>
						<div>
							<Button onClick={() => setIsOpen(true)} icon={<EditOutlined />} type='link'>
								ویرایش
							</Button>
						</div>
						<EditNotes text={notes?.text} open={isOpen} onClose={onClose} />
					</Card>
				))}
			</Flex>
		</Flex>
	)
}
export default MyNotes
