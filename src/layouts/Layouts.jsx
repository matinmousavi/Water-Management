import { Grid, Drawer, Menu, Button, Image, Layout, Flex } from 'antd'
import { UserOutlined, BellOutlined, MenuOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState } from 'react'
import styles from './Layouts.module.css'

const { Header, Content } = Layout

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const location = useLocation()

	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const [drawerVisible, setDrawerVisible] = useState(false)

	const mainMenuItems = useMemo(() => {
		const items = []

		if (isIrrigator) {
			items.push({
				key: '/',
				label: <Link to='/'>چاه</Link>,
			})
		}

		if (isAdmin) {
			items.push(
				{
					key: '/',
					label: <Link to='/'>داشبورد</Link>,
				},
				{
					key: '/lands',
					label: <Link to='/lands'>زمین ها</Link>,
				},
				{
					key: '/wells',
					label: <Link to='/wells'>چاه ها</Link>,
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
			label: <Link to='/profile'>{isMobile && 'پروفایل'}</Link>,
		},
		{
			key: '/bell',
			icon: <BellOutlined />,
			label: <Link to='/'>{isMobile && 'اعلان‌ها'}</Link>,
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
						<Button type='text' icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
					)}
				</Flex>
			</Header>

			<Drawer title='منو' placement='right' onClose={() => setDrawerVisible(false)} open={drawerVisible}>
				<Flex vertical justify='space-between' className={styles['drawer-menu']}>
					<Menu mode='vertical' selectedKeys={[location.pathname]} items={mainMenuItems} onClick={() => setDrawerVisible(false)} />
					<Menu mode='vertical' selectedKeys={[location.pathname]} items={profileMenuItems} />
				</Flex>
			</Drawer>

			<Content className={styles.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
