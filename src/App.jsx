import { App as AntApp } from 'antd'
import { useUser } from './contexts/UserContext'
import AuthRoutes from './routes/AuthRoutes'
import LayoutRoutes from './routes/LayoutRoutes'

function App() {
	const { isLogin } = useUser()
	return <AntApp>{!isLogin ? <AuthRoutes /> : <LayoutRoutes />}</AntApp>
}

export default App
