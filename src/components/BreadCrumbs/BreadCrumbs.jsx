import { useMemo } from 'react'
import { Breadcrumb } from 'antd'
import { useLocation } from 'react-router-dom'

const routesConfig = [
	{ path: '/', breadcrumb: 'خانه' },
	{ path: '/users', breadcrumb: 'کاربران' },
	{
		path: '/users/:id',
		breadcrumb: data => {
			data?.firstName && data?.lastName ? `${data.firstName} ${data.lastName}` : 'کاربر'
		},
	},
	{ path: '/wells', breadcrumb: 'چاه ها' },
	{ path: '/wells/:id', breadcrumb: data => data?.title || 'چاه' },
	{ path: '/lands', breadcrumb: 'زمین ها' },
	{ path: '/lands/:id', breadcrumb: data => data?.title || 'زمین' },
]

function matchPath(pattern, pathname) {
	const patternSegments = pattern.split('/').filter(Boolean)
	const pathSegments = pathname.split('/').filter(Boolean)

	if (patternSegments.length !== pathSegments.length) return null

	const params = {}

	for (let i = 0; i < patternSegments.length; i++) {
		const p = patternSegments[i]
		const segment = pathSegments[i]

		if (p.startsWith(':')) {
			const paramName = p.slice(1)
			params[paramName] = segment
		} else if (p !== segment) {
			return null
		}
	}

	return { params }
}

function findBreadcrumbs(pathname, data) {
	const segments = pathname.split('/').filter(Boolean)
	let currentPath = ''
	const breadcrumbs = []

	for (let i = 0; i < segments.length; i++) {
		currentPath += '/' + segments[i]

		const route = routesConfig.find(routeConfigItem => matchPath(routeConfigItem.path, currentPath))

		if (route) {
			const label = typeof route.breadcrumb === 'function' ? route.breadcrumb(data) : route.breadcrumb
			breadcrumbs.push(label)
		}
	}

	if (pathname === '/' && !breadcrumbs.length) {
		const rootRoute = routesConfig.find(route => route.path === '/')
		if (rootRoute) breadcrumbs.push(rootRoute.breadcrumb)
	}

	return breadcrumbs
}

const Breadcrumbs = ({ data }) => {
	const location = useLocation()

	const breadcrumbItems = useMemo(() => findBreadcrumbs(location.pathname, data), [location.pathname, data])

	return (
		<Breadcrumb>
			{breadcrumbItems.map((item, index) => (
				<Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
			))}
		</Breadcrumb>
	)
}

export default Breadcrumbs
