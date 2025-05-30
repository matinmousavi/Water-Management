import { Link } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import styles from './BackButton.module.css'

const BackButton = ({ backTo }) => {
	return (
		<Link to={backTo}>
			<ArrowRightOutlined className={styles.icon} />
		</Link>
	)
}

export default BackButton
