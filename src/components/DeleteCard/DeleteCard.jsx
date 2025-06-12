import { App, Button, Card, Flex, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import useAPI from '../../hooks/useAPI'
import style from './DeleteCard.module.css'
import { DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

const DeleteCard = ({ title, api, backTo }) => {
	const { modal } = App.useApp()
	const deleteAPI = useAPI()
	const navigate = useNavigate()

	const handleDelete = () => {
		modal.confirm({
			title: `حذف ${title}`,
			content: `آیا از حذف این ${title} مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
			okText: 'بله، حذف شود',
			cancelText: 'انصراف',
			okType: 'danger',
			centered: true,
			onOk: async () => {
				try {
					await deleteAPI.delete(`${api}`)
					message.success(`${title} با موفقیت حذف شد`)
					if (backTo) navigate(backTo)
				} catch (error) {
					message.error(`خطا در حذف ${title}`)
					console.error('Error deleting:', error)
				}
			},
			okButtonProps: {
				loading: deleteAPI.isLoading,
			},
		})
	}

	return (
		<Card className={style.card}>
			<Flex justify='space-between' align='center'>
				<Title level={2} className='text-card-title'>
					حذف {title}
				</Title>
				<Button danger onClick={handleDelete} loading={deleteAPI.isLoading} icon={<DeleteOutlined />}>
					حذف
				</Button>
			</Flex>
		</Card>
	)
}

export default DeleteCard
