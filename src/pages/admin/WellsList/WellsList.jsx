import { Flex } from 'antd'
import styles from './WellsList.module.css'
import WellsTableContainer from '../components/TableWells/WellsTableContainer'

const WellsList = () => {
	return (
		<Flex vertical justify='space-between' className={styles.container}>
			<WellsTableContainer />
		</Flex>
	)
}

export default WellsList
