import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

import english2persian from '../../../../utils/english2persian'
import BottomSheetModal from '../BottomSheetModal/BottomSheetModal'

import styles from './TimePickerSheet.module.css'

const ITEM_HEIGHT = 56
const VISIBLE_COUNT = 3
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2)

const toPositiveInteger = value => {
        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed <= 0) return 0
        return Math.floor(parsed)
}

const TimePickerSheet = ({
        open = false,
        onClose,
        onConfirm,
        onChange,
        value,
        title = '',
        subtitle = '',
        confirmText = 'ثبت',
        cancelText = 'بازگشت',
        height = 389,
        marginMinutesForward = 0,
        marginMinutesBackward = 0,
        marginHoursForward = 0,
        marginHoursBackward = 0,
}) => {
        const listRef = useRef(null)
        const scrollTimeout = useRef(null)

        const normalizedValue = useMemo(() => {
                const candidate = dayjs(value ?? dayjs())
                if (!candidate.isValid()) return dayjs()
                return candidate.second(0).millisecond(0)
        }, [value])

        const backwardMinutes = useMemo(
                () =>
                        toPositiveInteger(marginMinutesBackward) +
                        toPositiveInteger(marginHoursBackward) * 60,
                [marginHoursBackward, marginMinutesBackward],
        )

        const forwardMinutes = useMemo(
                () =>
                        toPositiveInteger(marginMinutesForward) +
                        toPositiveInteger(marginHoursForward) * 60,
                [marginHoursForward, marginMinutesForward],
        )

        const minuteRange = useMemo(() => {
                const safeBackward = Math.max(0, backwardMinutes)
                const safeForward = Math.max(0, forwardMinutes)
                const total = safeBackward + safeForward + 1
                const base = dayjs(normalizedValue.valueOf()).subtract(safeBackward, 'minute')

                return Array.from({ length: Math.max(total, 1) }, (_, idx) =>
                        base.add(idx, 'minute').second(0).millisecond(0),
                )
        }, [backwardMinutes, forwardMinutes, normalizedValue])

        const defaultIndex = useMemo(() => {
                if (!minuteRange.length) return 0
                const matchIndex = minuteRange.findIndex(time => time.valueOf() === normalizedValue.valueOf())
                if (matchIndex >= 0) return matchIndex
                const fallback = Math.min(minuteRange.length - 1, Math.max(0, backwardMinutes))
                return fallback
        }, [backwardMinutes, minuteRange, normalizedValue])

        const [selectedIndex, setSelectedIndex] = useState(defaultIndex)

        useEffect(() => {
                setSelectedIndex(defaultIndex)
        }, [defaultIndex, minuteRange])

        useEffect(() => () => {
                if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
        }, [])

        useEffect(() => {
                if (!open || !listRef.current) return
                const scrollPos = selectedIndex * ITEM_HEIGHT
                listRef.current.scrollTo({ top: scrollPos, behavior: 'auto' })
        }, [open, selectedIndex])

        const emitSelection = useCallback(
                index => {
                        const candidate = minuteRange[index]
                        if (!candidate) return

                        setSelectedIndex(index)
                        const normalizedCandidate = candidate.second(0).millisecond(0)
                        onChange?.(normalizedCandidate)
                },
                [minuteRange, onChange],
        )

        const handleScroll = useCallback(
                e => {
                        if (scrollTimeout.current) clearTimeout(scrollTimeout.current)

                        const target = e.target
                        scrollTimeout.current = setTimeout(() => {
                                const scrollTop = target.scrollTop
                                const index = Math.round(scrollTop / ITEM_HEIGHT)

                                if (minuteRange[index] && index !== selectedIndex) {
                                        emitSelection(index)
                                        listRef.current?.scrollTo({
                                                top: index * ITEM_HEIGHT,
                                                behavior: 'smooth',
                                        })
                                }
                        }, 100)
                },
                [emitSelection, minuteRange, selectedIndex],
        )

        const selectedTime = minuteRange[selectedIndex] ?? normalizedValue
        const selectedHour = selectedTime.hour().toString().padStart(2, '0')

        const handleConfirm = useCallback(() => {
                const candidate = minuteRange[selectedIndex] ?? normalizedValue
                const normalizedCandidate = candidate.second(0).millisecond(0)
                const first = minuteRange[0]
                const last = minuteRange[minuteRange.length - 1]

                if (first && normalizedCandidate.isBefore(first)) return
                if (last && normalizedCandidate.isAfter(last)) return

                onConfirm?.(normalizedCandidate)
        }, [minuteRange, normalizedValue, onConfirm, selectedIndex])

        const renderMinuteList = () => (
                <div className='container-scroll'>
                        <div
                                ref={listRef}
                                onScroll={handleScroll}
                                style={{
                                        height: ITEM_HEIGHT * VISIBLE_COUNT,
                                        overflowY: 'scroll',
                                        scrollbarWidth: 'none',
                                        msOverflowStyle: 'none',
                                }}
                                className='no-scrollbar'
                        >
                                <div
                                        className='container-item-scroll'
                                        style={{
                                                paddingTop: ITEM_HEIGHT * CENTER_INDEX,
                                                paddingBottom: ITEM_HEIGHT * CENTER_INDEX,
                                                textAlign: 'center',
                                        }}
                                >
                                        {minuteRange.map((time, idx) => {
                                                const isSelected = idx === selectedIndex
                                                const minute = time.minute().toString().padStart(2, '0')
                                                return (
                                                        <div
                                                                key={time.valueOf()}
                                                                style={{
                                                                        height: ITEM_HEIGHT,
                                                                        lineHeight: `60px`,
                                                                        fontSize: 20,
                                                                        padding: '0 10px',
                                                                        fontWeight: isSelected ? '600' : '400',
                                                                        color: isSelected
                                                                                ? 'rgba(0,0,0,0.88)'
                                                                                : 'rgba(30,30,44,0.5)',
                                                                        userSelect: 'none',
                                                                        textAlign: 'center',
                                                                }}
                                                                className='item-scroll'
                                                                onClick={() => emitSelection(idx)}
                                                        >
                                                                {english2persian(minute)}
                                                        </div>
                                                )
                                        })}
                                </div>
                        </div>
                </div>
        )

        return (
                <BottomSheetModal
                        open={open}
                        height={height}
                        onClose={onClose}
                        title={title}
                        okText={confirmText}
                        closeText={cancelText}
                        onSubmit={handleConfirm}
                >
                        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}

                        <div className={styles.container_time_lines}>
                                <div
                                        style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                height: 1,
                                                backgroundColor: 'rgba(217, 217, 217, 1)',
                                                zIndex: 10,
                                                top: ITEM_HEIGHT * CENTER_INDEX,
                                        }}
                                />
                                <div
                                        style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                height: 1,
                                                backgroundColor: 'rgba(217, 217, 217, 1)',
                                                zIndex: 10,
                                                top: ITEM_HEIGHT * (CENTER_INDEX + 1),
                                        }}
                                />

                                <div
                                        style={{
                                                height: ITEM_HEIGHT * VISIBLE_COUNT,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: 8,
                                        }}
                                >
                                        {renderMinuteList()}
                                        <div className={styles.clone}>:</div>
                                        <div className={styles.hour}>{english2persian(selectedHour)}</div>
                                </div>
                        </div>
                </BottomSheetModal>
        )
}

export default TimePickerSheet
