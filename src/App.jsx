import { App as AntApp } from 'antd'
import './App.css'
import { useUser } from './contexts/UserContext'
import AuthRoutes from './routes/AuthRoutes'

function App() {
	const { isLogin } = useUser()
	return <AntApp>{!isLogin && <AuthRoutes />}</AntApp>
}

export default App
