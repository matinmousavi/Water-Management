import  { useMemo, useState } from 'react'
import { Layout, Menu, Typography, Image, Grid, Flex, Button } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

import { SettingOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'

import iconExit from '../../public/Exit.svg'
import iconNotes from '../../public/myNotes.svg'

import styles from './Layouts.module.css'

const { Header, Content } = Layout
const { Title } = Typography

const Layouts = () => {
	const { isAdmin, isIrrigator, logout } = useUser()
	const location = useLocation()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	const [menuOpen, setMenuOpen] = useState(false)

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

						{!isMobile && <Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={mainMenuItems} className={styles.flex} />}
					</Flex>

					<div style={{ position: 'relative' }}>
						<Button
							type='text'
							shape='circle'
							icon={<UserOutlined style={{ color: '#FFFFFFA6', fontSize: 20, paddingTop: 60 }} />}
							onClick={() => setMenuOpen(prev => !prev)}
						/>
						{menuOpen && (
							<Menu mode='vertical' items={userMenuItems} onClick={handleUserMenuClick} className={styles.userMenu} selectable={false} />
						)}
					</div>
				</Flex>
			</Header>

			<Content className={styles.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
