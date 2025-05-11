import { App } from 'antd'

export default function useNotification() {
	const { notification } = App.useApp()

	const openNotification = (type, message) => {
		notification[type]({
			message,
			placement: 'bottomLeft'
		})
	}

	return { openNotification }
}
