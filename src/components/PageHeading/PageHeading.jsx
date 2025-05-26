import { Flex, Button, Card, Breadcrumb } from 'antd'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'

const generateBreadcrumbItems = path => {
	if (path === '/') return null
	if (path === '/users') return ['کاربران']
	if (path === '/wells') return ['چاه ها']
	if (path === '/lands') return ['زمین ها']
	// if (path === '/users') return ['Users']
	// if (path === '/users/add-user') return ['Users', 'Add a new user']
	// if (path === '/orders/add-order') return ['Orders', 'Add a new order']

	// if (path.match(/^\/companies\/[^/]+\/edit$/)) {
	// 	return ['Companies', data?.name || 'Company', 'Edit Company']
	// }
	// if (path.match(/^\/orders\/[^/]+\/edit$/)) {
	// 	const labelParts = ['Orders']
	// 	if (data?.orderNumber?.SPT) labelParts.push(data?.orderNumber?.SPT)
	// 	if (data?.orderNumber?.HL) labelParts.push(data?.orderNumber?.HL)
	// 	labelParts.push('Edit Order ')
	// 	return labelParts
	// }
	// if (path.match(/^\/orders\/[^/]+\/shipment$/)) {
	// 	const labelParts = ['Orders']
	// 	labelParts.push('Add a new shipment ')
	// 	return labelParts
	// }
	// if (path.match(/^\/companies\/[^/]+$/)) {
	// 	if (data?.name) {
	// 		return ['Companies', data?.name]
	// 	} else {
	// 		return ['Companies', 'Company Details']
	// 	}
	// }
	// if (path.match(/^\/orders\/[^/]+$/)) {
	// 	if (data?.orderNumber) {
	// 		if (data?.orderNumber?.SPT || data.orderNumber?.HL) {
	// 			const labelParts = []
	// 			if (data?.orderNumber?.SPT) labelParts.push(data.orderNumber?.SPT)
	// 			if (data?.orderNumber?.HL) labelParts.push(data.orderNumber?.HL)
	// 			return ['Orders', labelParts.join(' - ')]
	// 		}
	// 	} else {
	// 		return ['Orders', 'Order Details']
	// 	}
	// }

	return ''
}

const PageHeading = ({ children }) => {
	const location = useLocation()
	// const navigate = useNavigate()
	// const { id } = useParams()
	const [data, setData] = useState(null)

	const breadcrumbItems = useMemo(() => generateBreadcrumbItems(location.pathname), [location.pathname])

	const breadcrumb = (
		<Breadcrumb>
			<Breadcrumb.Item>خانه</Breadcrumb.Item>
			{breadcrumbItems && breadcrumbItems.map((item, index) => <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>)}
		</Breadcrumb>
	)
	return (
		<>
			<Flex vertical gap={20}>
				{breadcrumb}

				<Flex gap={36} vertical>
					{children}
				</Flex>
			</Flex>
		</>
	)
}

export default PageHeading
