import { Flex, Modal, Drawer, Typography } from 'antd'
import { useState } from 'react'
import moment from 'moment-jalaali'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import EditDescriptionLog from '../EditDescriptionLog/EditDescriptionLog'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'
import styles from './DescriptionModalCell.module.css'

const { Text } = Typography

const DescriptionModalCell = ({ record }) => {
	const [openEdit, setOpenEdit] = useState(false)
	const [openDescription, setOpenDescription] = useState(false)
	const [notes, setNotes] = useState(record.note || null)

	const { openNotification } = useNotification()
	const api = useAPI()

	const isOlderThanOneDay = moment().diff(moment(record.createdAt), 'hours') >= 24

	const handleEditClick = () => {
		if (!notes) {
			setOpenEdit(true)
		} else {
			setOpenDescription(true)
		}
	}

	const handleSubmit = async () => {
		const hadNoteBefore = Boolean(record.note)

		try {
			const response = await api.patch(`irrigations/${record._id}`, { note: notes })

			setNotes(response.irrigation.note)

			openNotification('success', hadNoteBefore ? 'ویرایش موفق' : 'ثبت موفق', hadNoteBefore ? 'توضیحات با موفقیت ویرایش شد' : 'توضیحات با موفقیت ثبت شد')

			setOpenEdit(false)
			setOpenDescription(false)
		} catch (error) {
			openNotification('error', 'خطا', 'مشکلی در ثبت اطلاعات به‌وجود آمد')
		}
	}

	const cancelEdit = () => {
		setOpenEdit(false)
	}

	const openEditFromModal = () => {
		setOpenDescription(false)
		setTimeout(() => setOpenEdit(true), 300)
	}

	return (
		<>
			<Flex align='center' justify='center' onClick={handleEditClick}>
				{isOlderThanOneDay ? (
					<EyeOutlined onClick={() => setOpenDescription(true)} className={styles.icon} />
				) : (
					<EditOutlined className={styles.icon} />
				)}
			</Flex>

			<Modal
				title={`توضیحات لاگ توزیع آب ${moment(record.startedAt).format('dddd jD jMMMM jYYYY')}`}
				open={openDescription}
				onCancel={() => setOpenDescription(false)}
				centered
				footer={
					!isOlderThanOneDay &&
					notes && (
						<Flex align='center' justify='start'>
							<EditOutlined onClick={openEditFromModal} className={styles.icon} />
							<Text className={styles.icon}>ویرایش</Text>
						</Flex>
					)
				}
			>
				<Text className={styles.text_note}>{notes || 'بدون توضیحات'}</Text>
			</Modal>

			<Drawer
				title={null}
				placement='bottom'
				height='auto'
				open={openEdit}
				onClose={cancelEdit}
				closable={false}
				maskClosable={true}
				rootClassName={styles.ModalMobileRoot}
				className={styles.containerDrawer}
			>
				<EditDescriptionLog onSubmit={handleSubmit} setNotes={setNotes} note={notes} onClose={cancelEdit} />
			</Drawer>
		</>
	)
}

export default DescriptionModalCell
