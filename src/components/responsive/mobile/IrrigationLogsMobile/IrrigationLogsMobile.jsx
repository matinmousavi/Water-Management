import { Button, Card, Flex, Typography } from 'antd'
import dayjs from 'dayjs'
import jalaliday from 'dayjs/plugin/jalaliday'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useState } from 'react'

import styles from './IrrigationLogsMobile.module.css'
import TimePickerSheet from '../TimePickerSheet/TimePickerSheet'
import EndNoticeDrawer from '../EndNoticeDrawer/EndNoticeDrawer'
import LogsTableMobile from '../LogsTableMobile/LogsTableMobile'
import TimerDisplay from '../../../common/TimerDisplay/TimerDisplay'
import WarningModalInUse from '../WarningModalInUse/WarningModalInUse'
import useNotification from '../../../../hooks/useNotification'
import useAPI from '../../../../hooks/useAPI'

const { Text } = Typography

dayjs.extend(jalaliday)
dayjs.extend(customParseFormat)

const END_TIME_MARGIN_MINUTES = 30

const parseTimeToMs = str => {
        if (!str) return 0
        const isNegative = str.startsWith('-')
        const cleanStr = isNegative ? str.substring(1) : str
        const [h, m] = cleanStr.split(':').map(Number)
        const ms = (h * 60 * 60 + m * 60) * 1000
        return isNegative ? -ms : ms
}

const normalizeLogs = rawLogs =>
        (Array.isArray(rawLogs) ? rawLogs : []).map(log => ({
                ...log,
                isOngoing: Boolean(log.isOngoing),
        }))

const getEntityMetricsSource = (entityType, response) => {
        if (entityType === 'land') return response?.land
        return response
}

