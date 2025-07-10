import { Flex, Modal, Drawer } from 'antd'
import { useState } from 'react'
import moment from 'moment-jalaali'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import EditDescriptionLog from '../EditDescriptionLog/EditDescriptionLog'
import useAPI from '../../../../../../../../../hooks/useAPI'

const DescriptionModalCell = ({ record, onUpdateNotes }) => {
	const [openEdit, setOpenEdit] = useState(false)
	const [openDescription, setOpenDescription] = useState(false)
	const [notes, setNotes] = useState(record.note || '')
	const api = useAPI()
	api.init('irrigations')
	const isOlderThanOneDay = moment().diff(moment(record.createdAt), 'hours') >= 24

	const handleSave = () => {
		onUpdateNotes(record._id, notes)
		setOpen(false)
	}
	console.log(api.data?.irrigations)
	console.log(record)

	const handleEditNotice = () => {
		api.patch('irrigations', { note: notes })
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
				<EditOutlined onClick={() => setOpenEdit(true)} style={{ color: '#1890ff', cursor: 'pointer' }} />
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
					<EditDescriptionLog onSubmit={handleEditNotice} setNotes={setNotes} notes={record?.note} onClose={cancelEdit} />
				</div>
			</Drawer>
		</Flex>
	)
}

export default DescriptionModalCell
