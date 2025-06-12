import { Button, Flex, Form, Modal } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import { useParams } from 'react-router'

import useModal from '../../../../../../../hooks/useModal'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

import WellAddLandsForm from '../WellAddLandsForm/WellAddLandsForm'

const WellAddLand = ({ setLandsData, currentLands = [] }) => {
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

			const response = await wellApi.patch(`wells/${wellId}`, {
				lands: values.lands,
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت به چاه اضافه شد')

				if (typeof setLandsData === 'function') {
					setLandsData({ lands: response.well.lands })
				}

				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', err?.error?.message || 'خطا در افزودن زمین')
		}
	}, [form, wellApi, wellId, setLandsData, openNotification, close])

	return (
		<>
			<Button className='style-btn' size='middle' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={8}>
					<PlusCircleOutlined />
					<span>افزودن زمین</span>
				</Flex>
			</Button>

			<Modal
				title='افزودن زمین'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='ثبت'
				cancelText='انصراف'
				confirmLoading={wellApi.isLoading}
				loading={landApi.isLoading}
			>
				<WellAddLandsForm form={form} lands={(landApi.data?.lands || []).filter(land => !currentLands.some(selected => selected._id === land._id))} />
			</Modal>
		</>
	)
}

export default WellAddLand
