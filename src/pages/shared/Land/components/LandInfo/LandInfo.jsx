import { Card, Col, Flex, Row, Typography } from 'antd'
import LandEdit from './components/LandEdit/LandEdit'
import styles from './LandInfo.module.css'
import useAPI from '../../../../../hooks/useAPI'
const LandInfo = ({ landData }) => {
	const api = useAPI()
	const land = api.data.land || landData
	const { Title, Text } = Typography
	const landInfoList = [
		{ label: 'نام زمین', value: land?.name },
		{ label: 'مالک', value: `${land?.owner?.firstName || ''} ${landData.owner?.lastName || ''}` },
		{ label: 'متراژ', value: `${land?.area} متر مربع` },
		{ label: 'ضریب k', value: land?.kFactor },
		{ label: 'موقعیت', value: land?.location || '-' },
		{ label: 'نوع آبیاری', value: land?.irrigationType },
		{ label: 'تعداد چاه‌ها', value: `${land?.wells?.length || 0}` },
	]
	return (
		<Card>
			<Flex align='center' justify='space-between'>
				<Title level={2} className='text-h2'>
					مشخصات زمین
				</Title>
				<LandEdit landData={land} setLandData={api.setData} />
			</Flex>

			<div className={styles.infoWrapper}>
				<Row gutter={[0, 8]}>
					{landInfoList.map((item, index) => (
						<Col key={index} xs={24} md={20} lg={18} className={styles.line}>
							<Row>
								<Col xs={10}>
									<Text className='text-label'>{item.label}</Text>
								</Col>
								<Col xs={14}>
									<Text className='text-label'>{item.value}</Text>
								</Col>
							</Row>
						</Col>
					))}
				</Row>
			</div>
		</Card>
	)
}
export default LandInfo
