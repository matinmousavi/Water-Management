import { useState, useCallback } from 'react'
import useAPI from '../../../hooks/useAPI'
import UsersTable from './components/UsersTable/UsersTable'
import Loading from '../../../components/Loading/Loading'
import { Button, Flex, Typography, Form } from 'antd'
import UserModal from '../../../components/User/UserModal/UserModal'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'

const { Title } = Typography

const Users = () => {
	const api = useAPI()
	const [isModalOpen, setIsModalOpen] = useState(false)

	const [form] = Form.useForm()

	api.init('users')

	console.log(api.data)

	const handleOpenModal = useCallback(() => {
		setIsModalOpen(true)
		form.resetFields()
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
		form.resetFields()
	}, [])

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />
			<Flex align='center' justify='space-between'>
				<Title level={1} className='text-page-title'>
					لیست کاربران ({api.data.users.length})
				</Title>
				<Button type='primary' onClick={handleOpenModal}>
					افزودن کاربر
				</Button>
			</Flex>

			<UsersTable usersData={api.data.users} />

			{isModalOpen && <UserModal type='add' open={isModalOpen} onClose={handleCloseModal} api={api} form={form} />}
		</Flex>
	)
}

export default Users
