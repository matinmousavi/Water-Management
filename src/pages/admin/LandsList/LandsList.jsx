import { Flex } from 'antd'
import LandsTableContainer from '../components/TableLands/LandsTableContainer'

const LandsList = () => {
	return (
		<Flex vertical gap={10}>
			<LandsTableContainer />
		</Flex>
	)
}
export default LandsList
