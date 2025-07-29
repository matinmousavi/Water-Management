import React, { useMemo } from 'react'
import { Card, Col, Flex, Row, Typography } from 'antd'
import { Link } from 'react-router'
import moment from 'moment-jalaali'
import useAPI from '../../../../../hooks/useAPI'
import EditWell from './components/EditWell/EditWell'
import { useUser } from '../../../../../contexts/UserContext'

const WellInfoCard = ({ wellInfo, setPageTitle }) => {
	const api = useAPI()
	const well = api.data.well || wellInfo
	const { isAdmin } = useUser()

	const wellInfoItems = useMemo(() => {
		const irrigator = well?.irrigator		

		const cycleStartDateFormatted = well?.cycleStartDate ? moment(well.cycleStartDate).format('jYYYY/jMM/jDD') : '--'

		const workTimeFormatted =
			well?.offTime?.start && well?.offTime?.end
				? `${moment(well.offTime.start).format('HH:mm')} - ${moment(well.offTime.end).format('HH:mm')}`
				: '--'

		return [
			{
				label: 'نام میرآب',
				value: irrigator ? <Link to={`/users/${irrigator._id}`}>{`${irrigator.fullName}`}</Link> : '--',
			},
			{
				label: 'شماره تماس میرآب',
				value: irrigator?.mobile || '--',
			},
			{
				label: 'License Code',
				value: well?.licenseCode || '--',
			},
			{
				label: 'مکان',
				value: well?.location || '--',
			},
			{
				label: 'Cycle Days',
				value: well?.cycleDays ? `${well.cycleDays} روز` : '--',
			},
			{
				label: 'تاریخ شروع سایکل',
				value: cycleStartDateFormatted,
			},
			{
				label: 'ساعت خاموشی',
				value: workTimeFormatted,
			},
		]
	}, [well])

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Typography.Title level={2} className='text-card-title'>
						مشخصات {well?.title}
					</Typography.Title>
					{isAdmin && <EditWell initialValue={well} setData={api.setData} setPageTitle={setPageTitle} />}
				</Flex>

				<Row justify='space-between' gutter={[0, 36]}>
					{wellInfoItems.map((item, index) => (
						<Col xs={24} md={12} key={index}>
							<Row>
								<Col xs={6}>
									<Typography.Text className='text-label'>{item.label}</Typography.Text>
								</Col>
								<Col xs={18}>
									<Typography.Text className='text-value'>{item.value}</Typography.Text>
								</Col>
							</Row>
						</Col>
					))}
				</Row>
			</Flex>
		</Card>
	)
}

export default React.memo(WellInfoCard)
