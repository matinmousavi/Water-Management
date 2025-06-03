import { Button, Card, Col, Flex, Row, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import english2persian from '../../../../../utils/english2persian';

const WellInfoCard = ({ wellData, setIsShowModal }) => {
	
	const wellInfoList = [
		{ label: 'نام میراب', value: wellData.irrigator ? <Link to={`/users/${wellData.irrigator._id}`}>{`${wellData.irrigator.firstName} ${wellData.irrigator.lastName}`}</Link> : '--' },
		{ label: 'شماره تماس میرآب', value: english2persian(wellData?.irrigator?.mobile) || '--' },
		{ label: 'License Code', value: wellData?.licenseCode || '--' },
		{ label: 'Cycle Days', value: wellData?.cycleDays ? `${wellData.cycleDays} روز` : '--' },
		{ label: 'مکان', value: wellData?.location || '--' },
	]

	const { Text, Title } = Typography
	const handleOpenModal = () => {
		setIsShowModal(true)
	}
	return (
		<>
			<Card>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						مشخصات چاه
					</Title>
					<Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal}>
						<span>ویرایش</span>
					</Button>
				</Flex>

				<div>
					<Row gutter={[0, 30]}>
						{wellInfoList.map((item, index) => (
							<Col xs={24} md={12} key={index}>
								<Row>
									<Col xs={6} className='label'>
										<Text className='text'>{item.label}</Text>
									</Col>
									<Col xs={18} className='value'>
										<Text className='text'>{item.value}</Text>
									</Col>
								</Row>
							</Col>
						))}
					</Row>
				</div>
			</Card>
		</>
	)
}
export default WellInfoCard
