import { Card, Col, Flex, Row, Typography } from 'antd'
import LandEdit from './components/LandEdit/LandEdit'
import useAPI from '../../../../../hooks/useAPI'
import { Link } from 'react-router'
import { useUser } from '../../../../../contexts/UserContext'

const LandInfo = ({ landData, setPageTitle }) => {
	const api = useAPI()
	const { isAdmin } = useUser()
	const land = api.data?.land || landData
	const { Title, Text } = Typography

	const infoItems = [
		{
			label: 'نام مالک',
			value: land?.owner ? (
				isAdmin ? (
					<Link to={`/users/${land.owner._id}`}>{`${land.owner.fullName || ''}`}</Link>
				) : (
					`${land.owner.fullName || ''}`
				)
			) : (
				'--'
			),
		},
		{ label: 'شماره تماس مالک', value: land?.owner?.mobile || '--' },
		{ label: 'مساحت', value: land?.area ? `${land.area} متر مربع` : '--' },
		{ label: 'K-factor', value: land?.kFactor || '--' },
		{ label: 'محصول', value: land?.cropType || '--' },
		{ label: 'نوع آبیاری', value: land?.irrigationType || '--' },
		{ label: 'آدرس زمین', value: land?.location || '--' },
		{
			label: 'عنوان چاه',
			value: land?.wells?.[0]?.title ? isAdmin ? <Link to={`/wells/${land.wells[0]._id}`}>{land.wells[0].title}</Link> : land.wells[0].title : '--',
		},
		{
			label: 'نام میرآب',
			value: land?.wells?.[0]?.irrigator ? (
				isAdmin ? (
					<Link to={`/users/${land.wells[0].irrigator._id}`}>{`${land.wells[0].irrigator.fullName || ''}`}</Link>
				) : (
					`${land.wells[0].irrigator.fullName || ''}`
				)
			) : (
				'--'
			),
		},
		{
			label: 'شماره تماس میرآب',
			value: land?.wells?.[0]?.irrigator?.mobile || '--',
		},
	]

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-card-title'>
						مشخصات زمین
					</Title>
					<LandEdit initialValue={land} setData={api.setData} setPageTitle={setPageTitle} />
				</Flex>

				<Row gutter={[0, 36]}>
					{infoItems.map((item, index) => (
						<Col xs={24} md={12} key={index}>
							<Row>
								<Col xs={12} md={6} className='label'>
									<Text className='text-label'>{item.label}</Text>
								</Col>
								<Col xs={12} md={18} className='value'>
									<Text className='text-value'>{item.value}</Text>
								</Col>
							</Row>
						</Col>
					))}
				</Row>
			</Flex>
		</Card>
	)
}

export default LandInfo
