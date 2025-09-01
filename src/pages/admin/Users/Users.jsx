import { Flex, Grid, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import UsersTable from './components/UsersTable/UsersTable'
import Loading from '../../../components/Loading/Loading'
import AddUser from './components/AddUser/AddUser'

const Users = () => {
	const api = useAPI()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	api.init('users')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container' gap={isMobile && 16}>
			<Flex align='center' justify='space-between'>
				<Typography.Title level={1} className='text-page-title'>
					لیست کاربران ({api.data.users.length})
				</Typography.Title>

				<AddUser setUser={api.setData} />
			</Flex>

			<UsersTable usersData={api.data.users} />
		</Flex>
	)
}

export default Users
