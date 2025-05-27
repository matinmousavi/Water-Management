import { Link } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import { Flex } from 'antd'

const BackLink = ({ id, data }) => {
	const location = useLocation()

	if (!data) return null

	const pageData = {
		[`/users/${id}`]: {
			title: `${data?.firstName} ${data?.lastName}`,
			backLink: '/users',
		},
		[`/wells/${id}`]: {
			title: `${data?.title}`,
			backLink: '/wells',
		},
		[`/lands/${id}`]: {
			title: `${data?.title}`,
			backLink: '/lands',
		},
	}

	const current = pageData[location.pathname] || {
		title: '',
		backLink: '',
	}

	if (!current || !current.title || !current.backLink) return null

	const { title, backLink } = current

	return (
		<Link to={backLink}>
			<Flex align='center' gap={16}>
				<ArrowRightOutlined />
				<h1>{title}</h1>
			</Flex>
		</Link>
	)
}

export default BackLink
