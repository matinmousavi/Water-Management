import React from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Card, Flex, Image, Layout, Menu } from 'antd'
import { Outlet } from 'react-router'
import styles from './Layouts.module.css'

const { Sider, Content } = Layout

const items = [{ key: '1', icon: UserOutlined, label: 'پروفایل' }].map(item => ({
	key: item.key,
	icon: React.createElement(item.icon),
	label: item.label,
}))

const Layouts = () => {
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
					<Image width={30} src='../assets/images/water.png' />
					<h2 className={style.listTitle}>مدیریت آب</h2>
				</Flex>
				<Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} items={items} className={style.menu} />
			</Sider>
			<Layout>
				<Content className={styles.content}>
					<Card>
						<Outlet />
					</Card>
				</Content>
			</Layout>
		</Layout>
	)
}

export default Layouts
