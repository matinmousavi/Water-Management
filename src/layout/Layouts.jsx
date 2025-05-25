import { DashboardOutlined, EnvironmentOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import { Flex, Image, Layout, Menu } from 'antd'
import { Link, Outlet, useLocation } from 'react-router'
import style from './Layouts.module.css'
import { useUser } from '../contexts/UserContext'
import { useMemo } from 'react'

const { Sider, Content } = Layout

const Layouts = () => {
	const { isAdmin, user } = useUser()
	const location = useLocation()

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
						label: <Link to='/users'> کاربران</Link>,
					},
					{
						key: '/lands',
						icon: <EnvironmentOutlined />,
						label: <Link to='/lands'> زمین ها</Link>,
					},
					{
						key: '/wells',
						icon: <UnorderedListOutlined />,
						label: <Link to='/wells'>لیست چاه ها</Link>,
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
				<Flex vertical justify='space-between' style={{ height: '100%' }}>
					<div>
						<Flex align='center' justify='center' gap={6} className={style.logo}>
							<Link to='/'>
								<Image width={30} src='../assets/images/water.png' preview={false} />
							</Link>
							<h2 className={style.listTitle}>مدیریت آب</h2>
						</Flex>

						<Menu theme='dark' mode='inline' selectedKeys={[location.pathname]} items={mainMenuItems} className={style.menu} />
					</div>

					<div>
						<Menu theme='dark' mode='vertical' selectedKeys={[location.pathname]} className={style.menu}>
							<Menu.Item key='/profile' icon={<UserOutlined />}>
								<Link to='/profile'>{fullName || 'پروفایل'}</Link>
							</Menu.Item>
						</Menu>
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
