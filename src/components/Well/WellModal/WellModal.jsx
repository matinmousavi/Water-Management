import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const WellModal = ({ type = 'add', editType = 'info', data = null, setData, setTitle, isOpen, setIsOpen, children }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const selectApi = useAPI()
	const { openNotification } = useNotification()
	const { wellId } = useParams()

	const well = api.data.well || data

	if (isOpen) {
		if (editType === 'info') {
			selectApi.init('users', { role: 'irrigator' })
		} else if (editType === 'lands') {
			selectApi.init('lands')
		}
	}

	useEffect(() => {
		if (isOpen && type === 'edit' && well) {
			if (editType === 'info') {
				form.setFieldsValue({ ...well, irrigator: well.irrigator?._id || null })
			}
		}
	}, [isOpen, type, well, editType, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await api.post('wells', values)
			} else {
				response = await api.patch(`wells/${wellId}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `چاه با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (typeof setData === 'function') {
					setData(response)
				}

				if (type === 'edit' && typeof setTitle === 'function') {
					setTitle(prev => (prev !== response.well.title ? response.well.title : prev))
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			console.log(error)
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}

	const childWithProps = React.isValidElement(children)
		? React.cloneElement(children, {
				form,
				...(editType === 'info' && { irrigators: selectApi.data.users }),
				...(editType === 'lands' && {
					lands: selectApi.data?.lands?.filter(land => !(well?.lands || []).some(selected => selected._id === land._id)),
				}),
		  })
		: children

	return (
		<Modal
			title={type === 'add' ? 'افزودن چاه' : 'ویرایش چاه'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			confirmLoading={api.isLoading}
			loading={selectApi.isLoading}
			okText='ذخیره'
			cancelText='انصراف'
		>
			{childWithProps}
		</Modal>
	)
}

export default WellModal
