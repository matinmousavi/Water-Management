import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import styles from './BackButton.module.css'

const BackButton = ({ backTo = '/' }) => {
	const navigate = useNavigate()

	const handleBack = () => {
		if (window.history.state && window.history.state.idx > 0) {
			navigate(-1)
		} else {
			navigate(backTo)
		}
	}

	return (
		<button onClick={handleBack} className={styles.button}>
			<ArrowRightOutlined className={styles.icon} />
		</button>
	)
}

export default BackButton
