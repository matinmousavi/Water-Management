import { DashboardOutlined, LogoutOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Flex, Image, Layout, Menu } from 'antd'
import { Link, Outlet, useLocation } from 'react-router'
import style from './Layouts.module.css'
import { useUser } from '../contexts/UserContext'

const { Sider, Content } = Layout

const Layouts = () => {
	const { isAdmin, logout } = useUser()
	const location = useLocation()
	const mainMenuItems = isAdmin
		? [
			{ key: '/users', icon: <UnorderedListOutlined />, label: <Link to='/users'>لیست کاربران</Link> },
		]
		: [
			{ key: '/', icon: <DashboardOutlined />, label: <Link to='/'>داشبورد</Link> },
		]

	const bottomMenuItems = [
		{
			key: '/profile',
			icon: <UserOutlined />,
			label: <Link to='/profile'>پروفایل</Link>,
		},
		{
			key: 'logout',
			label: (
				<Button
					type='text'
					icon={<LogoutOutlined />}
					onClick={logout}
					className={style.logoutButton}
					style={{ color: '#fff' }}
				>
					خروج
				</Button>
			),
		},
	]

	return (
		<Layout className={style.layout}>
			<Sider
				breakpoint='lg'
				collapsedWidth='0'
				zeroWidthTriggerStyle={{
					backgroundColor: 'transparent',
					top: 30,
					right: 20,
					borderRadius: 0,
					color: '#000',
					width: 30,
					height: 30,
					fontSize: 17,
				}}
				className={style.sider}
			>
				<Flex
					vertical
					justify='space-between'
					style={{ height: '100%' }}
				>
					<div>
						<Flex align='center' justify='center' gap={6} className={style.logo}>
							<Link to='/'>
								<Image width={30} src='../assets/images/water.png' preview={false} />
							</Link>
							<h2 className={style.listTitle}>مدیریت آب</h2>
						</Flex>

						<Menu
							theme='dark'
							mode='inline'
							selectedKeys={[location.pathname]}
							items={mainMenuItems}
							className={style.menu}
						/>
					</div>

					<div>
						<Menu
							theme='dark'
							mode='vertical'
							selectedKeys={[location.pathname]}
							items={bottomMenuItems}
							className={style.menu}
						/>
					</div>
				</Flex>
			</Sider>

			<Layout>
				<Content className={style.content}>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	)
}

export default Layouts
