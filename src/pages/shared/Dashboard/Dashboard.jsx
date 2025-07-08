import { Card, Typography } from 'antd'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'

const { Title } = Typography

const Dashboard = () => {
	return (
		<>
		<Breadcrumbs />
		<Card>
			<Title level={1} className='text-h1'>
				داشبورد
			</Title>
		</Card>
		</>
	)
}

export default Dashboard
