import { useEffect, useState } from 'react'
import { Input, Modal } from 'antd'

const EditNotes = ({ open, onClose, text }) => {
	const [editedText, setEditedText] = useState(text)

	useEffect(() => {
		if (open) {
			setEditedText(text)
		}
	}, [open, text])

	return (
		<Modal onCancel={onClose} open={open} title='ویرایش یادداشت'>
			<Input.TextArea value={editedText} onChange={e => setEditedText(e.target.value)} rows={5} />
		</Modal>
	)
}
export default EditNotes
