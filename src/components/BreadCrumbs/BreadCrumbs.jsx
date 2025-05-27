import { Breadcrumb } from 'antd'
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'

const generateBreadcrumbItems = path => {
	if (path === '/') return null
	if (path === '/users') return ['کاربران']
	if (path === '/wells') return ['چاه ها']
	if (path === '/lands') return ['زمین ها']

	return ''
}

const BreadCrumbs = () => {
	const location = useLocation()

	const breadcrumbItems = useMemo(() => generateBreadcrumbItems(location.pathname), [location.pathname])

	return (
		<Breadcrumb>
			<Breadcrumb.Item>خانه</Breadcrumb.Item>
			{breadcrumbItems && breadcrumbItems.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
		</Breadcrumb>
	)
}

export default BreadCrumbs
