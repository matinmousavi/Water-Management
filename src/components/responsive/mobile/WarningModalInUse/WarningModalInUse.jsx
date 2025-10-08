import { Flex, Typography } from 'antd'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import ModalMobile from '../ModalMobile/ModalMobile'
import TimerDisplay from '../../../common/TimerDisplay/TimerDisplay'
import { getIrrigationStartTime, setIrrigationStartTime } from '../../../../utils/irrigationStorage'

import styles from './WarningModalInUse.module.css'

const { Text } = Typography

const parseDurationToMs = str => {
	if (!str) return null
	const [h, m] = str.split(':').map(Number)
	return (h * 60 * 60 + m * 60) * 1000
}

const WarningModalInUse = ({ isOpen, onSubmit, onClose, well }) => {
	const [startedAt, setStartedAt] = useState(null)

	const ongoingLog = well?.logs?.find(log => log.isOngoing)
	const isGroup = ongoingLog?.isGroupLog

	const entityId = isGroup ? ongoingLog.landGroup : ongoingLog?.land?._id
	const entityTitle = isGroup ? ongoingLog.landGroupTitle : ongoingLog?.land?.title

	useEffect(() => {
		if (!entityId) return

		let irrigationStartTime = getIrrigationStartTime(entityId)

		if (!irrigationStartTime && ongoingLog?.startedAt) {
			const apiStart = dayjs(ongoingLog.startedAt).valueOf()
			setIrrigationStartTime(entityId, apiStart)
			irrigationStartTime = apiStart
		}

		if (irrigationStartTime) setStartedAt(irrigationStartTime)
	}, [entityId, ongoingLog])

	if (!isOpen || !entityId) return null

	const requiredWaterMs = parseDurationToMs(ongoingLog?.requiredWater) || 2 * 60 * 60 * 1000
	const remainingWaterMs = parseDurationToMs(ongoingLog?.remainingWater) || requiredWaterMs

	return (
		<ModalMobile
			height={240}
			open={isOpen}
			onClose={onClose}
			title={`شما در حال آبیاری ${isGroup ? 'گروه' : 'زمین'} ${entityTitle} هستید!`}
			okText='پایان آبیاری'
			closeText='بازگشت'
			handleSubmit={onSubmit}
		>
			<Flex vertical gap={2}>
				<Text className={styles.subtitle}>
					هنوز مدت زمان
					<span className={styles.countdown}>
						<TimerDisplay landId={entityId} startedAt={startedAt} requiredWaterMs={requiredWaterMs} remainingWaterMs={remainingWaterMs} />
					</span>
					به پایان زمان آبیاری {isGroup ? 'گروه' : 'زمین'} {entityTitle} باقی مانده است.
				</Text>
				<Text className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </Text>
			</Flex>
		</ModalMobile>
	)
}

export default WarningModalInUse
