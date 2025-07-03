import { Drawer, Menu, Button, Image, Layout, Flex, Grid, Typography } from 'antd'
import { UserOutlined, BellOutlined, MenuOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState } from 'react'
import styles from './Layouts.module.css'

const { Header, Content } = Layout
const { Title } = Typography

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const location = useLocation()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const navigate = useNavigate()

	const mainMenuItems = useMemo(() => {
		const items = []
		if (isAdmin) {
			items.push({
				key: '/',
				label: <Link to='/'>داشبورد</Link>,
			})
		}

		if (isAdmin || isIrrigator) {
			items.push({
				key: '/wells',
				label: <Link to='/wells'>چاه‌ها</Link>,
			})
		}

		if (isAdmin) {
			items.push(
				{
					key: '/lands',
					label: <Link to='/lands'>زمین‌ها</Link>,
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
			icon: <UserOutlined className={styles.icons} onClick={() => navigate('/profile')} />,
		},
		{
			key: '/bell',
			icon: <BellOutlined className={styles.icons} />,
		},
	]

	if (isAdmin) {
		profileMenuItems.push(
			{
				key: '/settings',
				icon: <SettingOutlined className={styles.icons} onClick={() => navigate('/settings')} />,
			},
			{
				key: 'logout',
				icon: <LogoutOutlined className={styles.icons} onClick={logout} />,
			}
		)
	}

	return (
		<Layout className={styles.layout}>
			<Header>
				<Flex align='center' justify='space-between'>
					<Flex className={styles['w-full']} align='center' gap={10}>
						<Link to='/'>
							<Image width={24} src='../assets/images/default-logo.png' preview={false} />
						</Link>
						<Link to='/'>
							<Title level={3} className={styles.title}>
								مدیریت آب
							</Title>
						</Link>
						{!isMobile && <Menu className={styles.flex} theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={mainMenuItems} />}
					</Flex>

					{!isMobile ? (
						<Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={profileMenuItems} />
					) : isIrrigator ? (
						<Button type='text' icon={<UserOutlined />} onClick={() => setDrawerVisible(true)} />
					) : (
						<Button type='text' color='default' icon={<MenuOutlined className={styles.menuIcon} />} onClick={() => setDrawerVisible(true)} />
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
