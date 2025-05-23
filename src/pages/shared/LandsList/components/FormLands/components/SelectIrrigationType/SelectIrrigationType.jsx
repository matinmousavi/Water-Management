import { Dropdown, Button } from 'antd'

const SelectIrrigationType = ({ value, onChange }) => {
	const items = [
		{ key: 'قطره‌ای', label: 'قطره‌ای' },
		{ key: 'بارانی', label: 'بارانی' },
		{ key: 'سطحی', label: 'سطحی' },
		{ key: 'چاه دستی', label: 'چاه دستی' },
		{ key: 'سایر', label: 'سایر' },
	]

	const handleMenuClick = e => {
		onChange(e.key)
	}

	const menuProps = {
		items,
		onClick: handleMenuClick,
	}

	return (
		<Dropdown menu={menuProps}>
			<Button>{value || 'نوع آبیاری را انتخاب کنید'}</Button>
		</Dropdown>
	)
}
export default SelectIrrigationType
