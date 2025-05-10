import { createContext, useContext, useEffect, useState } from 'react'
import { Spin, Flex } from 'antd'

import useAPI from '../hooks/useAPI'
import Errors from '../pages/public/Errors/Errors'

const userContext = createContext({})

export default function UserContext(props) {
	const [user, setUser] = useState(false)

	const isSuperAdmin = user.role == 'admin'
	const isAdmin = user.organizations?.[0]?.isAdmin ?? false
	const isManager = user.organizations?.[0]?.isManager ?? false
	const isLogin = !!user
	const token = localStorage.getItem('token')
	const hasToken = !!token

	const api = useAPI()
	const apiWithoutLoading = useAPI()

	async function getMe() {
		const me = await apiWithoutLoading.get('me')
		setUser(me)
	}

	useEffect(() => {
		if (hasToken) {
			api.get('me').then(data => {
				setUser(data)
			})
		}
	}, [])

	async function login({ token }) {
		localStorage.setItem('token', token)
		getMe()
	}
	async function logout() {
		localStorage.removeItem('token')
		setUser(false)
	}

	const showLoading = api.isLoading || (hasToken && !isLogin)

	return (
		<userContext.Provider value={{ user, setUser, isSuperAdmin, isLogin, isAdmin, isManager, hasToken, token, login, logout, getMe }}>
			{showLoading && (
				<Flex style={{ height: '100dvh' }} gap='middle' justify='center' align='center'>
					<Spin size='large' />
				</Flex>
			)}
			{api.error && api.error.status !== 403 && (
				<Errors
					message="There's an issue with your internet connection. Please try again."
					onClick={() =>
						api.get('me').then(data => {
							setUser(data)
						})
					}
				/>
			)}
			{!showLoading && !api.error ? props.children : null}
		</userContext.Provider>
	)
}

export function useUser() {
	return useContext(userContext)
}
