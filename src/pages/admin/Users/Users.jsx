import React from 'react'
import useAPI from '../../../hooks/useAPI'
import UsersTable from './components/UsersTable/UsersTable'
import Loading from '../../../components/Loading/Loading'
import { Button, Flex, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import ModalController from '../../../components/ModalController/ModalController'
import UserModal from '../../../components/User/UserModal/UserModal'

const Users = () => {
	const api = useAPI()

	api.init('users')

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />

			<Flex align='center' justify='space-between'>
				<Typography.Title level={1} className='text-page-title'>
					لیست کاربران ({api.data.users.length})
				</Typography.Title>

				<ModalController>
					<ModalController.Trigger>
						<Button type='primary'>
							<Flex gap={5} justify='center' align='center'>
								<PlusOutlined />
								<span> افزودن کاربر</span>
							</Flex>
						</Button>
					</ModalController.Trigger>

					<ModalController.Modal>
						<UserModal type='add' api={api} />
					</ModalController.Modal>
				</ModalController>
			</Flex>

			<UsersTable usersData={api.data.users} />
		</Flex>
	)
}

export default Users
