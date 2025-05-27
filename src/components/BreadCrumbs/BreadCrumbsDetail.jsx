import { Breadcrumb } from 'antd'
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

const generateBreadcrumbItems = (path, data) => {
	if (path === '/') return null
	if (path === '/users') return ['کاربران']
	if (path === '/wells') return ['چاه ها']
	if (path === '/lands') return ['زمین ها']

	if (path.match(/^\/users\/[^/]+$/)) {
		return ['کاربران', `${data?.firstName} ${data?.lastName}` || 'کاربر']
	}
	if (path.match(/^\/wells\/[^/]+$/)) {
		return ['چاه ها', `${data?.title}` || 'چاه']
	}
	if (path.match(/^\/lands\/[^/]+$/)) {
		return ['زمین ها', 'زمین']
	}

	return ''
}

const BreadCrumbsDetail = ({ data }) => {
	const location = useLocation()

	const breadcrumbItems = useMemo(() => generateBreadcrumbItems(location.pathname, data), [location.pathname, data])

	return (
		<Breadcrumb>
			<Breadcrumb.Item>خانه</Breadcrumb.Item>
			{breadcrumbItems && breadcrumbItems.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
		</Breadcrumb>
	)
}

export default BreadCrumbsDetail
