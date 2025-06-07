# useModal Hook Documentation

## Introduction

`useModal` is a custom React hook designed to simplify and optimize managing the open/close state of modal dialogs.
It also provides a clean way to run callback functions either **before** or **after** the modal opens or closes.

---

## How to Use

Import the hook:

```js
import useModal from 'path/to/useModal'
```

Example usage inside a React component:

```jsx
const MyComponent = () => {
	const { isOpen, open, close, toggle, handleAfterChange } = useModal()

	const handleOpen = () => {
		console.log('Modal opening (before fully open)')
	}

	const handleAfterOpen = () => {
		console.log('Modal fully opened (after)')
	}

	const handleClose = () => {
		console.log('Modal closing (before fully closed)')
	}

	const handleAfterClose = () => {
		console.log('Modal fully closed (after)')
	}

	return (
		<>
			<button onClick={() => open(handleOpen, 'before')}>Open Modal (Before)</button>
			<button onClick={() => open(handleAfterOpen, 'after')}>Open Modal (After)</button>

			{isOpen && (
				<Modal visible={isOpen} onCancel={() => close(handleClose, 'before')} afterOpenChange={openState => handleAfterChange(openState)}>
					Modal content here
				</Modal>
			)}
		</>
	)
}
```

---

## API and Parameters

| Variable                             | Type     | Description                                                                                                                                                                                           |
| ------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`                             | boolean  | Current state indicating whether the modal is open (`true`) or closed (`false`).                                                                                                                      |
| `open(callback, timing = 'before')`  | function | Opens the modal. Optionally accepts a callback to run **before** or **after** the modal opens. Timing can be `'before'` (default) or `'after'`.                                                       |
| `close(callback, timing = 'before')` | function | Closes the modal. Optionally accepts a callback to run **before** or **after** the modal closes. Timing can be `'before'` (default) or `'after'`.                                                     |
| `toggle()`                           | function | Toggles the modal state between open and closed.                                                                                                                                                      |
| `handleAfterChange(openState)`       | function | Must be called when the modal open state changes (e.g., from a UI library’s `afterOpenChange` prop). `openState` is a boolean indicating the new open state. Triggers any stored **after** callbacks. |

---

## How It Works

-   When calling `open(callback, timing)`:

    -   If `timing` is `'before'` (default), the callback runs immediately before opening the modal.
    -   If `timing` is `'after'`, the callback is stored and executed **after** the modal is fully open (when `handleAfterChange(true)` is called).

-   When calling `close(callback, timing)`:

    -   If `timing` is `'before'` (default), the callback runs immediately before closing the modal.
    -   If `timing` is `'after'`, the callback is stored and executed **after** the modal is fully closed (when `handleAfterChange(false)` is called).

-   The `handleAfterChange(openState)` function **must** be called by your modal component after it finishes opening or closing. This triggers any stored **after** callbacks for open or close events.

-   `toggle()` simply switches the modal between open and closed states.

---

## Important Note on `afterOpenChange`

To ensure that **`after`** callbacks run _after_ the modal has fully opened or closed, you **must** pass the `handleAfterChange` function to the modal’s `afterOpenChange` (or equivalent) prop.

If you **do not** do this, **all** callbacks — including those intended to run **after** open/close — will run immediately **before** the modal has actually finished opening or closing.

In other words:

-   Callbacks with timing `'before'` run immediately when `open()` or `close()` is called.
-   Callbacks with timing `'after'` run only when `handleAfterChange` is invoked with the updated open state.

Without calling `handleAfterChange` properly, your `'after'` callbacks will run _too early_ and not behave as intended.

---

## Benefits and Use Cases

-   Cleanly encapsulates modal open/close state management.
-   Allows running callbacks either **before** or **after** modal open/close events.
-   Useful for triggering data loading, form resets, or animations at the correct time.
-   Avoids running unnecessary callbacks on every render.
-   Compatible with many UI modal libraries (e.g., Ant Design, Material UI).

---

## Full Example Using Ant Design Modal

```jsx
import React from 'react'
import { Modal, Button } from 'antd'
import useModal from './useModal'

const MyModal = () => {
	const { isOpen, open, close, handleAfterChange } = useModal()

	const onBeforeOpen = () => {
		console.log('Before modal opens: can prepare data here')
	}

	const onAfterOpen = () => {
		console.log('After modal fully opened: animations can start here')
	}

	const onBeforeClose = () => {
		console.log('Before modal closes: cleanup tasks')
	}

	const onAfterClose = () => {
		console.log('After modal fully closed: finalize cleanup')
	}

	return (
		<>
			<Button onClick={() => open(onBeforeOpen, 'before')}>Open Modal (Before)</Button>
			<Button onClick={() => open(onAfterOpen, 'after')}>Open Modal (After)</Button>

			<Modal title='Example Modal' open={isOpen} onCancel={() => close(onBeforeClose, 'before')} afterOpenChange={open => handleAfterChange(open)}>
				Modal content here
			</Modal>
		</>
	)
}
```
