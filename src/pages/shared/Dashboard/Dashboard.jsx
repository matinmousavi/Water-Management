import { Flex } from 'antd'
import style from './Dashboard.module.css'
import PageHeading from '../../../components/PageHeading/PageHeading'

const Dashboard = () => {
	return (
		<PageHeading>
			<Flex className={style.card}>
				<h1 className={style.title}>خانه</h1>
			</Flex>
		</PageHeading>
	)
}

export default Dashboard
