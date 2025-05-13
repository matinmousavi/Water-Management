import { createContext, useContext, useEffect, useState } from 'react'
import { Spin, Flex } from 'antd'
import useAPI from '../hooks/useAPI'
import Errors from '../pages/public/errors/Errors'

const UserContext = createContext({})

export default function UserProvider({ children }) {
	const [user, setUser] = useState(false)
	const [initLoading, setInitLoading] = useState(true)
	const api = useAPI()
	const apiSilent = useAPI()

	const roles = user?.roles ?? []
	const isAdmin = roles.includes('admin')
	const isIrrigator = roles.includes('irrigator')
	const isLandOwner = roles.includes('landOwner')

	const isLogin = !!user
	console.log(user)

	const getMe = async () => {
		try {
			const me = await apiSilent.get('me')
			setUser(me)
		} catch (err) {
			console.log(err)
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
			await apiSilent.post('me/logout')
		} catch (err) {
			console.log(err)
		}
		setUser(null)
	}

	const showLoading = initLoading || api.isLoading

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				isAdmin,
				isIrrigator,
				isLandOwner,
				isLogin,
				getMe,
				logout,
			}}
		>
			{showLoading && (
				<Flex style={{ height: '100vh' }} justify='center' align='center'>
					<Spin size='large' />
				</Flex>
			)}
			{api.error && !showLoading && api.error.error?.status !== 403 && (
				<Errors message='خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.' onClick={getMe} />
			)}
			{!showLoading && !api.error && children}
		</UserContext.Provider>
	)
}

export function useUser() {
	return useContext(UserContext)
}
