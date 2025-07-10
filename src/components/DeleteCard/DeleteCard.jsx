import { Button, Card, Flex, Form, Modal, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import useAPI from '../../hooks/useAPI'
import style from './DeleteCard.module.css'
import { DeleteOutlined } from '@ant-design/icons'
import useModal from '../../hooks/useModal'
import useNotification from '../../hooks/useNotification'
import { useCallback } from 'react'

const { Title } = Typography

const DeleteCard = ({ title, api , backTo }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const deleteAPI = useAPI()
	const navigate = useNavigate()
	
	const { openNotification } = useNotification()
	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			await deleteAPI.delete(api)
			openNotification('success', `${title} با موفقیت حذف شد`)
			if (backTo) navigate(backTo)
		} catch (error) {
			openNotification('error', `خطا در حذف ${title}`)
			console.error('Error deleting:', error)
		}
	}, [])

	return (
		<Card className={style.card}>
			<Flex justify='space-between' align='center'>
				<Title level={2} className='text-card-title'>
					حذف {title}
				</Title>
				<Button danger onClick={() => open()} loading={deleteAPI.isLoading}>
					<Flex align='center' gap={8}>
						<DeleteOutlined /> <span>حذف</span>
					</Flex>
				</Button>
			</Flex>
			<Modal
				title={`حذف ${title}`}
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='تایید'
				cancelText='انصراف'
				okButtonProps={{
					danger: true,
					type: 'primary',
				}}
				confirmLoading={deleteAPI.isLoading}
				loading={deleteAPI.isLoading}
			>
				<p>آیا از حذف این {title.split(' ')[0]} اطمینان دارید؟</p>
			</Modal>
		</Card>
	)
}

export default DeleteCard
