import React from 'react'
import { UnorderedListOutlined, UserOutlined } from '@ant-design/icons'
import { Card, Col, Flex, Image, Layout, Menu, Row } from 'antd'
import { Outlet } from 'react-router'
import style from './Layouts.module.css'
import { useUser } from '../contexts/UserContext'

const { Sider, Content } = Layout

const itemsUser = [{ key: '1', icon: UserOutlined, label: 'پروفایل' }].map(item => ({
	key: item.key,
	icon: React.createElement(item.icon),
	label: item.label,
}))
const itemsAdmin = [{ key: '1', icon: UnorderedListOutlined, label: 'لیست کاربران' }].map(item => ({
	key: item.key,
	icon: React.createElement(item.icon),
	label: item.label,
}))

const Layouts = () => {
	//const { isAdmin } = useUser()

	return (
		<Layout>
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
						<h3 className={style.textPanel}>
							{/* {isAdmin ?  */}پنل مدیر {/* : 'پنل کاربری'} */}
						</h3>
					</Col>
				</Flex>
				<Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} items={/* isAdmin ? itemsUser : */ itemsAdmin} className={style.menu} />
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
