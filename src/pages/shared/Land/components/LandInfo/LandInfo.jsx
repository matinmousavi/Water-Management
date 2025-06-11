import { Card, Col, Flex, Row, Typography } from 'antd'
import LandEdit from './components/LandEdit/LandEdit'
import styles from './LandInfo.module.css'
import useAPI from '../../../../../hooks/useAPI'
import { Link } from 'react-router'
import { useUser } from '../../../../../contexts/UserContext'

const LandInfo = ({ landData, setPageTitle }) => {
	const api = useAPI()
	const { isAdmin } = useUser()
	const land = api.data?.land || landData
	const { Title, Text } = Typography

	const rightColumnItems = [
		{
			label: 'نام مالک',
			value: land?.owner ? (
				isAdmin ? (
					<Link to={`/users/${land.owner._id}`}>{`${land.owner.firstName || ''} ${land.owner.lastName || ''}`}</Link>
				) : (
					`${land.owner.firstName || ''} ${land.owner.lastName || ''}`
				)
			) : (
				'--'
			),
		},
		{ label: 'مساحت', value: land?.area ? `${land.area} متر مربع` : '--' },
		{ label: 'آدرس زمین', value: land?.location || '--' },
		{ label: 'نام محصول', value: land?.cropType || '--' },
		{
			label: 'نام میراب',
			value: land?.wells?.[0]?.irrigator ? (
				isAdmin ? (
					<Link to={`/users/${land.wells[0].irrigator._id}`}>
						{`${land.wells[0].irrigator.firstName || ''} ${land.wells[0].irrigator.lastName || ''}`}
					</Link>
				) : (
					`${land.wells[0].irrigator.firstName || ''} ${land.wells[0].irrigator.lastName || ''}`
				)
			) : (
				'--'
			),
		},
	]

	const leftColumnItems = [
		{ label: 'شماره تماس مالک', value: land?.owner?.mobile || '--' },
		{ label: 'K-factor', value: land?.kFactor || '--' },
		{ label: 'نوع آبیاری', value: land?.irrigationType || '--' },
		{ label: 'عنوان چاه', value: land?.wells?.[0]?.title || '--' },
		{
			label: 'شماره تماس میراب',
			value: land?.wells?.[0]?.irrigator ? `${land.wells[0].irrigator.mobile}` : '--',
		},
	]

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						مشخصات زمین
					</Title>
					<LandEdit initialValue={land} setData={api.setData} setPageTitle={setPageTitle} />
				</Flex>

				<Row gutter={[36, 0]}>
					<Col xs={24} md={10}>
						<Flex vertical gap={20}>
							{rightColumnItems.map((item, index) => (
								<Flex key={index} justify='space-between' className={styles.line}>
									<Text className={styles.labelText}>{item.label}</Text>
									<Text className={styles.valueText}>{item.value}</Text>
								</Flex>
							))}
						</Flex>
					</Col>

					<Col xs={24} md={10} offset={2}>
						<Flex vertical gap={20}>
							{leftColumnItems.map((item, index) => (
								<Flex key={index} justify='space-between' className={styles.line}>
									<Text className={styles.labelText}>{item.label}</Text>
									<Text className={styles.valueText}>{item.value}</Text>
								</Flex>
							))}
						</Flex>
					</Col>
				</Row>
			</Flex>
		</Card>
	)
}

export default LandInfo
