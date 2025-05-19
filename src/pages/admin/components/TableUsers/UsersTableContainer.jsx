import { Button, Card, Flex, Typography } from 'antd'
import { useEffect, useState } from 'react'
import FormUsers from '../FormUsers/FormUsers'
import useAPI from '../../../../hooks/useAPI'
import UsersTable from './UsersTable'
import Loading from '../../../../components/Loading/Loading'
const UsersTableContainer = () => {
	const { Title } = Typography
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
		return <Loading />
	}
	return (
		<Flex vertical>
			<Flex justify='space-between' align='center' style={{ marginBottom: '10px' }}>
				<Title className='text-h1'>لیست کاربران</Title>
				<Button onClick={showModal} type='primary'>
					افزودن کاربر
				</Button>
			</Flex>
			<Card>
				<UsersTable data={userApi?.data?.users} />
				<FormUsers setIsRenderList={setIsRenderList} isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
			</Card>
		</Flex>
	)
}
export default UsersTableContainer
