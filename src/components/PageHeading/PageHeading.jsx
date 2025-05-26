import { Flex, Button, Card, Breadcrumb } from 'antd'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import styles from './PageHeading.module.css'

const generateBreadcrumbItems = path => {
	if (path === '/') return null
	if (path === '/users') return ['کاربران']
	if (path === '/wells') return ['چاه ها']
	if (path === '/lands') return ['زمین ها']

	if (path.match(/^\/users\/[^/]+$/)) {
		return ['کاربران', 'کاربر']
	}
	if (path.match(/^\/wells\/[^/]+$/)) {
		return ['چاه ها', 'چاه']
	}
	if (path.match(/^\/lands\/[^/]+$/)) {
		return ['زمین ها', 'زمین']
	}

	return ''
}

const PageHeading = ({ children }) => {
	const location = useLocation()
	const { id } = useParams()
	const [data, setData] = useState(null)

	console.log(id)

	const breadcrumbItems = useMemo(() => generateBreadcrumbItems(location.pathname), [location.pathname])

	const breadcrumb = (
		<Breadcrumb>
			<Breadcrumb.Item>خانه</Breadcrumb.Item>
			{breadcrumbItems && breadcrumbItems.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
		</Breadcrumb>
	)
	return (
		<>
			<Flex vertical gap={20} className={styles.container}>
				{breadcrumb}

				<Flex gap={36} vertical>
					{children}
				</Flex>
			</Flex>
		</>
	)
}

export default PageHeading
