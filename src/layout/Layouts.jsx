import React from 'react'
import { DashboardOutlined, LogoutOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Image, Layout, Menu, Row } from 'antd'
import { Link, Outlet } from 'react-router'
import style from './Layouts.module.css'
import { useUser } from '../contexts/UserContext'

const { Sider, Content } = Layout

const menuItems = {
	user: [
		{ key: '1', icon: <DashboardOutlined />, label: <Link to='/'>داشبورد</Link> },
		{ key: '2', icon: <UserOutlined />, label: <Link to='/profile'>پروفایل</Link> },
	],
	admin: [
		{ key: '1', icon: <UserOutlined />, label: <Link to='/profile'>پروفایل</Link> },
		{ key: '2', icon: <UnorderedListOutlined />, label: <Link to='/users'>لیست کاربران</Link> },
	],
}

const Layouts = () => {
	const { isAdmin, logout } = useUser()

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
				onBreakpoint={broken => {
					console.log(broken)
				}}
				onCollapse={(collapsed, type) => {
					console.log(collapsed, type)
				}}
			>
				<Flex align='center' gap={6} className={style.logo}>
					<Col>
						<Flex align='center' gap={6}>
							<Image width={30} src='../assets/images/water.png' />
							<h2 className={style.listTitle}>مدیریت آب</h2>
						</Flex>
						<h3 className={style.textPanel}>{isAdmin ? 'پنل کاربری' : 'پنل مدیر'}</h3>
					</Col>
				</Flex>
				<Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} items={isAdmin ? menuItems.admin : menuItems.user} className={style.menu} />
				<Button
					type='text'
					icon={<LogoutOutlined />}
					onClick={logout}
					className={style.logoutButton}
					color='primary	'	
					variant='solid'
				>
					خروج
				</Button>
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
