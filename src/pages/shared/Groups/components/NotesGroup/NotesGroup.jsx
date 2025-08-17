import { Button, Flex, Form, Input } from 'antd'
import styles from './NotesGroup.module.css'
import { useState, useEffect } from 'react'
import ModalMobile from '../../../../../components/ModalMobile/ModalMobile'
import ListNotesGroup from './components/ListNotes/ListNotesGroup'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'

const NotesGroup = ({ groupId }) => {
	const [open, setOpen] = useState(false) // برای افزودن یادداشت
	const [openEdit, setOpenEdit] = useState(false) // برای ویرایش یادداشت
	const [editingNote, setEditingNote] = useState(null) // یادداشت در حال ویرایش

	const [addForm] = Form.useForm()
	const [editForm] = Form.useForm()

	const { openNotification } = useNotification()
	const noteApi = useAPI()

	// گرفتن لیست یادداشت‌های گروه زمین
	useEffect(() => {
		if (groupId) {
			noteApi.init('notes', {
				filters: { type: 'landGroup', reference: groupId },
			})
		}
	}, [groupId])

	// بستن مودال‌ها
	const onClose = () => {
		setOpen(false)
		setOpenEdit(false)
		addForm.resetFields()
		editForm.resetFields()
		setEditingNote(null)
	}

	// افزودن یادداشت
	const handleSubmitNote = async () => {
		try {
			const values = await addForm.validateFields()
			await noteApi.post(
				'notes',
				{
					text: values.text,
					type: 'landGroup',
					reference: groupId,
				},
				{
					responseHandler: (prev, res) => ({
						...prev,
						notes: [res.note, ...(prev?.notes || [])],
					}),
				}
			)
			openNotification('success', 'یادداشت اضافه شد', 'یادداشت با موفقیت اضافه شد')
			onClose()
		} catch (error) {
			console.error(error)
			openNotification('error', error.message || 'خطا در افزودن یادداشت')
		}
	}

	// ویرایش یادداشت
	const handleEditSubmit = async () => {
		try {
			const values = await editForm.validateFields()
			const noteId = editingNote?.id || editingNote?._id
			if (!noteId) throw new Error('آیدی یادداشت پیدا نشد')

			await noteApi.patch(
				`notes/${noteId}`,
				{ text: values.text },
				{
					responseHandler: (prev, res) => ({
						...prev,
						notes: prev.notes.map(n => (n.id === noteId || n._id === noteId ? res.note : n)),
					}),
				}
			)

			openNotification('success', 'ویرایش موفق', 'یادداشت با موفقیت ویرایش شد')
			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', err?.message || 'خطا در ویرایش یادداشت')
		}
	}

	return (
		<Flex vertical style={{ width: '100%' }}>
			<div className={styles.footer}>
				<Button type='default' onClick={() => setOpen(true)} className={`button-modal ${styles.buttonAdd}`}>
					افزودن یادداشت
				</Button>
			</div>

			{/* لیست یادداشت‌ها */}
			<ListNotesGroup
				notes={noteApi.data?.notes || []}
				loading={noteApi.isLoading}
				onEdit={note => {
					setEditingNote(note)
					editForm.setFieldsValue({ text: note.text })
					setOpenEdit(true)
				}}
			/>

			{/* مودال افزودن یادداشت */}
			<ModalMobile
				form={addForm}
				onClose={onClose}
				height={322}
				open={open}
				loading={noteApi.isLoading}
				handleSubmit={handleSubmitNote}
				title='افزودن یادداشت'
			>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
			</ModalMobile>

			{/* مودال ویرایش یادداشت */}
			<ModalMobile
				form={editForm}
				onClose={onClose}
				height={322}
				open={openEdit}
				loading={noteApi.isLoading}
				handleSubmit={handleEditSubmit}
				title='ویرایش یادداشت'
			>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
			</ModalMobile>
		</Flex>
	)
}

export default NotesGroup
