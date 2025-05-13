import React from 'react'
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { Card, Layout, Menu } from 'antd'
import { Outlet } from 'react-router'
import styles from './Layouts.module.css'

const { Sider, Content } = Layout

const items = [UserOutlined, VideoCameraOutlined, UploadOutlined, UserOutlined].map((icon, index) => ({
	key: String(index + 1),
	icon: React.createElement(icon),
	label: `nav ${index + 1}`,
}))

const Layouts = () => {
	return (
		<Layout>
			<Sider
				breakpoint='lg'
				collapsedWidth='0'
				onBreakpoint={broken => {
					console.log(broken)
				}}
				onCollapse={(collapsed, type) => {
					console.log(collapsed, type)
				}}
			>
				<Menu theme='dark' mode='inline' defaultSelectedKeys={['4']} items={items} className={styles.menu} />
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
