import { Flex } from 'antd'
import styles from './UsersList.module.css'
import UsersTableContainer from '../components/TableUsers/UsersTableContainer'

const UsersList = () => {
	return (
		<Flex vertical justify='space-between' className={styles.container}>
			<h1 className='text-page-title'>لیست کاربران</h1>
			<UsersTableContainer />
		</Flex>
	)
}

export default UsersList
