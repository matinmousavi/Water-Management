import { Flex } from 'antd'
import styles from './Wells.module.css'
import WellsTableContainer from './components/TableWells/WellsTableContainer'
import PageHeading from '../../../components/PageHeading/PageHeading'

const Wells = () => {
	return (
		<PageHeading>
			<Flex vertical justify='space-between' className={styles.container}>
				<WellsTableContainer />
			</Flex>
		</PageHeading>
	)
}

export default Wells
