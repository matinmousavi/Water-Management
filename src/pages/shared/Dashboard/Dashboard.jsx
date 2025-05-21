import { Card, Typography } from 'antd'
import style from './Dashboard.module.css'

const Dashboard = () => {
	const { Title } = Typography
	return (
		<div>
			<Card className={style.card}>
				<Title className='text-h1'>داشبورد</Title>
			</Card>
		</div>
	)
}

export default Dashboard
