import { useMemo } from 'react'
import { Breadcrumb } from 'antd'
import { useLocation, Link } from 'react-router-dom'
import styles from './BreadCrumbs.module.css'

const routesConfig = [
	{ path: '/', breadcrumb: 'خانه' },
	{ path: '/users', breadcrumb: 'کاربران' },
	{ path: '/settings', breadcrumb: 'تنظیمات اطلاع رسانی' },
	{
		path: '/users/:id',
		breadcrumb: data => data?.title || 'کاربر',
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

	const rootRoute = routesConfig.find(route => route.path === '/')
	if (rootRoute) {
		breadcrumbs.push({
			title: <Link to='/'>{rootRoute.breadcrumb}</Link>,
		})
	}

	for (let i = 0; i < segments.length; i++) {
		currentPath += '/' + segments[i]

		const route = routesConfig.find(routeConfigItem => matchPath(routeConfigItem.path, currentPath))

		if (route) {
			const label = typeof route.breadcrumb === 'function' ? route.breadcrumb(data) : route.breadcrumb

			breadcrumbs.push({
				title: i === segments.length - 1 ? <span className={styles.active}>{label}</span> : <Link to={currentPath}>{label}</Link>,
				key: currentPath,
			})
		}
	}

	return breadcrumbs
}

const Breadcrumbs = ({ data }) => {
	const location = useLocation()

	const breadcrumbItems = useMemo(() => findBreadcrumbs(location.pathname, data), [location.pathname, data])

	return <Breadcrumb className={styles.breadcrumb} items={breadcrumbItems} />
}

export default Breadcrumbs
