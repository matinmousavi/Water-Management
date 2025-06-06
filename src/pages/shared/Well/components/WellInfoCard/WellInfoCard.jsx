import React, { useMemo } from 'react'
import { Card, Col, Flex, Row, Typography } from 'antd'
import { Link } from 'react-router'
import useAPI from '../../../../../hooks/useAPI'
import EditWell from './components/EditWell/EditWell'
import { useUser } from '../../../../../contexts/UserContext'

const WellInfoCard = ({ wellInfo, setPageTitle }) => {
	const api = useAPI()
	const well = api.data.well || wellInfo
	const { isAdmin } = useUser()

	const wellInfoItems = useMemo(() => {
		const irrigator = well?.irrigator

		return [
			{
				label: 'نام میراب',
				value: irrigator ? <Link to={`/users/${irrigator._id}`}>{`${irrigator.firstName} ${irrigator.lastName}`}</Link> : '--',
			},
			{
				label: 'شماره تماس میرآب',
				value: irrigator?.mobile || '--',
			},
			{
				label: 'لایسنس کد',
				value: well?.licenseCode || '--',
			},
			{
				label: 'روزهای چرخه',
				value: well?.cycleDays ? `${well.cycleDays} روز` : '--',
			},
			{
				label: 'مکان',
				value: well?.location || '--',
			},
		]
	}, [well])

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Typography.Title level={2} className='text-card-title'>
						مشخصات چاه
					</Typography.Title>
					{isAdmin && <EditWell wellData={well} setWellData={api.setData} setPageTitle={setPageTitle} />}
				</Flex>

				<Row gutter={[0, 36]}>
					{wellInfoItems.map((item, index) => (
						<Col xs={24} md={12} key={index}>
							<Row>
								<Col xs={6} className='label'>
									<Typography.Text className='text'>{item.label}</Typography.Text>
								</Col>
								<Col xs={18} className='value'>
									<Typography.Text className='text'>{item.value}</Typography.Text>
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
