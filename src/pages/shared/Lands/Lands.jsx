import { useEffect, useState } from 'react'
import { Flex, Button, Typography } from 'antd'
import useAPI from '../../../hooks/useAPI'
import LandModal from '../../../components/Land/LandModal/LandModal'
import Loading from '../../../components/Loading/Loading'
import LandsTable from './components/LandsTable/LandsTable'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import { useUser } from '../../../contexts/UserContext'
import useModal from '../../../hooks/useModal'
import LandForm from '../../../components/Land/LandForm/LandForm'

const { Title } = Typography

const Lands = () => {
	const { isAdmin } = useUser()
	const [lands, setLands] = useState([])
	const { isOpen, open, close } = useModal()

	const api = useAPI()

	useEffect(() => {
		const fetchLands = async () => {
			try {
				const res = await api.get('lands')
				setLands(res?.lands || [])
			} catch (err) {
				console.error('Error loading lands:', err)
			}
		}
		fetchLands()
	}, [])

	if (api.isLoading) return <Loading />

	return (
		<Flex vertical className='main-container'>
			<Breadcrumbs />
			<Flex justify='space-between' align='center'>
				<Title level={1} className='text-page-title'>
					زمین‌ها ({lands.length}){' '}
				</Title>
				{isAdmin && (
					<Button type='primary' onClick={open}>
						افزودن زمین
					</Button>
				)}
			</Flex>

			<LandsTable landsData={lands} />

			<LandModal type='add' isOpen={isOpen} setIsOpen={close} setLandsData={setLands}>
				<LandForm />
			</LandModal>
		</Flex>
	)
}

export default Lands
