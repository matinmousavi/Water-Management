import { DashboardOutlined, EnvironmentOutlined, UnorderedListOutlined, UserOutlined, WomanOutlined, MenuOutlined } from '@ant-design/icons'
import { Drawer, Flex, Image, Layout, Menu, Button, Grid } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState } from 'react'
import style from './Layouts.module.css'

const { Header, Content } = Layout
const { useBreakpoint } = Grid

const Layouts = () => {
	const { isAdmin, user } = useUser()
	const location = useLocation()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const screens = useBreakpoint()
	const isMobile = !screens.md

	const mainMenuItems = useMemo(() => {
		return isAdmin
			? [
					{
						key: '/',
						icon: <DashboardOutlined />,
						label: <Link to='/'>داشبورد</Link>,
					},
					{
						key: '/users',
						icon: <UnorderedListOutlined />,
						label: <Link to='/users'>کاربران</Link>,
					},
					{
						key: '/lands',
						icon: <EnvironmentOutlined />,
						label: <Link to='/lands'>زمین‌ها</Link>,
					},
					{
						key: '/wells',
						icon: <WomanOutlined />,
						label: <Link to='/wells'>لیست چاه‌ها</Link>,
					},
			  ]
			: [
					{
						key: '/',
						icon: <DashboardOutlined />,
						label: <Link to='/'>داشبورد</Link>,
					},
			  ]
	}, [isAdmin])

	const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

	return (
		<Layout>
			<Header>
				<Flex align='center' justify='space-between'>
					<Flex align='center' gap={6}>
						<Link to='/'>
							<Image width={30} src='../assets/images/water.png' preview={false} />
						</Link>
						<h2 className={style.title}>مدیریت آب</h2>
						{!isMobile && <Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={mainMenuItems} className={style.menu} />}
					</Flex>
					{!isMobile ? (
						<Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} className={style.menu}>
							<Menu.Item key='/profile' icon={<UserOutlined />}>
								<Link to='/profile'>{fullName || 'پروفایل'}</Link>
							</Menu.Item>
						</Menu>
					) : (
						<Button className={style.button} type='text' icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
					)}
				</Flex>
			</Header>
			<Drawer title='منو' placement='right' onClose={() => setDrawerVisible(false)} open={drawerVisible} className={style.mobileDrawer}>
				<Menu mode='vertical' selectedKeys={[location.pathname]} items={mainMenuItems} onClick={() => setDrawerVisible(false)} />
				<Menu mode='vertical' selectedKeys={[location.pathname]}>
					<Menu.Item key='/profile' icon={<UserOutlined />}>
						<Link to='/profile'>{fullName || 'پروفایل'}</Link>
					</Menu.Item>
				</Menu>
			</Drawer>
			<Content className={style.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
