import styles from './LandsGroup.module.css'
import { Card, Flex, Typography } from 'antd'
import { Link } from 'react-router'
import moment from 'moment-jalaali'
import LandItemGroup from './components/LandItemGroup/LandItemGroup'

const { Text } = Typography

const LandsGroup = ({ data }) => {
	console.log(data)

	return (
		<Flex gap={16} vertical>
			{data?.map(land => (
				<LandItemGroup data={land} />
			))}
		</Flex>
	)
}

export default LandsGroup
