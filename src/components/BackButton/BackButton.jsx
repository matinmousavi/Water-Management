import { Link } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'

const BackButton = ({ backTo }) => {
	return (
		<Link to={backTo}>
			<ArrowRightOutlined />
		</Link>
	)
}

export default BackButton
