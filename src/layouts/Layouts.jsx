import { UserOutlined, BellOutlined, MenuOutlined } from '@ant-design/icons'
import { Drawer, Flex, Image, Layout, Menu, Button, Grid } from 'antd'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useMemo, useState } from 'react'
import style from './Layouts.module.css'

const { Header, Content } = Layout
const { useBreakpoint } = Grid

const Layouts = () => {
	const { isAdmin, isIrrigator } = useUser()
	const location = useLocation()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const screens = useBreakpoint()
	const isMobile = !screens.md

	const mainMenuItems = useMemo(() => {
		{
			if (isAdmin) {
				return [
					{
						key: '/',
						label: <Link to='/'>داشبورد</Link>,
					},
					{
						key: '/users',
						label: <Link to='/users'>کاربران</Link>,
					},
					{
						key: '/lands',
						label: <Link to='/lands'>زمین‌ها</Link>,
					},
					{
						key: '/wells',
						label: <Link to='/wells'>لیست چاه‌ها</Link>,
					},
				]
			} else if (isIrrigator) {
				return [
					{
						key: '/',
						label: <Link to='/'>داشبورد</Link>,
					},
					{
						key: '/wells',
						label: <Link to='/wells'>لیست چاه‌ها</Link>,
					},
				]
			} else {
				return [
					{
						key: '/',
						label: <Link to='/'>داشبورد</Link>,
					},
				]
			}
		}
	}, [isAdmin, isIrrigator])

	const profileMenuItems = [
		{
			key: '/profile',
			icon: <UserOutlined />,
			label: '',
		},
		{
			key: '/notifications',
			icon: <BellOutlined />,
			label: '',
		},
	]

	return (
		<Layout className={style.layout}>
			<Header>
				<Flex align='center' justify='space-between'>
					<Flex align='center' gap={6}>
						<Link to='/'>
							<Image width={30} src='../assets/images/water.png' preview={false} />
						</Link>
						<h2 className={style.title}>مدیریت آب</h2>
						<Menu theme='dark' mode={isMobile ? 'vertical' : 'horizontal'} selectedKeys={[location.pathname]} items={mainMenuItems} />
					</Flex>
					{!isMobile ? (
						<Menu theme='dark' mode='horizontal' selectedKeys={[location.pathname]} items={profileMenuItems} />
					) : (
						<Button className={style.button} type='text' icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} />
					)}
				</Flex>
			</Header>

			<Drawer title='منو' placement='right' onClose={() => setDrawerVisible(false)} open={drawerVisible} className={style.mobileDrawer}>
				<Menu mode='vertical' selectedKeys={[location.pathname]} items={mainMenuItems} onClick={() => setDrawerVisible(false)} />
				<Menu mode='vertical' selectedKeys={[location.pathname]} items={profileMenuItems} />
			</Drawer>

			<Content className={style.content}>
				<Outlet />
			</Content>
		</Layout>
	)
}

export default Layouts
