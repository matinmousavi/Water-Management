import { Button, Card, Flex, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './MyNotes.module.css'
import NotesIcon from '../../../assets/icons/NotesIcon.svg'
const MyNotes = () => {
	const { Title, Text } = Typography
	const dataNotes = [
		{
			name: 'چاه فیروزی',
			date: '1404/2/15',
			text: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی است.',
		},
		{
			name: 'چاه گلستان',
			date: '1404/2/15',
			text: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی است.',
		},
	]
	return (
		<Flex gap={20} vertical align='center'>
			<Flex gap={8}>
				<img src={NotesIcon} alt='notes icon' />
				<Title level={1} className={styles.headTitle}>
					یادداشت های من
				</Title>
			</Flex>
			<Flex vertical gap={8}>
				{dataNotes.map((notes, index) => (
					<Card>
						<Flex align='center' justify='space-between'>
							<Title className={styles.title} level={4}>
								{notes.name}
							</Title>
							<span className={styles.date}>| {notes.date}</span>
						</Flex>
						<Text className={styles.text}>{notes.text}</Text>
						<div>
							<Button icon={<EditOutlined />} type='link'>
								ویرایش
							</Button>
						</div>
					</Card>
				))}
			</Flex>
		</Flex>
	)
}
export default MyNotes
