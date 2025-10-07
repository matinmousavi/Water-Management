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

	useEffect(() => {
		if (!well?.land?._id) return

		const landId = well.land._id
		let irrigationStartTime = getIrrigationStartTime(landId)

		if (!irrigationStartTime && well.irrigationStartedAt) {
			const apiStart = dayjs(well.irrigationStartedAt).valueOf()
			setIrrigationStartTime(landId, apiStart)
			irrigationStartTime = apiStart
		}

		if (irrigationStartTime) setStartedAt(irrigationStartTime)
	}, [well?.land?._id, well?.irrigationStartedAt])

	if (!isOpen || !well?.land) return null

	const landId = well.land._id
	const requiredWaterMs = parseDurationToMs(well?.ongoingRequiredWater) || 2 * 60 * 60 * 1000
	const remainingWaterMs = parseDurationToMs(well?.ongoingRemainingWater) || requiredWaterMs

	return (
		<ModalMobile
			height={240}
			open={isOpen}
			onClose={onClose}
			title={`شما در حال آبیاری زمین ${well?.land?.title} هستید!`}
			okText='پایان آبیاری'
			closeText='بازگشت'
			handleSubmit={onSubmit}
		>
			<Flex vertical gap={2}>
				{' '}
				<Text className={styles.subtitle}>
					هنوز مدت زمان
					<span className={styles.countdown}>
						<TimerDisplay landId={landId} startedAt={startedAt} requiredWaterMs={requiredWaterMs} remainingWaterMs={remainingWaterMs} />
					</span>
					به پایان زمان آبیاری زمین {well?.land?.title} باقی مانده است.
				</Text>
				<Text className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </Text>
			</Flex>
		</ModalMobile>
	)
}

export default WarningModalInUse
