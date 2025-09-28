import { Form, Input } from 'antd'
import { useEffect } from 'react'
import ModalMobile from '../../../../../../../../../components/ModalMobile/ModalMobile'
import styles from './EditDescriptionLog.module.css'

const EditDescriptionLog = ({ onSubmit, loading, onClose, isOpen = true, note }) => {
	const [form] = Form.useForm()

	useEffect(() => {
		form.setFieldsValue({ text: note })
	}, [note, form])

	return (
		<ModalMobile
			height={322}
			loading={loading}
			open={isOpen}
			onClose={onClose}
			title='توضیحات لاگ'
			okText='ثبت'
			closeText='بازگشت'
			handleSubmit={() => {
				form.validateFields().then(values => {
					onSubmit(values.text)
				})
			}}
			form={form}
		>
			<div className={styles.container} style={{ padding: '0 16px', height: '100%' }}>
				<Form.Item noStyle className={styles.itemForm} name='text' rules={[{ required: true, message: 'لطفاً متن یادداشت را وارد کنید' }]}>
					<Input.TextArea className={styles.textArea} />
				</Form.Item>
			</div>
		</ModalMobile>
	)
}

export default EditDescriptionLog