const IrrigationLogsMobile = ({
        entityType,
        entityId,
        wellId,
        initialLogs = [],
        receivedWater,
        requiredWater,
        remainingWater,
}) => {
        const api = useAPI()
        const apiTime = useAPI()
        const entityApi = useAPI()
        const { openNotification } = useNotification()

        const [logs, setLogs] = useState(normalizeLogs(initialLogs))
        const [localRequiredWater, setLocalRequiredWater] = useState(requiredWater)
        const [localRemainingWater, setLocalRemainingWater] = useState(remainingWater)
        const [localReceivedWater, setLocalReceivedWater] = useState(receivedWater)
        const [showStartDrawer, setShowStartDrawer] = useState(false)
        const [showEndDrawer, setShowEndDrawer] = useState(false)
        const [endNoticeDrawer, setEndNoticeDrawer] = useState(false)
        const [isOpenWarning, setIsOpenWarning] = useState(false)
        const [startPickerValue, setStartPickerValue] = useState(dayjs())
        const [endPickerValue, setEndPickerValue] = useState(dayjs())

        const handleStartPickerChange = time => {
                const candidate = dayjs(time)
                if (candidate.isValid()) setStartPickerValue(candidate)
        }

        const handleEndPickerChange = time => {
                const candidate = dayjs(time)
                if (candidate.isValid()) setEndPickerValue(candidate)
        }

        apiTime.init('settings/irrigations')
        const descriptionEditHours = apiTime.data?.data?.descriptionEditHours?.time
        const logTimeMarginMinutes = apiTime.data?.data?.logTimeMarginMinutes?.time ?? 30

        const latestLog = logs[0] ?? null
        const ongoingLog = latestLog?.isOngoing ? latestLog : null
        const isIrrigating = Boolean(ongoingLog)
        const startedAt = ongoingLog?.startedAt ?? null

        const updatedRequiredWater = localRequiredWater ?? requiredWater
        const updatedRemainingWater = localRemainingWater ?? remainingWater
        const updatedReceivedWater = localReceivedWater ?? receivedWater

        const calculateActualRemainingWater = () => {
                const requiredMs = parseTimeToMs(updatedRequiredWater)
                const receivedMs = parseTimeToMs(updatedReceivedWater)
                const remainingMs = requiredMs - receivedMs

                if (remainingMs < 0 && parseTimeToMs(updatedRemainingWater) === 0) {
                        return remainingMs
                }

                return parseTimeToMs(updatedRemainingWater)
        }

        const actualRemainingWaterMs = calculateActualRemainingWater()

        const handleOpenStart = () => {
                const now = dayjs()
                setStartPickerValue(now)
                if (ongoingLog) setIsOpenWarning(true)
                else setShowStartDrawer(true)
        }

        const buildTempLog = combined => {
                const tempId = `temp-${Date.now()}`
                const base = {
                        _id: tempId,
                        well: wellId,
                        startedAt: combined.toISOString(),
                        isOngoing: true,
                        note: '',
                        duration: null,
                }

                if (entityType === 'landGroup') {
                        return { ...base, landGroup: entityId }
                }

                return { ...base, land: entityId }
        }

        const handleTimeStartSelected = async selectedTime => {
                setShowStartDrawer(false)
                if (ongoingLog) return

                const normalized = dayjs(selectedTime)
                if (!normalized.isValid()) return
                const combined = dayjs()
                        .startOf('day')
                        .hour(normalized.hour())
                        .minute(normalized.minute())
                        .second(0)
                        .millisecond(0)
                const tempLog = buildTempLog(combined)

                setLogs(prev => [tempLog, ...prev])

                try {
                        const payload = {
                                wellId,
                                startTime: combined.toISOString(),
                                isOngoing: true,
                        }

                        if (entityType === 'landGroup') payload.landGroupId = entityId
                        else payload.landId = entityId

                        const response = await api.post('irrigations', payload)
                        const created = response?.irrigation

                        if (created) {
                                setLogs(prev =>
                                        prev.map(log =>
                                                log._id === tempLog._id
                                                        ? { ...created, isOngoing: Boolean(created.isOngoing) }
                                                        : log,
                                        ),
                                )
                        }
                } catch (err) {
                        console.error(err)
                        setLogs(prev => prev.filter(log => log._id !== tempLog._id))
                        openNotification('error', 'خطا در شروع آبیاری')
                }
        }

        const refreshEntityData = async () => {
                if (!entityId || !wellId) return null

                if (entityType === 'landGroup') {
                        const response = await entityApi.get(`wells/${wellId}/land-groups/${entityId}`)
                        const rawLogs = response?.logs ?? []
                        const finalLogs = rawLogs
                                .filter(log => !String(log._id).startsWith('temp-'))
                                .map(log => ({ ...log, isOngoing: Boolean(log.isOngoing) }))
                        setLogs(finalLogs)

                        const metricsSource = getEntityMetricsSource(entityType, response)
                        if (metricsSource?.remainingWater !== undefined) setLocalRemainingWater(metricsSource.remainingWater)
                        if (metricsSource?.requiredWater !== undefined) setLocalRequiredWater(metricsSource.requiredWater)
                        if (metricsSource?.receivedWater !== undefined) setLocalReceivedWater(metricsSource.receivedWater)

                        return response
                }

                const response = await entityApi.get(`lands/${entityId}`)
                const rawLogs = response?.land?.logs ?? []
                const finalLogs = rawLogs
                        .filter(log => !String(log._id).startsWith('temp-'))
                        .map(log => ({ ...log, isOngoing: Boolean(log.isOngoing) }))
                setLogs(finalLogs)

                const metricsSource = getEntityMetricsSource(entityType, response)
                if (metricsSource?.remainingWater !== undefined) setLocalRemainingWater(metricsSource.remainingWater)
                if (metricsSource?.requiredWater !== undefined) setLocalRequiredWater(metricsSource.requiredWater)
                if (metricsSource?.receivedWater !== undefined) setLocalReceivedWater(metricsSource.receivedWater)

                return response
        }

        const handleTimeEndSelected = async time => {
                setShowEndDrawer(false)
                if (!ongoingLog) return openNotification('error', 'لاگ فعالی یافت نشد')

                const t = dayjs(time)
                if (!t.isValid()) return
                const combined = dayjs(ongoingLog.startedAt)
                        .hour(t.hour())
                        .minute(t.minute())
                        .second(0)
                        .millisecond(0)
                const endedAtISO = combined.toISOString()
                const originalId = ongoingLog._id

                setLogs(prev =>
                        prev.map(log => (log._id === originalId ? { ...log, isOngoing: false, endedAt: endedAtISO } : log)),
                )

                try {
                        if (String(originalId).startsWith('temp-')) {
                                const payload = {
                                        wellId,
                                        startTime: ongoingLog.startedAt,
                                        endTime: endedAtISO,
                                        isOngoing: false,
                                }

                                if (entityType === 'landGroup') payload.landGroupId = entityId
                                else payload.landId = entityId

                                await api.post('irrigations', payload)
                        } else {
                                await api.patch(`irrigations/${originalId}`, { endTime: endedAtISO, isOngoing: false })
                        }

                        await refreshEntityData()
                        openNotification('success', 'آبیاری با موفقیت پایان یافت')
                } catch (error) {
                        console.error(error)
                        openNotification('error', 'خطا در پایان آبیاری')
                }
        }

        const handleWarningModal = () => {
                setIsOpenWarning(false)
                setEndPickerValue(dayjs())
                setShowEndDrawer(true)
        }

        return (
                <div className={styles.container}>
                        <Card>
                                <Flex vertical gap={8}>
                                        <Text className={styles.titleLogs}>لاگ توزیع آب ({logs.length})</Text>
                                        <LogsTableMobile logs={logs} descriptionEditHours={descriptionEditHours} />
                                </Flex>
                        </Card>

                        <div className={styles.footer}>
                                {isIrrigating ? (
                                        <Flex align='center' gap={12} className={styles.footerContent}>
                                                <Text className={styles.timerText}>
                                                        <TimerDisplay
                                                                key={latestLog?._id ?? 'no-ongoing'}
                                                                startedAt={startedAt}
                                                                requiredWaterMs={parseTimeToMs(updatedRequiredWater)}
                                                                remainingWaterMs={actualRemainingWaterMs}
                                                        />
                                                </Text>
                                                <Button type='default' className={styles.textBtn} onClick={() => setEndNoticeDrawer(true)}>
                                                        پایان آبیاری
                                                </Button>
                                        </Flex>
                                ) : (
                                        <Button
                                                type='primary'
                                                className={`button-modal ${styles.btnModal}`}
                                                block
                                                onClick={handleOpenStart}
                                        >
                                                شروع آبیاری
                                        </Button>
                                )}
                        </div>

                        <TimePickerSheet
                                open={showStartDrawer}
                                value={startPickerValue}
                                onChange={handleStartPickerChange}
                                onConfirm={handleTimeStartSelected}
                                onClose={() => setShowStartDrawer(false)}
                                title='ثبت زمان شروع آبیاری'
                                subtitle='ساعت شروع آبیاری را مشخص کنید.'
                                confirmText='ثبت'
                                cancelText='بازگشت'
                                marginMinutesBackward={logTimeMarginMinutes}
                        />

                        <TimePickerSheet
                                open={showEndDrawer}
                                value={endPickerValue}
                                onChange={handleEndPickerChange}
                                onConfirm={handleTimeEndSelected}
                                onClose={() => setShowEndDrawer(false)}
                                title='ثبت زمان پایان آبیاری'
                                subtitle='ساعت پایان آبیاری زمین را مشخص کنید.'
                                confirmText='ثبت'
                                cancelText='بازگشت'
                                marginMinutesBackward={END_TIME_MARGIN_MINUTES}
                        />

                        <EndNoticeDrawer
                                isOpen={endNoticeDrawer}
                                onSubmit={() => {
                                        setEndNoticeDrawer(false)
                                        setEndPickerValue(dayjs())
                                        setShowEndDrawer(true)
                                }}
                                timer={
                                        <TimerDisplay
                                                startedAt={startedAt}
                                                requiredWaterMs={parseTimeToMs(updatedRequiredWater)}
                                                remainingWaterMs={actualRemainingWaterMs}
                                        />
                                }
                                onClose={() => setEndNoticeDrawer(false)}
                        />

                        <WarningModalInUse
                                isOpen={isOpenWarning}
                                onClose={() => setIsOpenWarning(false)}
                                well={{
                                        logs: ongoingLog ? [{ ...ongoingLog }] : [],
                                        requiredWater: updatedRequiredWater,
                                        remainingWater: updatedRemainingWater,
                                        land: ongoingLog?.land,
                                }}
                                onSubmit={handleWarningModal}
                        />
                </div>
        )
}

export default IrrigationLogsMobile
