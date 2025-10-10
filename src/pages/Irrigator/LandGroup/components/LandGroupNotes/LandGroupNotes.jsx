import { Button, Flex, Form, Input } from 'antd'
import styles from './LandGroupNotes.module.css'
import { useState, useEffect } from 'react'
import BottomSheetModal from '../../../../../components/responsive/mobile/BottomSheetModal/BottomSheetModal'
import ListNotesGroup from './components/ListNotes/ListNotesGroup'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'

const LandGroupNotes = ({ groupId }) => {
	const [open, setOpen] = useState(false)
	const [addForm] = Form.useForm()

	const { openNotification } = useNotification()
	const noteApi = useAPI()

	useEffect(() => {
		if (groupId) {
			noteApi.init('notes', {
				filters: { type: 'landGroup', reference: groupId },
			})
		}
	}, [groupId])

	const onClose = () => {
		setOpen(false)
		addForm.resetFields()
	}

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

	return (
		<Flex vertical style={{ width: '100%' }}>
			<div className={styles.footer}>
				<Button type='default' onClick={() => setOpen(true)} className={`button-modal ${styles.buttonAdd}`}>
					افزودن یادداشت
				</Button>
			</div>

			<ListNotesGroup notes={noteApi.data?.notes || []} loading={noteApi.isLoading} noteApi={noteApi} openNotification={openNotification} />

                        <BottomSheetModal
                                form={addForm}
                                onClose={onClose}
                                height={322}
                                open={open}
                                loading={noteApi.isLoading}
                                onSubmit={handleSubmitNote}
                                title='افزودن یادداشت'
                        >
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<div className={styles.modalContainer}>
						<Input.TextArea className={styles.textArea} />
					</div>
				</Form.Item>
                        </BottomSheetModal>
                </Flex>
        )
}

export default LandGroupNotes
