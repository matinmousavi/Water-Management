import { Flex } from 'antd'
import styles from './admin.module.css'
import TableUsers from './components/TableUsers'

const Admin = () => {
	return (
		<Flex vertical justify='space-between' className={styles.container}>
			<h1 className={styles.title}>لیست کاربران</h1>
			<TableUsers />
		</Flex>
	)
}

export default Admin
