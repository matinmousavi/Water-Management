import { App } from 'antd'

const useNotification = () => {
	const { notification } = App.useApp()

	const openNotification = (type, message, description = '') => {
		if (!notification) {
			console.error('notification is undefined. Make sure App is wrapped in <App> provider.')
			return
		}

		if (typeof notification[type] !== 'function') {
			console.error(`Invalid notification type: ${type}`)
			return
		}

		notification[type]({
			message,
			description,
			placement: 'bottomLeft',
		})
	}

	return { openNotification }
}

export default useNotification
