import { Flex } from 'antd'
import LandItemGroup from './components/LandItemGroup/LandItemGroup'

const LandsGroup = ({ data }) => {
	return (
		<Flex gap={16} vertical>
			{data?.map(land => (
				<LandItemGroup data={land} />
			))}
		</Flex>
	)
}

export default LandsGroup
