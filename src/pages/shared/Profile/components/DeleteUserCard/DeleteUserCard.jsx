import { Button, Card, Flex, message, App } from 'antd'
import style from './DeleteUserCard.module.css'

const DeleteUserCard = () => {
	const { modal } = App.useApp()

	const handleDelete = () => {
		modal.confirm({
			title: 'حذف کاربر',
			content: 'آیا از حذف این کاربر مطمئن هستید؟ این عمل غیرقابل بازگشت است.',
			okText: 'بله، حذف شود',
			cancelText: 'انصراف',
			okType: 'danger',
			centered: true,
			onOk: () => {
				message.success('عملیات حذف با موفقیت انجام شد (تست)')
			},
		})
	}

	return (
		<Card className={style.card}>
			<Flex justify='space-between' align='center'>
				<h2 className={style.title}>حذف کاربر</h2>
				<Button className={style.button} type='primary' danger onClick={handleDelete}>
					حذف کاربر
				</Button>
			</Flex>
		</Card>
	)
}

export default DeleteUserCard
