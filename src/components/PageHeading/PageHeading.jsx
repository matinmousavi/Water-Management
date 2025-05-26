import { Flex, Button, Card, Breadcrumb } from 'antd'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import useAPI from '../../hooks/useAPI'
import styles from './PageHeading.module.css'

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

const PageHeading = ({ children, id }) => {
	const location = useLocation()
	const [idData, setIdData] = useState(null)
	const api = useAPI()

	const pageData = {
		'/users': {
			title: 'لیست کاربران',
			buttonLink: '/users/add-user',
			buttonText: 'افزودن کاربر',
		},
		'/wells': {
			title: 'لیست چاه ها',
			buttonLink: '/wells/add-well',
			buttonText: 'افزودن چاه',
		},
		'/lands': {
			title: 'لیست زمین ها',
			buttonLink: '/lands/add-land',
			buttonText: 'افزودن زمین',
		},
	}

	const current = pageData[location.pathname] || {
		title: '',
		buttonLink: '',
		buttonText: ' ',
	}
	const { title, buttonLink, buttonText } = current

	const isWellDetail = location.pathname.startsWith('/wells/')
	const isLandDetail = location.pathname.startsWith('/lands/')
	const isUserDetail = location.pathname.startsWith('/users/')
	const isWells = location.pathname.includes('/wells')
	const isLands = location.pathname.includes('/lands')
	const isUsers = location.pathname.includes('/users')

	if (isUserDetail) {
		api.init(`users/${id}`)
	} else if (isWellDetail) {
		api.init(`wells/${id}`)
	} else if (isLandDetail) {
		api.init(`lands/${id}`)
	}
	const { data } = api

	useEffect(() => {
		if (isUserDetail && data?.user && !idData) {
			setIdData(data?.user)
		} else if (isLandDetail && data?.land && !idData) {
			setIdData(data?.land)
		} else if (isWellDetail && data?.well && !idData) {
			setIdData(data?.well)
		}
	}, [isUserDetail, isWellDetail, isLandDetail, data.user, idData])

	const breadcrumbItems = useMemo(() => generateBreadcrumbItems(location.pathname, idData), [location.pathname, idData])

	const breadcrumb = (
		<Breadcrumb>
			<Breadcrumb.Item>خانه</Breadcrumb.Item>
			{breadcrumbItems && breadcrumbItems.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
		</Breadcrumb>
	)
	if (isLandDetail || isUserDetail || isWellDetail) {
		return (
			<Flex vertical gap={20}>
				{breadcrumb}
				<Flex gap={36} vertical>
					{children}
				</Flex>
			</Flex>
		)
	} else if (isLands || isUsers || isWells) {
		return (
			<Flex vertical gap={20} className={styles.container}>
				{breadcrumb}
				<Flex gap={36} vertical>
					{children}
				</Flex>
			</Flex>
		)
	}
}

export default PageHeading
