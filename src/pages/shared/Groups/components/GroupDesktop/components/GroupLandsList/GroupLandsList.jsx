import { Card, Col, Flex, Row, Typography } from 'antd'
import moment from 'moment-jalaali'
const { Text } = Typography

const ItemLandGroup = ({ land, group }) => {
	const infoItems = [
		{
			label: 'نام زمین',
			value: land?.title || '--',
		},
		{
			label: 'نام مالک',
			value: land?.owner?.fullName || '--',
		},
		{ label: 'شماره تماس ', value: land?.owner?.mobile || '--' },
		{ label: 'آدرس زمین', value: land?.location || '--' },
		{
			label: 'زمان آبیاری بعدی',
			value: group?.nextIrrigationAt ? moment(group.nextIrrigationAt).format('HH:mm - jYYYY/jMM/jDD') : '--',
		},
		{ label: 'آب مورد نیاز', value: group?.requiredWater || '--' },
		{ label: 'آب دریافت شده', value: group?.receivedWater || '--' },
		{ label: 'زمان باقی مانده', value: group?.remainingWater || '--' },
	]

	return (
		<Card>
			<Row gutter={[0, 36]}>
				{infoItems.map((item, index) => (
					<Col xs={24} md={12} key={index}>
						<Row>
							<Col xs={6} className='label'>
								<Text className='text-label'>{item.label}</Text>
							</Col>
							<Col xs={18} className='value'>
								<Text className='text-value'>{item.value}</Text>
							</Col>
						</Row>
					</Col>
				))}
			</Row>
		</Card>
	)
}

const GroupLandsList = ({ lands, group }) => {
	return (
		<Flex gap={16} vertical>
			{lands?.map((item, index) => (
				<ItemLandGroup land={item} group={group} key={index} />
			))}
		</Flex>
	)
}

export default GroupLandsList
