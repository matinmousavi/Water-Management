import { useState } from 'react'
import { Form } from 'antd'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import IrrigationModal from '../../../../../../../components/IrrigationModal/IrrigationModal'
import WellLogForm from '../WellLogForm/WellLogForm'

const WellEditLog = ({ wellId, initialValues, setLogs, isOpen, close }) => {
	const [form] = Form.useForm()
	const [loading, setLoading] = useState(false)
	const { openNotification } = useNotification()
	const api = useAPI()

	const handleEdit = async values => {
		setLoading(true)
		try {
			const response = await api.patch(`irrigations/${wellId}`, values)
			if (!response?.error) {
				openNotification('success', 'لاگ آبیاری با موفقیت ویرایش شد')
				setLogs(prev => prev.map(item => (item._id === wellId ? { ...item, ...values } : item)))
				close()
			}
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در ویرایش لاگ آبیاری')
		} finally {
			setLoading(false)
		}
	}

	return (
		<IrrigationModal type='edit' wellId={wellId} isOpen={isOpen} setIsOpen={close} loading={loading} initialValue={initialValues}>
			<WellLogForm form={form} onFinish={handleEdit} />
		</IrrigationModal>
	)
}

export default WellEditLog
