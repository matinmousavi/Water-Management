import { UserOutlined, BellOutlined, MenuOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { Drawer, Flex, Image, Layout, Menu, Button } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState, useEffect } from 'react'
import styles from './Layouts.module.css'

const { Header, Content } = Layout

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const location = useLocation()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 576)
		}
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const mainMenuItems = useMemo(() => {
		const items = [
			{
				key: '/',
				label: <Link to='/'>داشبورد</Link>,
			},
		]

		if (isAdmin || isIrrigator) {
			items.push({
				key: '/wells',
				label: <Link to='/wells'>چاه ها</Link>,
			})
		}

		if (isAdmin) {
			items.push(
				{
					key: '/lands',
					label: <Link to='/lands'>زمین ها</Link>,
				},
				{
					key: '/users',
					label: <Link to='/users'>کاربران</Link>,
				}
			)
		}

		return items
	}, [isAdmin, isIrrigator])

	const profileMenuItems = [
		{
			key: '/profile',
			icon: <UserOutlined />,
			label: <Link to='/profile'></Link>,
		},
		{
			key: '/bell',
			icon: <BellOutlined />,
			label: <Link to='/'></Link>,
		},
	]

	if (isAdmin) {
		profileMenuItems.push(
			{
				key: '/settings',
				icon: <SettingOutlined />,
				label: <Link to='/settings'></Link>,
			},
			{
				key: 'logout',
				icon: <LogoutOutlined onClick={logout} />,
			}
		)
	}

	return (
		<Layout className={styles.layout}>
			<Header>
				<Flex align='center' justify='space-between'>
					<Flex className={styles['w-full']} align='center' gap={10}>
						<Link to='/'>
							<Image width={30} src='../assets/images/default-logo.png' preview={false} />
						</Link>
						<h3 className={styles.title}>مدیریت آب</h3>

						{!isMobile && <Menu className={styles.flex} theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={mainMenuItems} />}
					</Flex>

					{!isMobile ? (
						<Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={profileMenuItems} />
					) : (
						<Button className={styles.button} type='text' icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
					)}
				</Flex>
			</Header>

			{drawerVisible && (
				<Drawer title='منو' placement='right' onClose={() => setDrawerVisible(false)} open={drawerVisible}>
					<Menu mode='vertical' selectedKeys={[location.pathname]} items={mainMenuItems} onClick={() => setDrawerVisible(false)} />
					<Menu mode='vertical' selectedKeys={[location.pathname]} items={profileMenuItems} />
				</Drawer>
			)}

			<Content className={styles.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
