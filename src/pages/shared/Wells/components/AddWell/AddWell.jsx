import { useCallback } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import WellForm from '../../../../../components/Well/WellForm/WellForm'
import useNotification from '../../../../../hooks/useNotification'

const AddWell = ({ wellsApi }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const irrigatorsApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		irrigatorsApi.init('users', { role: 'irrigator' })
		form.resetFields()
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()

			const formattedValues = {
				...values,
				cycleStartDate: values.cycleStartDate ? values.cycleStartDate.toDate() : null,
				workTime: {
					start: values.startTime ? values.startTime.toDate() : null,
					end: values.endTime ? values.endTime.toDate() : null,
				},
			}

			delete formattedValues.startTime
			delete formattedValues.endTime

			const tempId = 'temp-' + Date.now()

			await wellsApi.post('wells', formattedValues, {
				optimisticUpdate: prev => ({
					...prev,
					wells: [...(prev?.wells || []), { ...formattedValues, _id: tempId, status: 'active' }],
				}),
				rollback: prev => ({
					...prev,
					wells: prev?.wells?.filter(w => w._id !== tempId) || [],
				}),
				responseHandler: (prev, res) => ({
					...prev,
					wells: prev.wells.map(w => (w._id === tempId ? res.well : w)),
				}),
			})

			openNotification('success', 'عملیات موفق', 'چاه با موفقیت افزوده شد.')
			close(() => form.resetFields(), 'after')
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', err?.error?.message || err?.message || 'خطایی رخ داده است')
		}
	}, [form, wellsApi, close, openNotification])

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={8} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن چاه</span>
				</Flex>
			</Button>

			<Modal
				title='افزودن چاه'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={wellsApi.isLoading}
				loading={irrigatorsApi.isLoading}
				okText='ثبت'
				cancelText='انصراف'
				forceRender
			>
				<WellForm form={form} irrigators={irrigatorsApi.data?.users || []} />
			</Modal>
		</>
	)
}

export default AddWell
