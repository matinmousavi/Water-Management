import { Routes, Route } from 'react-router-dom'
import Layouts from '../layout/Layouts'
import Login from '../pages/public/login/Login'
import Profile from '../pages/landOwner/profile/Profile'
import Admin from '../pages/admin/Admin'

const LayoutRoutes = ({ isLogin, isAdmin }) => (
	<Routes>
		{/* {!isLogin ? ( */}
		<Route path='/' element={<Login />} />
		{/* ) : ( */}
		<Route element={<Layouts />}>
			<Route path='/profile' element={<Profile />} />
			{/* {isAdmin &&  */}
			<Route path='/admin' element={<Admin />} />
			{/* } */}
		</Route>
		{/* )} */}
	</Routes>
)

export default LayoutRoutes
