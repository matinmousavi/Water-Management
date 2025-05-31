import { TableWellsIrrigator } from './Components/TableWellsIrrigator.jsx'
import MetaTitle from '../../../components/MetaTitle/MetaTitle.jsx'
import { Flex, Typography } from 'antd'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs.jsx'
import { useUser } from '../../../contexts/UserContext.jsx'
import { useEffect } from 'react'
import useAPI from '../../../hooks/useAPI'

const { Title } = Typography

const WellsIrrigator = () => {
	const { user } = useUser()

	const api = useAPI()

	useEffect(() => {
		if (user?._id) {
			api.init(`wells?irrigator=${user._id}`)
		}
	}, [user])

	const { data: wells } = api

	return (
		<>
			<Breadcrumbs />
			<MetaTitle> لیست چاه ها</MetaTitle>
			<Flex vertical>
				<Title className='text-h2'>لیست چاه ها</Title>
				<TableWellsIrrigator wellsData={wells?.wells} />
			</Flex>
		</>
	)
}

export default WellsIrrigator
