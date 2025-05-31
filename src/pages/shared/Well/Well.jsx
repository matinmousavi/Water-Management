import { Button, Card, Col, Flex, Form, Row, Typography } from 'antd'
import styles from './Well.module.css'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'
import useNotification from '../../../hooks/useNotification'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import DeleteCard from '../../../components/DeleteCard/DeleteCard'
import WellAssociatedLands from './components/WellAssociatedLands/WellAssociatedLands'
import WellModal from '../../../components/Well/WellModal/WellModal'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import WellInfoCard from './components/WellInfoCard/WellInfoCard'

const { Title } = Typography

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

	if (wellApi.isLoading || !wellData) return <Loading />

	return (
		<>
			<MetaTitle>ویرایش چاه</MetaTitle>

			<Flex vertical gap={10}>
				<Breadcrumbs />
				<Flex align='center'>
					<BackButton backTo='/wells' />
					<Title className='text-h3'>چاه {wellData.title}</Title>
				</Flex>
				<WellInfoCard setIsShowModal={setIsShowModal} wellData={wellData} />
				<WellAssociatedLands id={wellId} />
				<DeleteCard title='چاه' api={`wells/${wellId}`} backTo='/wells' />
				<WellModal wellData={wellApi?.data?.well} type='edit' setIsOpen={setIsShowModal} isOpen={isShowModal} />
			</Flex>
		</>
	)
}

export default Well
