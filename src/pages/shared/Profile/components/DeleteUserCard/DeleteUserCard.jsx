import { Button, Card, Flex, message, App } from 'antd'
import style from './DeleteUserCard.module.css'
import useAPI from '../../../../../hooks/useAPI'
import { useNavigate, useParams } from 'react-router'
import useNotification from '../../../../../hooks/useNotification'

const DeleteUserCard = () => {
	const { userId } = useParams()
	const { modal } = App.useApp()
	const { delete: deleteAPI, isLoading } = useAPI()
	const navigate = useNavigate()
	const { openNotification } = useNotification()
	const handleDelete = () => {
		modal.confirm({
			title: 'حذف کاربر',
			content: 'آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.',
			okText: 'بله، حذف شود',
			cancelText: 'انصراف',
			okType: 'danger',
			centered: true,
			onOk: async () => {
				try {
					await deleteAPI(`users/${userId}`)
					navigate('/users')
					message.success('کاربر با موفقیت حذف شد')
					openNotification('success', 'کاربر با موفقیت حذف شد')
				} catch (error) {
					message.error('خطا در حذف کاربر')
					openNotification('error', 'خطا در حذف کاربر')
					console.error('Error deleting user:', error)
				}
			},
			okButtonProps: {
				loading: isLoading,
			},
		})
	}

	return (
		<Card className={style.card}>
			<Flex justify='space-between' align='center'>
				<h2 className={style.title}>حذف کاربر</h2>
				<Button className={style.button} type='primary' danger onClick={handleDelete} loading={isLoading}>
					حذف کاربر
				</Button>
			</Flex>
		</Card>
	)
}

export default DeleteUserCard
