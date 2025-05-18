import { Button, Card, Flex } from 'antd'
import { useEffect, useState } from 'react'
import FormUsers from '../FormUsers/FormUsers'
import useAPI from '../../../../hooks/useAPI'
import UsersTable from './UsersTable'
import Loading from '../../../../components/Loading/Loading'
import styles from './UserTableContainer.module.css'
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
		return <Loading />
	}
	return (
		<div className={styles.container}>
			<Flex justify='space-between' align='center' style={{ marginBottom: '10px' }}>
				<h1>لیست کاربران</h1>
				<Button onClick={showModal} type='primary'>
					افزودن کاربر
				</Button>
			</Flex>
			<Card>
				<UsersTable data={userApi?.data?.users} />
				<FormUsers setIsRenderList={setIsRenderList} isOpen={isModalOpenFormUser} setIsOpen={setIsModalOpenFormUser} />
			</Card>
		</div>
	)
}
export default UsersTableContainer
