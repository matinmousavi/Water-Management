import { Card, Typography } from 'antd'
import style from './Dashboard.module.css'
import PageHeading from '../../../components/PageHeading/PageHeading'

const Dashboard = () => {
	const { Title } = Typography
	return (
		<PageHeading>
			<Card className={style.card}>
				<Title className='text-h1'>داشبورد</Title>
			</Card>
		</PageHeading>
	)
}

export default Dashboard
