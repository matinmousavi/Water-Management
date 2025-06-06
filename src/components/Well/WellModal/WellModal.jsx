import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import { useParams } from 'react-router'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const WellModal = ({ children, type = 'add', editSection = 'information', isOpen, setIsOpen, initialData = null, setData, setPageTitle }) => {
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const selectApi = useAPI()
	const { openNotification } = useNotification()
	const { wellId } = useParams()

	const well = wellApi.data.well || initialData

	if (isOpen) {
		if (editSection === 'info') {
			selectApi.init('users', { role: 'irrigator' })
		} else if (editSection === 'lands') {
			selectApi.init('lands')
		}
	}

	useEffect(() => {
		if (isOpen && type === 'edit' && well) {
			if (editSection === 'info') {
				form.setFieldsValue({ ...well, irrigator: well.irrigator?._id || null })
			}
		}
	}, [isOpen, type, well, editSection, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await wellApi.post('wells', values)
			} else {
				response = await wellApi.patch(`wells/${wellId}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `چاه با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (typeof setData === 'function') {
					setData(response)
				}

				if (type === 'edit' && typeof setPageTitle === 'function') {
					setPageTitle(prev => (prev !== response.well.title ? response.well.title : prev))
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}

	const childWithProps = React.isValidElement(children)
		? React.cloneElement(children, {
				form,
				...(editSection === 'information' && { irrigators: selectApi.data.users }),
				...(editSection === 'lands' && {
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
			confirmLoading={wellApi.isLoading}
			loading={selectApi.isLoading}
			okText='ذخیره'
			cancelText='انصراف'
		>
			{childWithProps}
		</Modal>
	)
}

export default WellModal
