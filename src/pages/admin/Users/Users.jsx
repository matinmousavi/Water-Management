import { useEffect, useState } from 'react'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import UsersTable from './components/UsersTable/UsersTable'
import UserFormModal from '../../../components/UserFormModal/UserFormModal'
import Loading from '../../../components/Loading/Loading'
import { Flex } from 'antd'

const Users = () => {
	const userApi = useAPI()
	const { openNotification } = useNotification()
	const [users, setUsers] = useState([])

	const fetchUsers = async () => {
		const res = await userApi.get('/users')
		if (res.error) {
			openNotification('error', 'خطا در دریافت کاربران', res.message)
		} else {
			setUsers(res.users || [])
		}
	}

	useEffect(() => {
		fetchUsers()
	}, [])

	if (userApi.isLoading || !userApi.data) return <Loading />

	return (
		<Flex vertical gap={10}>
			<Flex align='center' justify='space-between'>
				<h1>لیست کاربران ({users.length})</h1>
				<UserFormModal type='add' setUsersData={setUsers} />
			</Flex>
			<UsersTable usersData={users} />
		</Flex>
	)
}

export default Users
