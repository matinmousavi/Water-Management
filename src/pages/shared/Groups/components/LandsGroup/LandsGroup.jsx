import { Flex } from 'antd'
import LandItemGroup from './components/LandItemGroup/LandItemGroup'

const LandsGroup = ({ data, group }) => {
	return (
		<Flex gap={16} vertical>
			{data?.map(land => (
				<LandItemGroup key={land._id} data={land} group={group} />
			))}
		</Flex>
	)
}

export default LandsGroup
