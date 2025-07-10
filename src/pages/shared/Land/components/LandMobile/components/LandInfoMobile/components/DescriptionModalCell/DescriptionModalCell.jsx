import { Flex, Modal, Drawer } from 'antd'
import { useState } from 'react'
import moment from 'moment-jalaali'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import EditDescriptionLog from '../EditDescriptionLog/EditDescriptionLog'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'

const DescriptionModalCell = ({ record }) => {
	const [openEdit, setOpenEdit] = useState(false)
	const [openDescription, setOpenDescription] = useState(false)
	const [notes, setNotes] = useState(record.note || null)
	const [initialNote, setInitialNote] = useState(record.note || null)

	const { openNotification } = useNotification()
	const api = useAPI()

	const isOlderThanOneDay = moment().diff(moment(record.createdAt), 'hours') >= 24

	const onEditClick = () => {
		setInitialNote(notes || null)
		setOpenEdit(true)
	}
	const handleEditNotice = async () => {
		const isEditing = Boolean(initialNote)

		const response = await api.patch(`irrigations/${record._id}`, { note: notes })
		if (isEditing) {
			setNotes(response.irrigation.note)
			openNotification('success', 'ویرایش موفق', 'لاگ با موفقیت ویرایش شد')
		} else {
			setNotes(response.irrigation.note)
			openNotification('success', 'ثبت موفق', ' لاگ با موفقیت ثبت شد')
		}
		setOpenEdit(false)
	}

	const cancelEdit = () => {
		setOpenEdit(false)
	}

	return (
		<Flex align='center' justify='center' gap={8}>
			{isOlderThanOneDay ? (
				<EyeOutlined onClick={() => setOpenDescription(true)} style={{ color: '#1890ff', cursor: 'pointer' }} />
			) : (
				<EditOutlined onClick={onEditClick} style={{ color: '#1890ff', cursor: 'pointer' }} />
			)}

			<Modal
				title={`توضیحات لاگ توزیع آب  ${moment(record.startedAt).format('dddd jD jMMMM jYYYY')}`}
				open={openDescription}
				onCancel={() => setOpenDescription(false)}
				centered
				footer={null}
			>
				{record.note || 'بدون توضیحات'}
			</Modal>

			<Drawer title={null} placement='bottom' height='auto' open={openEdit} onClose={() => setOpenEdit(false)} closable={false}>
				<div>
					<EditDescriptionLog onSubmit={handleEditNotice} setNotes={setNotes} note={notes} onClose={cancelEdit} />
				</div>
			</Drawer>
		</Flex>
	)
}

export default DescriptionModalCell
