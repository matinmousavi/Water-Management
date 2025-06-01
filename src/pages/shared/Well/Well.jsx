import { Flex, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import { useParams } from 'react-router'
import { useEffect, useState } from 'react'
import Loading from '../../../components/Loading/Loading'
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
	const { wellId } = useParams()
	const wellApi = useAPI()

	useEffect(() => {
		if (wellId) wellApi.init(`wells/${wellId}`)
	}, [wellId])

	const well = wellApi.data?.well

	if (wellApi.isLoading || !well) return <Loading />

	return (
		<>
			<MetaTitle>ویرایش چاه</MetaTitle>
			<Flex vertical gap={10}>
				<Breadcrumbs />
				<Flex align='center'>
					<BackButton backTo='/wells' />
					<Title className='text-h3'>چاه {well.title}</Title>
				</Flex>
				<WellInfoCard setIsShowModal={setIsShowModal} wellData={well} />
				<WellAssociatedLands wellData={well} id={wellId} setWellData={wellApi.setData} />
				<DeleteCard title='چاه' api={`wells/${wellId}`} backTo='/wells' />
				<WellModal api={wellApi} wellData={well} setWellsData={wellApi.setData} type='edit' setIsOpen={setIsShowModal} isOpen={isShowModal} />
			</Flex>
		</>
	)
}

export default Well
