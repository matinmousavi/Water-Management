import { TableWells } from './Components/TableWells.jsx'
import MetaTitle from '../../../components/MetaTitle/MetaTitle.jsx'
import { Flex, Typography } from 'antd'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs.jsx'

const { Title } = Typography

const WellsIrrigator = () => {
	return (
		<>
			<Breadcrumbs />
			<MetaTitle> لیست چاه ها</MetaTitle>
			<Flex vertical>
				<Title className='text-h2'>لیست چاه ها</Title>
				<TableWells />
			</Flex>
		</>
	)
}

export default WellsIrrigator
