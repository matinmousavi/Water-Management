import { createContext } from 'react'
import { use, useState, useEffect } from 'react'
import { Spin, Flex } from 'antd'
import useAPI from '../hooks/useAPI'
import Errors from '../pages/public/errors/Errors'

const UserContext = createContext()

export default function UserProvider({ children }) {
	const [user, setUser] = useState(false)
	const [initLoading, setInitLoading] = useState(true)
	const api = useAPI()
	const apiSilent = useAPI()
	const isAdmin = user?.role === 'admin'
	const isIrrigator = user?.role === 'irrigator'
	const isLandOwner = user?.role === 'landOwner'
	const isLogin = !!user

	const getMe = async () => {
		try {
			const me = await apiSilent.get('me')
			setUser(me.user)
		} catch (err) {
			console.error(err)
			setUser(false)
		} finally {
			setInitLoading(false)
		}
	}

	useEffect(() => {
		getMe()
	}, [])

	const logout = async () => {
		try {
			await apiSilent.get('me/logout')
			location.replace('/')
		} catch (err) {
			console.error(err)
		}
	}

	if (initLoading) {
		return (
			<Flex style={{ height: '100vh' }} justify='center' align='center'>
				<Spin size='large' />
			</Flex>
		)
	}

	if (api?.error && api.error?.status !== 403) {
		return <Errors message='خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.' onClick={getMe} />
	}

	const contextValue = {
		user,
		setUser,
		isAdmin,
		isIrrigator,
		isLandOwner,
		isLogin,
		getMe,
		logout,
	}

	return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export function useUser() {
	return use(UserContext)
}
