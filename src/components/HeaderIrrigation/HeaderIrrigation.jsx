import { Flex, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './HeaderIrrigation.module.css'
import { ArrowRightOutlined } from '@ant-design/icons'

const HeaderIrrigation = ({ title, icon }) => {
	const { Title } = Typography
	const navigate = useNavigate()

	return (
		<Flex align='center' className={styles.containerHeader} justify='center'>
			<button onClick={() => navigate(-1)} className={styles.backLink}>
				<ArrowRightOutlined className={styles.icon} size={24} />
			</button>

			<Flex gap={8}>
				<img src={icon} alt='icon image' />
				<Title className='title-h1'>{title}</Title>
			</Flex>
		</Flex>
	)
}

export default HeaderIrrigation
