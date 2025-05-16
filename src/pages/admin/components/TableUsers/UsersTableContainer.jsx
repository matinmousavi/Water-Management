import { Button, Card, Flex, Spin } from 'antd'
import { useEffect, useState } from 'react'
import FormUsers from '../FormUsers/FormUsers'
import useAPI from '../../../../hooks/useAPI'
import UsersTable from './UsersTable'

const UsersTableContainer = () => {
	const userApi = useAPI()
	const [isModalOpenFormUser, setIsModalOpenFormUser] = useState(false)
	const [isRenderList, setIsRenderList] = useState(false)
	userApi.init('users')
	useEffect(() => {
		userApi.get('users')
	}, [isRenderList])
	const showModal = () => {
		setIsModalOpenFormUser(true)
	}

	if (userApi.isLoading) {
		return (
			<div>
				<Spin />
			</div>
		)
	}
	return (
		<Card>
			<Flex justify='space-between' style={{ marginBottom: '10px' }}>
				<h2>جدول کاربران</h2>
				<Button onClick={showModal} type='primary'>
					افزودن کاربر
				</Button>
			</Flex>
			<UsersTable data={userApi?.data?.users} />
			<FormUsers setIsRenderList={setIsRenderList} isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
		</Card>
	)
}
export default UsersTableContainer
