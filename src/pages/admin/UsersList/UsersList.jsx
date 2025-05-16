import { Flex } from 'antd'
import styles from './UsersList.module.css'
import TableUsers from '../components/TableUsers/TableUsers'

const UsersList = () => {
	return (
		<Flex vertical justify='space-between' className={styles.container}>
			<h1 className={styles.title}>لیست کاربران</h1>
			<TableUsers />
		</Flex>
	)
}

export default UsersList
