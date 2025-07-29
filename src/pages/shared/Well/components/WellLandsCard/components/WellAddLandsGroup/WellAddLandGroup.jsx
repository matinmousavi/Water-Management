import { Button, Flex, Form, Modal } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import { useParams } from 'react-router'

import useModal from '../../../../../../../hooks/useModal'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

import WellAddLandsGroupForm from '../WellAddLandsGroupForm/WellAddLandsGroupForm'

const WellAddLandsGroup = ({ setLandsData, currentLands = [] }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const landApi = useAPI()
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { wellId } = useParams()

	const handleOpen = () => {
		landApi.init('lands')
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()

			const patchRes = await wellApi.patch(`wells/${wellId}`, {
				lands: [...currentLands.map(land => land._id), ...values.lands],
			})

			if (patchRes?.error) {
				openNotification('error', 'خطا', patchRes.message)
				return
			}

			const response = await wellApi.post(`wells/${wellId}/land-groups/`, {
				title: values.groupName,
				lands: values.lands,
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت به گروه اضافه شد')
				if (typeof setLandsData === 'function') {
					setLandsData({ lands: response.group.lands })
				}
				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطا در افزودن گروه')
		}
	}, [form, wellApi, wellId, setLandsData, openNotification, close, currentLands])

	return (
		<>
			<Button color='primary' variant='outlined' size='middle' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={8} align='center' justify='center'>
					<PlusCircleOutlined />
					<span>گروه‌بندی</span>
				</Flex>
			</Button>

			<Modal
				title='ساخت گروه جدید'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='ثبت'
				cancelText='انصراف'
				confirmLoading={wellApi.isLoading}
				loading={landApi.isLoading}
			>
				<WellAddLandsGroupForm
					form={form}
					lands={(landApi.data?.lands || []).filter(land => currentLands.some(selected => selected._id === land._id))}
				/>
			</Modal>
		</>
	)
}

export default WellAddLandsGroup
