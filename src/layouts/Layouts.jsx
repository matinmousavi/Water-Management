import { useMemo, useState } from 'react'
import { Layout, Menu, Typography, Image, Grid, Flex, Button } from 'antd'
import { Link, Outlet, useSearchParams } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { SettingOutlined, MailOutlined, UserOutlined, CalendarOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons'

import iconExit from '../../public/Exit.svg'
import iconNotes from '../../public/myNotes.svg'
import styles from './Layouts.module.css'

const { Header, Content } = Layout
const { Title } = Typography

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs
	const [searchParams] = useSearchParams()
	const wellId = searchParams.get('wellId')
	const [menuOpen, setMenuOpen] = useState(false)
	const [drawerOpen, setDrawerOpen] = useState(false)

	const mainMenuItems = useMemo(() => {
		const items = []
		if (isAdmin) items.push({ key: '/', label: <Link to='/'>داشبورد</Link> })
		if (isAdmin || isIrrigator) items.push({ key: '/wells', label: <Link to='/wells'>چاه‌ها</Link> })
		if (isAdmin) {
			items.push({ key: '/lands', label: <Link to='/lands'>زمین‌ها</Link> }, { key: '/users', label: <Link to='/users'>کاربران</Link> })
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
					icon: <SettingOutlined style={{ color: '#00000073' }} />,
				},
				{
					key: '/send-notification',
					label: <Link to='/send-notification'>ارسال پیامک</Link>,
					icon: <MailOutlined style={{ color: '#00000073' }} />,
				}
			)
		}

		if (isIrrigator) {
			items.push({
				key: '/my-notes',
				label: (
					<Flex align='center' gap={8}>
						<img src={iconNotes} className={styles.svg_icon} alt='یادداشت‌های من' />
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
				<Flex align='center' gap={8} className={styles.exit}>
					<img src={iconExit} className={styles.svg_icon} alt='خروج' />
					خروج
				</Flex>
			),
		})

		return items
	}, [isAdmin, isIrrigator])

	const handleUserMenuClick = ({ key }) => {
		if (key === 'logout') logout()
		setMenuOpen(false)
	}

	return (
		<Layout className={styles.layout}>
			<Header>
				{isMobile && isAdmin ? (
					<Flex align='center' justify='space-between' className={styles['w-full']}>
						<Button
							type='text'
							shape='circle'
							icon={
								drawerOpen ? (
									<CloseOutlined style={{ color: '#FFFFFFA6', fontSize: 20 }} />
								) : (
									<MenuOutlined style={{ color: '#FFFFFFA6', fontSize: 20 }} />
								)
							}
							onClick={() => setDrawerOpen(prev => !prev)}
						/>
						<Link to='/' style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<Image src='../assets/images/default-logo.png' width={24} preview={false} />
							<Title level={3} className={styles.title}>
								مدیریت آب
							</Title>
						</Link>
						<Button
							type='text'
							shape='circle'
							icon={<UserOutlined style={{ color: '#FFFFFFA6', fontSize: 20 }} />}
							onClick={() => setMenuOpen(prev => !prev)}
						/>
						{menuOpen && (
							<Menu mode='vertical' items={userMenuItems} onClick={handleUserMenuClick} className={styles.userMenu} selectable={false} />
						)}
						{drawerOpen && (
							<>
								<div className={styles.mobileMenuWrapper}>
								<div className={styles.overlay} onClick={() => setDrawerOpen(false)} />
									<Menu
										mode='vertical'
										selectedKeys={[window.location.pathname]}
										items={mainMenuItems}
										className={styles.mobileMenu}
										onClick={() => setDrawerOpen(false)}
									/>
								</div>
							</>
						)}
					</Flex>
				) : (
					<Flex align='center' justify='space-between'>
						<Flex align='center' gap={10} className={styles['w-full']}>
							<Link to='/'>
								<Image src='../assets/images/default-logo.png' width={24} preview={false} />
							</Link>
							<Link to='/'>
								<Title level={3} className={styles.title}>
									مدیریت آب
								</Title>
							</Link>
							{!isMobile && (
								<Menu theme='dark' mode='horizontal' selectedKeys={[window.location.pathname]} items={mainMenuItems} className={styles.flex} />
							)}
						</Flex>
						<div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
							{isIrrigator && (
								<Link to={`/schedules/${wellId}`}>
									<Button type='text' shape='circle' icon={<CalendarOutlined style={{ color: '#FFFFFFA6', fontSize: 20 }} />} />
								</Link>
							)}
							<Button
								type='text'
								shape='circle'
								icon={<UserOutlined style={{ color: '#FFFFFFA6', fontSize: 20 }} />}
								onClick={() => setMenuOpen(prev => !prev)}
							/>
							{menuOpen && (
								<Menu mode='vertical' items={userMenuItems} onClick={handleUserMenuClick} className={styles.userMenu} selectable={false} />
							)}
						</div>
					</Flex>
				)}
			</Header>
			<Content className={styles.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
