import { Modal, Row, Col, message, Flex } from 'antd'
import { useNavigate } from 'react-router-dom'
import moment from 'moment-jalaali'
import styles from './NotesModal.module.css'
import useAPI from '../../../../hooks/useAPI'

const NotesModal = ({ visible, onCancel }) => {
	const navigate = useNavigate()
	const api = useAPI()

	api.init('dashboard/notes')

	const markAsReadAndNavigate = async note => {
		try {
			const res = await api.patch(`dashboard/notes/${note._id}/mark-read`)
			if (!res || res.error) throw new Error('Failed to mark note as read')

			if (note.reference?.id) {
				switch (note.type) {
					case 'land':
						navigate(`/lands/${note.reference.id}`)
						break
					case 'well':
						navigate(`/wells/${note.reference.id}`)
						break
					case 'landGroup':
						navigate(`/land-groups/${note.reference.id}`)
						break
					default:
						message.info('مرجع قابل پیمایش ندارد')
				}
			} else {
				message.info('مرجع معتبر ندارد')
			}
		} catch (error) {
			console.error('Error marking note as read:', error)
			message.error('خطا در بروزرسانی یادداشت')
		}
	}

	return (
		<Modal title='یادداشت‌ها' open={visible} onCancel={onCancel} loading={api.isLoading} footer={null} width={689}>
			{api.data.notes && api.data.notes.length > 0 ? (
				<Row gutter={[16, 16]}>
					{api.data.notes.map(note => {
						const time = `ساعت ${moment(note.createdAt).format('HH:mm')}`
						const date = moment(note.createdAt).format('jD jMMMM jYYYY')

						return (
							<Col xs={24} sm={24} key={note._id}>
								<div className={styles.noteCard} onClick={() => markAsReadAndNavigate(note)} style={{ cursor: 'pointer' }}>
									<Flex vertical gap={8}>
										<Flex justify='space-between' align='center'>
											<Flex>
												<p className={styles.authorName}>{note.user?.fullName || 'کاربر ناشناس'}</p>
												<p className={styles.dateTime}>
													{date} - {time}
												</p>
											</Flex>
											<p className={styles.location}>{note.reference?.title || 'مرجع ندارد'}</p>
										</Flex>
										<p className={styles.note}>{note.text}</p>
									</Flex>
								</div>
							</Col>
						)
					})}
				</Row>
			) : (
				<p style={{ textAlign: 'center', width: '100%' }}>یادداشتی وجود ندارد</p>
			)}
		</Modal>
	)
}

export default NotesModal
