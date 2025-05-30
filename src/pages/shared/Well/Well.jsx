import { Button, Card, Col, Flex, Form, Modal, Row, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import styles from './Well.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import FormFields from '../../../components/FormFields/FormFields'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import WellAssociatedLands from './components/WellAssociatedLands/WellAssociatedLands'
import WellModal from '../../../components/Well/WellModal/WellModal'

const { Text, Title } = Typography

const Well = () => {
	const [isShowModal, setIsShowModal] = useState(false)
	const [wellData, setWellData] = useState(null)
	const { wellId } = useParams()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()

	const wellApi = useAPI()

	useEffect(() => {
		const fetchWell = async () => {
			try {
				const response = await wellApi.get(`wells/${wellId}`)
				if (response?.well) {
					setWellData(response.well)
				}
			} catch (error) {
				openNotification('error', 'خطا در دریافت اطلاعات چاه')
				console.error('خطا در دریافت اطلاعات چاه:', error)
			}
		}

		if (wellId) {
			fetchWell()
		}
	}, [wellId])

	const handleOpenModal = () => {
		setIsShowModal(true)
	}

	if (wellApi.isLoading || !wellData) return <Loading />

	const wellInfoList = [
		{ label: 'کد پروانه', value: wellData.licenseCode },
		{ label: 'عنوان', value: `${wellData.title || ''}` },
		{ label: 'تعداد روزهای چرخه', value: `${wellData.cycleDays} روز` },
		{ label: 'نام میراب', value: wellApi.irrigator || 'آیدی میراب' },
	]
	console.log(wellApi?.data?.well)

	return (
		<>
			<MetaTitle>ویرایش چاه</MetaTitle>

			<Flex vertical gap={10}>
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
				<WellAssociatedLands id={wellId} />
				<DeleteCard title='چاه' api={`wells/${wellId}`} backTo='/wells' />
				<WellModal wellData={wellApi?.data?.well} type='edit' setIsOpen={setIsShowModal} isOpen={isShowModal} />
			</Flex>
		</>
	)
}

export default Well
