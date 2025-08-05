import { Card, Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import styles from './ListNotesGroup.module.css'
const ListNotesGroup = () => {
	const { Title, Text } = Typography
	return (
		<Flex gap={16} vertical>
			<Card>
				<Flex gap={8} vertical>
					<Flex align='center' justify='space-between' gap={20}>
						<Title className={styles.title} level={4}>
							نام و نام خانوادگی{' '}
						</Title>
						<Text className={styles.date}>{moment(new Date()).locale('fa').format(' jD jMMMM jYYYY - ساعت HH:mm')}</Text>
					</Flex>
					<Text className={styles.text}>
						متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متشت چند خطی متن یادداشت چند خطی متن
						یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی است.
					</Text>
				</Flex>
			</Card>
		</Flex>
	)
}

export default ListNotesGroup
