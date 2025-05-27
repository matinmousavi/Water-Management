import { Flex } from 'antd'
import styles from './Wells.module.css'
import WellsTableContainer from './components/TableWells/WellsTableContainer'

const Wells = () => {
	return (
		<Flex vertical justify='space-between' className={styles.container}>
			<WellsTableContainer />
		</Flex>
	)
}

export default Wells
