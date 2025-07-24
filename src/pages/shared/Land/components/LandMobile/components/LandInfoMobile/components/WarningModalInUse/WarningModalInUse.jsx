import { Flex, Typography } from 'antd'
import { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import ModalMobile from '../../../../../../../../../components/ModalMobile/ModalMobile'
import TimerDisplay from '../../../../../../../../../components/TimerDisplay/TimerDisplay'

import styles from './WarningModalInUse.module.css'

dayjs.extend(utc)

const { Text } = Typography

const WarningModalInUse = ({ isOpen, onSubmit, onClose, well }) => {
	const [startedAt, setStartedAt] = useState('00 : 00 : 00')

	const getLocalStorageKey = landId => `irrigation_start_${landId}`

	useEffect(() => {
		const landId = well?.land?._id
		if (!landId) {
			console.error('landId is missing:', landId)
			return
		}

		const localStorageKey = getLocalStorageKey(landId)
		const irrigationStartTime = localStorage.getItem(localStorageKey)

		if (!irrigationStartTime) {
			console.error('irrigationStartTime not found in localStorage for landId:', landId)
			return
		}

		if (!irrigationStartTime) {
			console.error('irrigationStartTime not found in localStorage for landId:', landId)
			return
		}

		setStartedAt(parseInt(irrigationStartTime, 10))
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
					<Text className={styles.subtitle}>
						هنوز مدت زمان
						<span className={styles.countdown}>
							{' '}
							<TimerDisplay startedAt={startedAt} />{' '}
						</span>
						به پایان زمان آبیاری زمین {well?.land?.title} باقی مانده است.
					</Text>
				</Text>
				<Text className={styles.subtitle}>از پایان دادن به زمان‌ آبیاری اطمینان دارید؟ </Text>
			</Flex>
		</ModalMobile>
	)
}

export default WarningModalInUse
