import { Button, Card, Col, Flex, Row, Typography } from 'antd'
import styles from './WellInfoCard.module.css'
import { EditOutlined } from '@ant-design/icons'

const WellInfoCard = ({ wellData, setIsShowModal }) => {
	const wellInfoList = [
		{ label: 'کد پروانه', value: wellData?.licenseCode || '--' },
		{ label: 'عنوان', value: wellData?.title || '--' },
		{ label: 'تعداد روزهای چرخه', value: wellData?.cycleDays ? `${wellData.cycleDays} روز` : '--' },
		{ label: 'نام میراب', value: wellData.irrigator ? `${wellData.irrigator.firstName} ${wellData.irrigator.firstName}` : '--' },
	]

	const { Text, Title } = Typography
	const handleOpenModal = () => {
		setIsShowModal(true)
	}
	return (
		<>
			<Card className={styles.card}>
				<Flex align='center' justify='space-between'>
					<Title level={2} className='text-h2'>
						مشخصات چاه
					</Title>
					<Button type='default' shape='round' icon={<EditOutlined />} size='middle' onClick={handleOpenModal}>
						<span>ویرایش</span>
					</Button>
				</Flex>

				<div className={styles.infoWrapper}>
					<Row gutter={[0, 8]}>
						{wellInfoList.map((item, index) => (
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
		</>
	)
}
export default WellInfoCard
