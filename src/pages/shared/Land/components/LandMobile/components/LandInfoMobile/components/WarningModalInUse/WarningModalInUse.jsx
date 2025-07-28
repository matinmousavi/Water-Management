import { Flex, Typography } from 'antd'
import { useEffect, useState } from 'react'

import ModalMobile from '../../../../../../../../../components/ModalMobile/ModalMobile'
import TimerDisplay from '../../../../../../../../../components/TimerDisplay/TimerDisplay'

import { getIrrigationStartTime } from '../../../../../../../../../utils/irrigationStorage'

import styles from './WarningModalInUse.module.css'

const { Text } = Typography

const WarningModalInUse = ({ isOpen, onSubmit, onClose, well }) => {
	const [startedAt, setStartedAt] = useState(null)

	useEffect(() => {
		const landId = well?.land?._id
		if (!landId) {
			console.error('landId is missing:', landId)
			return
		}

		const irrigationStartTime = getIrrigationStartTime(landId)

		if (!irrigationStartTime) {
			console.warn('irrigationStartTime not found in localStorage for landId:', landId)
			return
		}

		setStartedAt(irrigationStartTime)
	}, [well?.land?._id])

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
				<Text className={styles.subtitle}>
					هنوز مدت زمان
					<span className={styles.countdown}>
						<TimerDisplay startedAt={startedAt} />
					</span>
					به پایان زمان آبیاری زمین {well?.land?.title} باقی مانده است.
				</Text>
				<Text className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </Text>
			</Flex>
		</ModalMobile>
	)
}

export default WarningModalInUse
