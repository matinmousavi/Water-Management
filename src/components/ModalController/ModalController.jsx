import React, { useState, cloneElement, isValidElement } from 'react'

const ModalController = ({ children }) => {
	const [isOpen, setIsOpen] = useState(false)

	let trigger = null
	let modal = null

	React.Children.forEach(children, child => {
		if (!isValidElement(child)) return

		if (child.type === ModalController.Trigger) {
			trigger = child
		} else if (child.type === ModalController.Modal) {
			modal = child
		}
	})

	if (!trigger || !modal) {
		console.error('ModalController requires both Trigger and Modal children')
		return null
	}

	const enhancedTrigger = cloneElement(trigger, {
		onClick: () => setIsOpen(true),
	})

	const enhancedModal = isOpen ? cloneElement(modal, { isOpen, setIsOpen }) : null

	return (
		<>
			{enhancedTrigger}
			{enhancedModal}
		</>
	)
}

ModalController.Trigger = ({ children, ...rest }) => {
	if (isValidElement(children)) {
		return cloneElement(children, rest)
	}
	return children || null
}

ModalController.Modal = ({ children, ...rest }) => {
	if (isValidElement(children)) {
		return cloneElement(children, rest)
	}
	return null
}

export default ModalController
