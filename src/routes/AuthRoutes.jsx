import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Loading from '../components/common/Loading/Loading'

const Login = lazy(() => import('../pages/public/login/Login'))

const AuthRoutes = () => (
	<Suspense fallback={<Loading />}>
		<Routes>
			<Route path='/' element={<Login />} />
			<Route path='*' element={<Navigate to='/' replace />} />
		</Routes>
	</Suspense>
)

export default AuthRoutes
