import { Modal, Row, Col, Flex } from 'antd'
import styles from './NotesModal.module.css'

const NotesModal = ({ visible, onCancel }) => {
	const notesData = [
		{
			key: '1',
			author: 'علی احمدی',
			date: '1 اردیبهشت 1404',
			time: '10:30',
			note: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یاددا...',
		},
		{
			key: '2',
			author: 'مریم کریمی',
			date: '5 خرداد 1404',
			time: '14:20',
			note: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یاددا...',
		},
		{
			key: '3',
			author: 'محمد رضایی',
			date: '14 تیر 1404',
			time: '09:15',
			note: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یاددا...',
		},
		{
			key: '4',
			author: 'فاطمه محمدی',
			date: '23 مرداد 1404',
			time: '16:45',
			note: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یاددا...',
		},
		{
			key: '5',
			author: 'حسن علیزاده',
			date: '5 شهریور 1404',
			time: '11:30',
			note: 'متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یادداشت چند خطی متن یاددا...',
		},
	]

	return (
		<Modal title={'یادداشت‌های جدید'} open={visible} onCancel={onCancel} footer={null} width={689}>
			<Flex vertical gap={16}>
				<Row gutter={[16, 16]}>
					{notesData.map(note => {
						return (
							<Col xs={24} sm={24} key={note.key}>
								<div className={styles.noteCard}>
									<Flex vertical gap={8}>
										<Flex align='center' justify='space-between'>
											<Flex align='center' gap={20}>
												<p className={styles.authorName}>{note.author}</p>
												<p className={styles.dateTime}>
													{note.date} - ساعت {note.time}
												</p>
											</Flex>
											<p className={styles.location}>نام چاه - نام زمین</p>
										</Flex>
										<p className={styles.note}>{note.note}</p>
									</Flex>
								</div>
							</Col>
						)
					})}
				</Row>
			</Flex>
		</Modal>
	)
}

export default NotesModal
