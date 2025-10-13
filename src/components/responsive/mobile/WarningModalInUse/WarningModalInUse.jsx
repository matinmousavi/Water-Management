import { Flex, Typography } from 'antd'
import moment from 'moment-jalaali'
import BottomSheetModal from '../BottomSheetModal/BottomSheetModal'
import TimerDisplay from '../../../common/TimerDisplay/TimerDisplay'
import styles from './WarningModalInUse.module.css'

const { Text } = Typography

const parseHhMmToMs = str => {
	if (!str) return 0
	const isNeg = String(str).startsWith('-')
	const clean = isNeg ? String(str).slice(1) : String(str)
	const [h = '0', m = '0'] = clean.split(':')
	const ms = (Number(h) * 3600 + Number(m) * 60) * 1000
	return isNeg ? -ms : ms
}

const WarningModalInUse = ({ isOpen, onSubmit, onClose, irrigationTarget }) => {
	if (!isOpen || !irrigationTarget) return null

	const requiredMs = parseHhMmToMs(irrigationTarget.requiredWater)
	const baseReceivedMs = parseHhMmToMs(irrigationTarget.receivedWater)
	const startedAt = moment(irrigationTarget.startedAt).isValid() ? moment(irrigationTarget.startedAt).toISOString() : null

	return (
		<BottomSheetModal
			height={240}
			open={isOpen}
			onClose={onClose}
			title={`شما در حال آبیاری ${irrigationTarget.type === 'landGroup' ? 'گروه' : 'زمین'} ${irrigationTarget.title} هستید!`}
			okText='پایان آبیاری'
			closeText='بازگشت'
			onSubmit={onSubmit}
		>
			<Flex vertical gap={2}>
				<Text className={styles.subtitle}>
					هنوز مدت زمان
					<span className={styles.countdown}>
						<TimerDisplay startedAt={startedAt} requiredMs={requiredMs} baseReceivedMs={baseReceivedMs} />
					</span>
					به پایان زمان آبیاری {irrigationTarget.type === 'landGroup' ? 'گروه' : 'زمین'} {irrigationTarget.title} باقی مانده است.
				</Text>
				<Text className={styles.subtitle}>از پایان دادن به زمان آبیاری اطمینان دارید؟</Text>
			</Flex>
		</BottomSheetModal>
	)
}

export default WarningModalInUse
