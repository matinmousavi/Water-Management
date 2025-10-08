import { Flex } from 'antd'
import LandItemGroup from './components/LandItemGroup/LandItemGroup'

const LandGroupLands = ({ lands, group }) => {
	return (
		<Flex gap={16} vertical>
			{lands?.map(land => (
				<LandItemGroup key={land._id} data={land} group={group} />
			))}
		</Flex>
	)
}

export default LandGroupLands
