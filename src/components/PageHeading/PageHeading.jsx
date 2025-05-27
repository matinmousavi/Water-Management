import { Flex } from 'antd'
import { useLocation } from 'react-router-dom'
import BreadCrumbsDetail from '../BreadCrumbs/BreadCrumbsDetail'
import BreadCrumbs from '../BreadCrumbs/BreadCrumbs'
import BackLink from '../BackLink/BackLink'
import styles from './PageHeading.module.css'

const PageHeading = ({ children, id = 1, data = '' }) => {
	const location = useLocation()

	const isWellDetail = location.pathname.startsWith('/wells/')
	const isLandDetail = location.pathname.startsWith('/lands/')
	const isUserDetail = location.pathname.startsWith('/users/')
	const isWells = location.pathname.includes('/wells')
	const isLands = location.pathname.includes('/lands')
	const isUsers = location.pathname.includes('/users')
	const isDashboard = location.pathname.includes('/')

	if (isLandDetail || isUserDetail || isWellDetail) {
		return (
			<Flex vertical gap={20} className={styles.container}>
				<BreadCrumbsDetail data={data} />
				<Flex gap={16} vertical>
					<BackLink id={id} data={data} />
					{children}
				</Flex>
			</Flex>
		)
	} else if (isLands || isUsers || isWells || isDashboard) {
		return (
			<Flex vertical gap={20} className={styles.containerCard}>
				<BreadCrumbs />
				<Flex gap={36} vertical>
					{children}
				</Flex>
			</Flex>
		)
	}
}

export default PageHeading
