# `useNotification` Hook Documentation

Certainly! Here's your updated **Purpose** section with a concise explanation of why you chose this approach, including a reference to the complexity of the `contextHolder` method and the KISS principle:

---

## Purpose

The `useNotification` hook is a utility that simplifies the use of Ant Design's `notification` API in React components. Its primary purpose is to avoid runtime errors like the one below when `notification` is used directly in component-level functions such as `onSubmit`:

```
notification is undefined. Make sure App is wrapped in <App> provider.
```

Previously, using notifications required invoking `notification.useNotification()` and manually rendering the `contextHolder` in each component, which introduced unnecessary boilerplate and complexity. While using React context was another alternative, it also added indirection and setup overhead.

To address these issues, we implemented this hook using `App.useApp()`, which eliminates the need for `contextHolder` entirely. This approach keeps the implementation simple, adheres to the **KISS (Keep It Simple, Stupid)** principle, and ensures that notifications can be triggered safely and cleanly from any component.

## Hook Implementation

```js
import { App } from 'antd'

export default function useNotification() {
	const { notification } = App.useApp()

	const openNotification = (type, message, description = '', duration = 3, placement = 'bottomLeft') => {
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
			duration,
			placement,
		})
	}

	return { openNotification }
}
```

---

## `openNotification` Parameters

| Parameter     | Type                                                             | Required | Description                                                            |
| ------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `type`        | `'success'` \| `'info'` \| `'warning'` \| `'error'`              | Yes      | Type of the notification                                               |
| `message`     | `string`                                                         | Yes      | Title displayed at the top of the notification                         |
| `description` | `string`                                                         | No       | Optional message body displayed below the title                        |
| `duration`    | `number`                                                         | No       | How long the notification remains visible (in seconds). Default is `3` |
| `placement`   | `'topLeft'` \| `'topRight'` \| `'bottomLeft'` \| `'bottomRight'` | No       | Position of the notification. Default is `'bottomLeft'`                |

---

## Usage

### Step 1: Wrap your app with the Ant Design `<App>` provider

```jsx
import { App as AntdApp, ConfigProvider } from 'antd'

function App() {
	return (
		<ConfigProvider>
			<AntdApp>
				<YourComponent />
			</AntdApp>
		</ConfigProvider>
	)
}
```

### Step 2: Use the hook inside your component

```jsx
import useNotification from './hooks/useNotification'

function SubmitForm() {
	const { openNotification } = useNotification()

	const handleSubmit = () => {
		// Submit logic...
		openNotification('success', 'Submission Successful', 'Your data has been saved.', 5, 'topRight')
	}

	return <button onClick={handleSubmit}>Submit</button>
}
```

---

## Benefits

-   Prevents context-related runtime errors
-   Offers a simplified and consistent API for notifications
-   Supports customization for `duration` and `placement`
-   Keeps component logic clean and focused

---

## Possible Enhancements

This hook can be extended in the future to:

-   Accept a configuration object instead of multiple parameters
-   Support optional features like custom icons or buttons
-   Integrate with a global notification context for centralized control
