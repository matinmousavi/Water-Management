import { Button, Flex, Form, Input, Modal } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../../../hooks/useModal'

const GroupEditLogs = () => {
	const [form] = Form.useForm()
	const { open, isOpen, close } = useModal()
	const handleCancel = () => {
		form.resetFields()
		close()
	}
	const handleSubmit = () => {
		form.resetFields()
		close()
	}
	return (
		<>
			<Button color='primary' variant='outlined' size='middle' onClick={open}>
				<Flex gap={8} align='center' justify='center'>
					<PlusCircleOutlined />
					<span>افزودن لاگ</span>
				</Flex>
			</Button>
			<Modal
				title='افزودن لاگ توزیع'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText='ثبت'
				cancelText='انصراف'
				// confirmLoading={irrigationApi?.isLoading}
				forceRender
			>
				<Form>
					<Form.Item name='landId' label='زمین' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
export default GroupEditLogs
