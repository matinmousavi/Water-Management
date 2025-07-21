import { Drawer, Menu, Button, Image, Layout, Flex, Grid, Typography, Dropdown } from 'antd'
import { UserOutlined, SettingOutlined, MailOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState } from 'react'
import styles from './Layouts.module.css'
import iconExit from '../../public/Exit.svg'
import iconNotes from '../../public/myNotes.svg'

const { Header, Content } = Layout
const { Title } = Typography

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const location = useLocation()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const [logoutIcon, setLogoutIcon] = useState(false)
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

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

	const userMenuItems = useMemo(() => {
		const items = []

		if (isAdmin) {
			items.push(
				{
					key: '/settings',
					label: <Link to='/settings'>تنظیمات</Link>,
					icon: <SettingOutlined className={styles.icons} />,
				},
				{
					key: '/notification',
					label: <Link to='/send-notification'>ارسال پیامک</Link>,
					icon: <MailOutlined className={styles.icons} />,
				}
			)
		}
		if (isIrrigator) {
			items.push({
				key: 'my-notes',
				label: (
					<Flex align='center' gap={3}>
						<img src={iconNotes} className={styles.svg_icon} alt='icon note' />
						<Link className={styles.text_export} to='/my-notes'>
							یادداشت‌های من
						</Link>
					</Flex>
				),
			})
		}
		items.push({
			key: 'logout',
			label: (
				<Flex align='center' gap={3} onClick={logout}>
					<img src={iconExit} className={styles.svg_icon} alt='icon exit' />
					خروج
				</Flex>
			),
		})

		return items
	}, [isAdmin, logout])

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
						<Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]}>
							<Menu.SubMenu key='profile' icon={<UserOutlined className={styles.icons} />}>
								{userMenuItems.map(item => (
									<Menu.Item key={item.key} icon={item.icon}>
										{item.label}
									</Menu.Item>
								))}
							</Menu.SubMenu>
						</Menu>
					) : (
						<Dropdown className={styles.dropdown} menu={{ items: userMenuItems }} placement='bottomLeft' trigger={['click']}>
							<Button
								className={logoutIcon ? styles.button_click : styles.button}
								onClick={() => setLogoutIcon(prev => !prev)}
								type='text'
								shape='circle'
								icon={<UserOutlined />}
							/>
						</Dropdown>
					)}
				</Flex>
			</Header>

			<Drawer title='منو' placement='right' onClose={() => setDrawerVisible(false)} open={drawerVisible}>
				<Flex vertical justify='space-between' className={styles['drawer-menu']}>
					<Menu mode='vertical' selectedKeys={[location.pathname]} items={mainMenuItems} onClick={() => setDrawerVisible(false)} />
					<Menu mode='vertical' selectedKeys={[location.pathname]}>
						{userMenuItems.map(item => (
							<Menu.Item key={item.key} icon={item.icon} onClick={() => setDrawerVisible(false)}>
								{item.label}
							</Menu.Item>
						))}
					</Menu>
				</Flex>
			</Drawer>

			<Content className={styles.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
